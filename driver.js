const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

let init;
let allDrivers=[];
let selectedPassengers=new Set();

window.onload = async ()=>{

const user = JSON.parse(localStorage.getItem("user"));
if(!user){location.href="index.html";return;}

// init取得
init = JSON.parse(localStorage.getItem("init"));
if(!init){
init = await fetch(GAS+"?type=init").then(r=>r.json());
localStorage.setItem("init",JSON.stringify(init));
}

// ★↓↓↓↓ ここに追加 ↓↓↓↓
const driverList = document.getElementById("driverList");

if(driverList){
driverList.innerHTML="";

(init.drivers||[]).forEach(d=>{
const o=document.createElement("option");
o.value=d.name;
driverList.appendChild(o);
});
}
// ★↑↑↑↑ ここまで ↑↑↑↑

// 出発画面
if(document.getElementById("car")){
setupStart();
}

// 到着画面
if(document.getElementById("endMeter")){
setupArrival();
}

};

// ---------------- 出発 ----------------

function setupStart(){

const car = document.getElementById("car");
const meter = document.getElementById("meter");
const running = document.getElementById("running");

// 車両
car.innerHTML="";
init.cars.forEach(c=>{
const o=document.createElement("option");
o.value=c;o.textContent=c;
car.appendChild(o);
});

// メーター
car.onchange=async ()=>{
const m=await fetch(GAS+`?type=meter&car=${car.value}`).then(r=>r.json());
meter.value=m;
};
car.dispatchEvent(new Event("change"));

// 使用中
running.innerHTML="";
init.running.forEach(r=>{
running.innerHTML+=`${r.car}（${r.driver}）<br>`;
});

}

function start(){

const user = JSON.parse(localStorage.getItem("user"));
const car = document.getElementById("car").value;
const meter = document.getElementById("meter").value;

localStorage.setItem("lastCar",car);
localStorage.removeItem("init");

navigator.geolocation.getCurrentPosition(pos=>{

fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"start",
car:car,
const driverInput = document.getElementById("driverName");

fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"start",
car:car,
driver: driverInput.value || user.name, // ←ここ
dept:user.dept,
startMeter:meter,
lat:pos.coords.latitude,
lng:pos.coords.longitude
})
});
dept:user.dept,
startMeter:meter,
lat:pos.coords.latitude,
lng:pos.coords.longitude
})
});

location.href="driver_arrival.html";

},()=>{
// GPS失敗でも進む
fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"start",
car:car,
driver:user.name,
dept:user.dept,
startMeter:meter,
lat:0,lng:0
})
});
location.href="driver_arrival.html";
});

}

// ---------------- 到着 ----------------

function setupArrival(){

const endMeter = document.getElementById("endMeter");

// メーター取得
const car = localStorage.getItem("lastCar");
fetch(GAS+`?type=meter&car=${car}`)
.then(r=>r.json())
.then(m=>endMeter.value=m);

// 同乗者
allDrivers = init.drivers;
changeGroup();
  
// 行先
const destList = document.getElementById("destList");
destList.innerHTML="";

(init.destinations||[]).forEach(d=>{
const o=document.createElement("option");
o.value=d;
destList.appendChild(o);
});

// 用件
const purposeList = document.getElementById("purposeList");
purposeList.innerHTML="";

(init.purposes||[]).forEach(p=>{
const o=document.createElement("option");
o.value=p;
purposeList.appendChild(o);
});
}

function changeGroup(){

const group = document.getElementById("group").value;
const div = document.getElementById("passengerList");

div.innerHTML="";

allDrivers.filter(d=>d.dept===group).forEach(d=>{

const checked = selectedPassengers.has(d.name) ? "checked":"";

const label=document.createElement("label");

label.innerHTML=`
<input type="checkbox" value="${d.name}" ${checked}>
${d.name}
`;

label.querySelector("input").onchange=e=>{
if(e.target.checked) selectedPassengers.add(d.name);
else selectedPassengers.delete(d.name);
};

div.appendChild(label);
div.appendChild(document.createElement("br"));

});

}

function arrival(){

const endMeter = document.getElementById("endMeter").value;

// 同乗者
const checked=[...document.querySelectorAll("#passengerList input:checked")]
.map(c=>c.value);

const manual=document.getElementById("passengers").value;

const passengers=[...checked,manual].filter(x=>x).join(",");

// その他
const destination=document.getElementById("destination").value;
const purpose=document.getElementById("purpose").value;
const memo=document.getElementById("memo").value;

localStorage.removeItem("init");

navigator.geolocation.getCurrentPosition(pos=>{

sendArrival(passengers,destination,purpose,memo,endMeter,pos.coords.latitude,pos.coords.longitude);

},()=>{
sendArrival(passengers,destination,purpose,memo,endMeter,0,0);
});

}

function sendArrival(passengers,destination,purpose,memo,endMeter,lat,lng){

fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"arrival",
car:localStorage.getItem("lastCar"),
endMeter:endMeter,
lat:lat,
lng:lng,
passengers:passengers,
destination:destination,
purpose:purpose,
memo:memo
})
});

alert("完了");
location.href="driver_start.html";

}

// ---------------- 共通 ----------------

function logout(){
localStorage.clear();
location.href="index.html";
}
