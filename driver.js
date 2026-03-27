const GAS="https://script.google.com/macros/s/AKfycbwbMFxKiQlT_hpb_iNjljeEvKZ7LMr9q8i2KpdW6iWrO6d3pv40iun7SLRTFAstn9C5/exec";

console.log("NEW DRIVER VERSION 20260326");

let gpsWatchId = null;

// ---------------- JSONP ----------------
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
      reject(new Error("JSONP error"));
      delete window[cb];
      script.remove();
    };

    document.body.appendChild(script);
  });
}

// ---------------- 初期 ----------------
window.onload = async ()=>{
  const user = JSON.parse(localStorage.getItem("user"));
  if(!user){
    location.href = "index.html";
    return;
  }

  if(document.getElementById("car")){
    await initStart();
  }

  if(document.getElementById("endMeter")){
    await loadEndMeter();
    startGPS();
  }
};

// ---------------- 出発画面 ----------------
async function initStart(){
  const data = await jsonp(GAS + "?type=init");

  const driverSelect = document.getElementById("driverName");
  const carSelect = document.getElementById("car");
  const meterInput = document.getElementById("meter");
  const user = JSON.parse(localStorage.getItem("user"));

  driverSelect.innerHTML = "";
  (data.drivers || []).forEach(d=>{
    const o = document.createElement("option");
    o.value = d.name;
    o.textContent = d.name;
    if(user && d.name === user.name) o.selected = true;
    driverSelect.appendChild(o);
  });

  carSelect.innerHTML = "";
  (data.cars || []).forEach(c=>{
    const o = document.createElement("option");
    o.value = c;
    o.textContent = c;
    carSelect.appendChild(o);
  });

  carSelect.onchange = async ()=>{
    const m = await jsonp(GAS + "?type=meter&car=" + encodeURIComponent(carSelect.value));
    meterInput.value = m;
  };

  carSelect.dispatchEvent(new Event("change"));
}

// ---------------- 出発 ----------------
async function start(){
  try{
    const user = JSON.parse(localStorage.getItem("user"));
    const selectedCar = String(document.getElementById("car").value || "").trim();
    const selectedDriver = String(document.getElementById("driverName").value || "").trim();
    const selectedMeter = String(document.getElementById("meter").value || "").trim();

    console.log("出発 car=", selectedCar);
    console.log("driver=", selectedDriver);
    console.log("meter=", selectedMeter);

    await jsonp(
      GAS + "?type=start"
      + "&car=" + encodeURIComponent(selectedCar)
      + "&driver=" + encodeURIComponent(selectedDriver)
      + "&dept=" + encodeURIComponent(user.dept || "")
      + "&startMeter=" + encodeURIComponent(selectedMeter)
    );

    localStorage.setItem("lastCar", selectedCar);
    location.href = "driver_arrival.html";
  }catch(e){
    alert("出発処理エラー");
    console.error(e);
  }
}

// ---------------- GPS ----------------
function startGPS(){
  if(!navigator.geolocation){
    alert("この端末はGPS未対応です");
    return;
  }

  localStorage.setItem("gpsLog", "[]");
  updateGpsCount();

  navigator.geolocation.getCurrentPosition(
    pos => saveGps(pos),
    err => console.error("GPS初回取得失敗", err),
    {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 5000
    }
  );

  gpsWatchId = navigator.geolocation.watchPosition(
    pos => saveGps(pos),
    err => console.error("GPS監視失敗", err),
    {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 5000
    }
  );
}

function saveGps(pos){
  const accuracy = Number(pos.coords.accuracy || 9999);
  let log = JSON.parse(localStorage.getItem("gpsLog") || "[]");

  const point = {
    lat: Number(pos.coords.latitude),
    lng: Number(pos.coords.longitude),
    accuracy: accuracy,
    ts: Date.now()
  };

  // 最初の1件は少し緩めに保存
  if(log.length === 0){
    if(accuracy > 200){
      console.log("GPS初回破棄 accuracy>", accuracy);
      return;
    }

    log.push(point);
    localStorage.setItem("gpsLog", JSON.stringify(log));
    updateGpsCount();
    console.log("GPS初回保存", point);
    return;
  }

  // 2件目以降
if(accuracy > 150){
  console.log("GPS破棄 accuracy>", accuracy);
  return;
}

const last = log[log.length - 1];
const d = distanceOnePoint(last.lat, last.lng, point.lat, point.lng);
const dt = point.ts - (last.ts || 0);

// 5秒未満なら捨てる
if(dt < 5000){
  console.log("GPS破棄 時間短すぎ", dt);
  return;
}

// 15m未満なら捨てる
if(d < 15){
  console.log("GPS破棄 近すぎ", d);
  return;
}

  log.push(point);

  // GPS保存制限
  if(log.length > 1500){
  log = log.slice(-1500);
}

  localStorage.setItem("gpsLog", JSON.stringify(log));
  updateGpsCount();

  console.log("GPS保存", {
    count: log.length,
    lat: point.lat,
    lng: point.lng,
    accuracy: point.accuracy
  });
}

function updateGpsCount(){
  const el = document.getElementById("gpsCount");
  if(el){
    const log = JSON.parse(localStorage.getItem("gpsLog") || "[]");
    el.textContent = "GPS件数：" + log.length;
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
  if(gpsWatchId !== null){
    navigator.geolocation.clearWatch(gpsWatchId);
    gpsWatchId = null;
  }
}

// ---------------- 到着画面メーター ----------------
async function loadEndMeter(){
  const car = localStorage.getItem("lastCar");
  if(!car) return;

  const m = await jsonp(GAS + "?type=meter&car=" + encodeURIComponent(car));
  document.getElementById("endMeter").value = m;
}

// ---------------- logout ----------------
function logout(){
  stopGPS();
  localStorage.clear();
  location.href = "index.html";
}
