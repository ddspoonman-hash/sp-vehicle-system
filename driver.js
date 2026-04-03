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

function setStartButtonState(enabled, text){
  const btn = document.getElementById("startBtn");
  if(!btn) return;
  btn.disabled = !enabled;
  if(text) btn.textContent = text;
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
  }
};

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

  try{
    startProcessing = true;
    setStartButtonState(false, "出発処理中...");

    const user = JSON.parse(localStorage.getItem("user"));
    const selectedCar = String(document.getElementById("car").value || "").trim();
    const selectedDriver = String(document.getElementById("driverName").value || "").trim();
    const selectedMeter = meterValue;

    await jsonp(
      GAS + "?type=start" +
      "&car=" + encodeURIComponent(selectedCar) +
      "&driver=" + encodeURIComponent(selectedDriver) +
      "&dept=" + encodeURIComponent(user.dept || "") +
      "&startMeter=" + encodeURIComponent(selectedMeter)
    );

    localStorage.setItem("lastCar", selectedCar);
    localStorage.setItem("startMeter", selectedMeter);
    location.href = "driver_arrival.html";
  }catch(e){
    alert("出発処理エラー");
    console.error(e);
    startProcessing = false;
    setStartButtonState(true, "出発");
  }
}

function logout(){
  localStorage.clear();
  location.href = "index.html";
}
