let username=document.getElementById('username');
let email=document.getElementById('email');
let password=document.getElementById('password');

document.getElementById('signup_form').addEventListener("submit",function(event){
    event.preventDefault();
    console.log('Browser - '+username.value);
    axios.post('../user/signup',{username:username.value,email:email.value,password:password.value}).then(function(response){
        console.log(response);
    }).catch(function(error){
        console.log('Signup - '+error);
    })
});