const GAS="https://script.google.com/macros/s/AKfycbwbMFxKiQlT_hpb_iNjljeEvKZ7LMr9q8i2KpdW6iWrO6d3pv40iun7SLRTFAstn9C5/exec";

// JSONP
function jsonp(url){
  return new Promise(res=>{
    const cb = "cb_" + Date.now();
    window[cb]=data=>{
      res(data);
      delete window[cb];
    };
    const s=document.createElement("script");
    s.src=url+"&callback="+cb+"&t="+Date.now();
    document.body.appendChild(s);
  });
}

// 初期化
window.onload = async ()=>{
  const user = JSON.parse(localStorage.getItem("user"));
  if(!user){
    location.href="index.html";
    return;
  }

  if(document.getElementById("car")){
    initStart();
  }

  if(document.getElementById("endMeter")){
    startGPS();
    loadEndMeter();
  }
};

// 出発初期化
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

// 出発
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

// GPSログ
function startGPS(){
  localStorage.setItem("gpsLog","[]");

  setInterval(()=>{
    navigator.geolocation.getCurrentPosition(pos=>{
      const log = JSON.parse(localStorage.getItem("gpsLog"));
      log.push({
        lat:pos.coords.latitude,
        lng:pos.coords.longitude
      });
      localStorage.setItem("gpsLog",JSON.stringify(log));
    });
  },30000);
}

// メーター取得
async function loadEndMeter(){
  const car = localStorage.getItem("lastCar");
  const m = await jsonp(GAS+"?type=meter&car="+encodeURIComponent(car));
  document.getElementById("endMeter").value = m;
}

// 到着（修正版）
function arrival(){
  const gpsLog = JSON.parse(localStorage.getItem("gpsLog") || "[]");
  const car = localStorage.getItem("lastCar");
  const endMeter = document.getElementById("endMeter").value;

  const passengers = getSelected("passengers").join(",");
  const destinations = getSelected("destinations").join(",");
  const purposes = getSelected("purposes").join(",");

  const passengerOther = document.getElementById("passengerOther").value;
  const destOther = document.getElementById("destOther").value;
  const purposeOther = document.getElementById("purposeOther").value;
  const memo = document.getElementById("memo").value;

  window.cb_arrival = function(){
    localStorage.removeItem("gpsLog");
    alert("完了");
    location.href="driver_start.html";
  };

  const script = document.createElement("script");
  script.src =
    GAS+"?type=arrival"
    +"&car="+encodeURIComponent(car)
    +"&endMeter="+endMeter
    +"&gpsLog="+encodeURIComponent(JSON.stringify(gpsLog))
    +"&passengers="+encodeURIComponent(passengers + "," + passengerOther)
    +"&destinations="+encodeURIComponent(destinations + "," + destOther)
    +"&purposes="+encodeURIComponent(purposes + "," + purposeOther)
    +"&memo="+encodeURIComponent(memo)
    +"&callback=cb_arrival"
    +"&t="+Date.now();

  document.body.appendChild(script);
}


// ---------------- チップ生成 ----------------
function createChips(id, list){
  const box = document.getElementById(id);
  box.innerHTML="";

  list.forEach(text=>{
    const div = document.createElement("div");
    div.className="chip";
    div.textContent=text;

    div.onclick=()=>{
      div.classList.toggle("active");
    };

    box.appendChild(div);
  });
}

// 初期チップ
window.addEventListener("load", ()=>{
  if(document.getElementById("passengers")){
    createChips("passengers",["Aさん","Bさん","Cさん"]);
    createChips("destinations",["病院","駅","空港"]);
    createChips("purposes",["送迎","通院","業務"]);
  }
});

// 選択取得
function getSelected(id){
  return [...document.querySelectorAll("#"+id+" .active")]
    .map(e=>e.textContent);
}
