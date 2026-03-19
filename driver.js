const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

let init;
let allDrivers=[];
let selectedPassengers=new Set();

window.onload = async ()=>{

const user = JSON.parse(localStorage.getItem("user"));
if(!user){location.href="index.html";return;}

// init取得
init = await fetch(GAS+"?type=init").then(r=>r.json());
localStorage.setItem("init",JSON.stringify(init));

// ★↓↓↓↓ ここに追加 ↓↓↓↓
const driverSelect = document.getElementById("driverName");

if(driverSelect){
driverSelect.innerHTML="";

// デフォルト
const def = document.createElement("option");
def.value="";
def.textContent="選択してください";
driverSelect.appendChild(def);

(init.drivers||[]).forEach(d=>{
const o=document.createElement("option");
o.value=d.name;
o.textContent=d.name;
driverSelect.appendChild(o);
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

// ★ここで取得（外に出すのがポイント）
const driverInput = document.getElementById("driverName");

localStorage.setItem("lastCar",car);
localStorage.removeItem("init");

navigator.geolocation.getCurrentPosition(pos=>{

fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"start",
car:car,
driver: driverInput.value || user.name, // ←ここが効く
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
driver: driverInput.value || user.name, // ←ここも同じにする
dept:user.dept,
startMeter:meter,
lat:0,
lng:0
})
});

location.href="driver_arrival.html";

});
startTracking();
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
const destSelect = document.getElementById("destination");
destSelect.innerHTML="";

(init.destinations||[]).forEach(d=>{
  const o=document.createElement("option");
  o.value=d;
  o.textContent=d;
  destSelect.appendChild(o);
});

// その他
const other = document.createElement("option");
other.value="その他";
other.textContent="その他";
destSelect.appendChild(other);

const purposeSelect = document.getElementById("purpose");
purposeSelect.innerHTML="";

(init.purposes||[]).forEach(p=>{
  const o=document.createElement("option");
  o.value=p;
  o.textContent=p;
  purposeSelect.appendChild(o);
});

const other2 = document.createElement("option");
other2.value="その他";
other2.textContent="その他";
purposeSelect.appendChild(other2);
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
let destination = document.getElementById("destination").value;
if(destination==="その他"){
  destination = document.getElementById("destinationOther").value;
}

let purpose = document.getElementById("purpose").value;
if(purpose==="その他"){
  purpose = document.getElementById("purposeOther").value;
}
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


function checkDestination(){
  const v = document.getElementById("destination").value;
  document.getElementById("destinationOther").style.display =
    (v==="その他") ? "block":"none";
}

function checkPurpose(){
  const v = document.getElementById("purpose").value;
  document.getElementById("purposeOther").style.display =
    (v==="その他") ? "block":"none";
}


let watchId;

function startTracking(){

watchId = navigator.geolocation.watchPosition(pos=>{

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
enableHighAccuracy:true,
maximumAge:0,
timeout:5000
});

}
