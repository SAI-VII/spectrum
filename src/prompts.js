/* 圖像與 3D 指令產生器(第三版)
   這個圖鑑要讓普通人一眼看懂:這位神靈有多強、同一個凡人差幾遠、管的是甚麼。
   所以每張插畫都由四件事組成,而不是一個站着的人像加裝飾:
   · 實力等級(POWER_TIERS)→ 體型、構圖、鏡頭,以及畫面中那個「普通人」站在哪裏、有多細
   · 職權實景(realm.js)→ 祂一出手,世界正在發生甚麼
   · 對人的態度(attitude)→ 普通人在畫面中的反應:跪拜、遮眼、逃走、被安慰
   · 視覺正典(canon.js)→ 外形、法器、姿態
   再加上所屬環的燈光與畫風。圖中不放任何幾何光環、圖表或介面元素。
   ChatGPT 指令依 OpenAI 建議的次序:畫面目的 → 場景 → 主體 → 細節 → 鏡頭與光 → 風格 → 限制。
   Meshy 指令把最重要的詞放在最前,並嚴格控制在 600 字元以內。
   瀏覽器與 tools/ 下的 Node 腳本共用;依賴 lore.js、canon.js、realm.js。 */

const PROMPT_KINDS=[
  {k:"plate",label:"實力插畫",tool:"ChatGPT",note:"4:5 直幅:祂真正的大小、正在行使的職權、旁邊一個普通人作比例。生成後拖回上面的立體台。"},
  {k:"ref",label:"3D 參考圖",tool:"ChatGPT",note:"灰底雕像參考圖。存成 assets/refs/{編號}.png,Meshy 會用它做 Image to 3D。"},
  {k:"multiview",label:"四視圖",tool:"ChatGPT",note:"接著參考圖使用。存成 assets/refs/{編號}/front.png、right.png、back.png、left.png。"},
  {k:"meshy",label:"Meshy 文字",tool:"Meshy",note:"不經 ChatGPT,直接貼到 Meshy「Text to 3D」。已控制在 600 字元內。"},
  {k:"texture",label:"Meshy 貼圖",tool:"Meshy",note:"貼到 Meshy 的 Texture Prompt,令貼圖保持本環材質。"},
  {k:"depth",label:"深度圖",tool:"ChatGPT",note:"先上傳插畫再貼。下載後拖到立體台的「深度圖」。"}
];

const MESHY_MAX=600;

function canonOf(e){
  const c=(typeof CANON!=="undefined"&&CANON[e.rank])||(typeof window!=="undefined"&&window.CANON&&window.CANON[e.rank])||null;
  const art=BAND_ART[e.band];
  if(!c) return {kind:"figure",look:e.en||e.cn,props:"",pose:"standing",mat:art.statue};
  return {kind:c[0],look:c[1],props:c[2],pose:c[3],mat:c[4]||art.statue};
}
function realmOf(e){
  const R=(typeof REALM!=="undefined"&&REALM)||(typeof window!=="undefined"&&window.REALM)||{};
  return R[e.rank]||"";
}
const cap=s=>s?s[0].toUpperCase()+s.slice(1):s;
const sentence=s=>s?cap(s.trim().replace(/[.;,\s]+$/,""))+".":"";
const nameOf=e=>`${e.cn}${e.en?` / ${e.en}`:""}`;
const enName=e=>(e.en||e.cn).replace(/\s*\([^)]*\)\s*/g," ").trim();
const cnName=e=>e.cn.replace(/（.*?）|\(.*?\)/g,"").trim();
/* 代名詞:按視覺正典的用字判斷(正典本身已寫 his / her);群像用 their,器物、現象、法則用 its */
function pronounsOf(e){
  const c=canonOf(e);
  if(c.kind==="group") return {O:"them",P:"their"};
  if(c.kind==="figure"||c.kind==="creature"||c.kind==="abstract"){
    const t=[c.look,c.pose,c.props].join(" ").toLowerCase();
    const he=(t.match(/\b(he|his|him|king|god|man|boy|bearded|beard|hero|lord|father|general|youth|prince|titan|giant|warrior|judge|merman|magistrate|ferryman|centaur|immortal|vampire)\b/g)||[]).length;
    const she=(t.match(/\b(she|her|hers|queen|goddess|woman|girl|maiden|mother|lady|nymph|bride|daughter|crone|hag|huntress|titaness|sorceress|female|bodhisattva)\b/g)||[]).length;
    if(he>she) return {O:"him",P:"his"};
    if(she>he) return {O:"her",P:"her"};
  }
  return {O:"it",P:"its"};
}
function fillNM(s,N,M,pr){
  pr=pr||{O:"it",P:"its"};
  return s.replace(/\{N\}/g,N).replace(/\{M\}/g,M||"an ordinary person").replace(/\{O\}/g,pr.O).replace(/\{P\}/g,pr.P);
}

