const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

async function start(){

navigator.geolocation.getCurrentPosition(async pos=>{

await fetch(GAS,{
method:"POST",
body:JSON.stringify({

type:"start",
car:car.value,
startMeter:startMeter.value,
lat:pos.coords.latitude,
lng:pos.coords.longitude

})
});

location.href="driver_arrival.html";

});

}

async function arrival(){

navigator.geolocation.getCurrentPosition(async pos=>{

let passengers=[...document.querySelectorAll("input[name=pass]:checked")].map(x=>x.value).join(",");

let destination=destOther.value || destinationSelect.value;

let purpose=purposeOther.value || purposeSelect.value;

await fetch(GAS,{
method:"POST",
body:JSON.stringify({

type:"arrival",
destination,
purpose,
passengers,
endMeter:endMeter.value,
memo:memo.value,
lat:pos.coords.latitude,
lng:pos.coords.longitude

})
});

location.href="driver_start.html";

});


}


async function loadRunningCars(){

const res=await fetch(GAS+"?type=running");

const cars=await res.json();

let html="";

cars.forEach(c=>{

html+=`${c.car}（${c.driver}）<br>`;

});

document.getElementById("runningCars").innerHTML=html;

}




async function loadCars(){

const carRes=await fetch(GAS+"?type=cars");
const cars=await carRes.json();

const runRes=await fetch(GAS+"?type=running");
const running=await runRes.json();

const runningCars=running.map(c=>c.car);

let html="";

cars.forEach(c=>{

if(runningCars.includes(c)){

html+=`<option disabled>${c}（出発中）</option>`;

}else{

html+=`<option>${c}</option>`;

}

});

document.getElementById("car").innerHTML=html;

}


window.onload=function(){

loadRunningCars();
loadCars();

setTimeout(loadMeter,500);

};


async function loadMeter(){

const car=document.getElementById("car").value;

const res=await fetch(GAS+"?type=meter&car="+encodeURIComponent(car));

const meter=await res.json();

document.getElementById("currentMeter").innerText=meter;

document.getElementById("startMeter").value=meter;

}

