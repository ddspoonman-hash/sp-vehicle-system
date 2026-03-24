const GAS="https://script.google.com/macros/s/AKfycbwbMFxKiQlT_hpb_iNjljeEvKZ7LMr9q8i2KpdW6iWrO6d3pv40iun7SLRTFAstn9C5/exec";

// ---------------- JSONP ----------------
function jsonp(url){
  return new Promise((resolve,reject)=>{
    const cb = "cb_" + Date.now();

    window[cb] = function(data){
      resolve(data);
      delete window[cb];
      script.remove();
    };

    const script = document.createElement("script");
    script.src = url + "&callback=" + cb + "&t=" + Date.now();

    script.onerror = function(){
      reject("JSONP error");
      delete window[cb];
    };

    document.body.appendChild(script);
  });
}

// ---------------- 初期処理 ----------------
window.onload = async ()=>{
  const user = JSON.parse(localStorage.getItem("user"));
  if(!user){
    location.href="index.html";
    return;
  }

  // 出発画面
  if(document.getElementById("car")){
    initStart();
  }

  // 到着画面
  if(document.getElementById("endMeter")){
    startGPS();
    loadEndMeter();
  }
};

// ---------------- 出発初期化 ----------------
async function initStart(){
  const data = await jsonp(GAS+"?type=init");

  const car = document.getElementById("car");
  const driver = document.getElementById("driverName");

  driver.innerHTML="";
  data.drivers.forEach(d=>{
    const o=document.createElement("option");
    o.value=d.name;
    o.textContent=d.name;
    driver.appendChild(o);
  });

  car.innerHTML="";
  data.cars.forEach(c=>{
    const o=document.createElement("option");
    o.value=c;
    o.textContent=c;
    car.appendChild(o);
  });

  car.onchange = async ()=>{
    const m = await jsonp(GAS+"?type=meter&car="+encodeURIComponent(car.value));
    document.getElementById("meter").value = m;
  };

  car.dispatchEvent(new Event("change"));
}

// ---------------- 出発 ----------------
function start(){
  const user = JSON.parse(localStorage.getItem("user"));
  const car = document.getElementById("car").value;
  const driver = document.getElementById("driverName").value;
  const meter = document.getElementById("meter").value;

  jsonp(
    GAS+"?type=start"
    +"&car="+encodeURIComponent(car)
    +"&driver="+encodeURIComponent(driver)
    +"&dept="+encodeURIComponent(user.dept)
    +"&startMeter="+meter
  );

  localStorage.setItem("lastCar",car);
  location.href="driver_arrival.html";
}

// ---------------- GPS ----------------
function startGPS(){
  localStorage.setItem("gpsLog","[]");

  setInterval(()=>{
    navigator.geolocation.getCurrentPosition(pos=>{
      let log = JSON.parse(localStorage.getItem("gpsLog")||"[]");

      log.push({
        lat:pos.coords.latitude,
        lng:pos.coords.longitude
      });

      // 🔥 重要：ログ肥大防止（20件まで）
      if(log.length > 20){
        log = log.slice(-20);
      }

      localStorage.setItem("gpsLog",JSON.stringify(log));
    });
  },30000);
}

// ---------------- メーター ----------------
async function loadEndMeter(){
  const car = localStorage.getItem("lastCar");
  const m = await jsonp(GAS+"?type=meter&car="+encodeURIComponent(car));
  document.getElementById("endMeter").value = m;
}

// ---------------- 共通 ----------------
function logout(){
  localStorage.clear();
  location.href="index.html";
}
