const GAS = "https://script.google.com/macros/s/AKfycbwbMFxKiQlT_hpb_iNjljeEvKZ7LMr9q8i2KpdW6iWrO6d3pv40iun7SLRTFAstn9C5/exec";

let initCache = null;
let meterLoading = false;
let startProcessing = false;

function jsonp(url){
  return new Promise((resolve, reject) => {
    const cb = "cb_" + Math.random().toString(36).substring(2);
    const script = document.createElement("script");

    window[cb] = function(data){
      resolve(data);
      try{ delete window[cb]; }catch(e){}
      script.remove();
    };

    script.src = url + "&callback=" + cb + "&t=" + Date.now();

    script.onerror = function(){
      try{ delete window[cb]; }catch(e){}
      script.remove();
      reject(new Error("JSONP error"));
    };

    document.body.appendChild(script);
  });
}

function setBusyButton(btn, text){
  if(!btn) return;
  btn.disabled = true;
  btn.textContent = text;
  btn.classList.add("busy");
}

function releaseBusyButton(btn, text){
  if(!btn) return;
  btn.disabled = false;
  btn.textContent = text;
  btn.classList.remove("busy");
}

function setStartButtonState(enabled, text){
  const btn = document.getElementById("startBtn");
  if(!btn) return;
  btn.disabled = !enabled;
  btn.textContent = text || btn.textContent;

  if(enabled){
    btn.classList.remove("busy");
  }else{
    btn.classList.add("busy");
  }
}

function setMeterLoadingState(loading){
  meterLoading = loading;
  const meterInput = document.getElementById("meter");
  if(!meterInput) return;

  if(loading){
    meterInput.value = "読込中...";
    setStartButtonState(false, "メーター読込中...");
  }
}

function setMeterLoaded(value){
  const meterInput = document.getElementById("meter");
  if(!meterInput) return;

  meterLoading = false;
  meterInput.value = value;
  setStartButtonState(true, "出発");
}

function setMeterLoadError(){
  const meterInput = document.getElementById("meter");
  if(!meterInput) return;

  meterLoading = false;
  meterInput.value = "取得失敗";
  setStartButtonState(false, "メーター取得失敗");
}

window.onload = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if(!user){
    location.href = "index.html";
    return;
  }

  if(document.getElementById("car")){
    await initStart();

    // 起動時にサーバー側の進行中運行を確認
    try{
      const currentRun = await fetchCurrentRun(user.name);
      if(currentRun && currentRun.exists){
        localStorage.setItem("lastCar", String(currentRun.car || ""));
        localStorage.setItem("startMeter", String(currentRun.startMeter || ""));
        location.replace("driver_arrival.html");
        return;
      }
    }catch(e){
      console.error("currentRun check error", e);
    }
  }
};

async function fetchCurrentRun(driverName){
  return await jsonp(
    GAS + "?type=currentRun&driver=" + encodeURIComponent(String(driverName || "").trim())
  );
}

async function getInitData(force = false){
  if(initCache && !force) return initCache;
  initCache = await jsonp(GAS + "?type=init");
  return initCache;
}

async function loadMeterForSelectedCar(){
  const carSelect = document.getElementById("car");
  if(!carSelect) return;

  const car = String(carSelect.value || "").trim();
  if(!car){
    setMeterLoadError();
    return;
  }

  setMeterLoadingState(true);

  try{
    const m = await jsonp(GAS + "?type=meter&car=" + encodeURIComponent(car));
    setMeterLoaded(m);
  }catch(e){
    console.error("meter load error", e);
    setMeterLoadError();
  }
}

async function initStart(){
  try{
    setStartButtonState(false, "読込中...");

    const data = await getInitData();
    const driverSelect = document.getElementById("driverName");
    const carSelect = document.getElementById("car");
    const user = JSON.parse(localStorage.getItem("user"));

    driverSelect.innerHTML = "";
    (data.drivers || []).forEach(d => {
      const o = document.createElement("option");
      o.value = d.name;
      o.textContent = d.name;
      if(user && d.name === user.name) o.selected = true;
      driverSelect.appendChild(o);
    });

    carSelect.innerHTML = "";
    (data.cars || []).forEach(c => {
      const o = document.createElement("option");
      o.value = c;
      o.textContent = c;
      carSelect.appendChild(o);
    });

    carSelect.onchange = async () => {
      await loadMeterForSelectedCar();
    };

    await loadMeterForSelectedCar();
  }catch(e){
    console.error("initStart error", e);
    setStartButtonState(false, "初期化失敗");
    alert("初期データの読込に失敗しました");
  }
}

async function start(){
  if(startProcessing) return;

  if(meterLoading){
    alert("メーター読込中です。少し待ってください。");
    return;
  }

  const meterValue = String(document.getElementById("meter")?.value || "").trim();
  if(!meterValue || meterValue === "読込中..." || meterValue === "取得失敗"){
    alert("メーター取得完了後に出発してください。");
    return;
  }

  const btn = document.getElementById("startBtn");

  try{
    startProcessing = true;
    setBusyButton(btn, "出発処理中...");

    const user = JSON.parse(localStorage.getItem("user"));
    const selectedCar = String(document.getElementById("car").value || "").trim();
    const selectedDriver = String(document.getElementById("driverName").value || "").trim();
    const selectedMeter = meterValue;
    const reqId = "START_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);

    // 念のため事前確認
    const currentRun = await fetchCurrentRun(selectedDriver);
    if(currentRun && currentRun.exists){
      localStorage.setItem("lastCar", String(currentRun.car || ""));
      localStorage.setItem("startMeter", String(currentRun.startMeter || ""));
      alert("すでに進行中の運行があります。到着画面へ移動します。");
      location.href = "driver_arrival.html";
      return;
    }

    const res = await jsonp(
      GAS + "?type=start" +
      "&reqId=" + encodeURIComponent(reqId) +
      "&car=" + encodeURIComponent(selectedCar) +
      "&driver=" + encodeURIComponent(selectedDriver) +
      "&dept=" + encodeURIComponent(user.dept || "") +
      "&startMeter=" + encodeURIComponent(selectedMeter)
    );

    if(!res || !res.ok){
      throw new Error(res && res.message ? res.message : "start failed");
    }

    localStorage.setItem("lastCar", selectedCar);
    localStorage.setItem("startMeter", selectedMeter);
    location.href = "driver_arrival.html";
  }catch(e){
    console.error(e);
    alert("出発処理エラー\n" + (e && e.message ? e.message : ""));
    startProcessing = false;
    releaseBusyButton(btn, "出発");
  }
}

function logout(){
  localStorage.clear();
  location.href = "index.html";
}
