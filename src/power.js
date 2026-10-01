/* 實力:等級、排名、與凡人的差距、六項能力條、實力階梯。
   這是整個圖鑑的重點:讓普通人一眼看懂每位神靈有多強、同你差幾遠、管甚麼。
   圖鑑格、抽屜實力卡、實力階梯、比較、測驗、分享卡共用。依賴 lore.js、core.js。 */

const TIER_ASC=POWER_TIERS.slice().reverse();          // 一人級 → 宇宙級
const tierNo=t=>POWER_TIERS.indexOf(t)+1;               // 1 = 宇宙級,7 = 一人級
const tierShort=t=>t.cn.replace("級","");
/* 等級色:由宇宙級的白金,到一人級的灰藍 */
const TIER_COLOR={cosmic:"#FFF0C8",world:"#F6CF6A",divine:"#EDA24C",legend:"#DB6B45",regional:"#C17A9A",local:"#8590C2",personal:"#7894A8"};
const tierMax=t=>{ const i=POWER_TIERS.indexOf(t); return i?POWER_TIERS[i-1].min-1:100; };
const HUMAN_TIER=powerTier(HUMAN.power);
const POWER_ORDER=ENTITIES.slice().sort((a,b)=>b.radar[0]-a.radar[0]||a.rank-b.rank);
const powerRankOf=e=>1+ENTITIES.filter(x=>x.radar[0]>e.radar[0]).length;
/* 高過幾多 % 的靈體 */
const beatPct=(i,v)=>Math.round(ENTITIES.filter(x=>x.radar[i]<v).length/ENTITIES.length*100);

const AXIS_AVG=(()=>{
  const avg=L=>AXES.map((_,i)=>Math.round(L.reduce((s,e)=>s+e.radar[i],0)/L.length));
  const o={all:avg(ENTITIES)};
  BANDS.forEach(b=>{ o[b.key]=avg(ENTITIES.filter(e=>e.band===b.key)); });
  return o;
})();

/* ───── 實力環:取代六邊形印記。圓環填滿的比例 = 數值,中間寫數字 ───── */
function emblemSVG(v){
  const C=2*Math.PI*26, ticks=POWER_TIERS.slice(0,-1).map(t=>{
    const a=-Math.PI/2+t.min/100*Math.PI*2, x1=32+Math.cos(a)*29.5, y1=32+Math.sin(a)*29.5, x2=32+Math.cos(a)*31.5, y2=32+Math.sin(a)*31.5;
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
  }).join("");
  return `<circle class="em-track" cx="32" cy="32" r="26"/>`+
    `<circle class="em-arc" cx="32" cy="32" r="26" stroke-dasharray="${(C*v/100).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 32 32)"/>`+
    `<g class="em-ticks">${ticks}</g><text class="em-num" x="32" y="33">${v}</text>`;
}
const emblem=(e,sz,col,v)=>`<svg class="emblem" width="${sz}" height="${sz}" viewBox="0 0 64 64" aria-hidden="true" style="color:${col||bandColor(e)}">${emblemSVG(v??e.radar[0])}</svg>`;
function setEmblem(svg,v){
  if(!svg) return;
  const C=2*Math.PI*26, arc=svg.querySelector(".em-arc"), num=svg.querySelector(".em-num");
  if(arc) arc.setAttribute("stroke-dasharray",`${(C*v/100).toFixed(1)} ${C.toFixed(1)}`);
  if(num) num.textContent=v;
}

