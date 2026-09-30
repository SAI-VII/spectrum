/* 靈體圖鑑 · 本體光譜 — 核心:狀態、印記、法陣、圖鑑、抽屜
   沿用原檔的函式與寫法;新增:傾斜印記、收藏／遇見標記、立體台、相似靈體、前後導航、AI 經 Claude 續寫。 */

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const cvar=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const state={lens:"band",region:"all",q:"",favOnly:false,view:"codex",current:null};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

const byRank=r=>ENTITIES.find(x=>x.rank==r);
const bandOf=e=>BANDS.find(b=>b.key===e.band);
const bandColor=e=>cvar(bandOf(e).color);
/* 各環內的排序(依本體權能),圖鑑、導航、3D 塔共用 */
const BAND_LISTS={};
BANDS.forEach(b=>{BAND_LISTS[b.key]=ENTITIES.filter(e=>e.band===b.key).sort((a,c)=>c.radar[0]-a.radar[0]);});

function ramp(v){
  const stops=[[0,[56,68,92]],[50,[150,118,94]],[100,[244,201,93]]];
  v=Math.max(0,Math.min(100,v));
  let a=stops[0],b=stops[stops.length-1];
  for(let i=0;i<stops.length-1;i++){ if(v>=stops[i][0]&&v<=stops[i+1][0]){a=stops[i];b=stops[i+1];break;} }
  const t=(v-a[0])/((b[0]-a[0])||1);
  const c=a[1].map((x,i)=>Math.round(x+(b[1][i]-x)*t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
const lensIndex=()=>AXES.findIndex(a=>a.k===state.lens);
function entColor(e){
  if(state.lens==="band"){ return bandColor(e); }
  return ramp(e.radar[lensIndex()]);
}
const regionMatch=e=>state.region==="all"||e.region===state.region;
const searchMatch=e=>!state.q||e.cn.toLowerCase().includes(state.q.toLowerCase())||(e.en||"").toLowerCase().includes(state.q.toLowerCase());
const favMatch=e=>!state.favOnly||Collection.isFav(e.rank);
const visible=e=>regionMatch(e)&&searchMatch(e)&&favMatch(e);

function glyphSVG(vals){
  const cx=32,cy=32,R=22,n=6;
  const pt=(i,r)=>{const a=-Math.PI/2+i*2*Math.PI/n;return [cx+r*Math.cos(a),cy+r*Math.sin(a)];};
  const frame=Array.from({length:n},(_,i)=>pt(i,R).map(v=>v.toFixed(1)).join(",")).join(" ");
  const sig=vals.map((v,i)=>pt(i,R*Math.max(v,4)/100).map(x=>x.toFixed(1)).join(",")).join(" ");
  return `<polygon class="gframe" points="${frame}"/><polygon class="gsig" points="${sig}"/>`;
}
const glyph=(e,sz,col)=>`<svg class="glyph" width="${sz}" height="${sz}" viewBox="0 0 64 64" aria-hidden="true" style="color:${col||bandColor(e)}">${glyphSVG(e.radar)}</svg>`;

function build(){
  const main=$("#spectrum");
  BANDS.forEach((band,bi)=>{
    const list=BAND_LISTS[band.key];
    const sec=document.createElement("section");
    sec.className="band"+(band.warm?" band-warm":"");
    sec.id="band-"+band.key;
    if(band.warm)sec.style.setProperty("--warm-wash",band.warm);
    sec.style.transitionDelay=(bi*65)+"ms";
    sec.innerHTML=
      `<div class="seal-bg ${band.cls}">${band.seal}</div>`+
      `<div class="band-head"><span class="band-seal ${band.cls}">${band.seal}</span>`+
      `<span class="band-name">${band.cn}</span><span class="band-en">${band.en}</span>`+
      `<span class="band-tier">${band.tier}</span><span class="band-count">${list.length} 位</span></div>`+
      `<p class="band-essence">${band.essence}</p><div class="plate"></div>`;
    const plate=sec.querySelector(".plate");
    list.forEach(e=>{
      const sz=Math.round(30+(e.radar[0]/100)*24);
      const cell=document.createElement("button");
      cell.className="cell"+(e.flagship?" flag":"");
      cell.dataset.rank=e.rank;
      cell.setAttribute("aria-label",e.cn+(e.en?" "+e.en:""));
      cell.innerHTML=`<svg class="glyph" width="${sz}" height="${sz}" viewBox="0 0 64 64" aria-hidden="true">${glyphSVG(e.radar)}</svg>`+
        `<span class="cap">${e.cn}${e.en?`<span class="en">${e.en}</span>`:""}</span><span class="mk" aria-hidden="true"></span>`;
      cell.addEventListener("click",()=>openDetail(e.rank));
      plate.appendChild(cell);
    });
    tiltPlate(plate);
    main.appendChild(sec);
  });
  paint();
  $("#legend").innerHTML=BANDS.map(b=>`<span><i style="background:${cvar(b.color)}"></i>${b.seal} ${b.cn} · ${b.en}</span>`).join("");
  $("#colophon").innerHTML=`共 <b>${ENTITIES.length}</b> 位靈體,分作七環;其中 <b>${ENTITIES.filter(e=>e.flagship).length}</b> 位已立傳——以該環應有的語域精寫,並附豐富化的影響/職權與能力/手段,名字亮色顯示。每一位點開,都有<b>六軸逐條解讀</b>(數值＋一句詮釋＋量條)、一座<b>立體台</b>(六軸晶體,或你放入的肖像經深度圖立體化)、<b>相似靈體</b>與<b>ChatGPT 圖像指令</b>;在 Claude 內開啟時,更可按 <b>「深掘立傳」</b>或<b>「向祂問一句」</b>,由 AI 以對應語域續寫。每枚印記:形狀＝六軸側影,大小＝本體權能,顏色隨「光照」而變;左上小點＝已遇見,★＝已收藏,「像」＝已立像。`;
  requestAnimationFrame(()=>$$(".band").forEach(s=>s.classList.add("in")));
}

/* 印記隨游標傾斜:一個 plate 只掛一組監聽 */
function tiltPlate(plate){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches||matchMedia("(hover: none)").matches) return;
  let cur=null;
  plate.addEventListener("pointermove",ev=>{
    const c=ev.target.closest(".cell"); if(!c) return;
    if(cur&&cur!==c) reset(cur);
    cur=c;
    const r=c.getBoundingClientRect(), x=(ev.clientX-r.left)/r.width, y=(ev.clientY-r.top)/r.height;
    c.style.setProperty("--ry",((x-.5)*16).toFixed(1)+"deg");
    c.style.setProperty("--rx",((.5-y)*16).toFixed(1)+"deg");
    c.style.setProperty("--mx",(x*100).toFixed(0)+"%");
    c.style.setProperty("--my",(y*100).toFixed(0)+"%");
  });
  plate.addEventListener("pointerleave",()=>{ if(cur) reset(cur); cur=null; });
  function reset(c){ c.style.removeProperty("--rx"); c.style.removeProperty("--ry"); }
}

function paint(){
  $$(".cell").forEach(c=>{
    const e=byRank(c.dataset.rank);
    c.style.color=entColor(e);
    c.classList.toggle("dim",!visible(e));
    c.classList.toggle("seen",Collection.isSeen(e.rank));
    const mk=c.querySelector(".mk"), fav=Collection.isFav(e.rank), img=Portraits.has(e.rank);
    mk.textContent=fav?"★":img?"像":"";
    mk.className="mk"+(!fav&&img?" img":"");
  });
  Collection.renderProgress();
  if(typeof Cosmos!=="undefined") Cosmos.paint();
}
function setLens(l){ state.lens=l; $$(".lens").forEach(b=>b.setAttribute("aria-pressed",b.dataset.lens===l));
  $("#hint").innerHTML=HINTS[l]; $("#hint").style.opacity=0; requestAnimationFrame(()=>$("#hint").style.opacity=1); paint(); }
function setRegion(r){ state.region=r; $$(".reg").forEach(b=>b.setAttribute("aria-pressed",b.dataset.reg===r)); paint(); }

function radarSVG(vals,color){ return radarMultiSVG([{vals,color}],true); }
/* 多重法陣:比較與測驗共用。draw=true 時多邊形由中心展開 */
function radarMultiSVG(sets,draw){
  const cx=140,cy=140,R=100,n=6;
  const pt=(i,r)=>{const ang=-Math.PI/2+i*2*Math.PI/n;return [cx+r*Math.cos(ang),cy+r*Math.sin(ang)];};
  let s=`<svg class="radar${draw?" draw":""}" viewBox="-40 -4 360 288" role="img" aria-label="六軸法陣">`;
  [25,50,75,100].forEach(p=>{
    const poly=Array.from({length:n},(_,i)=>pt(i,R*p/100).map(v=>v.toFixed(1)).join(",")).join(" ");
    s+=`<polygon class="ring" points="${poly}"/>`;});
  for(let i=0;i<n;i++){const[x,y]=pt(i,R);s+=`<line class="spoke" x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`;}
  sets.forEach(({vals,color,dash})=>{
    const vpoly=vals.map((v,i)=>pt(i,R*v/100).map(x=>x.toFixed(1)).join(",")).join(" ");
    s+=`<polygon class="poly" points="${vpoly}" fill="${color}" fill-opacity="${sets.length>1?0.12:0.2}" stroke="${color}" stroke-width="1.4"${dash?` stroke-dasharray="4 3"`:""}/>`;
    vals.forEach((v,i)=>{const[x,y]=pt(i,R*v/100);s+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="${color}"/>`;});
  });
  for(let i=0;i<n;i++){const[x,y]=pt(i,R+18);const c=Math.cos(-Math.PI/2+i*2*Math.PI/n);
    const anc=c>0.3?"start":c<-0.3?"end":"middle";const dy=y<cy?-2:y>cy?12:4;
    s+=`<text x="${x.toFixed(1)}" y="${(y+dy).toFixed(1)}" text-anchor="${anc}">${AXES[i].label}</text>`;}
  s+=`</svg>`;return s;
}

/* 六軸距離:相似靈體與測驗共用。最大距離 = 100·√6 ≈ 245 */
const radarDist=(a,b)=>Math.sqrt(a.reduce((s,v,i)=>s+(v-b[i])**2,0));
const likeness=d=>Math.max(0,Math.round(100*(1-d/245)));
function similar(e,k=6){
  return ENTITIES.filter(x=>x!==e).map(x=>[x,radarDist(e.radar,x.radar)]).sort((a,b)=>a[1]-b[1]||(b[0].flagship-a[0].flagship)).slice(0,k);
}
function neighbours(e){
  const list=BAND_LISTS[e.band], i=list.indexOf(e);
  return [list[(i-1+list.length)%list.length], list[(i+1)%list.length]];
}

const X_ICON=`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`;

function openDetail(rank){
  const e=byRank(rank); if(!e)return;
  state.current=e.rank;
  Collection.markSeen(e.rank);
  const band=bandOf(e); const col=cvar(band.color);
  const voice=e.voice||VOICE_OF[e.band];
  const tierStyle=`background:${col}22;color:${col};border:1px solid ${col}55`;
  const meta=[["環",band.cn],["系統",e.system],["概念",e.concept],["段位",e.tier_label],["編號",e.rank]]
    .filter(m=>m[1]).map(m=>`<span>${m[0]} <b>${m[1]}</b></span>`).join("");
  const axisRows=AXES.map((a,i)=>{const v=e.radar[i];return `<div class="axrow"><span class="axname">${a.label}</span><span class="axbar"><span class="axfill" style="width:${v}%;background:${col}"></span></span><span class="axval">${v}</span><span class="axread">${axisRead(i,v)}</span></div>`;}).join("");
  const untold=e.flagship?"":`<span class="untold">待立傳</span>`;
  const facts=[["對人的影響／職權",e.influence],["能力與手段",e.means]]
    .filter(f=>f[1]&&f[1]!=="—").map(f=>`<div><b>${f[0]}</b><br>${f[1]}</div>`).join("");
  const sims=similar(e).map(([x,d])=>`<button class="sim-item" data-rank="${x.rank}">${glyph(x,30)}<span><span class="n">${x.cn}</span><span class="p">${bandOf(x).seal} · 相近 ${likeness(d)}%</span></span></button>`).join("");
  const [prev,next]=neighbours(e);

  $("#dr-body").innerHTML=
    `<button class="dr-close" aria-label="關閉">${X_ICON}</button>`+
    `<span class="dr-tier" style="${tierStyle}">${e.tier_label||e.tier}</span>`+
    `<h2 class="dr-cn">${e.cn}</h2>`+(e.en?`<p class="dr-en">${e.en}</p>`:"")+
    `<div class="dr-meta">${meta}</div>`+
    `<div class="stage" id="stage" style="--sc:${col}">`+
      `<div class="stage-gl"></div>`+
      `<span class="stage-mode" id="stage-mode">六軸晶體</span><div class="stage-ui">`+
        `<label class="sbtn">放入肖像<input type="file" accept="image/*" id="pf-img"></label>`+
        `<label class="sbtn">深度圖<input type="file" accept="image/*" id="pf-depth"></label>`+
        `<label class="sbtn">GLB 模型<input type="file" accept=".glb,model/gltf-binary" id="pf-model"></label>`+
        `<button class="sbtn" id="pf-clear" type="button" hidden>移除</button></div>`+
      `<div class="stage-drop">放開,即把圖像立體化</div>`+
    `</div>`+
    `<div class="acts">`+
      `<button class="act" id="a-fav" aria-pressed="${Collection.isFav(e.rank)}">${Collection.isFav(e.rank)?"★ 已收藏":"☆ 收藏"}</button>`+
      `<button class="act" id="a-cmp" aria-pressed="${Compare.has(e.rank)}">${Compare.has(e.rank)?"已加入比較":"加入比較"}</button>`+
      `<button class="act" id="a-prompt" aria-pressed="false">ChatGPT 圖像指令</button>`+
      `<button class="act" id="a-share">分享卡</button>`+
    `</div><div id="pp-slot"></div>`+
    `<div class="radar-wrap">${radarSVG(e.radar,col)}</div>`+
    `<div class="axis-block">${axisRows}</div>`+
    `<div class="voice-tag"><span>語域 · ${VOICE_NAME[voice]||""}</span>${untold}</div>`+
    `<div class="desc v-${voice}">${e.desc||e.brief||""}</div>`+
    (facts?`<div class="facts">${facts}</div>`:"")+
    (e.source&&e.source!=="—"?`<p class="source">來源 · ${e.source}</p>`:"")+
    `<div class="sim"><p class="sec-h">六軸最相近的靈體</p><div class="sim-list">${sims}</div></div>`+
    `<div class="deepen-wrap" id="ai-slot"></div>`+
    `<nav class="dr-nav" aria-label="同環導航"><button data-rank="${prev.rank}">← ${prev.cn}</button><button data-rank="${next.rank}">${next.cn} →</button></nav>`;

  const body=$("#dr-body");
  body.querySelector(".dr-close").addEventListener("click",closeDetail);
  body.querySelectorAll(".sim-item,.dr-nav button").forEach(b=>b.addEventListener("click",()=>openDetail(+b.dataset.rank)));
  $("#a-fav").addEventListener("click",ev=>{ const on=Collection.toggleFav(e.rank); ev.currentTarget.setAttribute("aria-pressed",on); ev.currentTarget.textContent=on?"★ 已收藏":"☆ 收藏"; paint(); });
  $("#a-cmp").addEventListener("click",ev=>{ const on=Compare.toggle(e.rank); ev.currentTarget.setAttribute("aria-pressed",on); ev.currentTarget.textContent=on?"已加入比較":"加入比較"; });
  $("#a-prompt").addEventListener("click",ev=>PromptPanel.toggle(e,ev.currentTarget));
  $("#a-share").addEventListener("click",()=>ShareCard.open(e));
  renderAI(e);

  const dr=$("#drawer"); dr.classList.add("open"); dr.setAttribute("aria-hidden","false");
  $("#scrim").classList.add("open"); dr.scrollTop=0; dr.focus({preventScroll:true});
  const r=dr.querySelector(".radar"); if(r)requestAnimationFrame(()=>r.classList.remove("draw"));
  StageUI.mount($("#stage"),e,col);
  Sound.enter(e.band,e.radar[0]);
  if(state.view==="cosmos") Cosmos.focus(e.rank);
  Hash.set("e"+e.rank);
  paint();
}
function closeDetail(){
  if(!$("#drawer").classList.contains("open")) return;
  $("#drawer").classList.remove("open"); $("#drawer").setAttribute("aria-hidden","true"); $("#scrim").classList.remove("open");
  state.current=null; Stage3D.stop(); AI.abort(); Hash.set(state.view==="cosmos"?"cosmos":"");
}

/* ───── AI:經 Claude 的 sample 能力續寫(只在 Claude 內開啟時可用) ───── */
function renderAI(e){
  const slot=$("#ai-slot"); if(!slot||state.current!==e.rank) return;
  if(AI.state==="off"){
    slot.innerHTML=window.claude?"":`<p class="ai-note">在 Claude 內開啟此頁,即可請 AI 以「${VOICE_NAME[e.voice||VOICE_OF[e.band]]}」為此靈深掘立傳,或向祂問一句。</p>`;
    return;
  }
  if(AI.state==="pending"){ slot.innerHTML=""; return; }
  slot.innerHTML=`<button class="deepen" id="deepen-btn">✦ 為此靈深掘立傳（AI 續寫）</button><div id="deepen-out"></div>`+
    `<form class="ask" id="ask-form"><input id="ask-q" type="text" maxlength="120" placeholder="向祂問一句⋯⋯" aria-label="向此靈體提問"><button type="submit">問</button></form><div class="ask-out" id="ask-out"></div>`;
  $("#deepen-btn").addEventListener("click",ev=>deepen(e,ev.currentTarget));
  $("#ask-form").addEventListener("submit",ev=>{ ev.preventDefault(); askSpirit(e); });
}

function lorePrompt(e){
  const band=bandOf(e);
  return `名稱:${e.cn}${e.en?` (${e.en})`:""}
所屬環:${band.cn} / ${band.en}（${band.essence}）
系統:${e.system||"—"}
概念:${e.concept||"—"}
現有影響/職權:${e.influence||"—"}
現有能力/手段:${e.means||"—"}
現有簡介:${e.brief||"—"}
${e.desc?`現有立傳:${e.desc}\n`:""}六軸數值(0-100):本體權能${e.radar[0]}、影響半徑${e.radar[1]}、向人性${e.radar[2]}、可協商度${e.radar[3]}、信仰熱度${e.radar[4]}、臨界性${e.radar[5]}`;
}

async function deepen(e,btn){
  const voice=e.voice||VOICE_OF[e.band];
  btn.disabled=true; btn.textContent="深掘中⋯⋯(AI 正在構思,約需半分鐘)";
  const prompt=`你係一位博學而文筆優美嘅靈異圖鑑作者。本圖鑑核心主題:權力與親密成反比——最有權能者最冷漠、不可祈求;最被惦記者(如祖先、夢中故人)權能近乎零,卻最親。

請為以下靈體撰寫一段「立傳」,並深化佢嘅資料。

${lorePrompt(e)}

語域要求:${REGISTER[voice]||REGISTER.epic}

請只輸出一個 JSON 物件,唔好有任何其他文字或 markdown 圍欄。格式:
{"desc":"一段約 130–200 字、極之詳盡而緊扣上述語域嘅立傳","influence":"深化後嘅對人的影響／職權,約 35–60 字","means":"深化後嘅能力與手段,約 35–60 字","axes":"六軸解讀,逐軸用一句解釋點解係咁個數值,合共約 70–110 字"}`;
  try{
    const o=await AI.json(prompt);
    if(state.current!==e.rank) return;
    $("#deepen-out").innerHTML=`<div class="deep-card"><div class="deep-tag">✦ AI 深掘 · ${VOICE_NAME[voice]||""}</div>`+
      (o.desc?`<div class="desc v-${voice}">${esc(o.desc)}</div>`:"")+
      ((o.influence||o.means)?`<div class="facts">`+(o.influence?`<div><b>影響／職權（深掘）</b><br>${esc(o.influence)}</div>`:"")+(o.means?`<div><b>能力／手段（深掘）</b><br>${esc(o.means)}</div>`:"")+`</div>`:"")+
      (o.axes?`<div class="deep-axes"><b>六軸解讀</b>　${esc(o.axes)}</div>`:"")+`</div>`;
    btn.style.display="none";
  }catch(err){
    if(state.current!==e.rank||err.code==="cancelled") return;
    btn.disabled=false; btn.textContent="✦ 再試一次";
    $("#deepen-out").innerHTML=`<div class="deep-err">${AI.explain(err)}原有資料仍然喺度。</div>`;
    if(AI.fatal(err)) renderAI(e);
  }
}

async function askSpirit(e){
  const inp=$("#ask-q"), q=inp.value.trim(); if(!q) return;
  const voice=e.voice||VOICE_OF[e.band], btn=$("#ask-form button"), out=$("#ask-out");
  btn.disabled=true;
  out.innerHTML=`<p class="ask-q">你問:${esc(q)}</p><div class="desc v-${voice}" id="ask-a">⋯⋯</div>`;
  const prompt=`你現在就係以下呢位靈體本身,用第一身回應凡人。保持角色,唔好解釋你係 AI,唔好用 markdown。

${lorePrompt(e)}

語域要求:${REGISTER[voice]||REGISTER.epic}
性格準則:本體權能越高越冷漠、越不屑回應個人;向人性越高越溫柔;可協商度越低越不肯答應任何請求;臨界性越高,說話越似夢話或低語。回應 60–140 字。

凡人問:${q}`;
  try{
    await AI.text(prompt,t=>{ if(state.current===e.rank){ const a=$("#ask-a"); if(a) a.textContent=t; } });
    inp.value="";
  }catch(err){
    if(state.current!==e.rank||err.code==="cancelled") return;
    const a=$("#ask-a"); if(a) a.textContent=err.text||"";
    out.insertAdjacentHTML("beforeend",`<div class="deep-err">${AI.explain(err)}</div>`);
    if(AI.fatal(err)) renderAI(e);
  }finally{ if(btn) btn.disabled=false; }
}
