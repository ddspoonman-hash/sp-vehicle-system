const GAS="https://script.google.com/macros/s/AKfycbwbMFxKiQlT_hpb_iNjljeEvKZ7LMr9q8i2KpdW6iWrO6d3pv40iun7SLRTFAstn9C5/exec";

// JSONP共通
function jsonp(url){
return new Promise((resolve,reject)=>{

const cb = "cb_" + Math.random().toString(36).substring(2);

window[cb] = function(data){
resolve(data);
delete window[cb];
script.remove();
};

const script = document.createElement("script");
script.src = url + "&callback=" + cb + "&t=" + Date.now();

script.onerror = function(){
reject("JSONP error");
delete window[cb];
};

document.body.appendChild(script);

});
}

let map;
let markers=[];

function initMap(){
map=new google.maps.Map(document.getElementById("map"),{
zoom:12,
center:{lat:35.0,lng:136.0}
});
}

async function load(){

const data = await jsonp(GAS+"?type=init");

const div=document.getElementById("running");
div.innerHTML="";

data.running.forEach(r=>{
div.innerHTML+=`
車両：${r.car}<br>
運転者：${r.driver}<hr>
`;
});

// マーカー更新
markers.forEach(m=>m.setMap(null));
markers=[];

data.running.forEach(r=>{
if(!r.lat||!r.lng)return;

const marker=new google.maps.Marker({
position:{lat:Number(r.lat),lng:Number(r.lng)},
map:map,
title:r.car+" "+r.driver
});

markers.push(marker);
});
}

// CSV用 車両リスト ←ここに追加
async function loadCarsForCSV(){

try{

const data = await jsonp(GAS+"?type=init");

console.log("cars:", data.cars); // ←デバッグ

const select = document.getElementById("csvCar");
select.innerHTML="";

data.cars.forEach(c=>{
const o=document.createElement("option");
o.value=c;
o.textContent=c;
select.appendChild(o);
});

}catch(e){
console.error("CSV車両エラー", e);
alert("車両取得エラー");
}

}

// 車両追加
async function addCar(){
await jsonp(GAS+`?type=addCar&car=${encodeURIComponent(newCar.value)}`);
alert("追加OK");
load();
}

// ドライバー追加
async function addDriver(){
await jsonp(GAS+`?type=addDriver`
+`&id=${newId.value}`
+`&name=${newName.value}`
+`&dept=${newDept.value}`
+`&pass=${newPass.value}`);
alert("追加OK");
load();
}

// メーター補正
async function fixMeter(){
await jsonp(GAS+`?type=fixMeter`
+`&car=${fixCar.value}`
+`&meter=${fixMeter.value}`);
alert("更新OK");
load();
}

// グループ取得
async function loadGroups(){

const groups = await jsonp(GAS+"?type=groups");

pGroup.innerHTML="";

groups.forEach(g=>{
const o=document.createElement("option");
o.value=g;
o.textContent=g;
pGroup.appendChild(o);
});

}

window.onload = ()=>{
  initMap();
  load();
  loadCarsForCSV(); // ←絶対必要
  loadGroups();     // ←あるなら
  setInterval(load,5000);
};

function downloadCSV(){
window.open(GAS+"?type=csv");
}

function downloadCarCSV(){

const car = document.getElementById("csvCar").value;

window.open(GAS+`?type=csvCar&car=${encodeURIComponent(car)}`);

}
function logout(){
  localStorage.clear();
  location.href = "index.html";
}


// 同乗者追加
async function addPassenger(){
await jsonp(
GAS+`?type=addPassenger`
+`&group=${pGroup.value}`
+`&name=${pName.value}`
);
alert("追加OK");
pGroup.value="";
pName.value="";
}

// 行き先
async function addDestination(){
await jsonp(
GAS+`?type=addDestination`
+`&name=${dName.value}`
);
alert("追加OK");
dName.value="";
}

// 用件
async function addPurpose(){
await jsonp(
GAS+`?type=addPurpose`
+`&name=${uName.value}`
);
alert("追加OK");
uName.value="";
}
