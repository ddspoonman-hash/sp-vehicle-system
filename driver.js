const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

const car=document.getElementById("car");
const meter=document.getElementById("meter");

window.onload=async()=>{

const user=JSON.parse(localStorage.getItem("user"));
document.getElementById("user").innerText=`ログイン：${user.name}`;

// 車両一覧
const cars=await fetch(GAS+"?type=cars").then(r=>r.json());

cars.forEach(c=>{
const opt=document.createElement("option");
opt.value=c;
opt.textContent=c;
car.appendChild(opt);
});

// メーター
car.onchange=async()=>{
const m=await fetch(GAS+`?type=meter&car=${car.value}`).then(r=>r.json());
meter.value=m;
};

car.dispatchEvent(new Event("change"));

// ★ここ追加が重要
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
