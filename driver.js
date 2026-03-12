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