/* ───── 實力尺:0–100,七級分段,你與祂兩枚釘;多位時(比較)每位一枚 ───── */
function powerRuler(pins,col){
  const segs=TIER_ASC.map(t=>`<i class="pr-seg${pins.some(p=>p.v>=t.min&&p.v<=tierMax(t)&&!p.you)?" on":""}" style="left:${t.min}%;width:${tierMax(t)+1-t.min}%" title="${t.cn} ${t.min}–${tierMax(t)}"></i>`).join("");
  const me=pins.filter(p=>!p.you), top=Math.max(...me.map(p=>p.v));
  return `<div class="pr" style="--pc:${col}">`+
    `<div class="pr-track">${segs}<span class="pr-span" style="left:${HUMAN.power}%;width:${top-HUMAN.power}%"></span>`+
    stack(pins).map(p=>`<span class="pr-pin${p.you?" you":""}" style="left:${p.v}%;--ly:${p.ly};${p.color?`--pp:${p.color}`:""}"><b>${p.label}</b></span>`).join("")+
    `</div><div class="pr-scale">${[0,25,40,55,70,85,100].map(v=>`<span style="left:${v}%">${v}</span>`).join("")}</div></div>`;
}
/* 數值相近的釘,名牌逐層疊高,不會互相蓋住 */
function stack(pins){
  const out=pins.map(p=>({...p,ly:0})).sort((a,b)=>a.v-b.v);
  out.forEach((p,i)=>{ const prev=out.slice(0,i).filter(q=>p.v-q.v<10); p.ly=prev.length?Math.max(...prev.map(q=>q.ly))+1:0; });
  return out;
}
/* 七級階梯小條:由一人級到宇宙級,目前一級亮起,你在最左 */
function tierSteps(t){
  return `<ol class="pw-steps">${TIER_ASC.map(x=>`<li class="${x===t?"on":""}${x===HUMAN_TIER?" you":""}"><span>${tierShort(x)}</span></li>`).join("")}</ol>`;
}

/* ───── 抽屜頂部的實力卡 ───── */
function powerCard(e,col){
  const p=e.radar[0], t=powerTier(p), att=attitude(e), rank=powerRankOf(e);
  const up=tierNo(HUMAN_TIER)-tierNo(t);
  const i=POWER_ORDER.indexOf(e);
  const stronger=POWER_ORDER.slice(0,i).reverse().find(x=>x.radar[0]>p), weaker=POWER_ORDER.slice(i+1).find(x=>x.radar[0]<p);
  const fact=(k,v)=>v&&v!=="—"?`<div><dt>${k}</dt><dd>${v}</dd></div>`:"";
  return `<section class="pw-card" style="--pc:${col}" aria-label="實力">`+
    `<div class="pw-top"><div class="pw-num"><b>${p}</b><span>本體權能</span></div>`+
    `<div class="pw-tier"><span class="pw-tname">${t.cn}</span><span class="pw-tsub">第 ${tierNo(t)} 級(共 7 級)· 全圖第 ${rank} 強 / ${ENTITIES.length}</span></div></div>`+
    `<p class="pw-gap">${t.gap}</p>`+
    powerRuler([{v:HUMAN.power,label:"你",you:true},{v:p,label:p}],col)+
    tierSteps(t)+
    `<p class="pw-diff">${up>0?`比你高 <b>${up}</b> 級 · 權能數值是你的 <b>${Math.round(p/HUMAN.power)}</b> 倍`:`和你同屬一人級:力量不比你大多少,只是能找上你`}</p>`+
    `<dl class="pw-facts">`+
      fact("職權",e.influence)+fact("手段",e.means)+
      fact("範圍",`${axisRead(1,e.radar[1])}<small>影響半徑 ${e.radar[1]} · 比 ${beatPct(1,e.radar[1])}% 靈體管得廣</small>`)+
      fact("對你",`${att.cn}<small>向人性 ${e.radar[2]} · 可協商度 ${e.radar[3]}</small>`)+
    `</dl>`+
    `<div class="pw-nav">${stronger?`<button data-rank="${stronger.rank}">↑ 強一點 · ${stronger.cn} <b>${stronger.radar[0]}</b></button>`:"<span></span>"}`+
      `${weaker?`<button data-rank="${weaker.rank}">↓ 弱一點 · ${weaker.cn} <b>${weaker.radar[0]}</b></button>`:"<span></span>"}</div>`+
  `</section>`;
}

/* ───── 六項能力條:數值、本環平均、全圖平均、你(只在權能與範圍) ───── */
function statBars(e,col){
  const band=AXIS_AVG[e.band], all=AXIS_AVG.all;
  return `<section class="st" style="--pc:${col}" aria-label="六項能力">`+
    `<p class="sec-h">六項能力<span class="st-key"><i class="k-band"></i>本環平均<i class="k-all"></i>全圖平均<i class="k-you"></i>你</span></p>`+
    AXES.map((a,i)=>{ const v=e.radar[i];
      return `<div class="st-row"><span class="st-name">${a.label}<small>${AXIS_PLAIN[i]}</small></span><span class="st-val">${v}</span>`+
        `<span class="st-bar"><span class="st-fill" style="width:${v}%"></span>`+
        `<i class="st-mk mk-band" style="left:${band[i]}%" title="本環平均 ${band[i]}"></i><i class="st-mk mk-all" style="left:${all[i]}%" title="全圖平均 ${all[i]}"></i>`+
        (i<2?`<i class="st-mk mk-you" style="left:${i?HUMAN.scope:HUMAN.power}%" title="你"></i>`:"")+`</span>`+
        `<span class="st-read">${axisRead(i,v)} · 高過 ${beatPct(i,v)}% 靈體</span></div>`;
    }).join("")+`</section>`;
}

