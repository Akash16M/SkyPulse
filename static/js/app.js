const $ = (id) => document.getElementById(id);
let selectedPlace = null;
let weatherData = null;
let isFahrenheit = false;
let chart = null;
let suggestionTimer = null;

const weatherInfo = {
  0:["Clear sky","☀️"],1:["Mainly clear","🌤️"],2:["Partly cloudy","⛅"],3:["Overcast","☁️"],
  45:["Fog","🌫️"],48:["Rime fog","🌫️"],51:["Light drizzle","🌦️"],53:["Drizzle","🌦️"],55:["Dense drizzle","🌧️"],
  56:["Freezing drizzle","🌧️"],57:["Heavy freezing drizzle","🌧️"],61:["Slight rain","🌦️"],63:["Moderate rain","🌧️"],65:["Heavy rain","🌧️"],
  66:["Freezing rain","🌧️"],67:["Heavy freezing rain","🌧️"],71:["Slight snow","🌨️"],73:["Moderate snow","❄️"],75:["Heavy snow","❄️"],
  77:["Snow grains","🌨️"],80:["Rain showers","🌦️"],81:["Moderate showers","🌧️"],82:["Violent showers","⛈️"],85:["Snow showers","🌨️"],86:["Heavy snow showers","❄️"],
  95:["Thunderstorm","⛈️"],96:["Thunderstorm & hail","⛈️"],99:["Heavy thunderstorm","⛈️"]
};
const infoFor = code => weatherInfo[code] || ["Weather conditions","🌤️"];
const temp = value => value == null ? "--" : `${Math.round(isFahrenheit ? value * 9/5 + 32 : value)}°`;
const speed = value => value == null ? "--" : `${Math.round(value)} km/h`;
const fmtTime = value => value ? new Date(value).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) : "--:--";
const dayName = (value, index) => index === 0 ? "Today" : new Date(value+"T12:00:00").toLocaleDateString([], {weekday:"long"});
function showStatus(message){$("statusMessage").textContent=message;$("statusMessage").classList.remove("hidden");}
function clearStatus(){$("statusMessage").classList.add("hidden");}
function setLoading(loading){$("searchBtn").disabled=loading;$("searchBtn").innerHTML=loading?"Loading...":'Search <span>→</span>';}

