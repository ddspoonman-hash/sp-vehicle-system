const GAS="https://script.google.com/macros/s/AKfycbwbMFxKiQlT_hpb_iNjljeEvKZ7LMr9q8i2KpdW6iWrO6d3pv40iun7SLRTFAstn9C5/exec";

function jsonp(url){
return new Promise(res=>{
const cb="cb_"+Date.now();
window[cb]=data=>{
res(data);
delete window[cb];
};
const s=document.createElement("script");
s.src=url+"&callback="+cb+"&t="+Date.now();
document.body.appendChild(s);
});
}

// 一覧
async function load(){

let d=await jsonp(GAS+"?type=reservations");

list.innerHTML=d.map(x=>`
${x.date} ${x.start}-${x.end}<br>
🚗 ${x.car} / 👤 ${x.user}<br>
📌 ${x.purpose||""}<hr>
`).join("");

}

// 車両
async function initCars(){

const data=await jsonp(GAS+"?type=init");

car.innerHTML="";
data.cars.forEach(c=>{
const o=document.createElement("option");
o.value=c;
o.textContent=c;
car.appendChild(o);
});
}

// 追加
async function addReservation(){

const user=JSON.parse(localStorage.getItem("user"));

const res=await jsonp(
GAS+`?type=addReservation`
+`&date=${date.value}`
+`&start=${start.value}`
+`&end=${end.value}`
+`&car=${car.value}`
+`&user=${user.name}`
+`&purpose=${purpose.value}`
);

if(res.status=="conflict"){
alert("予約済み");
return;
}

alert("OK");
load();
}

function logout(){
localStorage.clear();
location.href="index.html";
}

window.onload=()=>{
load();
initCars();
};

function logout(){
  localStorage.clear();
  location.href = "index.html";
}