/* 某些形體需要額外說明,否則模型會畫成普通人像或散開的碎片 */
function kindNote(kind,forStatue){
  if(kind==="group") return forStatue?"All figures share one base and touch one another, so the group reads as a single connected sculpture.":"Show every member of the group together in one composition.";
  if(kind==="abstract") return forStatue?"This being has no body of its own: render it as a sculptural object standing on the base.":"This being is a principle rather than a person: show it as a vast form, never as an ordinary human.";
  if(kind==="phenomenon") return forStatue?"Render the phenomenon as a small sculptural diorama on the base.":"Show the phenomenon itself as the subject.";
  if(kind==="object") return forStatue?"Render it as a detailed object sculpture on the base.":"The object itself is the subject; the spirit inside it is felt through light and smoke.";
  return "";
}

const NO_DECOR="No geometric halos, rings of symbols, charts, frames, borders or interface elements";
function sealLine(band){ return `No text, letters or numbers anywhere except one small vermilion seal stamp reading "${band.seal}" in the lower-right corner.`; }

/* 圖鑑插畫:實力、職權、對人的態度,一張圖講完 */
function platePrompt(e){
  const band=BANDS.find(b=>b.key===e.band), art=BAND_ART[e.band], c=canonOf(e), r=e.radar;
  const t=powerTier(r[0]), ti=POWER_TIERS.indexOf(t)+1, N=enName(e), M=mortalOf(e), pr=pronounsOf(e);
  const realm=realmOf(e), att=attitude(e);
  const f=s=>sentence(fillNM(s,N,M,pr)), raw=s=>fillNM(s,N,M,pr);
  const subject=[`${cap(c.look)}.`,`Pose: ${c.pose}.`+(c.props?` Attributes: ${c.props}.`:""),kindNote(c.kind,false)].filter(Boolean).join(" ");
  const style=`${sentence(BAND_STYLE[e.band])} Palette: ${art.palette}.`;
  const who=`${N} (${cnName(e)})`;

  if(e.band==="matter") return [
`Create a striking, cinematic illustration, vertical 4:5, maximum detail. It shows what people once called ${who}, and reveals that there was never a spirit there at all.`,
``,
`THE SCENE`,
sentence(realm),
``,
`THE REVEAL: the heart of the image`,
`On the left, the haunting exactly as people lived it: ${M}, frightened, and the "spirit" looming as if it were real. Toward the right, the same scene dissolves into a clean scientific cutaway that shows the real cause: ${c.look}.${c.props?` Include ${c.props}.`:""} The "spirit" thins into measured lines as it crosses the middle of the image. It has no power of its own: the only real being here is the human.`,
``,
`CAMERA AND LIGHT`,
`Eye level, 50mm lens. ${sentence(art.light)} A single faint phosphor-green trace is the only colour.`,
``,
`STYLE`,
`${style} One clear focal point, strong value contrast, precise detail. The viewer should feel the magic draining out of the world.`,
``,
`KEEP OUT`,
`${NO_DECOR}. Any labels in the cutaway are blank tags. ${sealLine(band)} Avoid ${art.avoid}; extra limbs or fingers.`
  ].join("\n");

  return [
`Create a breathtaking, cinematic illustration, vertical 4:5, maximum detail. It shows ${who} ${raw(t.intro)}.`,
``,
`THE MOMENT: ${(pr.P).toUpperCase()} POWER AT WORK`,
sentence(realm),
``,
`POWER AND SCALE: the heart of the image`,
`Power tier ${ti} of 7, counting down from Cosmic: ${t.en} (${t.cn}). ${f(t.size)} ${f(t.mortal)} The difference in power between ${N} and the ordinary person must be readable in one glance.`,
``,
`${N.toUpperCase()}`,
subject,
``,
`HOW ${N.toUpperCase()} TREATS PEOPLE`,
f(att.en),
``,
`CAMERA AND LIGHT`,
`${f(t.camera)} ${sentence(art.light)} ${f(valenceLight(r[2]))}`,
``,
`STYLE`,
`${style} One unmistakable focal point, a strong readable silhouette, dramatic value contrast, deep atmospheric perspective and rich surface detail. The viewer should feel ${Array.isArray(t.feel)?t.feel[r[2]>=45?0:1]:t.feel}.`,
``,
`KEEP OUT`,
`${NO_DECOR}. ${sealLine(band)} Avoid ${art.avoid}; cluttered backgrounds; extra limbs or fingers; modern objects that are not described.`
  ].join("\n");
}

