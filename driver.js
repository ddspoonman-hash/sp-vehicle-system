const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

async function load(){

// 車両
let cars=await (await fetch(GAS+"?type=cars")).json();
car.innerHTML=cars.map(c=>`<option>${c}</option>`).join("");

// メーター
let m=await (await fetch(GAS+"?type=meter&car="+car.value)).json();
meter.innerText=m;

// 予約
let resv=await (await fetch(GAS+"?type=reservations")).json();

res.innerText=resv
.filter(r=>r.car===car.value)
.map(r=>r.start+"-"+r.end+" "+r.user)
.join("\\n");

}

async function start(){

navigator.geolocation.getCurrentPosition(async p=>{

await fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"start",
car:car.value,
driver:localStorage.getItem("driver"),
lat:p.coords.latitude,
lng:p.coords.longitude
})
});

location.href="driver_arrival.html";

});

}

async function arrival(){

navigator.geolocation.getCurrentPosition(async p=>{

await fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"arrival",
driver:localStorage.getItem("driver"),
endMeter:endMeter.value,
lat:p.coords.latitude,
lng:p.coords.longitude
})
});

location.href="driver_start.html";

});

}

if(document.getElementById("car")) load();
