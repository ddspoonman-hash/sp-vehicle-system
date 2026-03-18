const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

window.onload=async()=>{

const user=JSON.parse(localStorage.getItem("user"));
if(!user) location.href="index.html";

if(user) document.getElementById("user")?.innerText=user.name;

// init取得
const init=await fetch(GAS+"?type=init").then(r=>r.json());

// 車両UI
if(car){
loadCars(init,user);

car.onchange=async()=>{
const m=await fetch(GAS+`?type=meter&car=${car.value}`).then(r=>r.json());
meter.value=m;
};

car.dispatchEvent(new Event("change"));
loadRunning(init);
}

// 到着
if(endMeter){
const c=localStorage.getItem("lastCar");
const m=await fetch(GAS+`?type=meter&car=${c}`).then(r=>r.json());
endMeter.value=m;
}

};

// 車両ロック
function loadCars(init,user){

const today=new Date().toISOString().slice(0,10);

car.innerHTML="";

init.cars.forEach(c=>{

let disabled=false;
let label=c;

if(init.running.find(r=>r.car===c)){
disabled=true;
label+="（使用中）";
}

const rsv=init.reservations.find(r=>r.car===c && r.date===today);

if(rsv){
if(rsv.user!==user.name){
disabled=true;
label+="（予約）";
}else{
label+="（自分）";
}
}

const opt=document.createElement("option");
opt.value=c;
opt.textContent=label;
opt.disabled=disabled;
car.appendChild(opt);

});

}

// 使用中表示
function loadRunning(init){

running.innerHTML="";

init.running.forEach(r=>{
running.innerHTML+=`${r.car}（${r.driver}）<br>`;
});

}

// 出発
function start(){

const user=JSON.parse(localStorage.getItem("user"));

localStorage.setItem("lastCar",car.value);

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

// 到着
function arrival(){

navigator.geolocation.getCurrentPosition(async pos=>{

await fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"arrival",
car:localStorage.getItem("lastCar"),
endMeter:endMeter.value,
lat:pos.coords.latitude,
lng:pos.coords.longitude,
passengers:passengers.value,
destination:destination.value,
purpose:purpose.value,
memo:memo.value
})
});

alert("完了");
location.href="driver_start.html";

});

}

function logout(){
localStorage.clear();
location.href="index.html";
}
