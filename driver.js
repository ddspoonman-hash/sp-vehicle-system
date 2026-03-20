const GAS="https://script.google.com/macros/s/AKfycbwbMFxKiQlT_hpb_iNjljeEvKZ7LMr9q8i2KpdW6iWrO6d3pv40iun7SLRTFAstn9C5/exec";

let initData = null;
let gpsTimer = null;

// ---------------- JSONP共通 ----------------
function jsonp(url, callbackName){
  return new Promise(resolve=>{
    window[callbackName] = function(data){
      resolve(data);
      delete window[callbackName];
    };
    const script = document.createElement("script");
    script.src = url + "&callback=" + callbackName + "&t=" + Date.now();
    document.body.appendChild(script);
  });
}

// ---------------- 初期化 ----------------
window.onload = async ()=>{

  const user = JSON.parse(localStorage.getItem("user"));
  if(!user){
    location.href="index.html";
    return;
  }

  try{

    // ---------- init取得 ----------
    initData = await jsonp(GAS+"?type=init","cb_init");

    if(!initData){
      alert("init取得失敗");
      return;
    }

    // ---------- UI生成 ----------
    setupDriver(initData);
    setupCar(initData);

    // ---------- 到着画面 ----------
    if(document.getElementById("endMeter")){
      startGPS();
      loadEndMeter();
    }

  }catch(e){
    console.error(e);
    alert("初期化失敗");
  }
};

// ---------------- 運転者 ----------------
function setupDriver(data){
  const el = document.getElementById("driverName");
  if(!el) return;

  el.innerHTML = `<option value="">運転者を選択</option>`;

  data.drivers.forEach(d=>{
    const o=document.createElement("option");
    o.value=d.name;
    o.textContent=`${d.name}（${d.dept}）`;
    el.appendChild(o);
  });
}

// ---------------- 車両 ----------------
function setupCar(data){
  const el = document.getElementById("car");
  if(!el) return;

  el.innerHTML="";

  data.cars.forEach(c=>{
    const o=document.createElement("option");
    o.value=c;
    o.textContent=c;
    el.appendChild(o);
  });

  el.onchange = async ()=>{
    const m = await jsonp(GAS+`?type=meter&car=${el.value}`,"cb_meter");
    document.getElementById("meter").value = m;
  };

  el.dispatchEvent(new Event("change"));
}

// ---------------- 出発 ----------------
function start(){

  const user = JSON.parse(localStorage.getItem("user"));

  const car = document.getElementById("car").value;
  const driverName = document.getElementById("driverName").value || user.name;
  const meter = document.getElementById("meter").value;

  if(!car){
    alert("車両選択して");
    return;
  }

  jsonp(
    GAS + `?type=start&car=${car}&driver=${driverName}&dept=${user.dept}&startMeter=${meter}`,
    "cb_start"
  );

  localStorage.setItem("lastCar",car);

  location.href="driver_arrival.html";
}

// ---------------- GPS ----------------
function startGPS(){

  localStorage.setItem("gpsLog","[]");

  gpsTimer = setInterval(()=>{
    navigator.geolocation.getCurrentPosition(pos=>{

      const log = JSON.parse(localStorage.getItem("gpsLog") || "[]");

      log.push({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        time: Date.now()
      });

      localStorage.setItem("gpsLog", JSON.stringify(log));

      console.log("GPS保存", log.length);

    });
  },30000);
}

// ---------------- メーター取得 ----------------
async function loadEndMeter(){

  const car = localStorage.getItem("lastCar");
  if(!car) return;

  const m = await jsonp(GAS+`?type=meter&car=${car}`,"cb_meter2");

  document.getElementById("endMeter").value = m;
}

// ---------------- 到着 ----------------
function arrival(){

  const gpsLog = JSON.parse(localStorage.getItem("gpsLog") || "[]");

  const endMeter = document.getElementById("endMeter").value;
  const car = localStorage.getItem("lastCar");

  console.log("送信GPS:", gpsLog);

  jsonp(
    GAS + `?type=arrival`
    + `&car=${car}`
    + `&endMeter=${endMeter}`
    + `&gpsLog=${encodeURIComponent(JSON.stringify(gpsLog))}`,
    "cb_arrival"
  );

  alert("完了");

  localStorage.removeItem("gpsLog");

  location.href="driver_start.html";
}

// ---------------- ログアウト ----------------
function logout(){
  localStorage.clear();
  location.href="index.html";
}
