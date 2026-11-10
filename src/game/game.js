/* 《十二宮 · 輪迴迷宮》輔助 app(規則 v0.2 的第一世)。依賴 src/data/entities.js、src/data/lore.js。
   這一版管:開局、派命盤、每輪流程、三條路的考驗、命運骰與神罰、時間與死神、受審。
   手牌暫由 app 代管(四德牌未印成實物之前);各宮的特殊玩法、缺陷牌、眷顧與來世之籤未做。 */
(()=>{
const $=s=>document.querySelector(s), esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const rnd=n=>Math.floor(Math.random()*n), pick=a=>a[rnd(a.length)], d6=()=>1+rnd(6);
const VIRT=["勇","智","節","義"];
const HOUSES=[null,
 {v:"戴",cn:"人格面具",gk:"ΠΡΟΣΩΠΟΝ"},{v:"認",cn:"致死缺陷",gk:"ΑΜΑΡΤΙΑ"},{v:"造",cn:"創生技藝",gk:"ΠΟΙΗΣΙΣ"},{v:"承",cn:"血脈家屋",gk:"ΟΙΚΟΣ"},
 {v:"辯",cn:"真言理性",gk:"ΛΟΓΟΣ"},{v:"結",cn:"慾望結合",gk:"ΕΡΩΣ"},{v:"聽",cn:"守護靈",gk:"ΔΑΙΜΩΝ"},{v:"擔",cn:"重擔契約",gk:"ΑΤΛΑΣ"},
 {v:"潛",cn:"冥界之旅",gk:"ΚΑΤΑΒΑΣΙΣ"},{v:"開",cn:"潘多拉的希望",gk:"ΕΛΠΙΣ"},{v:"議",cn:"城邦群體",gk:"ΠΟΛΙΣ"},{v:"越",cn:"狂喜出離",gk:"ΕΚΣΤΑΣΙΣ"},
 {v:"終",cn:"終宮",gk:"ΤΕΛΟΣ"}];
const TELOS=13;
const MORTALS=["帝王","戰士","工匠","祭司","農夫"];
const EXTRA=[45,56,79,88,90,91,94,95,104,105,111,113,115,260];
const POOL=ENTITIES.filter(e=>e.band==="sovereign"||EXTRA.includes(e.rank));
const TELOS_GODS=[10,5].map(r=>ENTITIES.find(e=>e.rank===r));
const god=r=>ENTITIES.find(e=>e.rank===r);
const cn=e=>e.cn.replace(/（.*?）/g,"");
const bandHex=e=>BAND_ART[e.band].hex;
const ringOf=h=>h>=TELOS?4:Math.ceil(h/4);

const NEMESIS=[
 {n:"西西弗斯",t:"退回上一宮,再做一次。",f:p=>{p.house=Math.max(1,p.house-1);}},
 {n:"伊卡洛斯",t:"飛得太高。往後跌兩宮。",f:p=>{p.house=Math.max(1,p.house-2);}},
 {n:"坦塔洛斯",t:"果子就在眼前。下一輪不能補牌。",f:p=>{p.noDraw=true;}},
 {n:"尼俄柏",t:"你誇耀的東西被取走。失去最多的那種牌的一半。",f:p=>{const i=p.hand.indexOf(Math.max(...p.hand));p.hand[i]=Math.floor(p.hand[i]/2);}},
 {n:"阿拉克涅",t:"你的作品被撕碎。名聲 −1。",f:p=>{p.kleos=Math.max(0,p.kleos-1);}}];
const OMENS=[
 {n:"豐年",t:"得墨忒耳心情好。每人多抽 1 張。",f:S=>live(S).forEach(p=>draw(p,1))},
 {n:"日蝕",t:"眾人驚惶。傲慢最高的人傲慢 −1。",f:S=>{const L=live(S);if(L.length){const m=L.slice().sort((a,b)=>b.hubris-a.hubris)[0];m.hubris=Math.max(0,m.hubris-1);}}},
 {n:"瘟疫",t:"阿波羅的箭落在城中。每人棄 1 張最多的牌。",f:S=>live(S).forEach(p=>{const i=p.hand.indexOf(Math.max(...p.hand));if(p.hand[i])p.hand[i]--;})},
 {n:"慶典",t:"城中獻祭。業最低的人業 +1。",f:S=>{const L=live(S);if(L.length)L.slice().sort((a,b)=>a.karma-b.karma)[0].karma++;}},
 {n:"風平浪靜",t:"今天眾神沒有留意凡人。",f:()=>{}},
 {n:"流言",t:"厄里斯拋下金蘋果。名聲最高的人傲慢 +1。",f:S=>{const L=live(S);if(L.length)L.slice().sort((a,b)=>b.kleos-a.kleos)[0].hubris++;}}];

let S=null, use3d=true;
/* 聲音:一下里拉琴的撥弦、一下低鼓。第一次點擊後才可發聲 */
const Snd=(()=>{ let ctx=null; const on=()=>{ try{ ctx=ctx||new (window.AudioContext||window.webkitAudioContext)(); if(ctx.state==="suspended") ctx.resume(); }catch{} return ctx; };
  function tone(f,dur,type,vol,when){ const c=on(); if(!c) return; const o=c.createOscillator(), g=c.createGain(), t=c.currentTime+(when||0); o.type=type; o.frequency.setValueAtTime(f,t);
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+.012); g.gain.exponentialRampToValueAtTime(.0001,t+dur); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+dur+.05); }
  return {pluck:()=>{ [293.7,440,587.3].forEach((f,i)=>tone(f,1.6,"triangle",.07,i*.09)); }, good:()=>{ [392,493.9,587.3,784].forEach((f,i)=>tone(f,1.4,"triangle",.06,i*.07)); },
    doom:()=>{ tone(55,2.2,"sine",.3); tone(58.3,2.2,"sine",.2,.02); tone(110,.5,"sawtooth",.04); }, tick:()=>tone(660,.25,"sine",.04)}; })();
