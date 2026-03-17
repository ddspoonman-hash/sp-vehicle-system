const GAS="https://script.google.com/macros/s/AKfycbxkgNmKdoeilTzXtelG_1VZNu8MHP0wxxkPNLaS-OY4Ix2V08bxJx7CyYMlozKyirLN/exec";

async function load(){

let d=await (await fetch(GAS+"?type=board")).json();

list.innerText=d.map(x=>x.msg).join("\n");

}

async function post(){

await fetch(GAS,{
method:"POST",
body:JSON.stringify({
type:"board",
msg:msg.value
})
});

load();

}

load();
