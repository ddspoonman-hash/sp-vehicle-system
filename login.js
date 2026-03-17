const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

const driverSelect=document.getElementById("driver");

window.onload=async()=>{

const list=await fetch(GAS+"?type=drivers").then(r=>r.json());

driverSelect.innerHTML="";

list.forEach(d=>{
const opt=document.createElement("option");
opt.value=JSON.stringify(d);
opt.textContent=`${d.dept} ${d.name}`;
driverSelect.appendChild(opt);
});

};

async function login(){

const user=JSON.parse(driverSelect.value);
const pass=document.getElementById("pass").value;

if(pass!=user.pass){
alert("パスワードが違います");
return;
}

localStorage.setItem("user",JSON.stringify(user));

location.href="driver_start.html";

}
