let express=require('express');
let path=require('path');
let session = require('express-session');
let bodyParser = require('body-parser');
let sanitize=require('sanitize-html');
//let flash=require('connect-flash');
let cookieParser=require('cookie-parser');
let morgan=require('morgan');  // For logs
let incomingform=require('formidable');
let spawn=require('child_process').spawn;
let nodemailer=require('nodemailer');

let server=express();

server.use(express.json())
server.use(express.urlencoded({extended: false}))
server.use(express.static(__dirname));
server.use(express.static('public'));
//server.use(flash());
//server.use(morgan('short'));  // for viewing logs on console

let con=require('./db');

let user_route=require('./route/user-info');
server.use('/user',user_route);

server.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/html/index.html'));
});

server.get('/reset-page',function(req,res){
    res.sendFile(path.join(__dirname+'/html/resetpass.html'));
});

server.get('/about',function(req,res){
    res.sendFile(path.join(__dirname+'/html/about.html'));
});

server.get('/login',function(req,res){
    res.sendFile(path.join(__dirname+'/html/login.html'));
});

server.get('/user-auth',function(req,res){
    res.sendFile(path.join(__dirname+'/html/authpage.html'));
});

server.get('/movie',function(req,res){
    res.sendFile(path.join(__dirname+'/html/movie.html'));
});

server.get('/chatbot',function(req,res){
  res.sendFile(path.join(__dirname+'/html/chatbot.html'));
});

server.get('/signup_suc_page',function(req,res){
  res.sendFile(path.join(__dirname+'/html/redirect.html'));
});

server.get('/send',function(req,res){
  res.sendFile(path.join(__dirname+'/html/send.html'));
});

server.get('/payment',function(req,res){
  res.sendFile(path.join(__dirname+'/html/payment.html'));
});

server.get('/layout',function(req,res){
  res.sendFile(path.join(__dirname+'/html/layout.html'));
});


server.post('/predict',function(req,res){
  let num='5';
  let movie='Spectre';
  let email=req.body.email;
  //console.log(movie);
  //let email='ayushsinha126@gmail.com';
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
                res.redirect('/reset-page');
              }
            
            });
          } 
          catch (error) 
          {
            console.log(error);
            res.status(500).send("could not sent reset code");
          }
        

    })
  
  
});


/*
server.post('/predict',function(req,res){
    let num='5';
    //let movie='Spectre';
    let email=req.body.email;
    con.query('select movie from user_movie_history where email=?',[email],function(error,results){
      let movie=results[0].movie;
      movie=movie.toString();
      //let new_movie=[];
      //new_movie.push(movie);
      //let movie='Spectre';
      //console.log(movie);
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
                  res.redirect('/movie');
                }
              
              });
            } 
            catch (error) 
            {
              console.log(error);
              res.status(500).send("could not sent reset code");
            }
          

      })
  });
    
    
});
*/

server.get('/review',function(req,res){
  let process=spawn('python',["./python/movie_pred.py"]);
  process.stdout.on('data',function(data){
    console.log('Got data');
    let review=data.toString();
    console.log(review);
  })
});

let portnum=process.env.PORT;
if(portnum==null || portnum=='')
{
    portnum=8080;
}
server.listen(portnum);
console.log('Server started at '+portnum);
