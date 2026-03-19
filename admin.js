const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

async function load(){

const data = await fetch(GAS+"?type=init").then(r=>r.json());

const div = document.getElementById("running");

div.innerHTML="";

data.running.forEach(r=>{

div.innerHTML += `
車両：${r.car}<br>
運転者：${r.driver}<br>
位置：${r.lat}, ${r.lng}<br>
<hr>
`;

});

}

// ---------------- 車両追加 ----------------
function addCar(){

fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"addCar",
car:document.getElementById("newCar").value
})
});

alert("追加OK");
load();

}

// ---------------- ドライバー追加 ----------------
function addDriver(){

fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"addDriver",
id:document.getElementById("newId").value,
name:document.getElementById("newName").value,
dept:document.getElementById("newDept").value,
pass:document.getElementById("newPass").value
})
});

alert("追加OK");
load();

}

// ---------------- メーター補正 ----------------
function fixMeter(){

fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"fixMeter",
car:document.getElementById("fixCar").value,
meter:document.getElementById("fixMeter").value
})
});

alert("更新OK");
load();

}

// 初期ロード
load();


let map;

async function load(){

const data = await fetch(GAS+"?type=init").then(r=>r.json());

// 地図初期化
map = new google.maps.Map(document.getElementById("map"),{
zoom:12,
center:{lat:35.0,lng:136.0}
});

// マーカー表示
data.running.forEach(r=>{

new google.maps.Marker({
position:{
lat:Number(r.lat),
lng:Number(r.lng)
},
map:map,
title:r.car+" "+r.driver
});

});

}
