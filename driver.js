const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";
let gpsLog = [];
let gpsTimer = null;
let init;

window.onload = async ()=>{

try{

const user = JSON.parse(localStorage.getItem("user"));
if(!user){
location.href="index.html";
return;
}

// ---------------- init取得 ----------------
const res = await fetch(GAS+"?type=init&time="+Date.now());
init = await res.json();

console.log("init:", init);

// 安全チェック
if(!init || !init.cars || !init.drivers){
alert("初期データ取得失敗");
return;
}

// ---------------- 運転者 ----------------
const driver = document.getElementById("driverName");

if(driver){
driver.innerHTML="";

// 初期表示
const def = document.createElement("option");
def.value="";
def.textContent="運転者を選択";
driver.appendChild(def);

// データ
init.drivers.forEach(d=>{
const o=document.createElement("option");
o.value=d.name;
o.textContent=`${d.name}（${d.dept}）`;
driver.appendChild(o);
});
}

// ---------------- 車両 ----------------
const car = document.getElementById("car");

if(car){
car.innerHTML="";

init.cars.forEach(c=>{
const o=document.createElement("option");
o.value=c;
o.textContent=c;
car.appendChild(o);
});

// ★ メーター取得
car.onchange = async ()=>{

try{

const res = await fetch(GAS+`?type=meter&car=${car.value}`);
const m = await res.json();

console.log("meter:", m);

const meterInput = document.getElementById("meter");

if(meterInput){
meterInput.value = m;
}else{
console.error("meter要素がない");
}

}catch(e){
console.error("メーター取得エラー", e);
}

};

// 初期実行
car.dispatchEvent(new Event("change"));

}

// ---------------- 到着画面処理 ----------------
if(document.getElementById("endMeter")){

const carName = localStorage.getItem("lastCar");

if(carName){
fetch(GAS+`?type=meter&car=${carName}`)
.then(r=>r.json())
.then(m=>{
document.getElementById("endMeter").value = m;
});
}

}

}catch(e){
console.error("初期化エラー", e);
alert("初期化失敗");
}

};

// ---------------- 出発 ----------------
function start(){

const user = JSON.parse(localStorage.getItem("user"));

const car = document.getElementById("car").value;
const driverName = document.getElementById("driverName").value || user.name;
const meter = document.getElementById("meter").value;

if(!car){
alert("車両選択して");
return;
}

fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"start",
car:car,
driver:driverName,
dept:user.dept,
startMeter:meter
})
});

localStorage.setItem("lastCar",car);

location.href="driver_arrival.html";
// GPSログ開始
gpsLog = [];

gpsTimer = setInterval(()=>{
navigator.geolocation.getCurrentPosition(pos=>{
gpsLog.push({
lat: pos.coords.latitude,
lng: pos.coords.longitude
});
console.log("GPS:", pos.coords.latitude, pos.coords.longitude);
});
}, 30000); // 30秒ごと
}

// ---------------- 到着 ----------------
function arrival(){

const endMeter = document.getElementById("endMeter").value;

fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"arrival",
car:localStorage.getItem("lastCar"),
endMeter:endMeter,
gpsLog:gpsLog // ★追加
})
});

alert("完了");
location.href="driver_start.html";
}

// ---------------- ログアウト ----------------
function logout(){
localStorage.clear();
location.href="index.html";
}