const save=()=>{ try{ localStorage.setItem("houses12",JSON.stringify(S)); }catch{} };
const load=()=>{ try{ return JSON.parse(localStorage.getItem("houses12")); }catch{ return null; } };
const live=S=>S.players.filter(p=>p.threads>0);
const log=t=>{ S.log.unshift(t); S.log.length=Math.min(S.log.length,30); };
function draw(p,n){ for(let i=0;i<n;i++) p.hand[rnd(4)]++; while(p.hand.reduce((a,b)=>a+b)>7){ p.hand[p.hand.indexOf(Math.max(...p.hand))]--; } }

/* 神要求哪幾種德:由圖鑑六軸推算。勇←本體權能,智←臨界性與影響半徑,節←可協商度,義←向人性。張數按圈,怒相 +1 */
function demandOf(e,house,wrath){
  const r=e.radar, w=[r[0],(r[5]+r[1])/2,r[3]+20,r[2]], n=Math.min(4,ringOf(house)+1)+(wrath?1:0), need=[0,0,0,0];
  let seed=e.rank*31+house*7; const next=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
  for(let i=0;i<n;i++){ let x=next()*w.reduce((a,b)=>a+b), k=0; while(x>w[k]){ x-=w[k]; k++; } need[Math.min(k,3)]++; }
  return need;
}
const lackOf=(p,need)=>need.map((n,i)=>Math.max(0,n-p.hand[i]));
/* 「求」的門檻:可協商度越高越易應允;怒相難一級 */
const prayTarget=(e,wrath)=>Math.max(2,Math.min(6,8-Math.round(e.radar[3]/10)+(wrath?1:0)));

function newGame(seats){
  const n=seats.length, deck=n>=4?10:12;
  S={life:1,round:0,phase:"omen",turn:0,deck,deathAt:deck-rnd(4),log:[],over:false,
    players:seats.map((s,i)=>{ const gods=[null]; for(let h=1;h<=12;h++) gods.push({r:pick(POOL).rank,w:Math.random()<.35}); gods.push({r:pick(TELOS_GODS).rank,w:false});
      const p={i,name:s.name||`第 ${i+1} 位`,mortal:s.mortal,house:1,hubris:0,karma:0,kleos:0,threads:3,hand:[0,0,0,0],gods,punished:false,guide:false}; draw(p,5); return p; })};
  log("第一世開始。眾人站在第 1 宮。"); Board3D.reset(); save(); render();
}

