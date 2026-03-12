const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

let map;

let markers={};

map=new google.maps.Map(
document.getElementById("map"),
{zoom:13,center:{lat:35,lng:137}}
);

async function load(){

const res=await fetch(GAS+"?type=running");

const cars=await res.json();

running.innerHTML="";

cars.forEach(c=>{

running.innerHTML+=c.car+" "+c.driver+"<br>";

const pos={lat:c.lat,lng:c.lng};

if(markers[c.car]){

markers[c.car].setPosition(pos);

}else{

markers[c.car]=new google.maps.Marker({
position:pos,
map:map,
label:c.car
});

}

});

}

load();

setInterval(load,60000);