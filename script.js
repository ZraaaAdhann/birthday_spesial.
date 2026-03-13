/* ================= SLIDER ================= */

document.addEventListener("DOMContentLoaded",()=>{
  typedAlready=false;
});


let current = 1;

function goNext(){

  const currentSlide = document.getElementById("slide" + current);
  if(!currentSlide) return;

  // SLIDE 3 buka amplop dulu
  if(current === 3 && !currentSlide.classList.contains("open")){
    currentSlide.classList.add("open");
    return;
  }

  // pindah
  currentSlide.classList.remove("active");
  current++;

  const nextSlide = document.getElementById("slide" + current);
  if(!nextSlide) return;

  nextSlide.classList.add("active");

  /* trigger khusus tiap slide */
if(nextSlide.id === "slide2") setTimeout(startTyping,400);
if(nextSlide.id === "slide4") showPap();
if(nextSlide.id === "slide6") startSecretGame();

}

/* auto start game saat slide6 aktif */
const observer = new MutationObserver(()=>{
  const slide6=document.getElementById("slide6");
  if(slide6 && slide6.classList.contains("active")){
    startSecretGame();
  }
});
observer.observe(document.body,{attributes:true,subtree:true});



/* ================= PAP PHOTO ================= */

function showPap(){
  const paps = document.querySelectorAll('#slide4 .pap');
  const nextBtn = document.querySelector("#slide4 .next-btn");

  if(nextBtn) nextBtn.classList.add("hidden");

  paps.forEach((pap, i) => {
    pap.classList.remove("show");
    setTimeout(() => pap.classList.add("show"), i * 300);
  });

  if(nextBtn){
    setTimeout(() => {
      nextBtn.classList.remove("hidden");
    }, paps.length * 300);
  }
}

/* ================= MUSIC PLAYER ================= */

const audio = document.getElementById("audio");
const playBtn = document.querySelector(".play-btn");
const progressFill = document.getElementById("progressFill");
const progressBar = document.querySelector(".progress-bar");

function toggleMusic(){

  if(!audio) return;

  if(audio.paused){
    audio.play().then(()=>{
      if(playBtn) playBtn.innerHTML="⏸";
    }).catch(()=>{});
  }else{
    audio.pause();
    if(playBtn) playBtn.innerHTML="▶";
  }
}

/* progress jalan */
if(audio && progressFill){
  audio.addEventListener("timeupdate", ()=>{
    if(audio.duration){
      const percent = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = percent + "%";
    }
  });
}

/* klik progress */
if(progressBar && audio){
  progressBar.addEventListener("click", (e)=>{
    const width = progressBar.clientWidth;
    const clickX = e.offsetX;
    audio.currentTime = (clickX / width) * audio.duration;
  });
}


//* ================= SECRET GAME ================= */

let gameStarted = false;
let selectedDate = null;
let printing = false;
let gameFinished = false; // GLOBAL STATE (penting)

function startSecretGame(){

if(gameStarted || gameFinished) return;
gameStarted = true;

const words=[
'LOVE','CAKE','MUSIC','HUG','STAR','FOREVER','ANGEL',
'SMILE','BABY','MOON','GIFT','PEACE'
];

const secret="MEET";

const grid=document.getElementById("wordGrid");
const dateForm=document.getElementById("dateForm");
const datePicker=document.getElementById("datePicker");
const textTitle=document.getElementById("dateTitle");

if(!grid || !dateForm || !datePicker) return;

/* reset */
grid.innerHTML="";
datePicker.innerHTML="";
dateForm.style.display="none";
grid.style.display="flex";

/* acak kata */
const shuffled=[...words];
shuffled.splice(Math.floor(Math.random()*shuffled.length),0,secret);

/* tampilkan kata */
shuffled.forEach((word,i)=>{
  const btn=document.createElement("button");
  btn.className="word-btn";
  btn.innerText=word;
  grid.appendChild(btn);

  setTimeout(()=>btn.classList.add("show"), i*80);

  btn.onclick=()=>{
    if(gameFinished) return;

    if(word===secret){

      textTitle.innerText="YEEAAYY BENAARR, Pilih Tanggal Meet Kita!!!";

      grid.style.display="none";
      dateForm.style.display="block";
      createDatePicker();

    }else{
      btn.classList.add("wrong");
      setTimeout(()=>btn.classList.remove("wrong"),350);
    }
  };
});

/* tanggal */
function createDatePicker(){

  for(let i=1;i<=31;i++){
    const d=document.createElement("button");
    d.className="date-btn";
    d.innerText=i;
    datePicker.appendChild(d);

    d.onclick=()=>{
      if(gameFinished) return;

      document.querySelectorAll(".date-btn").forEach(b=>b.classList.remove("selected"));
      d.classList.add("selected");
      selectedDate=i;
    };
  }
}

}