/* ── 版圖 ── */
const C=300, RINGS=[215,140,68];
function pos(h){ if(h>=TELOS) return [C,C]; const r=RINGS[ringOf(h)-1], k=(h-1)%4; return [[C-r,C+r],[C-r,C-r],[C+r,C-r],[C+r,C+r]][k]; }
function boardSVG(){
  const pts=[]; for(let h=1;h<=12;h++){ const [x,y]=pos(h); pts.push([x,y]); if(h%4===0){ const nr=h<12?RINGS[h/4]:0; pts.push([C-nr,y]); if(h===12) pts.push([C,C]); } }
  const d="M"+pts.map(p=>p.join(",")).join(" L");
  let s=`<svg id="board" viewBox="0 0 600 600" role="img" aria-label="迷宮版圖:十二宮與終宮,外圈是時間"><circle class="ring" cx="${C}" cy="${C}" r="284"/>`;
  for(let i=0;i<S.deck;i++){ const a=-Math.PI/2+i/S.deck*Math.PI*2, c=Math.cos(a), n=Math.sin(a);
    s+=`<line class="tick${i<S.round?" spent":""}${i>=S.deck-4?" dusk":""}" x1="${C+c*276}" y1="${C+n*276}" x2="${C+c*292}" y2="${C+n*292}"/>`; }
  s+=`<path class="path-glow" d="${d}"/><path class="path" d="${d}"/>`;
  const cur=S.phase==="trial"?S.players[S.turn]:null;
  for(let h=1;h<=TELOS;h++){ const [x,y]=pos(h), H=HOUSES[h], R=h===TELOS?38:30;
    s+=`<g class="st${h===TELOS?" telos":""}${cur&&cur.house===h?" here":""}"><circle cx="${x}" cy="${y}" r="${R}"/><text class="verb" x="${x}" y="${y+1}">${H.v}</text>`+
      (h<TELOS?`<text class="no" x="${x}" y="${y-R-6}">${h}</text>`:"")+`<text class="gk" x="${x}" y="${y+R+14}">${H.gk}</text></g>`; }
  S.players.forEach(p=>{ const [x,y]=pos(p.house), R=p.house===TELOS?38:30, a=-Math.PI/2+p.i/S.players.length*Math.PI*2+.6;
    s+=`<circle class="pawn${p.threads?"":" shade"}" cx="${(x+Math.cos(a)*(R+2)).toFixed(1)}" cy="${(y+Math.sin(a)*(R+2)).toFixed(1)}" r="8" fill="var(--p${p.i})" style="color:var(--p${p.i})"><title>${esc(p.name)}</title></circle>`; });
  return s+"</svg>";
}

