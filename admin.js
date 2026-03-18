const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

window.onload=async()=>{

const init=await fetch(GAS+"?type=init").then(r=>r.json());

init.cars.forEach(c=>{
const o=document.createElement("option");
o.value=c;
o.textContent=c;
car.appendChild(o);
});

// 現在位置表示
map.innerHTML="";
init.running.forEach(r=>{
map.innerHTML+=`${r.car}:${r.lat},${r.lng}<br>`;
});

};

function updateMeter(){

fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"updateMeter",
car:car.value,
meter:meter.value
})
});

alert("更新完了");

}
