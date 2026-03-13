const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

const car=document.getElementById("car");
const startMeter=document.getElementById("startMeter");

async function loadCars(){

const res=await fetch(GAS+"?type=cars");

const cars=await res.json();

let html="";

cars.forEach(c=>{

html+=`<option>${c}</option>`;

});

car.innerHTML=html;

}

async function loadMeter(){

const res=await fetch(GAS+"?type=meter&car="+car.value);

const meter=await res.json();

document.getElementById("currentMeter").innerText=meter;

startMeter.value=meter;

}

async function start(){

const driver=localStorage.getItem("driver");

navigator.geolocation.getCurrentPosition(async pos=>{

await fetch(GAS,{
method:"POST",
body:JSON.stringify({

type:"start",
car:car.value,
driver:driver,
startMeter:startMeter.value,
lat:pos.coords.latitude,
lng:pos.coords.longitude

})
});

location.href="driver_arrival.html";

});

}

async function arrival(){

if(!confirmDrop.checked){

alert("降車確認してください");

return;

}

navigator.geolocation.getCurrentPosition(async pos=>{

await fetch(GAS,{
method:"POST",
body:JSON.stringify({

type:"arrival",
endMeter:endMeter.value,
lat:pos.coords.latitude,
lng:pos.coords.longitude

})
});

alert("登録完了");

location.href="driver_start.html";

});

}

window.onload=function(){

if(car){
loadCars();
setTimeout(loadMeter,500);
}

}

function logout(){

localStorage.removeItem("driver");

location.href="login.html";

}
