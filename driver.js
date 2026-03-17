const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

const car=document.getElementById("car");
const meter=document.getElementById("meter");

window.onload=async()=>{

const user=JSON.parse(localStorage.getItem("user"));
document.getElementById("user").innerText=`ログイン：${user.name}`;

// ★ここ差し替え
await loadCarsWithLock();

// メーター
car.onchange=async()=>{
const m=await fetch(GAS+`?type=meter&car=${car.value}`).then(r=>r.json());
meter.value=m;
};

// 初期選択
if(car.options.length>0){
car.selectedIndex=0;
car.dispatchEvent(new Event("change"));
}

loadRunning();
loadReservations();

};


// ■ 使用中車両
async function loadRunning(){

const list=await fetch(GAS+"?type=running").then(r=>r.json());

const div=document.getElementById("running");
div.innerHTML="";

if(list.length===0){
div.innerHTML="なし";
return;
}

list.forEach(r=>{
div.innerHTML+=`${r.car}（${r.driver}）<br>`;
});

}


// ■ 予約表示（本日）
async function loadReservations(){

const list=await fetch(GAS+"?type=reservations").then(r=>r.json());

const today=new Date().toISOString().slice(0,10);

const div=document.getElementById("reservations");
div.innerHTML="";

const todayList=list.filter(r=>r.date===today);

if(todayList.length===0){
div.innerHTML="なし";
return;
}

todayList.forEach(r=>{
div.innerHTML+=`${r.start}-${r.end} ${r.car}（${r.user}）<br>`;
});

}


// ■ 出発
async function start(){

const user=JSON.parse(localStorage.getItem("user"));

navigator.geolocation.getCurrentPosition(async pos=>{

await fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"start",
car:car.value,
driver:user.name,
startMeter:meter.value,
lat:pos.coords.latitude,
lng:pos.coords.longitude
})
});

location.href="driver_arrival.html";

});

}

async function loadCarsWithLock(){

const user=JSON.parse(localStorage.getItem("user"));

const cars=await fetch(GAS+"?type=cars").then(r=>r.json());
const running=await fetch(GAS+"?type=running").then(r=>r.json());
const reservations=await fetch(GAS+"?type=reservations").then(r=>r.json());

const today=new Date().toISOString().slice(0,10);

car.innerHTML="";

cars.forEach(c=>{

let disabled=false;
let label=c;

// ■ 使用中チェック
const isRunning=running.find(r=>r.car===c);

if(isRunning){
disabled=true;
label+="（使用中）";
}

// ■ 予約チェック（今日）
const rsv=reservations.find(r=>r.car===c && r.date===today);

if(rsv){

if(rsv.user!==user.name){
disabled=true;
label+=`（予約:${rsv.user}）`;
}else{
label+="（自分予約）";
}

}

// option生成
const opt=document.createElement("option");
opt.value=c;
opt.textContent=label;
opt.disabled=disabled;

car.appendChild(opt);

});

}