/* ================= CONFIRM BUTTON ================= */

document.addEventListener("click",(e)=>{
  if(e.target && e.target.id==="confirmBtn"){
    e.stopPropagation();
    handleConfirm();
  }
});

/* ================= CONFIRM → PRINT → DOWNLOAD ================= */

async function handleConfirm(){

  if(printing || gameFinished) return;

  if(!selectedDate){
    alert("pilih tanggal dulu ❤️");
    return;
  }

  printing = true;

  const fullDate = selectedDate + " Mei 2026";

  const printer  = document.getElementById("ticketPrinter");
  const viewport = document.querySelector(".paper-viewport");
  const ticket   = document.getElementById("ticket");
  const machine  = document.querySelector("#slide6 .printer");
  const dateTxt  = document.getElementById("ticketDate");
  const dateTxt2 = document.getElementById("ticketDate2");
  const qr       = document.getElementById("qrcode");

  if(!printer || !viewport || !ticket || !machine){
    printing=false;
    return;
  }

  /* isi tiket */
  dateTxt.textContent = fullDate;
  if(dateTxt2) dateTxt2.textContent = fullDate;

  qr.innerHTML="";
  new QRCode(qr,{
    text:"Meet With Liana Sabirah - "+fullDate,
    width:70,
    height:70
  });

  await new Promise(r=>setTimeout(r,300));

  /* tampilkan printer */
  printer.classList.add("active");

  /* getar mesin */
  machine.classList.add("shake");
  await new Promise(r=>setTimeout(r,450));

  /* keluar kertas */
  viewport.style.height = ticket.scrollHeight + "px";
  machine.classList.remove("shake");

  await new Promise(r=>setTimeout(r,2400));

  /* download tiket */
  const canvas = await html2canvas(ticket,{backgroundColor:"#fff",scale:2});

  const link=document.createElement("a");
  link.download="Meet-Ticket.png";
  link.href=canvas.toDataURL();
  link.click();

  /* ===== MODE ENDING ===== */
gameFinished = true;
printing = false;

/* matikan semua interaksi di slide */
document.querySelectorAll(".slide *").forEach(el=>{
  el.style.pointerEvents="none";
});

/* printer tetap aktif */
printer.style.pointerEvents="auto";

/* tampilkan tombol back */
const backBtn = document.getElementById("backBtn");
backBtn.style.display = "block";

/* aktifkan tombol */
backBtn.style.pointerEvents = "auto";
backBtn.style.zIndex = "9999";
}

let typedAlready = false;

function startTyping(){

  if(typedAlready) return;

  const el = document.getElementById("typingText");
  if(!el) return;

  typedAlready = true;

  const text = el.textContent.trim();
  el.textContent="";

  let i=0;

  function type(){

    if(i < text.length){

      let speed = 20;

      if(text[i] === ".") speed = 260;
      else if(text[i] === ",") speed = 140;
      else if(text[i] === " ") speed = 10;

      el.textContent += text[i];
      i++;

      setTimeout(type, speed);

    }
  }

  type();
}

function printTicket() {
    window.print();

    // setelah print tampilkan tombol back
    document.getElementById("backBtn").style.display = "block";
}

const backBtn = document.getElementById("backBtn");

backBtn.addEventListener("click", () => {
  location.reload();
});

document.addEventListener("DOMContentLoaded", () => {

  const backBtn = document.getElementById("backBtn");

  if(backBtn){
    backBtn.addEventListener("click", () => {
      location.reload();
    });
  }

});