function buildImagePrompt(e,kind){
  const art=BAND_ART[e.band], c=canonOf(e);

  if(kind==="plate") return platePrompt(e);

  if(kind==="ref") return [
`Create one image: a studio reference photograph of a physical collectible statue, made for image-to-3D reconstruction. Square 1:1.`,
``,
`SUBJECT`,
`A statue of ${enName(e)} (${e.cn}): ${c.look}.`,
`Pose: ${c.pose}.`+(c.props?` Attributes: ${c.props}.`:""),
[kindNote(c.kind,true),`Bearing: ${statureOf(e)}.`].filter(Boolean).join(" "),
``,
`MATERIAL`,
`${sentence(c.mat)} Finished like a museum collectible, with the colour held in the material itself.`,
``,
`BASE`,
sentence(art.plinth),
``,
`CAMERA`,
`Three-quarter front view from slightly above eye level, 85mm lens with minimal perspective distortion. The whole statue and base fit inside the frame with about 10% empty margin on every side.`,
``,
`LIGHT AND BACKGROUND`,
`Soft, even, low-contrast studio light from the front. No cast shadows, no rim glow, no bloom, no depth of field. Seamless flat mid-grey background (#808080) with nothing else in it.`,
``,
`SCULPTURAL RULES (these matter for 3D)`,
`One solid, connected object. Thicken anything wire-thin (threads, strings, whiskers, spear shafts, feathers) the way a sculptor would. Smoke, flames, water, mist and light are carved as solid sculpted forms attached to the statue, never floating free. No transparent or mirror-like parts that would hide the shape behind them.`,
``,
`TEXT`,
`None.`
  ].join("\n").replace(/\n{3,}/g,"\n\n");

  if(kind==="multiview") return [
`Using the statue of ${enName(e)} in the image above, create 4 separate square images of exactly the same statue for multi-view 3D reconstruction:`,
`1. front view  2. right side view (turned 90°)  3. back view  4. left side view.`,
``,
`Keep identical: the statue, its proportions, every detail and colour, the base, the scale in frame, the flat mid-grey background (#808080) and the soft even light with no shadows.`,
`Camera at the statue's mid-height, orthographic-style, no perspective distortion, whole statue in frame with the same margin.`,
`Invent the unseen back consistently with the front${c.props?`, including the back of: ${c.props}`:""}.`,
`No text.`
  ].join("\n");

  if(kind==="depth") return [
`Using the image I just uploaded (${nameOf(e)}), create its depth map.`,
`Exactly the same framing and aspect ratio. Grayscale only: pure white = closest to the camera, pure black = farthest background.`,
`Smooth continuous gradients that follow the forms of the body, face and attributes; the small human figure is a separate mid-grey shape at its own depth; sky and far background stay near black; hair, smoke and mist are soft mid-greys.`,
`No texture, no outlines, no text.`
  ].join("\n");

  if(kind==="meshy") return meshyPrompt(e);
  if(kind==="texture") return meshyTexturePrompt(e);
  return "";
}

/* 雕像的氣度:不改尺寸(3D 會在 app 內配一個凡人比例人形),只改姿態的份量 */
function statureOf(e){
  const k=powerTier(e.radar[0]).key;
  return {cosmic:"monumental and utterly still, as if the statue were a fragment of something far larger",
    world:"monumental, heavy and immovable, every line of the pose suggesting immense scale",
    divine:"commanding and regal, with the weight and calm of a temple cult statue",
    legend:"powerful and dynamic, every muscle or coil tensed",
    regional:"dignified and grounded, a protector or a threat to a whole district",
    local:"close and human-scaled, intimate in its gesture",
    personal:"slight and fragile, as if it might fade"}[k];
}

