const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

let init;
let watchId;
let lastSendTime = 0;

window.onload = async ()=>{

const user = JSON.parse(localStorage.getItem("user"));
if(!user){location.href="index.html";return;}

init = await fetch(GAS+"?type=init&time="+Date.now())
.then(r=>r.json());

// 運転者
const driverSelect = document.getElementById("driverName");
if(driverSelect){
driverSelect.innerHTML="";
(init.drivers||[]).forEach(d=>{
const o=document.createElement("option");
o.value=d.name;
o.textContent=d.name;
driverSelect.appendChild(o);
});
}

// 車両
const car = document.getElementById("car");
if(car){
car.innerHTML="";
(init.cars||[]).forEach(c=>{
const o=document.createElement("option");
o.value=c;
o.textContent=c;
car.appendChild(o);
});
}

};

// ---------------- GPSログ ----------------
function startTracking(){

watchId = navigator.geolocation.watchPosition(pos=>{

const now = Date.now();

// ★30秒間隔制御
if(now - lastSendTime < 30000) return;

lastSendTime = now;

fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"track",
car:localStorage.getItem("lastCar"),
lat:pos.coords.latitude,
lng:pos.coords.longitude
})
});

},{
enableHighAccuracy:true
});

}

// ---------------- 出発 ----------------
function start(){

const user = JSON.parse(localStorage.getItem("user"));
const car = document.getElementById("car").value;
const meter = document.getElementById("meter").value;
const driver = document.getElementById("driverName").value || user.name;

localStorage.setItem("lastCar",car);

fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"start",
car,
driver,
dept:user.dept,
startMeter:meter
})
});

startTracking();

location.href="driver_arrival.html";
}

// ---------------- 到着 ----------------
function arrival(){

if(watchId){
navigator.geolocation.clearWatch(watchId);
}

fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"arrival",
car:localStorage.getItem("lastCar")
})
});

alert("完了");
location.href="driver_start.html";
}
