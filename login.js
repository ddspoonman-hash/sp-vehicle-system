const GAS="https://script.google.com/macros/s/AKfycbwbMFxKiQlT_hpb_iNjljeEvKZ7LMr9q8i2KpdW6iWrO6d3pv40iun7SLRTFAstn9C5/exec";

const GAS="https://script.google.com/macros/s/AKfycbwbMFxKiQlT_hpb_iNjljeEvKZ7LMr9q8i2KpdW6iWrO6d3pv40iun7SLRTFAstn9C5/exec";

function login(){

const id = document.getElementById("id").value;
const pass = document.getElementById("pass").value;

// 毎回callback名変える（超重要）
const cb = "cb_" + Date.now();

window[cb] = function(list){

const user = list.find(u=>u.id==id && u.pass==pass);

if(!user){
alert("ログイン失敗");
return;
}

localStorage.setItem("user",JSON.stringify(user));

location.href = user.id==="admin" ? "admin.html" : "driver_start.html";

};

// JSONP
const script = document.createElement("script");
script.src = GAS + `?type=drivers&callback=${cb}&t=${Date.now()}`;
document.body.appendChild(script);

}