async function searchCity(query){
  if(!query.trim()) return;
  clearStatus(); setLoading(true); $("suggestions").classList.add("hidden");
  try{
    const response=await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data=await response.json();
    if(!response.ok) throw new Error(data.error||"Could not search for that city.");
    if(!data.results.length) throw new Error("No matching city found. Try another spelling.");
    if(data.results.length===1) loadWeather(data.results[0]);
    else renderSuggestions(data.results);
  }catch(error){showStatus(error.message);}
  finally{setLoading(false);}
}
function renderSuggestions(results){
  const box=$("suggestions"); box.innerHTML="";
  results.forEach(place=>{
    const button=document.createElement("button");button.className="suggestion";
    button.innerHTML=`${escapeHtml(place.name)} <small>${escapeHtml([place.admin1,place.country].filter(Boolean).join(", "))}</small>`;
    button.addEventListener("click",()=>{box.classList.add("hidden");loadWeather(place);});
    box.appendChild(button);
  });
  box.classList.remove("hidden");
}
function escapeHtml(value){return String(value||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
async function loadWeather(place){
  selectedPlace=place; clearStatus(); setLoading(true);
  $("welcomeState").classList.add("hidden"); $("weatherContent").classList.add("hidden");
  try{
    const response=await fetch(`/api/weather?lat=${encodeURIComponent(place.latitude)}&lon=${encodeURIComponent(place.longitude)}`);
    const data=await response.json();
    if(!response.ok) throw new Error(data.error||"Unable to load weather.");
    weatherData=data; renderWeather(data.weather,data.air||{});
    $("weatherContent").classList.remove("hidden");
    saveRecent(place); updateFavoriteButton();
    $("cityInput").value="";
    window.scrollTo({top:0,behavior:"smooth"});
  }catch(error){showStatus(error.message);$("welcomeState").classList.remove("hidden");}
  finally{setLoading(false);}
}
function renderWeather(data,air){
  const c=data.current,h=data.hourly,d=data.daily,dayIndex=0;
  const placeLabel=[selectedPlace.name,selectedPlace.admin1,selectedPlace.country].filter(Boolean).join(", ");
  $("placeName").textContent=placeLabel;
  const now=new Date();
  $("localDate").textContent=new Intl.DateTimeFormat("en",{weekday:"long",month:"long",day:"numeric",year:"numeric",timeZone:data.timezone}).format(now);
  $("currentTime").textContent=new Intl.DateTimeFormat("en",{hour:"2-digit",minute:"2-digit",timeZone:data.timezone}).format(now);
  const [condition,icon]=infoFor(c.weather_code);
  $("currentTemp").textContent=temp(c.temperature_2m);$("currentCondition").textContent=condition;
  $("weatherArt").textContent=icon;$("feelsLike").textContent=`Feels like ${temp(c.apparent_temperature)}`;
  $("todayHigh").textContent=temp(d.temperature_2m_max[0]);$("todayLow").textContent=temp(d.temperature_2m_min[0]);
  $("currentUv").textContent=(d.uv_index_max?.[0]??"--");
  $("humidity").textContent=`${c.relative_humidity_2m}%`;$("humidityBar").style.width=`${c.relative_humidity_2m}%`;
  $("wind").textContent=speed(c.wind_speed_10m);$("windDirection").textContent=`Direction ${c.wind_direction_10m}°`;
  $("gusts").textContent=speed(c.wind_gusts_10m);$("pressure").textContent=`${Math.round(c.pressure_msl)} hPa`;
  $("cloudCover").textContent=`${c.cloud_cover}%`;$("precipitation").textContent=`${c.precipitation} mm`;
  const currentHour=new Date(c.time).toISOString().slice(0,13);
  let hourIndex=h.time.findIndex(t=>t.slice(0,13)===currentHour);if(hourIndex<0)hourIndex=0;
  $("rainChance").textContent=`${h.precipitation_probability[hourIndex]??0}%`;
  $("sunrise").textContent=fmtTime(d.sunrise[0]);$("sunset").textContent=fmtTime(d.sunset[0]);
  renderHourly(h,hourIndex);renderWeekly(d);renderAir(air);
}
function renderHourly(hourly,start){
  const strip=$("hourlyStrip");strip.innerHTML="";
  for(let i=start;i<Math.min(start+24,hourly.time.length);i++){
    const item=document.createElement("div");item.className="hour-item";
    const time=i===start?"Now":new Date(hourly.time[i]).toLocaleTimeString([],{hour:"numeric"});
    item.innerHTML=`<span class="time">${time}</span><span class="icon">${infoFor(hourly.weather_code[i])[1]}</span><strong>${temp(hourly.temperature_2m[i])}</strong><small>☔ ${hourly.precipitation_probability[i]??0}%</small>`;
    strip.appendChild(item);
  }
  const labels=[],values=[];
  for(let i=start;i<Math.min(start+24,hourly.time.length);i+=2){labels.push(new Date(hourly.time[i]).toLocaleTimeString([],{hour:"numeric"}));values.push(isFahrenheit?hourly.temperature_2m[i]*9/5+32:hourly.temperature_2m[i]);}
  if(chart)chart.destroy();
  const ctx=$("hourlyChart").getContext("2d");
  chart=new Chart(ctx,{type:"line",data:{labels,datasets:[{data:values,borderColor:"#78a0ff",backgroundColor:"rgba(120,160,255,.13)",fill:true,tension:.4,pointRadius:3,pointBackgroundColor:"#70dce3",borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{displayColors:false,callbacks:{label:c=>`${Math.round(c.raw)}°`}}},scales:{x:{grid:{display:false},ticks:{color:getComputedStyle(document.body).getPropertyValue("--muted"),maxTicksLimit:8}},y:{grid:{color:"rgba(150,170,210,.10)"},ticks:{color:getComputedStyle(document.body).getPropertyValue("--muted"),callback:v=>`${Math.round(v)}°`}}}}});
}
function renderWeekly(d){
  const box=$("weeklyForecast");box.innerHTML="";
  d.time.forEach((date,i)=>{
    const [label,icon]=infoFor(d.weather_code[i]);
    const row=document.createElement("div");row.className="day-row";
    row.innerHTML=`<div class="day-name">${dayName(date,i)}</div><div><span class="day-icon">${icon}</span><span class="day-condition">${label}</span></div><div class="day-rain">☔ ${d.precipitation_probability_max[i]??0}%</div><div class="day-temps"><span>${temp(d.temperature_2m_min[i])}</span><strong>${temp(d.temperature_2m_max[i])}</strong></div>`;
    box.appendChild(row);
  });
}
function renderAir(air){
  const aqi=air.us_aqi;$("aqiValue").textContent=aqi==null?"--":Math.round(aqi);
  let label="Not available";
  if(aqi!=null){label=aqi<=50?"Good":aqi<=100?"Moderate":aqi<=150?"Unhealthy for sensitive groups":aqi<=200?"Unhealthy":aqi<=300?"Very unhealthy":"Hazardous";}
  $("aqiLabel").textContent=label;$("pm25").textContent=air.pm2_5==null?"--":`${air.pm2_5.toFixed(1)} µg/m³`;
  $("pm10").textContent=air.pm10==null?"--":`${air.pm10.toFixed(1)} µg/m³`;
  $("ozone").textContent=air.ozone==null?"--":`${air.ozone.toFixed(1)} µg/m³`;
}
function saveRecent(place){
  let list=JSON.parse(localStorage.getItem("ww_recent")||"[]");
  list=[place,...list.filter(p=>p.latitude!==place.latitude||p.longitude!==place.longitude)].slice(0,5);
  localStorage.setItem("ww_recent",JSON.stringify(list));
}
function favorites(){return JSON.parse(localStorage.getItem("ww_favorites")||"[]");}
function updateFavoriteButton(){
  const saved=favorites().some(p=>p.latitude===selectedPlace.latitude&&p.longitude===selectedPlace.longitude);
  $("favoriteBtn").classList.toggle("saved",saved);$("favoriteBtn").innerHTML=saved?"★ <span>Saved location</span>":"☆ <span>Save location</span>";
}
$("favoriteBtn").addEventListener("click",()=>{
  if(!selectedPlace)return;let list=favorites();const exists=list.some(p=>p.latitude===selectedPlace.latitude&&p.longitude===selectedPlace.longitude);
  list=exists?list.filter(p=>p.latitude!==selectedPlace.latitude||p.longitude!==selectedPlace.longitude):[selectedPlace,...list].slice(0,10);
  localStorage.setItem("ww_favorites",JSON.stringify(list));updateFavoriteButton();
});
$("searchBtn").addEventListener("click",()=>searchCity($("cityInput").value));
$("cityInput").addEventListener("keydown",e=>{if(e.key==="Enter")searchCity($("cityInput").value);});
$("cityInput").addEventListener("input",()=>{
  clearTimeout(suggestionTimer);const q=$("cityInput").value.trim();
  if(q.length<3){$("suggestions").classList.add("hidden");return;}
  suggestionTimer=setTimeout(async()=>{try{const r=await fetch(`/api/search?q=${encodeURIComponent(q)}`);const d=await r.json();if(d.results?.length)renderSuggestions(d.results);}catch(e){}},350);
});
document.addEventListener("click",e=>{if(!e.target.closest(".search-wrap"))$("suggestions").classList.add("hidden");});
document.querySelectorAll("[data-city]").forEach(b=>b.addEventListener("click",()=>searchCity(b.dataset.city)));
$("locationBtn").addEventListener("click",()=>{
  clearStatus();if(!navigator.geolocation){showStatus("Your browser does not support location access.");return;}
  $("locationBtn").textContent="Finding location...";
  navigator.geolocation.getCurrentPosition(async pos=>{
    try{
      const lat=pos.coords.latitude,lon=pos.coords.longitude;
      const r=await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en&format=json`);
      const d=await r.json();const p=d.results?.[0]||{};
      loadWeather({name:p.name||"Your location",admin1:p.admin1||"",country:p.country||"",latitude:lat,longitude:lon});
    }catch(e){loadWeather({name:"Your location",latitude:pos.coords.latitude,longitude:pos.coords.longitude});}
    finally{$("locationBtn").innerHTML="<span>◎</span> Use my location";}
  },()=>{showStatus("Location permission was denied or unavailable. Search for a city instead.");$("locationBtn").innerHTML="<span>◎</span> Use my location";},{enableHighAccuracy:false,timeout:10000});
});
function refreshUnits(){
  if(!weatherData)return;renderWeather(weatherData.weather,weatherData.air||{});
  $("celsiusBtn").classList.toggle("unit-active",!isFahrenheit);$("fahrenheitBtn").classList.toggle("unit-active",isFahrenheit);
}
$("unitToggle").addEventListener("click",()=>{isFahrenheit=!isFahrenheit;refreshUnits();});
$("themeToggle").addEventListener("click",()=>{document.body.classList.toggle("light");$("themeToggle").textContent=document.body.classList.contains("light")?"☀":"☾";});
$("celsiusBtn").classList.add("unit-active");
