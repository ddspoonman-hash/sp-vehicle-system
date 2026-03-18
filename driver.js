const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

const car=document.getElementById("car");
const meter=document.getElementById("meter");
const running=document.getElementById("running");
const endMeter=document.getElementById("endMeter");

window.onload=async()=>{

const user=JSON.parse(localStorage.getItem("user"));
if(!user){ location.href="index.html"; return; }

if(document.getElementById("user")){
document.getElementById("user").innerText=user.name;
}

const init=await fetch(GAS+"?type=init").then(r=>r.json());

// 出発画面
if(car){

car.innerHTML="";

init.cars.forEach(c=>{
const opt=document.createElement("option");
opt.value=c;
opt.textContent=c;
car.appendChild(opt);
});

car.onchange=async()=>{
const m=await fetch(GAS+`?type=meter&car=${car.value}`).then(r=>r.json());
meter.value=m;
};

car.dispatchEvent(new Event("change"));

running.innerHTML="";
init.running.forEach(r=>{
running.innerHTML+=`${r.car}（${r.driver}）<br>`;
});

}

// 到着画面
if(endMeter){

const c=localStorage.getItem("lastCar");

if(c){
const m=await fetch(GAS+`?type=meter&car=${c}`).then(r=>r.json());
endMeter.value=m;
}

}

};

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