/* ───── 多位並排的能力條:比較與測驗共用。sets = [{label,vals,color,dash}] ───── */
function compareBars(sets){
  return `<div class="cb">`+AXES.map((a,i)=>{
    const mx=Math.max(...sets.map(s=>s.vals[i]));
    return `<div class="cb-ax"><p class="cb-h">${a.label}<small>${AXIS_PLAIN[i]}</small></p>`+
      sets.map(s=>`<div class="cb-row${s.vals[i]===mx&&sets.length>1?" hi":""}"><span class="cb-n">${s.label}</span>`+
        `<span class="cb-bar"><span class="cb-fill${s.dash?" dash":""}" style="width:${s.vals[i]}%;--bc:${s.color}"></span></span><span class="cb-v">${s.vals[i]}</span></div>`).join("")+
    `</div>`; }).join("")+`</div>`;
}

/* ───── 實力階梯:由宇宙級到一人級,最底是你 ───── */
const Ladder={
  built:false,
  build(){
    if(this.built) return; this.built=true;
    const root=$("#ladder-rows");
    const tileSz={cosmic:76,world:66,divine:56,legend:48,regional:44,local:40,personal:36};
    root.innerHTML=POWER_TIERS.map(t=>{
      const L=POWER_ORDER.filter(e=>powerTier(e.radar[0])===t);
      return `<section class="ld-row" id="tier-${t.key}" data-tier="${t.key}" style="--ts:${tileSz[t.key]}px;--tc:${TIER_COLOR[t.key]}">`+
        `<div class="ld-side"><span class="ld-no">第 ${tierNo(t)} 級</span><h3>${t.cn}<small>${t.en}</small></h3>`+
        `<span class="ld-range">權能 ${t.min}–${tierMax(t)} · ${L.length} 位</span>`+
        `<p class="ld-reach"><b>管轄</b>${t.reach}</p><p class="ld-gap">${t.gap}</p>`+
        `<button class="ld-copy" type="button" data-tier="${t.key}">複製本級群像指令</button></div>`+
        `<div class="ld-tiles"></div></section>`;
    }).join("")+
      `<section class="ld-row ld-you"><div class="ld-side"><span class="ld-no">起點</span><h3>${HUMAN.cn}</h3><span class="ld-range">權能 ${HUMAN.power}</span>`+
      `<p class="ld-reach"><b>管轄</b>${HUMAN.reach}</p><p class="ld-gap">由這裏往上數:每升一級,力量就跨一大步。</p></div>`+
      `<div class="ld-tiles"><div class="ld-human">${HUMAN_SVG}<span>你</span></div></div></section>`;
    POWER_TIERS.forEach(t=>{
      const box=root.querySelector(`#tier-${t.key} .ld-tiles`);
      POWER_ORDER.filter(e=>powerTier(e.radar[0])===t).forEach(e=>box.appendChild(makeCell(e,"lt")));
      tiltPlate(box);
    });
    root.querySelectorAll(".ld-copy").forEach(b=>b.addEventListener("click",()=>{
      const t=POWER_TIERS.find(x=>x.key===b.dataset.tier);
      const pick=lineupPick(ENTITIES.filter(e=>powerTier(e.radar[0])===t),6);
      copyText(buildLineup(pick,{title:`the ${t.en.toLowerCase()}-tier beings`}),b);
    }));
    $("#ladder-spectrum").addEventListener("click",ev=>copyText(buildLineup(SPECTRUM_LINEUP.map(byRank)),ev.currentTarget));
    paint();
  }
};
const HUMAN_SVG=`<svg viewBox="0 0 24 48" aria-hidden="true"><circle cx="12" cy="6" r="4.6"/><path d="M5 15.5c0-2.2 1.8-4 4-4h6c2.2 0 4 1.8 4 4V29h-3v17h-3.6V31h-.8v15H8V29H5z"/></svg>`;
