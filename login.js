const GAS="https://script.google.com/macros/s/AKfycbwbMFxKiQlT_hpb_iNjljeEvKZ7LMr9q8i2KpdW6iWrO6d3pv40iun7SLRTFAstn9C5/exec";

function login(){

const id = document.getElementById("id").value;
const pass = document.getElementById("pass").value;

// 毎回ユニークcallback（キャッシュ完全回避）
const cb = "cb_" + Date.now();

window[cb] = function(list){

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

const script = document.createElement("script");
script.src = GAS + `?type=drivers&callback=${cb}&t=${Date.now()}`;
document.body.appendChild(script);

}
