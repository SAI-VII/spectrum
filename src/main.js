/* 啟動與事件接線 */

function measureControls(){
  document.documentElement.style.setProperty("--ctl-h",$("#controls").offsetHeight+"px");
}

function setView(v){
  state.view=v;
  const cz=v==="cosmos", ld=v==="ladder";
  $$(".viewsw [data-view]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.view===v));
  $("#codex").hidden=v!=="codex"; $("#ladder").hidden=!ld; $("#foot").hidden=cz; $("#cosmos").hidden=!cz;
  document.body.classList.toggle("view-cosmos",cz);
  measureControls();
  if(ld) Ladder.build();
  if(cz||ld){
    const y=$(cz?"#cosmos":"#ladder").getBoundingClientRect().top+scrollY-$("#controls").offsetHeight;
    scrollTo({top:Math.max(0,y),behavior:"instant"});
  }
  if(cz) Cosmos.start($("#cosmos")); else Cosmos.stop();
  if(!state.current) Hash.set(cz?"cosmos":ld?"ladder":"");
}

function jumpToBand(key){
  if(state.view==="cosmos"){ Cosmos.flyToBand(key); return; }
  if(state.view==="ladder") setView("codex");
  const el=$("#band-"+key); if(!el) return;
  const y=el.getBoundingClientRect().top+scrollY-$("#controls").offsetHeight-8;
  scrollTo({top:y,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
  Sound.band(key);
}

function currentBand(){
  if(state.current) return byRank(state.current).band;
  const mid=innerHeight/2;
  const sec=$$(".band").find(s=>{ const r=s.getBoundingClientRect(); return r.top<=mid&&r.bottom>=mid; });
  return sec?sec.id.replace("band-",""):"law";
}

document.addEventListener("DOMContentLoaded",async()=>{
  await Portraits.init();
  build();
  Compare.render();

  $("#q").addEventListener("input",ev=>{ state.q=ev.target.value.trim(); paint(); });
  $$(".lens").forEach(b=>b.addEventListener("click",()=>setLens(b.dataset.lens)));
  $$(".reg").forEach(b=>b.addEventListener("click",()=>setRegion(b.dataset.reg)));
  $("#favOnly").addEventListener("click",ev=>{
    state.favOnly=!state.favOnly; ev.currentTarget.setAttribute("aria-pressed",state.favOnly); paint();
    if(state.favOnly&&!ENTITIES.some(e=>Collection.isFav(e.rank))) toast("未有收藏:打開任何一位,按「☆ 收藏」");
  });
  $("#sound").addEventListener("click",ev=>{
    const on=Sound.toggle(currentBand()); ev.currentTarget.setAttribute("aria-pressed",on);
    toast(on?"聲景已開:每一環有自己的和弦":"聲景已關");
  });
  $$(".viewsw [data-view]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
  $$("#spine b").forEach(b=>b.addEventListener("click",()=>jumpToBand(b.dataset.band)));
  $("#t-cosmos").addEventListener("click",()=>setView("cosmos"));
  $("#t-ladder").addEventListener("click",()=>setView("ladder"));
  $("#ld-human").textContent=HUMAN.power;
  $("#t-omen").addEventListener("click",()=>Omen.open());
  $("#t-quiz").addEventListener("click",()=>Quiz.start());
  $("#scrim").addEventListener("click",closeDetail);
  $("#modal").addEventListener("click",ev=>{ if(ev.target.id==="modal") Modal.close(); });

  document.addEventListener("keydown",ev=>{
    if(ev.key==="Escape"){ if(Modal.isOpen()) Modal.close(); else closeDetail(); return; }
    if(/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)||ev.metaKey||ev.ctrlKey||ev.altKey) return;
    if(ev.key==="/"){ ev.preventDefault(); $("#q").focus(); return; }
    if(state.current&&!Modal.isOpen()&&(ev.key==="ArrowLeft"||ev.key==="ArrowRight")){
      const [p,n]=neighbours(byRank(state.current)); openDetail((ev.key==="ArrowLeft"?p:n).rank);
    }
  });

  /* 聲景跟住捲動:哪一環在畫面中間,就奏哪一環 */
  if("IntersectionObserver" in window){
    const io=new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting&&!state.current) Sound.band(en.target.id.replace("band-","")); }),{rootMargin:"-45% 0px -45% 0px"});
    $$(".band").forEach(s=>io.observe(s));
  }
  addEventListener("resize",measureControls);
  measureControls();
  $("#hint").innerHTML=HINTS.band;

  /* 網址錨點:#e121 打開該靈,#ladder 實力階梯,#cosmos 進入星宇,#omen 抽籤,#quiz 測驗 */
  const h=Hash.get();
  if(h==="cosmos") setView("cosmos");
  else if(h==="ladder") setView("ladder");
  else if(/^e\d+$/.test(h)&&byRank(h.slice(1))) openDetail(+h.slice(1));
  else if(h==="omen") Omen.open();
  else if(h==="quiz") Quiz.start();
});
