document.addEventListener("DOMContentLoaded", () => {

let targetDate = new Date();
const timeInput = document.getElementById("time");

function formatKyivTime(date){

const str = date.toLocaleString("uk-UA",{
timeZone:"Europe/Kyiv",
day:"2-digit",
month:"2-digit",
year:"2-digit",
hour:"2-digit",
minute:"2-digit",
hour12:false
});

return str.replace(/(\d{2})\.(\d{2})\.(\d{2}),? (\d{2}):(\d{2})/, "$1:$2:$3 $4:$5");

}

function updateTime(){
timeInput.value = formatKyivTime(targetDate);
}

updateTime();

document.getElementById("plus-btn").addEventListener("click",()=>{

targetDate.setMinutes(targetDate.getMinutes()+1);
updateTime();
updateReport();

});

document.getElementById("minus-btn").addEventListener("click",()=>{

targetDate.setMinutes(targetDate.getMinutes()-1);
updateTime();
updateReport();

});

function getVal(id,def="—"){
const el=document.getElementById(id);
return el.value.trim() || def;
}

function updateReport(){

const type=getVal("target-type","невідома ціль");
const time=getVal("time");
const height=getVal("height");
const distance=getVal("distance");
const azimuth=getVal("azimuth");
const course=getVal("course");

const resultRadio=document.querySelector("input[name='result']:checked");

let result="не вказано";

if(resultRadio){

result=resultRadio.value==="destroyed"?"знищена":"не знищена";

}

const weaponFrolov=getVal("weapon-frolov");
const ammoFrolov=getVal("ammo-frolov","0");

const weaponChayun=getVal("weapon-chayun");
const ammoChayun=getVal("ammo-chayun","0");

const reportText=

`"Смерека"
Дата - ${time}
Виявлено ворожий ${type}

Висота:    ${height} м
Дальність: ${distance} м
Азимут:    ${azimuth}°
Курс:      ${course}°

Результат: ціль ${result}

--- Витрата набоїв ---
ст. с-нт Фролов - ${ammoFrolov} шт. (${weaponFrolov})
ст. солд Чаюн   - ${ammoChayun} шт. (${weaponChayun})`;

document.getElementById("report").value=reportText;

}

document.querySelectorAll("input,select,textarea").forEach(el=>{

el.addEventListener("input",updateReport);

});

document.querySelectorAll(".ammo-plus").forEach(btn=>{

btn.addEventListener("click",()=>{

const input=document.getElementById(btn.dataset.target);

let val=parseInt(input.value)||0;

input.value=val+1;

updateReport();

});

});

document.querySelectorAll(".ammo-minus").forEach(btn=>{

btn.addEventListener("click",()=>{

const input=document.getElementById(btn.dataset.target);

let val=parseInt(input.value)||0;

if(val>0) input.value=val-1;

updateReport();

});

});

document.getElementById("copy-report-btn").addEventListener("click",()=>{

const report=document.getElementById("report");

navigator.clipboard.writeText(report.value).then(()=>{

const toast=document.getElementById("toast");

toast.classList.add("visible");

setTimeout(()=>{

toast.classList.remove("visible");

},3000);

});

});

updateReport();

});