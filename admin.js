const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

let map;

async function initMap(){

map=new google.maps.Map(document.getElementById("map"),{

center:{lat:35,lng:135},
zoom:12

});

loadCars();

}

async function loadCars(){

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

window.onload=initMap;
