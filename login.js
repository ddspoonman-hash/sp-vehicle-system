const GAS="https://script.google.com/macros/s/AKfycbwbMFxKiQlT_hpb_iNjljeEvKZ7LMr9q8i2KpdW6iWrO6d3pv40iun7SLRTFAstn9C5/exec";

function login(){

const id = document.getElementById("id").value;
const pass = document.getElementById("pass").value;

const script = document.createElement("script");

script.src = GAS + "?type=drivers&callback=handleLogin";

document.body.appendChild(script);

window.handleLogin = function(list){

const user = list.find(u=>u.id==id && u.pass==pass);

if(!user){
alert("IDまたはPASS違う");
return;
}

localStorage.setItem("user",JSON.stringify(user));

if(user.id==="admin"){
location.href="admin.html";
}else{
location.href="driver_start.html";
}

};

}
