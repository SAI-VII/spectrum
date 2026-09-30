/* 靈體圖鑑 · 功能模組
   Store 本機偏好 · Collection 遇見／收藏 · Portraits 立像(IndexedDB＋登記冊) · StageUI 立體台操作
   Compare 對照 · PromptPanel ChatGPT 圖像指令 · ShareCard 分享卡 · Quiz 本命靈 · Omen 今日靈籤
   Sound 聲景 · AI 經 Claude 續寫 · Modal/Toast/Hash 介面小工具 */

const Store={
  get(k,d){ try{ const v=localStorage.getItem("spectrum."+k); return v==null?d:JSON.parse(v); }catch{ return d; } },
  set(k,v){ try{ localStorage.setItem("spectrum."+k,JSON.stringify(v)); }catch{} }
};

const Hash={
  set(tok){ try{ history.replaceState(null,"",tok?"#"+tok:location.pathname+location.search); }catch{} },
  get(){ return (location.hash||"").slice(1); }
};

let toastT=0;
function toast(msg){
  const t=$("#toast"); t.textContent=msg; t.classList.add("show");
  clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("show"),2400);
}
function copyText(text,el){
  const done=()=>toast("已複製,貼到 ChatGPT 即可");
  const fallback=()=>{ if(el){ el.focus(); el.select(); } toast("已選取全文,請按 Ctrl+C / ⌘C 複製"); };
  try{ navigator.clipboard.writeText(text).then(done,fallback); }catch{ fallback(); }
}
const rgba=(hex,a)=>{ const h=hex.replace("#",""); const n=parseInt(h.length===3?h.split("").map(c=>c+c).join(""):h,16); return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`; };
const firstSentence=(s,max=64)=>{ s=String(s||"").replace(/<[^>]+>/g,""); const m=s.match(/^[^。!?!?]+[。!?!?]?/); let r=(m?m[0]:s).trim(); return r.length>max?r.slice(0,max-1)+"⋯":r; };

const Modal={
  prev:null,
  open(html,{wide=false}={}){
    const m=$("#modal"), md=$("#md");
    md.className="md"+(wide?" wide":""); md.tabIndex=-1;
    md.innerHTML=`<button class="md-x" aria-label="關閉">${X_ICON}</button>`+html;
    md.querySelector(".md-x").addEventListener("click",()=>Modal.close());
    if(m.hidden) this.prev=document.activeElement;
    m.hidden=false; md.scrollTop=0; md.focus({preventScroll:true});
    return md;
  },
  close(){
    const m=$("#modal"); if(m.hidden) return;
    m.hidden=true; $("#md").innerHTML="";
    try{ this.prev?.focus?.({preventScroll:true}); }catch{}
  },
  isOpen(){ return !$("#modal").hidden; }
};

/* ───── 遇見與收藏 ───── */
const Collection=(()=>{
  const seen=new Set(Store.get("seen",[])), fav=new Set(Store.get("fav",[]));
  return {
    isSeen:r=>seen.has(+r),
    isFav:r=>fav.has(+r),
    markSeen(r){ r=+r; if(!seen.has(r)){ seen.add(r); Store.set("seen",[...seen]); } },
    toggleFav(r){ r=+r; fav.has(r)?fav.delete(r):fav.add(r); Store.set("fav",[...fav]); return fav.has(r); },
    renderProgress(){
      const el=$("#progress"); if(!el) return;
      const nImg=ENTITIES.filter(e=>Portraits.has(e.rank)).length;
      el.innerHTML=`<p class="prog-h">已遇見 <b>${[...seen].filter(r=>byRank(r)).length}</b> / ${ENTITIES.length} · 收藏 <b>${fav.size}</b> · 立像 <b>${nImg}</b></p>`+
        BANDS.map(b=>{ const L=BAND_LISTS[b.key], n=L.filter(e=>seen.has(e.rank)).length, c=cvar(b.color);
          return `<div><b style="color:${c}">${b.seal}</b>${b.cn}<span class="num">${n}/${L.length}</span><span class="bar"><i style="width:${(n/L.length*100).toFixed(1)}%;background:${c}"></i></span></div>`; }).join("");
    }
  };
})();

/* ───── 立像:本機拖放(IndexedDB,只存在這部裝置)＋ assets/manifest.js 登記冊 ───── */
const Portraits=(()=>{
  const mem={}, local=new Set(); let dbp=null, live=[];
  function open(){
    if(dbp) return dbp;
    return dbp=new Promise(res=>{
      try{ const r=indexedDB.open("spectrum-portraits",1);
        r.onupgradeneeded=()=>r.result.createObjectStore("p");
        r.onsuccess=()=>res(r.result); r.onerror=()=>res(null); r.onblocked=()=>res(null);
      }catch{ res(null); }
    });
  }
  function tx(mode,fn){
    return open().then(db=>db&&new Promise(res=>{
      try{ const t=db.transaction("p",mode), q=fn(t.objectStore("p"));
        t.oncomplete=()=>res(q?.result); t.onerror=()=>res(null); t.onabort=()=>res(null);
      }catch{ res(null); }
    }));
  }
  const reg=r=>(window.SPECTRUM_ASSETS||{})[r]||{};
  async function record(r){ return mem[r]||(local.has(r)?await tx("readonly",s=>s.get(r)):null)||{}; }
  return {
    async init(){ const keys=await tx("readonly",s=>s.getAllKeys()); (keys||[]).forEach(k=>local.add(+k)); },
    has(r){ r=+r; const m=reg(r); return !!(mem[r]?.img||mem[r]?.model||local.has(r)||m.img||m.model); },
    isLocal:r=>!!mem[+r]||local.has(+r),
    /* 回傳 {img,depth,model,local} 的網址;本機素材優先於登記冊 */
    async get(r){
      r=+r; live.forEach(u=>URL.revokeObjectURL(u)); live=[];
      const rec=await record(r), m=reg(r), out={};
      for(const k of ["img","depth","model"]){
        if(rec[k] instanceof Blob){ const u=URL.createObjectURL(rec[k]); live.push(u); out[k]=u; out.local=true; }
        else if(m[k]) out[k]=m[k];
      }
      return (out.img||out.model)?out:null;
    },
    async put(r,kind,blob){ r=+r; const rec={...(await record(r))}; rec[kind]=blob; mem[r]=rec; await tx("readwrite",s=>s.put(rec,r)); local.add(r); },
    async clear(r){ r=+r; delete mem[r]; local.delete(r); await tx("readwrite",s=>s.delete(r)); }
  };
})();

const StageUI={
  mount(stage,e,col){
    const rank=e.rank, mode=$("#stage-mode"), clearBtn=$("#pf-clear"), gl=stage.querySelector(".stage-gl");
    const refresh=async()=>{
      const a=await Portraits.get(rank);
      if(state.current!==rank) return;
      clearBtn.hidden=!a?.local;
      const res=await Stage3D.show(gl,e,col,a);
      if(state.current!==rank||!res.label) return;
      mode.textContent=res.label;
      if(!res.ok) gl.innerHTML=`<div class="stage-fallback">${glyph(e,150,col)}</div>`;
    };
    const take=async files=>{
      for(const f of files){
        const kind=/\.glb$/i.test(f.name)?"model":/depth|深度/i.test(f.name)?"depth":f.type.startsWith("image/")?"img":null;
        if(!kind){ toast("只接受圖像或 .glb 模型"); continue; }
        await Portraits.put(rank,kind,f);
        toast(kind==="img"?"已放入肖像,正在立體化":kind==="depth"?"已放入深度圖":"已放入 GLB 模型");
      }
      paint(); refresh();
    };
    const pick=(id,kind)=>$(id).addEventListener("change",async ev=>{
      const f=ev.target.files[0]; if(!f) return;
      if(kind!=="model"&&!f.type.startsWith("image/")){ toast("請選擇圖像檔"); return; }
      await Portraits.put(rank,kind,f); paint(); refresh();
    });
    pick("#pf-img","img"); pick("#pf-depth","depth"); pick("#pf-model","model");
    clearBtn.addEventListener("click",async()=>{ await Portraits.clear(rank); paint(); refresh(); toast("已移除此靈的本機素材"); });
    ["dragenter","dragover"].forEach(t=>stage.addEventListener(t,ev=>{ ev.preventDefault(); stage.classList.add("drag"); }));
    stage.addEventListener("dragleave",ev=>{ if(!stage.contains(ev.relatedTarget)) stage.classList.remove("drag"); });
    stage.addEventListener("drop",ev=>{ ev.preventDefault(); stage.classList.remove("drag"); take([...ev.dataTransfer.files]); });
    refresh();
  }
};

/* ───── 比較(最多三位) ───── */
const Compare=(()=>{
  const COLORS=["#ECE6D9","#F2BD5C","#6FB0A4"];
  let list=Store.get("cmp",[]).filter(r=>byRank(r)).slice(0,3);
  const has=r=>list.includes(+r);
  function save(){ Store.set("cmp",list); render(); }
  function render(){
    const t=$("#tray");
    if(!list.length){ t.hidden=true; t.innerHTML=""; return; }
    t.hidden=false;
    t.innerHTML=`<span class="tray-l">比較</span>`+
      list.map((r,i)=>`<button class="tray-chip" data-rank="${r}" aria-label="從比較移除 ${byRank(r).cn}"><i style="background:${COLORS[i]}"></i>${byRank(r).cn} ×</button>`).join("")+
      `<button class="tray-go"${list.length<2?" disabled":""}>對照 ${list.length} 位</button>`;
    t.querySelectorAll(".tray-chip").forEach(b=>b.addEventListener("click",()=>{ toggle(+b.dataset.rank); syncDrawer(); }));
    t.querySelector(".tray-go").addEventListener("click",open);
  }
  function syncDrawer(){ const b=$("#a-cmp"); if(b&&state.current){ const on=has(state.current); b.setAttribute("aria-pressed",on); b.textContent=on?"已加入比較":"加入比較"; } }
  function toggle(r){
    r=+r;
    if(has(r)) list=list.filter(x=>x!==r);
    else{ if(list.length>=3){ list.shift(); toast("比較最多三位,已移走最早加入的一位"); } list.push(r); }
    save(); return has(r);
  }
  function open(){
    const es=list.map(byRank);
    const rows=AXES.map((a,i)=>{
      const vs=es.map(e=>e.radar[i]), mx=Math.max(...vs);
      return {i,label:a.label,vs,spread:mx-Math.min(...vs),cells:vs.map(v=>`<td class="${v===mx&&es.length>1?"hi":""}">${v}</td>`).join("")};
    });
    const widest=[...rows].sort((a,b)=>b.spread-a.spread)[0];
    const hiE=es[widest.vs.indexOf(Math.max(...widest.vs))], loE=es[widest.vs.indexOf(Math.min(...widest.vs))];
    const byPower=[...es].sort((a,b)=>b.radar[0]-a.radar[0]), strong=byPower[0], weak=byPower[byPower.length-1];
    const inverse=strong!==weak&&strong.radar[2]<weak.radar[2];
    Modal.open(
      `<p class="md-eyebrow">對照 · Side by side</p><h2 class="md-h" id="md-title">${es.map(e=>e.cn).join(" ／ ")}</h2>`+
      `<div class="cmp-wrap"><div>${radarMultiSVG(es.map((e,i)=>({vals:e.radar,color:COLORS[i]})))}</div>`+
      `<div class="cmp-scroll"><table class="cmp-table"><thead><tr><th>軸</th>${es.map((e,i)=>`<th><span style="color:${COLORS[i]}">●</span> ${e.cn}</th>`).join("")}</tr></thead>`+
      `<tbody>${rows.map(r=>`<tr><td>${r.label}</td>${r.cells}</tr>`).join("")}</tbody></table></div></div>`+
      `<p class="cmp-read">差距最大在<b>「${widest.label}」</b>:${hiE.cn} ${Math.max(...widest.vs)},${loE.cn} ${Math.min(...widest.vs)}——${axisRead(widest.i,Math.max(...widest.vs))},對上${axisRead(widest.i,Math.min(...widest.vs))}。`+
      (inverse?`權能較高的<b>${strong.cn}</b>,向人性反而低過<b>${weak.cn}</b>:正是這部圖鑑講的那條反比。`:`今次權能較高的<b>${strong.cn}</b>,向人性亦不低於<b>${weak.cn}</b>——反比並非鐵律。`)+`</p>`+
      `<div class="md-foot">${es.map(e=>`<button class="btn" data-rank="${e.rank}">打開 ${e.cn}</button>`).join("")}<button class="btn" id="cmp-clear">清空比較</button></div>`,
      {wide:true});
    $$("#md .md-foot [data-rank]").forEach(b=>b.addEventListener("click",()=>{ Modal.close(); openDetail(+b.dataset.rank); }));
    $("#cmp-clear").addEventListener("click",()=>{ list=[]; save(); syncDrawer(); Modal.close(); });
  }
  return {has,toggle,render,open};
})();

/* ───── ChatGPT 圖像指令面板 ───── */
const PromptPanel={
  toggle(e,btn){
    const slot=$("#pp-slot");
    if(slot.firstChild){ slot.innerHTML=""; btn.setAttribute("aria-pressed","false"); return; }
    btn.setAttribute("aria-pressed","true");
    slot.innerHTML=`<div class="pp"><div class="pp-tabs" role="tablist">`+
      PROMPT_KINDS.map((k,i)=>`<button role="tab" data-k="${k.k}" aria-selected="${i===0}">${k.label}</button>`).join("")+
      `</div><textarea id="pp-text" readonly aria-label="圖像指令"></textarea>`+
      `<div class="pp-foot"><span class="pp-note" id="pp-note"></span><button class="btn gold" id="pp-copy">複製指令</button></div></div>`;
    const show=k=>{
      $$("#pp-slot .pp-tabs button").forEach(b=>b.setAttribute("aria-selected",b.dataset.k===k));
      $("#pp-text").value=buildImagePrompt(e,k);
      $("#pp-note").textContent=PROMPT_KINDS.find(x=>x.k===k).note;
    };
    $$("#pp-slot .pp-tabs button").forEach(b=>b.addEventListener("click",()=>show(b.dataset.k)));
    $("#pp-copy").addEventListener("click",()=>copyText($("#pp-text").value,$("#pp-text")));
    show("plate");
  }
};

/* ───── 分享卡:1080×1350 PNG ───── */
const ShareCard={
  wrap(g,text,maxW,maxLines){
    const out=[]; let line="";
    for(const ch of text){
      if(ch==="\n"){ out.push(line); line=""; continue; }
      if(g.measureText(line+ch).width>maxW){ out.push(line); line=ch; } else line+=ch;
      if(out.length===maxLines) break;
    }
    if(out.length<maxLines&&line) out.push(line);
    if(out.length===maxLines&&(out.join("").length<text.length)){ let l=out[maxLines-1]; while(l&&g.measureText(l+"⋯").width>maxW) l=l.slice(0,-1); out[maxLines-1]=l+"⋯"; }
    return out.slice(0,maxLines);
  },
  radar(g,vals,cx,cy,R,col){
    const pt=(i,r)=>{ const a=-Math.PI/2+i*Math.PI/3; return [cx+r*Math.cos(a),cy+r*Math.sin(a)]; };
    g.strokeStyle="rgba(236,230,217,.14)"; g.lineWidth=1.5;
    [.25,.5,.75,1].forEach(p=>{ g.beginPath(); for(let i=0;i<6;i++){ const [x,y]=pt(i,R*p); i?g.lineTo(x,y):g.moveTo(x,y); } g.closePath(); g.stroke(); });
    for(let i=0;i<6;i++){ const [x,y]=pt(i,R); g.beginPath(); g.moveTo(cx,cy); g.lineTo(x,y); g.stroke(); }
    g.beginPath(); vals.forEach((v,i)=>{ const [x,y]=pt(i,R*Math.max(v,4)/100); i?g.lineTo(x,y):g.moveTo(x,y); }); g.closePath();
    g.fillStyle=rgba(col,.28); g.shadowColor=col; g.shadowBlur=R*.25; g.fill(); g.shadowBlur=0;
    g.strokeStyle=col; g.lineWidth=R/60; g.lineJoin="round"; g.stroke();
  },
  async render(e,{noImg=false}={}){
    try{ await document.fonts?.ready; }catch{}
    const W=1080,H=1350, c=document.createElement("canvas"); c.width=W; c.height=H;
    const g=c.getContext("2d"), band=bandOf(e), col=cvar(band.color);
    const serif=cvar("--serif"), display=cvar("--display"), sans=cvar("--sans"), mono=cvar("--mono");
    g.fillStyle="#0E1015"; g.fillRect(0,0,W,H);
    const rg=g.createRadialGradient(W/2,400,30,W/2,400,820); rg.addColorStop(0,rgba(col,.2)); rg.addColorStop(1,"rgba(14,16,21,0)");
    g.fillStyle=rg; g.fillRect(0,0,W,H);
    g.textBaseline="alphabetic";
    g.font=`400 520px ${serif}`; g.fillStyle=rgba(col,.05); g.textAlign="right"; g.fillText(band.seal,W-50,1240);
    g.textAlign="center"; g.fillStyle="#9B968A"; g.font=`italic 400 34px ${display}`; g.fillText("靈體圖鑑 · An Ontological Spectrum",W/2,92);

    let img=null; const a=noImg?null:await Portraits.get(e.rank);
    if(a?.img){ try{ img=await loadImage(a.img); }catch{ img=null; } }
    if(img){
      const bx=110,by=130,bw=860,bh=570, s=Math.max(bw/img.naturalWidth,bh/img.naturalHeight);
      g.save(); g.beginPath(); g.roundRect(bx,by,bw,bh,28); g.clip();
      g.drawImage(img,bx+(bw-img.naturalWidth*s)/2,by+(bh-img.naturalHeight*s)/2,img.naturalWidth*s,img.naturalHeight*s);
      const vg=g.createLinearGradient(0,by+bh*.55,0,by+bh); vg.addColorStop(0,"rgba(14,16,21,0)"); vg.addColorStop(1,"rgba(14,16,21,.85)");
      g.fillStyle=vg; g.fillRect(bx,by,bw,bh); g.restore();
      g.beginPath(); g.arc(bx+bw-110,by+bh-110,96,0,Math.PI*2); g.fillStyle="rgba(14,16,21,.72)"; g.fill();
      this.radar(g,e.radar,bx+bw-110,by+bh-110,74,col);
    }else this.radar(g,e.radar,W/2,420,250,col);

    const tier=e.tier_label||e.tier; g.font=`500 28px ${mono}`;
    const tw=g.measureText(tier).width+40; g.fillStyle=rgba(col,.14); g.strokeStyle=rgba(col,.5); g.lineWidth=2;
    g.beginPath(); g.roundRect(W/2-tw/2,742,tw,48,8); g.fill(); g.stroke();
    g.fillStyle=col; g.fillText(tier,W/2,776);
    g.fillStyle="#ECE6D9"; g.font=`400 88px ${serif}`;
    let name=e.cn; while(g.measureText(name).width>W-140&&name.length>2) name=name.slice(0,-1);
    g.fillText(name,W/2,890);
    if(e.en){ g.fillStyle="#9B968A"; g.font=`italic 400 44px ${display}`; g.fillText(e.en,W/2,948); }
    g.fillStyle="#6C675D"; g.font=`400 28px ${sans}`; g.fillText(`${band.seal} ${band.cn} · ${band.en}${e.system?" · "+e.system:""}`,W/2,1000);
    g.fillStyle="#D9D2C3"; g.font=`400 34px ${serif}`; g.textAlign="left";
    this.wrap(g,e.desc||e.influence||e.brief||"",W-220,4).forEach((l,i)=>g.fillText(l,110,1070+i*56));
    g.textAlign="center"; g.fillStyle="#6C675D"; g.font=`400 24px ${mono}`;
    [[0,3],[3,6]].forEach(([a,b],row)=>g.fillText(AXES.slice(a,b).map((ax,i)=>`${ax.label} ${e.radar[a+i]}`).join("   ·   "),W/2,1284+row*36));
    return new Promise(res=>c.toBlob(b=>res(b),"image/png"));
  },
  async open(e){
    Modal.open(`<p class="md-eyebrow">分享卡 · 1080 × 1350</p><h2 class="md-h" id="md-title">${e.cn}</h2><p class="share-note">繪製中⋯⋯</p>`);
    /* 以 file:// 開啟時,登記冊內的圖像會「污染」畫布而無法匯出;此時改畫不含肖像的版本 */
    let blob=null;
    try{ blob=await this.render(e); }catch{ try{ blob=await this.render(e,{noImg:true}); }catch{ blob=null; } }
    if(!Modal.isOpen()) return;
    if(!blob){ const n=$("#md .share-note"); if(n) n.textContent="這個瀏覽器未能繪製分享卡。"; return; }
    const url=URL.createObjectURL(blob);
    const dl=window.claude?.use?await Promise.resolve(window.claude.use("downloads")).catch(()=>null):null;
    const canSave=!!dl||!window.claude;
    const md=Modal.open(`<p class="md-eyebrow">分享卡 · 1080 × 1350</p><h2 class="md-h" id="md-title">${e.cn}</h2>`+
      `<img class="share-img" src="${url}" alt="${esc(e.cn)} 分享卡">`+
      `<p class="share-note">${canSave?"":"長按或右鍵即可另存圖片。"}有立像的靈體,分享卡會用上你的肖像。</p>`+
      (canSave?`<div class="md-foot"><button class="btn gold" id="sc-save">儲存 PNG</button></div>`:""));
    const name=`靈體圖鑑-${e.rank}-${e.cn.replace(/[（）()\s/]/g,"")}.png`;
    md.querySelector("#sc-save")?.addEventListener("click",async()=>{
      if(dl){ try{ await dl.save({filename:name,data:blob}); toast("已儲存"); }catch(err){ if(err?.code!=="declined") toast("未能儲存,可長按或右鍵另存圖片"); } }
      else{ const a=document.createElement("a"); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); }
    });
  }
};

/* ───── 本命靈測驗 ───── */
const Quiz={
  ans:[],
  start(){ this.ans=[]; this.step(0); },
  step(i){
    if(i>=QUIZ.length) return this.result();
    const q=QUIZ[i];
    Modal.open(`<p class="md-eyebrow">本命靈測驗 · ${i+1} / ${QUIZ.length} · ${AXES[q.axis].label}</p>`+
      `<div class="qz-prog">${QUIZ.map((_,j)=>`<i class="${j<=i?"on":""}"></i>`).join("")}</div>`+
      `<h2 class="md-h" id="md-title">${q.q}</h2><div class="qz-a">${q.a.map(([t,v])=>`<button data-v="${v}">${t}</button>`).join("")}</div>`);
    $$("#md .qz-a button").forEach(b=>b.addEventListener("click",()=>{ this.ans[q.axis]=+b.dataset.v; this.step(i+1); }));
  },
  result(){
    const me=this.ans, pool=ENTITIES.filter(e=>e.flagship);
    const ranked=pool.map(e=>[e,radarDist(me,e.radar)]).sort((a,b)=>a[1]-b[1]);
    const [best,d]=ranked[0], band=bandOf(best), col=cvar(band.color);
    Store.set("quiz",best.rank);
    Modal.open(`<p class="md-eyebrow">你的本命靈</p><h2 class="md-h" id="md-title" hidden>${best.cn}</h2>`+
      `<div class="qz-res"><div>${radarMultiSVG([{vals:me,color:"#ECE6D9",dash:true},{vals:best.radar,color:col}])}`+
      `<div class="qz-legend"><span><i style="background:#ECE6D9"></i>你</span><span><i style="background:${col}"></i>${best.cn}</span></div></div>`+
      `<div><span class="pct">六軸契合 ${likeness(d)}% · ${band.seal} ${band.cn}</span><div class="who" style="color:${col}">${best.cn}</div>`+
      (best.en?`<div class="en">${best.en}</div>`:"")+
      `<p class="qz-read">${firstSentence(best.desc||best.influence,90)}</p>`+
      `<p class="qz-read">次近:${ranked.slice(1,3).map(([x,dd])=>`${x.cn}(${likeness(dd)}%)`).join("、")}</p></div></div>`+
      `<div class="md-foot"><button class="btn gold" id="qz-open">打開 ${best.cn} 的圖鑑</button><button class="btn" id="qz-again">再測一次</button></div>`,{wide:true});
    $("#qz-open").addEventListener("click",()=>{ Modal.close(); openDetail(best.rank); });
    $("#qz-again").addEventListener("click",()=>this.start());
  }
};

/* ───── 今日靈籤:按日期固定抽一位已立傳的靈;宜忌由最高／最低軸決定 ───── */
const Omen={
  pool:()=>ENTITIES.filter(e=>e.flagship),
  today(){
    const d=new Date(), key=`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`, P=this.pool();
    let h=2166136261; for(const ch of key){ h^=ch.charCodeAt(0); h=Math.imul(h,16777619); }
    return {e:P[(h>>>0)%P.length],label:`今日靈籤 · ${d.getMonth()+1} 月 ${d.getDate()} 日`};
  },
  open(random=false){
    const P=this.pool(), pick=random?{e:P[Math.floor(Math.random()*P.length)],label:"再抽一張"}:this.today();
    const e=pick.e, band=bandOf(e), col=cvar(band.color);
    const hi=e.radar.indexOf(Math.max(...e.radar)), lo=e.radar.indexOf(Math.min(...e.radar));
    Modal.open(`<p class="md-eyebrow">${pick.label}</p><h2 class="md-h" id="md-title">撳一下,翻開今日遇見的靈</h2>`+
      `<div class="omen"><div class="omen-card" id="omen-card" role="button" tabindex="0" aria-label="翻牌" style="--oc:${col}">`+
        `<div class="omen-face omen-back"><b>籤</b><span>An Ontological Spectrum</span></div>`+
        `<div class="omen-face omen-front">${glyph(e,92,col)}<span class="om-band">${band.seal} ${band.cn} · ${e.tier_label||e.tier}</span>`+
          `<span class="who">${e.cn}</span>${e.en?`<span class="en">${e.en}</span>`:""}`+
          `<div class="omen-yiji"><div><b>宜</b>${AXIS_OMEN[hi].yi}</div><div><b>忌</b>${AXIS_OMEN[lo].ji}</div></div></div>`+
      `</div></div><p class="omen-line" id="omen-line" hidden>${firstSentence(e.desc||e.influence||e.brief,80)}</p>`+
      `<div class="md-foot"><button class="btn gold" id="om-open">打開 ${e.cn} 的圖鑑</button><button class="btn" id="om-again">再抽一張</button></div>`);
    const card=$("#omen-card");
    const flip=()=>{ if(card.classList.contains("flip")) return; card.classList.add("flip"); Sound.enter(e.band,e.radar[0]);
      $("#md-title").textContent=`今日遇見:${e.cn}`; setTimeout(()=>{ const l=$("#omen-line"); if(l) l.hidden=false; },500); };
    card.addEventListener("click",flip);
    card.addEventListener("keydown",ev=>{ if(ev.key==="Enter"||ev.key===" "){ ev.preventDefault(); flip(); } });
    $("#om-open").addEventListener("click",()=>{ Modal.close(); openDetail(e.rank); });
    $("#om-again").addEventListener("click",()=>this.open(true));
  }
};

/* ───── 聲景:每環一個持續和弦,打開靈體時響一下鐘聲(音高隨權能:權能越低音越高、越近) ───── */
const Sound=(()=>{
  let ctx=null, master=null, on=false, cur=null, curBand=null;
  function voice(band){
    const t=BAND_TONE[band], g=ctx.createGain(), f=ctx.createBiquadFilter(), srcs=[];
    g.gain.value=0; f.type="lowpass"; f.frequency.value=t.cut; f.Q.value=.6; f.connect(g); g.connect(master);
    if(t.type==="noise"){
      const buf=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate), d=buf.getChannelData(0);
      for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*.35;
      const s=ctx.createBufferSource(); s.buffer=buf; s.loop=true; s.connect(f); s.start(); srcs.push(s);
    }else t.f.forEach((hz,i)=>{
      const o=ctx.createOscillator(), og=ctx.createGain(), lfo=ctx.createOscillator(), lg=ctx.createGain();
      o.type=t.type; o.frequency.value=hz; o.detune.value=i%2?5:-5;
      og.gain.value=.12/t.f.length; lfo.frequency.value=.05+i*.03; lg.gain.value=.05/t.f.length;
      lfo.connect(lg); lg.connect(og.gain); o.connect(og); og.connect(f); o.start(); lfo.start(); srcs.push(o,lfo);
    });
    return {g,srcs};
  }
  function fadeOut(v,tc){ if(!v) return; v.g.gain.setTargetAtTime(0,ctx.currentTime,tc); setTimeout(()=>v.srcs.forEach(s=>{ try{s.stop();}catch{} }),tc*6000); }
  function to(band){
    if(!on||!ctx||!band||band===curBand) return;
    fadeOut(cur,.8); cur=voice(band); cur.g.gain.setTargetAtTime(1,ctx.currentTime,1.2); curBand=band;
  }
  function chime(power){
    if(!on||!ctx) return;
    const now=ctx.currentTime, o=ctx.createOscillator(), g=ctx.createGain();
    o.type="sine"; o.frequency.value=330+(100-power)*5;
    g.gain.setValueAtTime(0,now); g.gain.linearRampToValueAtTime(.09,now+.01); g.gain.exponentialRampToValueAtTime(.0001,now+2.4);
    o.connect(g); g.connect(master); o.start(now); o.stop(now+2.5);
  }
  return {
    get on(){ return on; },
    toggle(band){
      on=!on;
      if(on){
        if(!ctx){ const AC=window.AudioContext||window.webkitAudioContext; if(!AC){ on=false; return false; }
          ctx=new AC(); master=ctx.createGain(); master.gain.value=.55; master.connect(ctx.destination); }
        ctx.resume(); curBand=null; to(band);
      }else if(ctx){ fadeOut(cur,.25); cur=null; curBand=null; }
      return on;
    },
    band:to,
    enter(band,power){ to(band); chime(power); }
  };
})();

/* ───── AI:只在 Claude 內開啟時可用(sample 能力,用觀看者自己的 Claude 額度) ───── */
const AI=(()=>{
  let sample=null, st=window.claude?.use?"pending":"off";
  const ctl={};
  const FATAL=["not_granted","sampling_disabled","not_declared","capability_disabled","capability_removed"];
  const refresh=()=>{ if(state.current) renderAI(byRank(state.current)); };
  if(st==="pending") Promise.resolve(window.claude.use("sample")).then(s=>{ sample=s; st=s?"on":"off"; refresh(); },()=>{ st="off"; refresh(); });
  const fresh=k=>{ ctl[k]?.abort(); return (ctl[k]=new AbortController()).signal; };
  return {
    get state(){ return st; },
    json:p=>sample.json(p,{signal:fresh("deepen")}),
    text:(p,onText)=>sample(p,{signal:fresh("ask"),cache:false,onText:({text})=>onText(text)}),
    abort(){ Object.values(ctl).forEach(c=>c.abort()); },
    fatal(err){ if(FATAL.includes(err?.code)){ st="off"; return true; } return false; },
    explain(err){
      switch(err?.code){
        case "rate_limited": return "請求太密,稍等一陣再試。";
        case "session_expired": return "Claude 登入已過期,請重新登入。";
        case "refused": return "今次未能生成,換個問法再試。";
        case "invalid_json": return "AI 回應格式有誤,可以再試一次。";
        case "not_granted": case "sampling_disabled": case "not_declared": case "capability_disabled": case "capability_removed":
          return "此頁未獲准使用 Claude。";
        default: return "暫時連唔到 AI 服務。";
      }
    }
  };
})();
