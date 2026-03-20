const GAS="https://script.google.com/macros/s/AKfycbwbMFxKiQlT_hpb_iNjljeEvKZ7LMr9q8i2KpdW6iWrO6d3pv40iun7SLRTFAstn9C5/exec";
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
// ---------------- init取得（JSONP） ----------------
function loadInit(){

const script = document.createElement("script");
script.src = GAS + "?type=init&callback=handleInit&time=" + Date.now();
document.body.appendChild(script);

window.handleInit = function(data){

console.log("init:", data);

init = data;

// 安全チェック
if(!init || !init.cars || !init.drivers){
alert("初期データ取得失敗");
return;
}

// ---------------- 運転者 ----------------
const driver = document.getElementById("driverName");

if(driver){
driver.innerHTML="";

const def = document.createElement("option");
def.value="";
def.textContent="運転者を選択";
driver.appendChild(def);

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

// メーター取得（ここは後で直す）
car.onchange = ()=>{
const script2 = document.createElement("script");
script2.src = GAS + `?type=meter&car=${car.value}&callback=handleMeter`;
document.body.appendChild(script2);
};

window.handleMeter = function(m){
document.getElementById("meter").value = m;
};

car.dispatchEvent(new Event("change"));

}

};

}

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


// ---------------- GPS開始（到着画面） ----------------
if(document.getElementById("endMeter")){

gpsLog = [];

gpsTimer = setInterval(()=>{
navigator.geolocation.getCurrentPosition(pos=>{

gpsLog.push({
lat: pos.coords.latitude,
lng: pos.coords.longitude
});

console.log("GPS:", pos.coords.latitude, pos.coords.longitude);

});
}, 30000);

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

}

// ---------------- 到着 ----------------
function arrival(){

// ★追加（ここ超重要）
gpsLog = JSON.parse(localStorage.getItem("gpsLog") || "[]");

const endMeter = document.getElementById("endMeter").value;

console.log("arrival押された");
console.log("gpsLog:", gpsLog);

fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"arrival",
car:localStorage.getItem("lastCar"),
endMeter:endMeter,
gpsLog:gpsLog
})
})
.then(r=>r.json())
.then(res=>{
console.log("GASレスポンス:", res);
})
.catch(err=>{
console.error("送信エラー", err);
});

alert("完了");
location.href="driver_start.html";

localStorage.removeItem("gpsLog");
}
// ---------------- ログアウト ----------------
function logout(){
localStorage.clear();
location.href="index.html";
}
