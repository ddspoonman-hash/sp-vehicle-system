const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

const car=document.getElementById("car");
const startMeter=document.getElementById("startMeter");

window.onload=async()=>{

const user=JSON.parse(localStorage.getItem("user"));
document.getElementById("user").innerText=user.name;

// 車両
const cars=await fetch(GAS+"?type=cars").then(r=>r.json());

car.innerHTML="";
cars.forEach(c=>{
const opt=document.createElement("option");
opt.value=c;
opt.textContent=c;
car.appendChild(opt);
});

// メーター
car.onchange=async()=>{
const m=await fetch(GAS+`?type=meter&car=${car.value}`).then(r=>r.json());
startMeter.value=m;
};

car.dispatchEvent(new Event("change"));

// 走行中
loadRunning();

};

async function loadRunning(){

const list=await fetch(GAS+"?type=running").then(r=>r.json());

const div=document.getElementById("runningCars");
div.innerHTML="";

list.forEach(r=>{
div.innerHTML+=`${r.car}（${r.driver}）<br>`;
});

}

async function start(){

const user=JSON.parse(localStorage.getItem("user"));
const adjust=document.getElementById("adjust").value;

navigator.geolocation.getCurrentPosition(async pos=>{

await fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"start",
car:car.value,
driver:user.name,
startMeter:Number(startMeter.value)+Number(adjust),
lat:pos.coords.latitude,
lng:pos.coords.longitude
})
});

location.href="driver_arrival.html";

});

}
