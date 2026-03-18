const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

let drivers=[];

window.onload=async()=>{
drivers=await fetch(GAS+"?type=drivers").then(r=>r.json());
};

function login(){

const id=document.getElementById("id").value;
const pass=document.getElementById("pass").value;

const user=drivers.find(d=>d.id===id);

if(!user){ alert("IDなし"); return; }
if(user.pass!=pass){ alert("PASS違い"); return; }

localStorage.setItem("user",JSON.stringify(user));
location.href="driver_start.html";

}

function login(){

const id = document.getElementById("id").value;
const pass = document.getElementById("pass").value;

fetch(GAS+"?type=drivers")
.then(r=>r.json())
.then(list=>{

const user = list.find(u=>u.id==id && u.pass==pass);

if(!user){
alert("IDまたはPASS違う");
return;
}

// 保存
localStorage.setItem("user",JSON.stringify(user));

// ★ 管理者分岐（ここ重要）
if(user.id==="admin"){
location.href="admin.html";
}else{
location.href="driver_start.html";
}

});

}
