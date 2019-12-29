let mysql=require('mysql');

let con=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'ayush123#',
    database:'movie_management'
});

con.connect(function(error){
    if(error)
    {
        console.log(error);
    }
    else
    {
        console.log('Connected!!');
        con.query('use movie_management');
    }
});

module.exports=con;
