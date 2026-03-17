const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

async function load(){

let d=await (await fetch(GAS+"?type=reservations")).json();

list.innerText=d
.map(x=>x.date+" "+x.start+"-"+x.end+" "+x.car+" "+x.user)
.join("\n");

}

load();
