const GAS="https://script.google.com/macros/s/AKfycbwbMFxKiQlT_hpb_iNjljeEvKZ7LMr9q8i2KpdW6iWrO6d3pv40iun7SLRTFAstn9C5/exec";

let gpsWatchId=null;

// ---------------- JSONP ----------------
function jsonp(url){
  return new Promise((resolve,reject)=>{
    const cb="cb_"+Math.random().toString(36).substring(2);

    window[cb]=data=>{
      resolve(data);
      delete window[cb];
      script.remove();
    };

    const script=document.createElement("script");
    script.src=url+"&callback="+cb+"&t="+Date.now();

    script.onerror=()=>reject("JSONP error");

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

// ---------------- 出発画面 ----------------
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

// ---------------- 出発 ----------------
async function start(){

  const user = JSON.parse(localStorage.getItem("user"));

  const selectedCar = String(car.value || "").trim();
  const selectedDriver = String(driverName.value || "").trim();
  const selectedMeter = String(meter.value || "").trim();

  // 👇ここ追加（デバッグ）
  console.log("出発 car=", selectedCar);
  console.log("driver=", selectedDriver);
  console.log("meter=", selectedMeter);

  await jsonp(
    GAS+"?type=start"
    +"&car="+encodeURIComponent(selectedCar)
    +"&driver="+encodeURIComponent(selectedDriver)
    +"&dept="+encodeURIComponent(user.dept||"")
    +"&startMeter="+encodeURIComponent(selectedMeter)
  );

  localStorage.setItem("lastCar", selectedCar);
  location.href="driver_arrival.html";
}

// ---------------- GPS ----------------
function startGPS(){

  if(!navigator.geolocation){
    alert("GPS未対応端末");
    return;
  }

  localStorage.setItem("gpsLog","[]");

  navigator.geolocation.getCurrentPosition(
    p=>saveGps(p),
    e=>console.error(e),
    {enableHighAccuracy:true}
  );

  gpsWatchId=navigator.geolocation.watchPosition(
    p=>saveGps(p),
    e=>console.error(e),
    {
      enableHighAccuracy:true,
      timeout:20000,
      maximumAge:0
    }
  );
}

function saveGps(pos){

  const accuracy = Number(pos.coords.accuracy || 9999);

  // 精度が悪すぎる点は捨てる
  if(accuracy > 30){
    return;
  }

  let log = JSON.parse(localStorage.getItem("gpsLog") || "[]");

  const point = {
    lat: Number(pos.coords.latitude),
    lng: Number(pos.coords.longitude),
    accuracy: accuracy
  };

  // 直前点との距離が近すぎるなら捨てる
  if(log.length > 0){
    const last = log[log.length - 1];
    const d = distanceOnePoint(last.lat, last.lng, point.lat, point.lng);

    // 15m未満はブレ扱い
    if(d < 15){
      return;
    }
  }

  log.push(point);

  if(log.length > 20){
    log = log.slice(-20);
  }

  localStorage.setItem("gpsLog", JSON.stringify(log));

  if(document.getElementById("gpsCount")){
    gpsCount.textContent = "GPS件数：" + log.length;
  }
}

function distanceOnePoint(lat1, lng1, lat2, lng2){
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000;
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