/* ── 畫面 ── */
const handHTML=(h,need)=>VIRT.map((v,i)=>`<span class="vt v${i}${h[i]?"":" none"}"><b>${v}</b>${h[i]}</span>`).join("");
function soulHTML(p){
  const where=p.threads?(p.house===TELOS?"終宮 · 引路人":`第 ${p.house} 宮 · ${HOUSES[p.house].cn}`):"陰魂";
  return `<div class="soul${S.phase==="trial"&&S.turn===p.i?" turn":""}" style="--pc:var(--p${p.i})"><div class="who"><b>${esc(p.name)}</b><span>${p.mortal} · ${where}</span></div>`+
    `<div class="gauges"><div class="g hub${p.hubris>=4?" hot":""}"><label>傲慢<b>${p.hubris}</b></label><div class="bar"><i style="width:${p.hubris*10}%"></i></div></div>`+
    `<div class="g kar"><label>業<b>${p.karma}</b></label><div class="bar"><i style="width:${Math.min(100,p.karma*6.6)}%"></i></div></div>`+
    `<div class="g kle"><label>名聲<b>${p.kleos}</b></label><div class="bar"><i style="width:${Math.min(100,p.kleos*8.3)}%"></i></div></div>`+
    `<div class="threads" title="命線">${[0,1,2].map(i=>`<i class="${i<p.threads?"":"cut"}"></i>`).join("")}</div></div>`+
    `<div class="hand">${handHTML(p.hand)}</div></div>`;
}
function phaseHTML(){
  const p=S.players[S.turn];
  if(S.phase==="omen") return [`預兆`,`第 ${S.round+1} 輪`,`翻開這一輪的預兆,然後所有人補 2 張牌。`,`<button class="btn gold" data-a="omen">翻開預兆</button>`];
  if(S.phase==="trial") return [`考驗`,`輪到 ${esc(p.name)}`,p.threads?(p.house===TELOS?`你已在終宮。這一輪可以為別人引路。`:`第 ${p.house} 宮「${HOUSES[p.house].v}」:${cn(god(p.gods[p.house].r))}在等你。`):`陰魂不能前進,但可以低語。`,
    `<button class="btn gold" data-a="trial">${p.threads&&p.house<TELOS?"面對考驗":"遞牌給別人"}</button><button class="btn" data-a="rest">${p.threads&&p.house<TELOS?"休整(多抽 2 張)":"略過"}</button>`];
  if(S.phase==="fate") return [`命運`,`安那刻的骰`,`傲慢到 4 的人,逐個擲骰。`,`<button class="btn gold" data-a="fate">擲命運骰</button>`];
  return [`時間`,`克羅諾斯`,`翻一張時間牌。最後四張之中藏着死神。`,`<button class="btn gold" data-a="time">翻時間牌</button>`];
}
function render(){
  $("#setup").hidden=!!S; $("#table").hidden=!S; $("#clock").hidden=!S;
  if(!S) return;
  $("#clock").innerHTML=`<span>第<b>${S.life}</b>世</span><span>第<b>${Math.min(S.round+1,S.deck)}</b>輪</span><span>時間牌餘<b>${S.deck-S.round}</b></span>`;
  $("#board2d").hidden=use3d&&!Board3D.failed; $("#board3d").hidden=!use3d||Board3D.failed; $("#viewsw").textContent=use3d&&!Board3D.failed?"平面版圖":"立體版圖"; $("#viewsw").hidden=Board3D.failed;
  if(use3d&&!Board3D.failed) Board3D.mount($("#board3d"),S).then(ok=>{ if(!ok) render(); }); 
  if(!use3d||Board3D.failed) $("#board2d").innerHTML=boardSVG();
  const [gk,h,t,b]=phaseHTML();
  $("#phase").innerHTML=`<span class="greek">${gk}</span><h2>${h}</h2><p>${t}</p><div class="row">${b}</div>`;
  $("#souls").innerHTML=S.players.map(soulHTML).join("");
  $("#log").innerHTML=S.log.map(l=>`<p>${l}</p>`).join("");
}
const sheet=html=>{ $("#sheet").hidden=false; $("#sheet").classList.toggle("dock",use3d&&Board3D.ok); $("#sheet").innerHTML=`<div class="panel" role="dialog" aria-modal="true"><div class="meander"></div>${html}</div>`; $("#sheet .panel").focus?.(); };
const closeSheet=()=>{ Board3D.hideGod(); $("#sheet").hidden=true; $("#sheet").innerHTML=""; save(); render(); };

