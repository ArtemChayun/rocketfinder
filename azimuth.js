const CX=155,CY=155;
const R_OUT=148, R_TICK=138, R_NUM=112, R_HIT=125;

const svg=document.getElementById('dialSvg');
function el(tag,a){const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const[k,v]of Object.entries(a))e.setAttribute(k,v);return e;}

// BG
svg.appendChild(el('circle',{cx:CX,cy:CY,r:R_OUT+5,fill:'#0c0e0c'}));
svg.appendChild(el('circle',{cx:CX,cy:CY,r:R_OUT,fill:'none',stroke:'#1e221e','stroke-width':'1.5'}));

// Ticks
const tickG=el('g',{});
svg.appendChild(tickG);
for(let i=0;i<360;i+=5){
  const rad=(i-90)*Math.PI/180;
  const isMaj=i%90===0, isTen=i%10===0;
  const r2=isMaj?R_TICK-18:isTen?R_TICK-10:R_TICK-5;
  tickG.appendChild(el('line',{
    x1:CX+R_TICK*Math.cos(rad),y1:CY+R_TICK*Math.sin(rad),
    x2:CX+r2*Math.cos(rad),   y2:CY+r2*Math.sin(rad),
    stroke:isMaj?'#3dff7a':isTen?'rgba(61,255,122,.45)':'rgba(61,255,122,.18)',
    'stroke-width':isMaj?'2':isTen?'1.2':'.7','stroke-linecap':'round'
  }));
}

// Degree labels + hit areas every 10°
const labelsG=el('g',{});
svg.appendChild(labelsG);

const hitAreas=[]; // {deg, hitEl, labelEl}

for(let i=0;i<360;i+=10){
  const rad=(i-90)*Math.PI/180;
  const isCard=i%90===0;
  const nx=CX+R_NUM*Math.cos(rad), ny=CY+R_NUM*Math.sin(rad);

  // Invisible hit circle — зона нажатия
  const hit=el('circle',{
    cx:CX+R_HIT*Math.cos(rad), cy:CY+R_HIT*Math.sin(rad),
    r:'18', fill:'transparent', cursor:'pointer',
    'data-deg':i
  });
  labelsG.appendChild(hit);
  hitAreas.push({deg:i, hitEl:hit});

  // Label text
  const lbl=isCard?['Пн','Сх','Пд','Зх'][i/90]:String(i);
  const t=el('text',{
    x:nx,y:ny,'text-anchor':'middle','dominant-baseline':'middle',
    'font-family':isCard?"'Rajdhani',sans-serif":"'Share Tech Mono',monospace",
    'font-size':isCard?'13':'9.5',
    'font-weight':isCard?'700':'400',
    fill:isCard?'rgba(61,255,122,.8)':'rgba(61,255,122,.55)',
    'pointer-events':'none',
    'data-deg':i
  });
  t.textContent=lbl;
  labelsG.appendChild(t);
  hitAreas[hitAreas.length-1].labelEl=t;
}

// Arrow group — азимут (красная стрелка)
const azArrowG=el('g',{opacity:'0','pointer-events':'none'});
azArrowG.appendChild(el('line',{x1:CX,y1:CY,x2:CX,y2:CY-R_TICK+4,
  stroke:'#ff3d3d','stroke-width':'2','stroke-linecap':'round'}));
azArrowG.appendChild(el('polygon',{
  points:`${CX},${CY-R_TICK-4} ${CX-6},${CY-R_TICK+12} ${CX+6},${CY-R_TICK+12}`,
  fill:'#ff3d3d'}));
svg.appendChild(azArrowG);

// Arrow group — курс (синяя пунктирная стрелка)
const crsArrowG=el('g',{opacity:'0','pointer-events':'none'});
crsArrowG.appendChild(el('line',{x1:CX,y1:CY,x2:CX,y2:CY-R_TICK+4,
  stroke:'#4db8ff','stroke-width':'2','stroke-linecap':'round','stroke-dasharray':'5 3'}));
crsArrowG.appendChild(el('polygon',{
  points:`${CX},${CY-R_TICK-4} ${CX-6},${CY-R_TICK+12} ${CX+6},${CY-R_TICK+12}`,
  fill:'#4db8ff'}));
svg.appendChild(crsArrowG);

// Center dot
svg.appendChild(el('circle',{cx:CX,cy:CY,r:5,fill:'rgba(61,255,122,.2)','pointer-events':'none'}));
svg.appendChild(el('circle',{cx:CX,cy:CY,r:2,fill:'#3dff7a','pointer-events':'none'}));

// ─── State ───
let azDeg=null, crsDeg=null;
// step: 'az' | 'crs' | 'done'
let step='az';

const vAz=document.getElementById('vAz');
const vCrs=document.getElementById('vCrs');
const hint=document.getElementById('hint');

function pad(n){return String(n).padStart(3,'0')+'°';}

