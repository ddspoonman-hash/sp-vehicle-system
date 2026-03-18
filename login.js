const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

let drivers=[];

window.onload=async()=>{
drivers=await fetch(GAS+"?type=drivers").then(r=>r.json());
};

function login(){

const id=document.getElementById("id").value;
const pass=document.getElementById("pass").value;

const user=drivers.find(d=>d.id===id);

if(!user){
alert("IDが存在しません");
return;
}

if(user.pass!=pass){
alert("パスワードが違います");
return;
}

localStorage.setItem("user",JSON.stringify(user));

location.href="driver_start.html";

}
