
let express=require('express');
let bcrypt=require('bcrypt');
let session = require('express-session');
let shortid=require('shortid');
let nodemailer=require('nodemailer');
let sanitize=require('sanitize-html'); // for preventing the sql injection 
let bodyParser=require('body-parser');
let cookieParser=require('cookie-parser');
let logger=require('morgan');
let spawn=require('child_process').spawn;
let salt_round=5;
let path=require('path');

let route=express.Router();

let server=express();

let session_options=session({
    secret:'secret_crypt',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 1000*60*5 , httpOnly: true}
});

server.use(session_options);

server.use(logger);
server.use(cookieParser());
server.use(bodyParser());


server.use(express.json());
server.use(express.urlencoded({extended: false}));
server.use(express.static(__dirname));
server.use(express.static('public'));

let con=require('../db');


route.post('/redirect',function(req,res){
    res.redirect('/login');
})

route.get('/payment',function(req,res){
    res.redirect('/payment');
});

route.get('/layout',function(req,res){
    //res.redirect('/layout');
    res.sendFile(path.join(__dirname+'/html/layout.html'));
});

// SignUp for New User
route.post('/signup',function(req,res){
    let username=sanitize(req.body.username,{allowedTags:[],allowedAttributes:{}}); // For preventing the SQL injection
    let email=sanitize(req.body.email,{allowedTags:[],allowedAttributes:{}});
    let password=sanitize(req.body.password,{allowedTags:[],allowedAttributes:{}});

    if(username && email && password)
    {
        con.query('select * from login where username=?',[username],function(error,results){
            if(results.length>0)
            {
                console.log('User already exists with this username!!');
               
                
                
            }
            else
            {
                bcrypt.hash(password,salt_round).then(function(hash){
                    con.query("INSERT INTO login (username, email, password) VALUES ('"+username+"', '"+email+"','"+hash+"')",function(error,results){
                        console.log('User data inserted');
                        //res.json('Sign Up Successful');
                        res.redirect('/send');
                    });
                });
            }
        });
        
        
    }
    else
    {
        console.log('No data given');
    }

});


route.post('/login',function(req,res){
    let email=sanitize(req.body.email,{allowedTags:[],allowedAttributes:{}});
    let password=sanitize(req.body.password,{allowedTags:[],allowedAttributes:{}});
    //console.log(req.session);
    //console.log(req);
    //req.session.user={user_email: email,user_password:password};
    if(email && password)
    {
        
        con.query('select password from login where email=?',[email],function(error,results){
            bcrypt.compare(password,results[0].password).then(function(output){
                if(output==true){
                    console.log('Logged In');
                    return res.redirect('/movie');
                }
                else{
                    console.log('Wrong Password');
                    res.json('Wrong Password');
                }
                res.end();
            });
            
                //console.log('2nd- '+req.session);
                //req.session.username=results[0].username;
                //req.session.email=email;
                //console.log('3rd- '+req.session);
                //res.redirect('/welcome-page');
                
        
        /*    
        else
            {
                
                //return res.redirect('/login');
                //res.redirect('/wrong-pass');
            }*/
            
        });
    }
    else
    {
        console.log('Please Enter email and password');
        res.json('Please enter email and password');
    }
    
    
});

/*
route.all('/logout',function(req,res){
    delete req.session.username,req.session.email;
    req.session.destroy();
    res.status(200).send('Logout Successfull');
});
*/



