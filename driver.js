const GAS="https://script.google.com/macros/s/AKfycbwbMFxKiQlT_hpb_iNjljeEvKZ7LMr9q8i2KpdW6iWrO6d3pv40iun7SLRTFAstn9C5/exec";
let selectedPassengers = [];
// JSONP
function jsonp(url){
return new Promise(res=>{
const cb = "cb_" + Date.now();
window[cb]=data=>{
res(data);
delete window[cb];
};
const s=document.createElement("script");
s.src=url+"&callback="+cb+"&t="+Date.now();
document.body.appendChild(s);
});
}

window.onload = async ()=>{

const user = JSON.parse(localStorage.getItem("user"));
if(!user){
location.href="index.html";
return;
}

if(document.getElementById("car")){
initStart();
}

if(document.getElementById("endMeter")){
startGPS();
loadEndMeter();
}

if(document.getElementById("passengerList")){
  initArrival();
}
};

// 出発初期化
async function initStart(){

const data = await jsonp(GAS+"?type=init");

const car = document.getElementById("car");
const driver = document.getElementById("driverName");

driver.innerHTML="";
data.drivers.forEach(d=>{
const o=document.createElement("option");
o.value=d.name;
o.textContent=d.name;
driver.appendChild(o);
});

car.innerHTML="";
data.cars.forEach(c=>{
const o=document.createElement("option");
o.value=c;
o.textContent=c;
car.appendChild(o);
});

car.onchange = async ()=>{
const m = await jsonp(GAS+`?type=meter&car=${encodeURIComponent(car.value)}`);
document.getElementById("meter").value = m;
};

car.dispatchEvent(new Event("change"));
}

// 出発
function start(){

const user = JSON.parse(localStorage.getItem("user"));

const car = document.getElementById("car").value;
const driver = document.getElementById("driverName").value;
const meter = document.getElementById("meter").value;

jsonp(
GAS+`?type=start`
+`&car=${encodeURIComponent(car)}`
+`&driver=${encodeURIComponent(driver)}`
+`&dept=${encodeURIComponent(user.dept)}`
+`&startMeter=${meter}`
);

localStorage.setItem("lastCar",car);

location.href="driver_arrival.html";
}

// GPS
function startGPS(){

localStorage.setItem("gpsLog","[]");

setInterval(()=>{
navigator.geolocation.getCurrentPosition(pos=>{

const log = JSON.parse(localStorage.getItem("gpsLog"));

log.push({
lat:pos.coords.latitude,
lng:pos.coords.longitude
});

localStorage.setItem("gpsLog",JSON.stringify(log));

});
},30000);
}

// メーター
async function loadEndMeter(){

const car = localStorage.getItem("lastCar");

const m = await jsonp(GAS+`?type=meter&car=${encodeURIComponent(car)}`);

document.getElementById("endMeter").value = m;
}

// 到着
function arrival(){

const gpsLog = JSON.parse(localStorage.getItem("gpsLog") || "[]");
const car = localStorage.getItem("lastCar");
const endMeter = document.getElementById("endMeter").value;

const script = document.createElement("script");

script.src =
GAS + `?type=arrival`
+ `&car=${encodeURIComponent(car)}`
+ `&endMeter=${endMeter}`
+ `&gpsLog=${encodeURIComponent(JSON.stringify(gpsLog))}`
+ `&callback=cb_arrival`
+ `&t=${Date.now()}`;

document.body.appendChild(script);

localStorage.removeItem("gpsLog");

alert("完了");

location.href="driver_start.html";
}

function logout(){
  localStorage.clear();
  location.href = "index.html";
}


let passengers = [];

// 初期化（到着画面用）
async function initArrival(){

const data = await jsonp(GAS+"?type=masters");

passengers = data.passengers;

const groupSelect = document.getElementById("pGroup");

// グループ一覧
const groups = [...new Set(passengers.map(p=>p.group))];

groupSelect.innerHTML="";

groups.forEach(g=>{
const o=document.createElement("option");
o.value=g;
o.textContent=g;
groupSelect.appendChild(o);
});

// 初期表示
renderPassengers(groups[0]);

groupSelect.onchange = ()=>{
renderPassengers(groupSelect.value);
};

}

function renderPassengers(group){

const container = document.getElementById("passengerList");

// 現在の選択を保存
const checks = container.querySelectorAll("input[type=checkbox]");
selectedPassengers = Array.from(checks)
  .filter(c=>c.checked)
  .map(c=>c.value);

// 再描画
container.innerHTML="";

passengers
  .filter(p=>p.group===group)
  .forEach(p=>{

    const checked = selectedPassengers.includes(p.name) ? "checked" : "";

    container.innerHTML += `
    <label>
      <input type="checkbox" value="${p.name}" ${checked}>
      ${p.name}
    </label><br>
    `;
  });

}

