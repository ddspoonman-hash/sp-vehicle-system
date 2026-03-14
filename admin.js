const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

let map;

async function initMap(){

map=new google.maps.Map(document.getElementById("map"),{
center:{lat:35,lng:135},
zoom:10
});

loadRunning();

}

async function loadRunning(){

const res=await fetch(GAS+"?type=running");
const cars=await res.json();

cars.forEach(c=>{

new google.maps.Marker({
position:{lat:c.lat,lng:c.lng},
map:map,
title:c.car+" "+c.driver
});

});

}

async function loadCars(){

const res=await fetch(GAS+"?type=cars");
const cars=await res.json();

let html="";

cars.forEach(c=>{
html+=`<div>${c}</div>`;
});

carList.innerHTML=html;

}

async function addCar(){

await fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"addCar",
car:newCar.value
})
});

loadCars();

}

async function loadDrivers(){

const res=await fetch(GAS+"?type=drivers");
const drivers=await res.json();

let html="";

drivers.forEach(d=>{
html+=`<div>${d}</div>`;
});

driverList.innerHTML=html;

}

async function addDriver(){

await fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"addDriver",
driver:newDriver.value
})
});

loadDrivers();

}

function logout(){
localStorage.removeItem("driver");
location.href="login.html";
}

window.onload=function(){
initMap();
loadCars();
loadDrivers();
}