/* Meshy:依重要性排列各段,超出 600 字元就由最不重要的一段開始刪減 */
function fitParts(parts,max){
  const P=parts.filter(p=>p&&p.t);
  const join=()=>P.map(p=>p.t).join(", ");
  let s=join();
  while(s.length>max){
    const drop=P.filter(p=>p.drop!==false).sort((a,b)=>a.pri-b.pri)[0];
    if(!drop){ s=s.slice(0,max); break; }
    /* 能縮短的段落先刪去最後一個子句,真的太長才整段拿走 */
    const cut=drop.t.lastIndexOf(", ");
    if(drop.shrink&&cut>30) drop.t=drop.t.slice(0,cut);
    else P.splice(P.indexOf(drop),1);
    s=join();
  }
  return s;
}
function meshyPrompt(e){
  const art=BAND_ART[e.band], c=canonOf(e);
  const lead={figure:"collectible statue of",creature:"collectible statue of",group:"collectible statue group of",object:"collectible sculpture of",abstract:"abstract collectible sculpture of",phenomenon:"sculptural diorama of"}[c.kind]||"collectible statue of";
  const big=["cosmic","world","divine"].includes(powerTier(e.radar[0]).key);
  return fitParts([
    {t:`${big?"Monumental ":""}${big?lead:cap(lead)} ${enName(e)}`,pri:99,drop:false},
    {t:c.look,pri:90,shrink:true},
    {t:c.pose,pri:70},
    {t:c.props?`with ${c.props}`:"",pri:60,shrink:true},
    {t:c.mat,pri:80},
    {t:art.plinth,pri:40},
    {t:"museum-quality sculpture, clean readable silhouette, thick sturdy details, single connected object",pri:50},
    {t:"no floating particles, no background",pri:30}
  ],MESHY_MAX);
}
function meshyTexturePrompt(e){
  const art=BAND_ART[e.band], c=canonOf(e);
  return fitParts([
    {t:cap(c.mat),pri:99,drop:false},
    {t:`palette ${art.palette}`,pri:80},
    {t:"hand-painted museum statue finish with a subtle dark wash in the crevices and gentle wear on the edges",pri:70},
    {t:c.props?`crisp painted detail on ${c.props}`:"",pri:60,shrink:true},
    {t:"no baked lighting or shadows, no text, no logos",pri:90}
  ],MESHY_MAX);
}

/* 一次請 ChatGPT 生成多位靈體的 3D 參考圖(同一環、同一規則),節省來回 */
function buildRefBatch(list){
  const art=BAND_ART[list[0].band];
  const head=[
`Create ${list.length} separate images, one for each statue below. Every image follows the same rules:`,
`- square 1:1 studio reference photograph of a physical collectible statue, for image-to-3D reconstruction`,
`- three-quarter front view from slightly above eye level, 85mm lens, whole statue and base in frame with about 10% margin`,
`- soft even low-contrast front light, no cast shadows, no rim glow, no depth of field, seamless flat mid-grey background (#808080)`,
`- one solid connected object; thicken wire-thin parts; smoke, flames, water and light are carved solid and attached, never floating`,
`- base: ${art.plinth}`,
`- no text`,
``];
  const body=list.map((e,i)=>{
    const c=canonOf(e), note=kindNote(c.kind,true);
    return `${i+1}. ${enName(e)} (${e.cn}): ${c.look}. Pose: ${c.pose}, ${statureOf(e)}.${c.props?` Attributes: ${c.props}.`:""} Material: ${c.mat}.${note?` ${note}`:""}`;
  });
  return head.concat(body).join("\n");
}

/* ───────── 實力對照群像 ─────────
   像「體型對照圖」,但畫成史詩:由一個普通人開始,按本體權能由弱至強一字排開,
   每位按等級畫成相應大小。一眼看到差距有幾大。用於七環主視覺與實力階梯。 */
