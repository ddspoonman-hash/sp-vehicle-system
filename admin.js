const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

window.onload=async()=>{

const cars=await fetch(GAS+"?type=cars").then(r=>r.json());

cars.forEach(c=>{
const opt=document.createElement("option");
opt.value=c;
opt.textContent=c;
car.appendChild(opt);
});

};

async function updateMeter(){

await fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"updateMeter",
car:car.value,
meter:meter.value
})
});

alert("更新完了");

}
