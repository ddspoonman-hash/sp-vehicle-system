const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

// 要素取得（全部ここで定義）
const car = document.getElementById("car");
const meter = document.getElementById("meter");
const running = document.getElementById("running");
const endMeter = document.getElementById("endMeter");

window.onload = async () => {

const user = JSON.parse(localStorage.getItem("user"));
if(!user){
location.href="index.html";
return;
}

// 名前表示
const userDiv = document.getElementById("user");
if(userDiv){
userDiv.innerText = user.name;
}

// -----------------------------
// ★ init取得（キャッシュ対応）
// -----------------------------
let init = JSON.parse(localStorage.getItem("init"));

if(!init){
init = await fetch(GAS+"?type=init").then(r=>r.json());
localStorage.setItem("init",JSON.stringify(init));
}

// -----------------------------
// ★ 出発画面処理
// -----------------------------
if(car){

// 車両セット
car.innerHTML = "";

init.cars.forEach(c=>{
const opt = document.createElement("option");
opt.value = c;
opt.textContent = c;
car.appendChild(opt);
});

// メーター取得
car.onchange = async ()=>{
const m = await fetch(GAS+`?type=meter&car=${car.value}`).then(r=>r.json());
meter.value = m;
};

car.dispatchEvent(new Event("change"));

// 使用中表示
if(running){
running.innerHTML = "";

init.running.forEach(r=>{
running.innerHTML += `${r.car}（${r.driver}）<br>`;
});
}

}

// -----------------------------
// ★ 到着画面処理
// -----------------------------
if(endMeter){

const c = localStorage.getItem("lastCar");

if(c){
const m = await fetch(GAS+`?type=meter&car=${c}`).then(r=>r.json());
endMeter.value = m;
}

}

};

// -----------------------------
// ★ 出発
// -----------------------------
function start(){

const user = JSON.parse(localStorage.getItem("user"));
localStorage.setItem("lastCar",car.value);

// キャッシュ削除（重要）
localStorage.removeItem("init");

navigator.geolocation.getCurrentPosition(async pos=>{

await fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"start",
car:car.value,
driver:user.name,
dept:user.dept,
startMeter:meter.value,
lat:pos.coords.latitude,
lng:pos.coords.longitude
})
});

location.href="driver_arrival.html";

});

}

// -----------------------------
// ★ 到着
// -----------------------------
function arrival(){

// キャッシュ削除
localStorage.removeItem("init");

// 同乗者取得（チェック＋手入力）
const checked = [...document.querySelectorAll("#passengerList input:checked")]
.map(c=>c.value);

const manual = document.getElementById("passengers")?.value || "";

const passengers = [...checked, manual].filter(x=>x).join(",");

// 行先など
const destination = document.getElementById("destination")?.value || "";
const purpose = document.getElementById("purpose")?.value || "";
const memo = document.getElementById("memo")?.value || "";

// GPSなしでも動くようにする
if(!navigator.geolocation){
sendArrival(passengers,destination,purpose,memo,0,0);
return;
}

navigator.geolocation.getCurrentPosition(
pos=>{
sendArrival(
passengers,
destination,
purpose,
memo,
pos.coords.latitude,
pos.coords.longitude
);
},
()=>{
// GPS失敗でも続行
sendArrival(passengers,destination,purpose,memo,0,0);
}
);

}

async function sendArrival(passengers,destination,purpose,memo,lat,lng){

await fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"arrival",
car:localStorage.getItem("lastCar"),
endMeter:endMeter.value,
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

// -----------------------------
// ★ ログアウト
// -----------------------------
function logout(){
localStorage.clear();
location.href="index.html";
}