const LINEUP_SIZE={
  personal:"about the height of the person, faint and half-transparent",
  local:"about human height",
  regional:"about twice the height of the person",
  legend:"four to five times the height of the person",
  divine:"a colossus about ten times the height of the person",
  world:"so vast that only {P} lower body fits in the frame, mountains reaching to {P} knees",
  cosmic:"far beyond the frame: {N} is the sky and the whole background behind the line"
};
/* 七級各一位,由凡人一直排到宇宙法則 */
const SPECTRUM_LINEUP=[253,139,121,128,17,7,2];

/* 由一組靈體揀出有代表性的幾位:每個等級先揀最有名的一位(信仰熱度最高),再按名氣補足 */
function lineupPick(list,n){
  n=n||6;
  /* 有身形的(人形、異獸、群像)優先,器物與現象排後 */
  const body=e=>["figure","creature","group","abstract"].includes(canonOf(e).kind)?0:1;
  const fame=(a,b)=>body(a)-body(b)||b.radar[4]-a.radar[4]||b.radar[0]-a.radar[0];
  const out=[], seen=new Set();
  const top=list.slice().sort((a,b)=>b.radar[0]-a.radar[0])[0];
  if(top){ out.push(top); seen.add(top.rank); }
  for(const t of POWER_TIERS){
    const c=list.filter(e=>!seen.has(e.rank)&&powerTier(e.radar[0])===t).sort(fame)[0];
    if(c&&out.length<n){ out.push(c); seen.add(c.rank); }
  }
  for(const e of list.slice().sort(fame)){ if(out.length>=n) break; if(!seen.has(e.rank)){ out.push(e); seen.add(e.rank); } }
  return out.sort((a,b)=>a.radar[0]-b.radar[0]||a.rank-b.rank);
}

function buildLineup(list,opt){
  opt=opt||{};
  const L=list.slice().sort((a,b)=>a.radar[0]-b.radar[0]||a.rank-b.rank);
  const bands=[...new Set(L.map(e=>e.band))];
  const one=bands.length===1?BANDS.find(b=>b.key===bands[0]):null;
  const M=opt.mortal||(one?mortalOf(L[0]):"an ordinary Hong Kong person of today in everyday clothes");
  const aspect=opt.aspect||"horizontal 16:9";
  const rows=L.map((e,i)=>{
    const t=powerTier(e.radar[0]), c=canonOf(e), pr=pronounsOf(e), N=enName(e);
    return `${i+1}. ${N} (${cnName(e)}), power ${e.radar[0]}, ${t.en} tier: ${fillNM(LINEUP_SIZE[t.key],N,M,pr)}. ${cap(c.look)}.`;
  });
  const setting=opt.setting||(one?sentence(BAND_ART[one.key].env)
    :"One continuous background that changes from left to right: a small Hong Kong bedroom at night, a temple street full of incense, a fishing harbour, a battlefield in smoke, the marble heights of Mount Olympus, and finally deep space full of stars.");
  const style=one?`${sentence(BAND_STYLE[one.key])} Palette: ${BAND_ART[one.key].palette}.`
    :"Museum-quality epic painting with cinematic realism. Each being keeps the light of its own band: warm lamplight for the beloved dead, amber incense glow for the temple gods, vermilion firelight for monsters and heroes, violet and gold for the Olympians, cold silver-blue for the cosmic laws.";
  const labels=[`「你」`].concat(L.map(e=>`「${cnName(e)}」`)).join(", ");
  return [
`Create one epic poster, ${aspect}, maximum detail: a power-scale lineup, like a size-comparison chart painted as a museum-quality epic painting. Its purpose is to let an ordinary person see at once how big the gaps in power are${opt.title?` among ${opt.title}`:""}.`,
``,
`THE LINE`,
`Everyone stands in one row on a single shared ground line, weakest on the left, strongest on the right. Each being is drawn at the size of its power, measured against the ordinary person on the far left:`,
`0. You: ${M}, ordinary human height, the yardstick for everyone else.`,
...rows,
``,
`THE SETTING`,
setting,
``,
`LIGHT AND STYLE`,
`${style} Every figure has a strong, readable silhouette even when small. The jumps in size between neighbours must be dramatic and exact, so the eye climbs from the human to the largest power in one sweep.`,
``,
`LABELS`,
`Under each figure, a small bone-white plaque with its name written exactly as given: ${labels}. No other text, letters or numbers.`,
``,
`KEEP OUT`,
`${NO_DECOR}. No gore. No figure may hide another.`
  ].join("\n");
}