/* ── 流程 ── */
function nextTurn(){ S.turn++; if(S.turn>=S.players.length){ S.turn=0; S.phase="fate"; } closeSheet(); }
function doOmen(){
  const o=pick(OMENS); S.players.forEach(p=>{ if(p.noDraw) p.noDraw=false; else if(p.threads) draw(p,2); }); o.f(S);
  log(`預兆「${o.n}」:${o.t}`); S.phase="trial"; S.turn=0;
  sheet(`<span class="greek">ΟΙΩΝΟΣ · 預兆</span><h2>${o.n}</h2><p class="verdict">${o.t}</p><p class="sub">所有人已補 2 張牌。</p><div class="row" style="margin-top:16px"><button class="btn gold" data-a="close">開始考驗</button></div>`);
}
function giveUI(p){
  const others=S.players.filter(x=>x!==p&&x.threads&&x.house<TELOS);
  if(!others.length||!p.hand.some(Boolean)){ log(`${esc(p.name)}略過。`); return nextTurn(); }
  sheet(`<span class="greek">${p.threads?"ΨΥΧΟΠΟΜΠΟΣ · 引路":"ΣΚΙΑ · 低語"}</span><h2>${esc(p.name)},你想幫誰?</h2><p class="sub">每遞一張牌,業 +1。</p>`+
    `<div class="aside"><label for="gv-to">給</label><select id="gv-to">${others.map(o=>`<option value="${o.i}">${esc(o.name)}</option>`).join("")}</select>`+
    `<label for="gv-v">一張</label><select id="gv-v">${VIRT.map((v,i)=>p.hand[i]?`<option value="${i}">${v}(你有 ${p.hand[i]})</option>`:"").join("")}</select></div>`+
    `<div class="row" style="margin-top:18px"><button class="btn gold" data-a="give">遞牌</button><button class="btn" data-a="skip">不幫</button></div>`);
}
function trialUI(){
  const p=S.players[S.turn];
  if(!p.threads||p.house>=TELOS) return giveUI(p);
  const g=p.gods[p.house], e=god(g.r), H=HOUSES[p.house], need=demandOf(e,p.house,g.w), lack=lackOf(p,need), miss=lack.reduce((a,b)=>a+b), tier=powerTier(e.radar[0]), tgt=prayTarget(e,g.w);
  const helpers=S.players.filter(x=>x!==p&&x.hand.some((n,i)=>n&&lack[i]));
  if(!trialUI.shown||trialUI.shown!==p.i+"-"+p.house+"-"+S.round){ trialUI.shown=p.i+"-"+p.house+"-"+S.round; Board3D.showGod(e,p.house,g.w); Snd.pluck(); }
  sheet(`<span class="greek">${H.gk} · 第 ${p.house} 宮「${H.v}」${H.cn}</span><h2>${esc(p.name)}面對${cn(e)}</h2>`+
    `<div class="god"><div class="medal${g.w?" wrath":""}" style="--bc:${bandHex(e)}">${cn(e)}</div><div><h3>${cn(e)}<span class="mood${g.w?" wrath":""}">${g.w?"怒":"喜"}</span></h3>`+
    `<p>${tier.cn} · 本體權能 ${e.radar[0]} · 可協商度 ${e.radar[3]}<br>${esc(e.influence||e.concept||"")}</p></div></div>`+
    `<div class="demand"><span>祂要:</span>${need.map((n,i)=>n?`<span class="vt v${i}${lack[i]?" lack":""}"><b>${VIRT[i]}</b>× ${n}</span>`:"").join("")}<span class="sub">${miss?`你欠 ${miss} 張`:"你付得起"}</span></div>`+
    `<div class="paths">`+
    `<button class="pathb shun" data-a="shun"${miss?" disabled":""}><b>順</b><span>付足祂要的牌,過宮。</span><em>${miss?"牌不夠":"安全,沒有名聲"}</em></button>`+
    `<button class="pathb cheng" data-a="cheng"><b>逞</b><span>硬闖,並連過下一宮。</span><em>傲慢 +${Math.max(1,miss)} · 名聲 +${g.w?2:1}</em></button>`+
    `<button class="pathb qiu" data-a="qiu"${p.hand.some(Boolean)?"":" disabled"}><b>求</b><span>棄一張牌獻祭,祈求祂放行。</span><em>擲出 ${tgt} 或以上才應允</em></button></div>`+
    (helpers.length?`<div class="aside"><span>有人肯幫你:</span><select id="hp-who">${helpers.map(o=>`<option value="${o.i}">${esc(o.name)}</option>`).join("")}</select><button class="btn sm" data-a="help">收下一張牌</button><span>遞牌的人業 +1</span></div>`:""));
}
function advance(p,steps){ p.house=Math.min(TELOS,p.house+steps); if(p.house===TELOS&&!S.players.some(x=>x.guide)){ p.guide=true; p.kleos+=2; return "<br>你最先抵達終宮,成為<b>引路人</b>。名聲 +2。"; } return p.house===TELOS?"<br>你抵達終宮。":""; }
function resolve(path){
  const p=S.players[S.turn], g=p.gods[p.house], e=god(g.r), need=demandOf(e,p.house,g.w), lack=lackOf(p,need), miss=lack.reduce((a,b)=>a+b);
  let out="", die="";
  if(path==="shun"){ need.forEach((n,i)=>p.hand[i]-=n); out=`你付足了。${cn(e)}讓你過去。`+advance(p,1); log(`${esc(p.name)}順從${cn(e)},過宮。`); }
  else if(path==="cheng"){ need.forEach((n,i)=>p.hand[i]-=Math.min(n,p.hand[i])); const hb=Math.max(1,miss), kl=g.w?2:1; p.hubris=Math.min(10,p.hubris+hb); p.kleos+=kl;
    out=`你闖了過去,而且一口氣連過兩宮。<span class="bad">傲慢 +${hb}</span>,<b>名聲 +${kl}</b>。`+advance(p,2); log(`${esc(p.name)}在${cn(e)}面前逞強,傲慢 +${hb}。`); }
  else{ const i=p.hand.indexOf(Math.max(...p.hand)); p.hand[i]--; const r=d6(), tgt=prayTarget(e,g.w); die=`<div class="die roll">${r}</div>`;
    if(r>=tgt) Snd.good();
    if(r>=tgt){ out=`你獻上一張「${VIRT[i]}」。<span class="good">${cn(e)}應允了。</span>`+advance(p,1); log(`${esc(p.name)}向${cn(e)}祈求,祂應允。`); }
    else{ out=`你獻上一張「${VIRT[i]}」。${cn(e)}沒有回應。<span class="sub">祂沒有義務回應你。</span>`; log(`${esc(p.name)}向${cn(e)}祈求,祂不理會。`); } }
  sheet(`<span class="greek">${HOUSES[Math.min(p.house,TELOS)].gk}</span><h2>${esc(p.name)}</h2>${die}<p class="verdict">${out}</p><div class="row"><button class="btn gold" data-a="next">下一位</button></div>`);
}
function doFate(){
  const rows=live(S).filter(p=>p.hubris>=4).map(p=>{ const r=d6(), hit=r<=p.hubris-3; let t;
    if(hit){ Snd.doom(); const n=pick(NEMESIS); p.threads--; p.hubris=3; p.punished=true; n.f(p);
      t=`<span class="bad">${esc(p.name)}受神罰:${n.n}。</span>${n.t}命運三女神剪斷一條命線${p.threads?"":",你成為陰魂"}。`; log(`${esc(p.name)}受神罰「${n.n}」。`); }
    else t=`${esc(p.name)}(傲慢 ${p.hubris})擲出 ${r}。這一次,眾神沒有看見。`;
    return `<div class="fate"><div class="die roll">${r}</div><p>${t}</p></div>`; });
  S.phase="time";
  sheet(`<span class="greek">ΑΝΑΓΚΗ · 必然</span><h2>命運</h2>`+(rows.length?`<div class="fates">${rows.join("")}</div>`:`<p class="verdict">沒有人的傲慢到 4。今晚無事。</p>`)+`<div class="row"><button class="btn gold" data-a="close">繼續</button></div>`);
}
function doTime(){
  S.round++;
  if(S.round>=S.deathAt||!live(S).some(p=>p.house<TELOS)) return endLife(S.round>=S.deathAt);
  S.phase="omen"; const left=S.deck-S.round;
  sheet(`<span class="greek">ΧΡΟΝΟΣ · 時間</span><h2>又過了一輪</h2><p class="verdict">時間牌還餘 ${left} 張。${left<=4?`<span class="bad">死神就在這幾張之中。</span>`:""}</p><div class="row"><button class="btn gold" data-a="close">下一輪</button></div>`);
}
function endLife(death){
  S.over=true; Snd.doom();
  const rows=S.players.map(p=>{ const oath=false, dest=!p.threads||p.hubris>=7?"塔耳塔羅斯":(p.karma>=10&&!p.punished?"樂土":"常春花原");
    const line=dest==="樂土"?"這一世無過。":dest==="塔耳塔羅斯"?"下一世帶着懲罰開局。":"無賞無罰。";
    return `<div class="end" style="--pc:var(--p${p.i})"><b>${esc(p.name)}</b><span class="dest">${dest}</span><p>${p.mortal},死於第 ${Math.min(p.house,12)} 宮${p.house===TELOS?"之後的終宮":""}。業 ${p.karma} · 名聲 ${p.kleos} · 傲慢 ${p.hubris}。${line}</p></div>`; });
  log("這一世結束。"); 
  sheet(`<span class="greek">ΘΑΝΑΤΟΣ · 死神</span><h2>${death?"死神來了":"所有人都走到了盡頭"}</h2><p class="sub">第 ${S.life} 世結束。三位判官讀出每個人的一生:</p><div class="ends">${rows.join("")}</div>`+
    `<p class="note">眷顧、兩泉之擇與來世之籤還未做進這一版。</p><div class="row" style="margin-top:14px"><button class="btn gold" data-a="reset">開新一局</button></div>`);
}

