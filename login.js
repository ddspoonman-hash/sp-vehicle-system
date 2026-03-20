const GAS="https://script.google.com/macros/s/AKfycbwbMFxKiQlT_hpb_iNjljeEvKZ7LMr9q8i2KpdW6iWrO6d3pv40iun7SLRTFAstn9C5/exec";

function login(){

const id = document.getElementById("id").value;
const pass = document.getElementById("pass").value;

fetch(GAS+"?type=drivers")
.then(r=>r.json())
.then(list=>{

console.log("drivers:", list);

const user = list.find(u=>u.id==id && u.pass==pass);

if(!user){
alert("IDまたはPASS違う");
return;
}

localStorage.setItem("user",JSON.stringify(user));

// 管理者分岐
if(user.id==="admin"){
location.href="admin.html";
}else{
location.href="driver_start.html";
}

})
.catch(e=>{
alert("通信エラー");
console.error(e);
});

}
