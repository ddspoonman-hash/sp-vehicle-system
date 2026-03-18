const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

let drivers=[];

window.onload=async()=>{
drivers=await fetch(GAS+"?type=drivers").then(r=>r.json());
};

function login(){

const id=idInput.value;
const pass=passInput.value;

const user=drivers.find(d=>d.id===id);

if(!user) return alert("IDなし");
if(user.pass!=pass) return alert("PASS違い");

localStorage.setItem("user",JSON.stringify(user));
location.href="driver_start.html";

}