/* ── 事件 ── */
document.addEventListener("click",ev=>{
  const b=ev.target.closest("[data-a]"); if(!b) return; const a=b.dataset.a, p=S&&S.players[S.turn];
  if(a==="start"){ const seats=[...document.querySelectorAll(".seat")].map(s=>({name:s.querySelector("input").value.trim(),mortal:s.querySelector("select").value})); return newGame(seats); }
  if(a==="seats"){ return seatsUI(+b.dataset.n); }
  if(a==="view"){ use3d=!use3d; return render(); }
  if(a==="reset"){ Board3D.reset(); S=null; try{ localStorage.removeItem("houses12"); }catch{} $("#sheet").hidden=true; return render(); }
  if(a==="omen") return doOmen();
  if(a==="trial") return trialUI();
  if(a==="rest"){ if(p.threads&&p.house<TELOS){ draw(p,2); log(`${esc(p.name)}休整,多抽 2 張。`); } else log(`${esc(p.name)}略過。`); return nextTurn(); }
  if(a==="shun"||a==="cheng"||a==="qiu") return resolve(a);
  if(a==="help"){ const o=S.players[+$("#hp-who").value], need=demandOf(god(p.gods[p.house].r),p.house,p.gods[p.house].w), lack=lackOf(p,need), i=lack.findIndex((n,k)=>n&&o.hand[k]);
    if(i>=0){ o.hand[i]--; p.hand[i]++; o.karma++; log(`${esc(o.name)}遞了一張「${VIRT[i]}」給${esc(p.name)},業 +1。`); } save(); return trialUI(); }
  if(a==="give"){ const o=S.players[+$("#gv-to").value], i=+$("#gv-v").value; p.hand[i]--; o.hand[i]++; p.karma++; log(`${esc(p.name)}遞了一張「${VIRT[i]}」給${esc(o.name)},業 +1。`); return nextTurn(); }
  if(a==="skip"){ log(`${esc(p.name)}沒有出手。`); return nextTurn(); }
  if(a==="next") return nextTurn();
  if(a==="fate") return doFate();
  if(a==="time") return doTime();
  if(a==="close") return closeSheet();
});
function seatsUI(n){
  document.querySelectorAll("[data-a=seats]").forEach(b=>b.classList.toggle("gold",+b.dataset.n===n));
  $("#seats").innerHTML=Array.from({length:n},(_,i)=>`<div class="seat" style="--pc:var(--p${i})"><i></i><input id="seat-n${i}" type="text" maxlength="12" placeholder="第 ${i+1} 位的名字" aria-label="第 ${i+1} 位的名字">`+
    `<select id="seat-m${i}" aria-label="這一世的身份">${MORTALS.map((m,k)=>`<option${k===i?" selected":""}>${m}</option>`).join("")}</select></div>`).join("");
}
seatsUI(3);
S=load(); if(S&&S.over) S=null;
render();
})();