// Кратковременная подсветка метки на циферблате при тапе
function setHighlight(deg, color){
  const entry=hitAreas.find(h=>h.deg===deg);
  if(!entry)return;
  const orig=entry.labelEl.getAttribute('fill');
  entry.labelEl.setAttribute('fill',color);
  setTimeout(()=>entry.labelEl.setAttribute('fill',orig),400);
}

// Вспомогательная функция: записывает значение в input на главной странице
// и диспатчит событие 'input' чтобы script.js подхватил изменение
// и сразу пересчитал доклад в textarea
function setMainInput(id, value){
  const input = document.getElementById(id);
  if(!input) return; // защита: если input с таким id не найден — просто выходим
  input.value = value;
  // Диспатч события 'input' — именно на него подписан updateReport() в script.js:
  // document.querySelectorAll("input,...").forEach(el => el.addEventListener("input", updateReport))
  input.dispatchEvent(new Event('input'));
}

function onTap(deg){
  if(step==='az'){
    // ── Шаг 1: пользователь выбрал азимут ──
    azDeg=deg;
    azArrowG.setAttribute('transform',`rotate(${deg},${CX},${CY})`);
    azArrowG.setAttribute('opacity','1');
    // Обновляем отображение внутри попапа
    vAz.textContent=pad(deg);
    vAz.className='info-val set-az';
    setHighlight(deg,'#ff3d3d');
    // Переходим к шагу выбора курса
    step='crs';
    hint.textContent='Оберіть курс цілі';
    hint.classList.add('active');

  } else if(step==='crs'){
    // ── Шаг 2: пользователь выбрал курс ──
    crsDeg=deg;
    crsArrowG.setAttribute('transform',`rotate(${deg},${CX},${CY})`);
    crsArrowG.setAttribute('opacity','1');
    // Обновляем отображение внутри попапа
    vCrs.textContent=pad(deg);
    vCrs.className='info-val set-crs';
    setHighlight(deg,'#4db8ff');
    step='done';
    hint.textContent='Зафіксовано ✓';
    hint.classList.add('active');

    // ── Передаём данные в поля главной страницы ──

    // Записываем азимут в input id="azimuth" (используется в script.js: getVal("azimuth"))
    // Формат: "045" — три цифры без знака °, чтобы корректно попасть в шаблон доклада
    setMainInput('azimuth', String(azDeg).padStart(3,'0'));

    // Записываем курс в input id="course" (используется в script.js: getVal("course"))
    setMainInput('course', String(crsDeg).padStart(3,'0'));
  }
  // Если step==='done' — тапы игнорируются до нажатия Reset
}

// Обработка клика мышью — берём data-deg с элемента
labelsG.addEventListener('click', e=>{
  if(step==='done')return;
  const deg=parseInt(e.target.getAttribute('data-deg'));
  if(isNaN(deg))return;
  onTap(deg);
});

// Обработка тача — ищем ближайшую зону к точке касания
labelsG.addEventListener('touchend', e=>{
  if(step==='done')return;
  e.preventDefault();
  const t=e.changedTouches[0];
  const rect=svg.getBoundingClientRect();
  const scale=310/rect.width;
  const tx=(t.clientX-rect.left)*scale;
  const ty=(t.clientY-rect.top)*scale;

  let best=null,bestD=Infinity;
  hitAreas.forEach(h=>{
    const hx=CX+R_HIT*Math.cos((h.deg-90)*Math.PI/180);
    const hy=CY+R_HIT*Math.sin((h.deg-90)*Math.PI/180);
    const d=Math.hypot(tx-hx,ty-hy);
    if(d<bestD){bestD=d;best=h;}
  });
  if(best&&bestD<28)onTap(best.deg);
},{passive:false});

// ── Кнопка сброса ──
document.getElementById('resetBtn').addEventListener('click',()=>{
  // Сбрасываем внутреннее состояние
  azDeg=null;crsDeg=null;step='az';
  azArrowG.setAttribute('opacity','0');
  crsArrowG.setAttribute('opacity','0');
  // Сбрасываем отображение внутри попапа
  vAz.textContent='—';vAz.className='info-val';
  vCrs.textContent='—';vCrs.className='info-val';
  hint.textContent='Оберіть азимут виявлення';
  hint.classList.remove('active');

  // Очищаем поля на главной странице — доклад тоже пересчитается
  // через dispatchEvent внутри setMainInput
  setMainInput('azimuth', '');
  setMainInput('course', '');
});

// ── Открытие / закрытие попапа ──

const azimuthContainer = document.getElementById("azimuth-container");
const openBtn = document.getElementById("openBtn");
const closeBtn = document.getElementById("closeBtn");
const addValue = document.getElementById("addValue");

openBtn.addEventListener('click',()=>{
  azimuthContainer.classList.add('show');
});
closeBtn.addEventListener('click',()=>{
  azimuthContainer.classList.remove('show');
});
addValue.addEventListener('click',()=>{
  azimuthContainer.classList.remove('show');
});