route.post('/user-auth',function(req,res){
    let email=sanitize(req.body.email,{allowedTags:[],allowedAttributes:{}});
    if(email)
    {
        con.query('select * from login where email=?',[email],function(error,results){
            if(results.length>0)
            {
                
                let key=shortid.generate();
                let key_exp_time=new Date().getTime() + 10*60*1000;
                con.query('update login set reset_key=?,reset_exp_time=? where email=?',[key,key_exp_time,email],function(err,results){
                    if(!err)
                    {
                        let transporter = nodemailer.createTransport({
                            service: "gmail",
                            port: 465,
                            auth: {
                              user: '<gmail address>',
                              pass: '<gmail application password>'
                            }
                          });
                        let mailinfo = {
                            subject: `CRYPTS Password reset`,
                            to: email,
                            from: `CRYPTS <enter your gmail address>`,
                            html: `
                              <h3>Hi,</h3>
                              <h3>Here is your password reset key</h3>
                              <h2><code contenteditable="false" style="font-weight:200;font-size:1.5rem;padding:5px 10px; background: #EEEEEE; border:0">${key}</code></h4>
                              <p>Please ignore if you didn't try to reset your password on our platform</p>
                            `
                          };
                          try {
                            transporter.sendMail(mailinfo, function(error, response){
                              if (error) 
                              {
                                console.log("error:\n", error, "\n");
                                res.status(500).send("could not send reset code");
                              } 
                              else 
                              {
                                console.log("email sent:\n", response);
                                //res.status(200).send("Email sent");
                                res.redirect('/reset-page');
                              }
                            
                            });
                          } 
                          catch (error) 
                          {
                            console.log(error);
                            res.status(500).send("could not sent reset code");
                          }
                        
                    }
                    else
                    {
                        console.log(err);
                    }
                    
                });

                // Proceed for the email verfication
                //results[0].reset_key=shortid.generate();
                // Time returned by 'Date().getTime()' is in milliseconds from 1970. We convert 10 minutes to milliseconds and add it to it
                //results[0].reset_key_expire_time=new Date().getTime() + 10*60*1000; 
                // We will create the SMTP for sending the mail
                
                

            }
            else {
                res.status(400).send('email is incorrect');
              }
        })
    }
});


route.post('/reset',function(req,res){
    let reset_key=sanitize(req.body.reset_key,{allowedTags:[],allowedAttributes:{}});
    let new_pass=sanitize(req.body.new_pass,{allowedTags:[],allowedAttributes:{}});
    let confirm_pass=sanitize(req.body.confirm_pass,{allowedTags:[],allowedAttributes:{}});

    let current_time= new Date().getTime();
    if(new_pass==confirm_pass){
        
        con.query('select * from login where reset_key=?',[reset_key],function(err,results){
            if(results.length>0)
            {
                if(current_time<results[0].reset_exp_time)
                {
                    bcrypt.hash(new_pass,salt_round).then(function(hash){
                        con.query('update login set password=? where reset_key=?',[hash,reset_key],function(err,results){
                            if(!err){
                                console.log('Password Reset Successfull!!');
                                return res.redirect('/');
                            }
                            else{
                                res.send('Error in password reset!!');
                            }
                            
                        })
                    });
                    
                    
                }
                else
                {
                    res.send('Reset_key expired');
                }
                
            }
            else
            {
                res.send('Reset Key invalid');
            }
        });
    }
    else
    {
        res.send('Password not matching');
    }

});

/*
route.post('/predict',function(req,res){
    let num='5';
    let movie='Spectre';
    let email=req.body.email;
    //console.log(email);
    let process=spawn('python',["./python/movie_rec.py",movie,num]);
    process.stdout.on('data',function(data){
        console.log('Got data');
        let prediction = data.toString();
        let transporter = nodemailer.createTransport({
            service: "gmail",
            port: 465,
            auth: {
              user: 'ayushsinha126@gmail.com', // gmail address
              pass: 'dpeiwpbypsokgzqj' //gmail application password
            }
          });
        let mailinfo = {
            subject: `CRYPTS Movie Recommendations`,
            to: email,
            from: `CRYPTS <ayushsinha126@gmail.com>`,
            html: `
              <h3>Hi,</h3>
              <h3>Here are your reccomendations</h3>
              <h2><code contenteditable="false" style="font-weight:200;font-size:1.5rem;padding:5px 10px; background: #EEEEEE; border:0">${prediction}</code></h4>
            `
          };
          try {
            transporter.sendMail(mailinfo, function(error, response){
              if (error) 
              {
                console.log("error:\n", error, "\n");
                res.status(500).send("could not send Recommendations");
              } 
              else 
              {
                console.log("email sent:\n", response);
                //res.status(200).send("Reset Code sent");
                res.redirect('/movie');
              }
            
            });
          } 
          catch (error) 
          {
            console.log(error);
            res.status(500).send("could not send Recommendations");
          }
        

    })
});
*/

module.exports=route;

