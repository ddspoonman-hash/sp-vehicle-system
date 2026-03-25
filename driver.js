const GAS="https://script.google.com/macros/s/AKfycbwbMFxKiQlT_hpb_iNjljeEvKZ7LMr9q8i2KpdW6iWrO6d3pv40iun7SLRTFAstn9C5/exec";

let gpsWatchId=null;

// ---------------- JSONP ----------------
function jsonp(url){
  return new Promise((resolve,reject)=>{
    const cb="cb_"+Date.now();

    window[cb]=data=>{
      resolve(data);
      delete window[cb];
      script.remove();
    };

    const script=document.createElement("script");
    script.src=url+"&callback="+cb+"&t="+Date.now();

    script.onerror=()=>{
      reject("JSONP error");
    };

    document.body.appendChild(script);
  });
}

// ---------------- 初期 ----------------
window.onload=async ()=>{
  const user=JSON.parse(localStorage.getItem("user"));
  if(!user){
    location.href="index.html";
    return;
  }

  if(document.getElementById("car")){
    initStart();
  }

  if(document.getElementById("endMeter")){
    loadEndMeter();
    startGPS();
  }
};

// ---------------- 出発 ----------------
async function initStart(){
  const data=await jsonp(GAS+"?type=init");

  driverName.innerHTML="";
  data.drivers.forEach(d=>{
    const o=document.createElement("option");
    o.value=d.name;
    o.textContent=d.name;
    driverName.appendChild(o);
  });

  car.innerHTML="";
  data.cars.forEach(c=>{
    const o=document.createElement("option");
    o.value=c;
    o.textContent=c;
    car.appendChild(o);
  });

  car.onchange=async ()=>{
    const m=await jsonp(GAS+"?type=meter&car="+encodeURIComponent(car.value));
    meter.value=m;
  };

  car.dispatchEvent(new Event("change"));
}

function start(){
  const user=JSON.parse(localStorage.getItem("user"));

  jsonp(
    GAS+"?type=start"
    +"&car="+encodeURIComponent(car.value)
    +"&driver="+encodeURIComponent(driverName.value)
    +"&dept="+encodeURIComponent(user.dept)
    +"&startMeter="+encodeURIComponent(meter.value)
  );

  localStorage.setItem("lastCar",car.value);
  location.href="driver_arrival.html";
}

// ---------------- GPS ----------------
function startGPS(){

  localStorage.setItem("gpsLog","[]");

  navigator.geolocation.getCurrentPosition(p=>{
    saveGps(p);
  });

  gpsWatchId=navigator.geolocation.watchPosition(p=>{
    saveGps(p);
  },{
    enableHighAccuracy:true
  });
}

function saveGps(pos){

  let log=JSON.parse(localStorage.getItem("gpsLog")||"[]");

  log.push({
    lat:pos.coords.latitude,
    lng:pos.coords.longitude
  });

  if(log.length>20){
    log=log.slice(-20);
  }

  localStorage.setItem("gpsLog",JSON.stringify(log));

  if(document.getElementById("gpsCount")){
    gpsCount.textContent="GPS件数："+log.length;
  }
}

function stopGPS(){
  if(gpsWatchId){
    navigator.geolocation.clearWatch(gpsWatchId);
  }
}

// ---------------- メーター ----------------
async function loadEndMeter(){
  const car=localStorage.getItem("lastCar");
  const m=await jsonp(GAS+"?type=meter&car="+encodeURIComponent(car));
  endMeter.value=m;
}

// ---------------- logout ----------------
function logout(){
  stopGPS();
  localStorage.clear();
  location.href="index.html";
}
