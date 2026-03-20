const GAS="https://script.google.com/macros/s/AKfycbwbMFxKiQlT_hpb_iNjljeEvKZ7LMr9q8i2KpdW6iWrO6d3pv40iun7SLRTFAstn9C5/exec";

function login(){

const id = document.getElementById("id").value;
const pass = document.getElementById("pass").value;

// scriptタグで取得（CORS回避）
const script = document.createElement("script");

script.src = GAS + "?type=drivers&callback=handleLogin";

document.body.appendChild(script);

// コールバック
window.handleLogin = function(list){

console.log("取得:", list);

const user = list.find(u=>u.id==id && u.pass==pass);

if(!user){
alert("IDまたはPASS違う");
return;
}

// 保存
localStorage.setItem("user",JSON.stringify(user));

// 遷移
if(user.id==="admin"){
location.href="admin.html";
}else{
location.href="driver_start.html";
}

};

}
