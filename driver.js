const GAS="https://script.google.com/macros/s/AKfycbwbMFxKiQlT_hpb_iNjljeEvKZ7LMr9q8i2KpdW6iWrO6d3pv40iun7SLRTFAstn9C5/exec";

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

// ---------------- 出発画面初期化 ----------------
async function initStart(){
  const data = await jsonp(GAS + "?type=init");

  const driverSelect = document.getElementById("driverName");
  const carSelect = document.getElementById("car");
  const meterInput = document.getElementById("meter");
  const user = JSON.parse(localStorage.getItem("user"));

  driverSelect.innerHTML = "";
  data.drivers.forEach(d=>{
    const o = document.createElement("option");
    o.value = d.name;
    o.textContent = d.name;
    if(user && d.name === user.name) o.selected = true;
    driverSelect.appendChild(o);
  });

  carSelect.innerHTML = "";
  data.cars.forEach(c=>{
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
    const car = document.getElementById("car").value;
    const driver = document.getElementById("driverName").value;
    const meter = document.getElementById("meter").value;

    await jsonp(
      GAS + "?type=start"
      + "&car=" + encodeURIComponent(car)
      + "&driver=" + encodeURIComponent(driver)
      + "&dept=" + encodeURIComponent(user.dept || "")
      + "&startMeter=" + encodeURIComponent(meter)
    );

    localStorage.setItem("lastCar", car);
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

  navigator.geolocation.getCurrentPosition(
    pos => saveGps(pos),
    err => console.error("GPS初回取得失敗", err),
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );

  gpsWatchId = navigator.geolocation.watchPosition(
    pos => saveGps(pos),
    err => console.error("GPS監視失敗", err),
    {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0
    }
  );
}

function saveGps(pos){
  let log = JSON.parse(localStorage.getItem("gpsLog") || "[]");

  log.push({
    lat: pos.coords.latitude,
    lng: pos.coords.longitude
  });

  if(log.length > 20){
    log = log.slice(-20);
  }

  localStorage.setItem("gpsLog", JSON.stringify(log));

  const gpsCount = document.getElementById("gpsCount");
  if(gpsCount){
    gpsCount.textContent = "GPS件数：" + log.length;
  }
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
