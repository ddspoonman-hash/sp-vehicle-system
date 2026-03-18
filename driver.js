const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

const car=document.getElementById("car");
const meter=document.getElementById("meter");

window.onload=async()=>{

const user=JSON.parse(localStorage.getItem("user"));
if(!user){ location.href="index.html"; return; }

if(document.getElementById("user")){
document.getElementById("user").innerText=user.name;
}

// 初期データ一括取得
const init=await fetch(GAS+"?type=init").then(r=>r.json());

if(car){

loadCars(init,user);

car.onchange=async()=>{
const m=await fetch(GAS+`?type=meter&car=${car.value}`).then(r=>r.json());
meter.value=m;
};

car.dispatchEvent(new Event("change"));

loadRunning(init);
loadReservations(init);

}

// 到着画面
if(document.getElementById("endMeter")){
const c=localStorage.getItem("lastCar");
if(c){
const m=await fetch(GAS+`?type=meter&car=${c}`).then(r=>r.json());
document.getElementById("endMeter").value=m;
}
}

};

// 車両ロック
function loadCars(init,user){

const today=new Date().toISOString().slice(0,10);

car.innerHTML="";

init.cars.forEach(c=>{

let disabled=false;
let label=c;

// 使用中
const run=init.running.find(r=>r.car===c);
if(run){ disabled=true; label+="（使用中）"; }

// 予約
const rsv=init.reservations.find(r=>r.car===c && r.date===today);
if(rsv){
if(rsv.user!==user.name){
disabled=true;
label+=`（予約:${rsv.user}）`;
}else{
label+="（自分予約）";
}
}

const opt=document.createElement("option");
opt.value=c;
opt.textContent=label;
opt.disabled=disabled;

car.appendChild(opt);

});

}

// 使用中表示
function loadRunning(init){

const div=document.getElementById("running");
div.innerHTML="";

init.running.forEach(r=>{
div.innerHTML+=`${r.car}（${r.driver}）<br>`;
});

}

// 予約表示
function loadReservations(init){

const today=new Date().toISOString().slice(0,10);

const div=document.getElementById("reservations");
div.innerHTML="";

init.reservations
.filter(r=>r.date===today)
.forEach(r=>{
div.innerHTML+=`${r.start}-${r.end} ${r.car}<br>`;
});

}

// 出発
async function start(){

const user=JSON.parse(localStorage.getItem("user"));

localStorage.setItem("lastCar",car.value);

navigator.geolocation.getCurrentPosition(async pos=>{

await fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"start",
car:car.value,
driver:user.name,
lat:pos.coords.latitude,
lng:pos.coords.longitude
})
});

location.href="driver_arrival.html";

});

}

// 到着
async function arrival(){

const endMeter=document.getElementById("endMeter").value;

navigator.geolocation.getCurrentPosition(async pos=>{

await fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"arrival",
endMeter:endMeter,
lat:pos.coords.latitude,
lng:pos.coords.longitude
})
});

alert("完了");
location.href="driver_start.html";

});

}

// ログアウト
function logout(){
localStorage.removeItem("user");
location.href="index.html";
}
