const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

function login(){

const id = document.getElementById("id").value;
const pass = document.getElementById("pass").value;

fetch(GAS+"?type=drivers")
.then(r=>r.json())
.then(list=>{

console.log("drivers:", list);

const user = list.find(u=>u.id==id && u.pass==pass);

if(!user){
alert("IDまたはPASS違う");
return;
}

localStorage.setItem("user",JSON.stringify(user));

// 管理者分岐
if(user.id==="admin"){
location.href="admin.html";
}else{
location.href="driver_start.html";
}

})
.catch(e=>{
alert("通信エラー");
console.error(e);
});

}
