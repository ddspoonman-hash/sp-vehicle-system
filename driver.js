const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

let init;

window.onload = async ()=>{

try{

const user = JSON.parse(localStorage.getItem("user"));
if(!user){
location.href="index.html";
return;
}

// ★キャッシュ防止
const res = await fetch(GAS+"?type=init&time="+Date.now());
init = await res.json();

console.log("init:", init);

// ---------------- 運転者 ----------------
const driver = document.getElementById("driverName");
if(driver){
driver.innerHTML="";

// デフォルト
const def = document.createElement("option");
def.value="";
def.textContent="選択してください";
driver.appendChild(def);

// データ
(init.drivers||[]).forEach(d=>{
const o=document.createElement("option");
o.value=d.name;
o.textContent=d.name+"（"+d.dept+"）";
driver.appendChild(o);
});
}

// ---------------- 車両 ----------------
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

}catch(e){
console.error("初期化エラー", e);
alert("データ取得失敗");
}

};

// ---------------- 出発 ----------------
function start(){

const user = JSON.parse(localStorage.getItem("user"));

const car = document.getElementById("car").value;
const driverName = document.getElementById("driverName").value || user.name;

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
startMeter:0
})
});

localStorage.setItem("lastCar",car);

location.href="driver_arrival.html";
}

// ---------------- 到着 ----------------
function arrival(){

fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"arrival",
car:localStorage.getItem("lastCar"),
endMeter:0
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
