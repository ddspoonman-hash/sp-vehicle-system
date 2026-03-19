const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

// ---------------- 一覧 ----------------
async function load(){

let d=await (await fetch(GAS+"?type=reservations")).json();

list.innerHTML = d.map(x=>`
${x.date} ${x.start}-${x.end}<br>
🚗 ${x.car} / 👤 ${x.user}<br>
📌 ${x.purpose || ""}<hr>
`).join("");

}

// ---------------- 車両 ----------------
async function initCars(){

const data = await fetch(GAS+"?type=init").then(r=>r.json());

const carSelect = document.getElementById("car");

carSelect.innerHTML="";

data.cars.forEach(c=>{
const o=document.createElement("option");
o.value=c;
o.textContent=c;
carSelect.appendChild(o);
});

}

// ---------------- 予約追加 ----------------
async function addReservation(){

const user = JSON.parse(localStorage.getItem("user"));

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

// 衝突チェック
if(res.status=="conflict"){
alert("その時間は予約済みです");
return;
}

alert("予約OK");

// 再読み込み
load();

}

// ---------------- 共通 ----------------
function logout(){
localStorage.clear();
location.href="index.html";
}

// 初期化
window.onload = ()=>{
load();
initCars();
};
