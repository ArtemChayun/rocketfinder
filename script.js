document.addEventListener("DOMContentLoaded", () => {
  
  // ініціалізація дати та часу
  let targetDate = new Date();
  
  // Присвоюємо константі поле для 
  //відображення дати та часу
  const timeInput = document.getElementById("time");
  
  // Функція яка формує дату та час
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
    
    // Повертає формат відображення дати та часу
    return str.replace(/(\d{2})\.(\d{2})\.(\d{2}),? (\d{2}):(\d{2})/, "$1/$2/$3 $4:$5");
  }
  
  // Функція яка оновлює відображення даты та часу
  function updateTime(){
    timeInput.value = formatKyivTime(targetDate);
  }
  
  // Виклик функції
  updateTime();
  
  // Вішаємо клик на button та додаємо 1 хвилину часу
  // оновлюємо повністю дату та час
  // оновлюємо функцію яка формує шаблон
  document.getElementById("plus-btn").addEventListener("click",()=>{
    targetDate.setMinutes(targetDate.getMinutes()+1);
    updateTime();
    updateReport();
  });
  
  // Вішаємо клик на button та віднімаємо 1 хвилину часу
  // оновлюємо повністю дату та час
  // оновлюємо функцію яка формує шаблон
  document.getElementById("minus-btn").addEventListener("click",()=>{
    targetDate.setMinutes(targetDate.getMinutes()-1);
    updateTime();
    updateReport();
  });
  
  // Функція де id це id input, def - значення за
  //замовчуванням. Функція бере id input та присвоює
  //константі el, повертає значення поля input, якщо true
  //або присвоює значення за замовчуванням.
  function getVal(id,def="—"){
    const el=document.getElementById(id);
    return el.value.trim() || def;
  }
  
  // Обробка input та формування доповіді.
  // reportText - шаблон доповіді.
  // Функція збирає данні з усіх input та
  // формує доповідь за шаблоном.
  function updateReport(){

    const type=getVal("target-type","невідома ціль");
    const time=getVal("time");
    const height=getVal("height");
    const distance=getVal("distance");
    const azimuth=getVal("azimuth");
    const course=getVal("course");
    const resultRadio=document.querySelector("input[name='result']:checked");
    let result="не вказано";

    if(resultRadio.value === "destroyed") {
     result = "знищена";
    } else if(resultRadio.value === "not-destroyed") {
     result = "не знищена";
    } else {
     result = "самознищена"
    }

    //const weaponFrolov=getVal("weapon-frolov");
    const calibr1=getVal("calibr1","0");
    const ammoFrolov=getVal("ammo-frolov","0");
    //const weaponChayun=getVal("weapon-chayun");
    const calibr2=getVal("calibr2","0");
    const ammoChayun=getVal("ammo-chayun","0");
    //const commentText=getVal("comment");
    const reportText=
`${time} "Смерека". Виявлено ворожий ${type} ( А-${azimuth}°, К-${course}°, В-${height}m, Д-${distance}m ). Ціль обстріляно. Ціль ${result}. Витрата набоїв: 
${ammoFrolov} шт - ${calibr1} ст. с-нт Фролов. 
${ammoChayun} шт - ${calibr2} ст. солд. Чаюн`;
  
  // Вибираємо textarea для втавки сформованої доповіді
    document.getElementById("report").value=reportText;
  }

  //Поки незнаю, але думаю що коли щось змінюється
  // в input, select, textarea то ми оновлюємо
  // доповідь
  document.querySelectorAll("input,select,textarea").forEach(el=>{
    el.addEventListener("input",updateReport);
  });

  // Кнопка яка додає патроны в input і оновлює доповідь
  document.querySelectorAll(".ammo-plus").forEach(btn=>{
    btn.addEventListener("click",()=>{
    const input=document.getElementById(btn.dataset.target);
    let val=parseInt(input.value)||0;
    input.value=val+1;
    updateReport();
    });
  });
  
  // Кнопка яка віднімає патрон з input
  document.querySelectorAll(".ammo-minus").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const input=document.getElementById(btn.dataset.target);
      let val=parseInt(input.value)||0;
      if(val>0) input.value=val-1;
      updateReport();
    });
  });
  
  // Вішаємо клік на button, це анімація повідомлення
  // Про успішне копіювання до буфера обміну
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
  
document.getElementById("share-report-btn").addEventListener("click", async () => {
    const text = document.getElementById("report").value;
    if (navigator.share) {
        try {
            await navigator.share({
                title: "Сообщение",
                text: text
            });
        } catch (err) {
            console.log("Ошибка:", err);
        }
    } else {
        alert("Функция не поддерживается на этом устройстве");
    }
});

  updateReport();

});
