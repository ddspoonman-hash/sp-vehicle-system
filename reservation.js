const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

async function load(){

let d=await (await fetch(GAS+"?type=reservations")).json();

list.innerText=d
.map(x=>x.date+" "+x.start+"-"+x.end+" "+x.car+" "+x.user)
.join("\n");

}
async function addReservation(){

const user = JSON.parse(localStorage.getItem("user"));

const date = document.getElementById("date");
const start = document.getElementById("start");
const end = document.getElementById("end");
const car = document.getElementById("car");
const purpose = document.getElementById("purpose");

const res = await fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"addReservation",
date:date.value,
start:start.value,
end:end.value,
car:car.value,
user:user.name,
purpose:purpose.value
})
}).then(r=>r.json());

// 🚨 ここ重要
if(res.status=="conflict"){
alert("その時間は予約済みです");
return;
}

alert("予約OK");
load(); // 一覧更新
}
load();
