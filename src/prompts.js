/* 圖像與 3D 指令產生器(第二版)
   以「視覺正典」(canon.js)為主體,再疊上所屬環的美術方向與六軸數值:
   · 本體權能 → 鏡頭角度與焦距      · 向人性 → 光的溫度與軟硬
   · 影響半徑、可協商度、信仰熱度、臨界性 → 場景中的空間、供品、燈火、霧
   ChatGPT 指令依 OpenAI 的建議順序:場景 → 主體 → 細節 → 鏡頭與光 → 風格 → 限制。
   Meshy 指令把最重要的詞放在最前,並嚴格控制在 600 字元以內。
   瀏覽器與 tools/ 下的 Node 腳本共用;依賴 lore.js、canon.js。 */

const PROMPT_KINDS=[
  {k:"plate",label:"圖鑑插畫",tool:"ChatGPT",note:"4:5 直幅插畫,與圖鑑同一美術語言。生成後拖回上面的立體台。"},
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
const cap=s=>s?s[0].toUpperCase()+s.slice(1):s;
const sentence=s=>s?cap(s.trim().replace(/[.;,\s]+$/,""))+".":"";
const nameOf=e=>`${e.cn}${e.en?` / ${e.en}`:""}`;
const enName=e=>(e.en||e.cn).replace(/\s*\([^)]*\)\s*/g," ").trim();

/* 某些形體需要額外說明,否則模型會畫成普通人像或散開的碎片 */
function kindNote(kind,forStatue){
  if(kind==="group") return forStatue?"All figures share one plinth and touch one another, so the group reads as a single connected sculpture.":"Show every member of the group together in one composition.";
  if(kind==="abstract") return forStatue?"This being has no body of its own: render it as a sculptural object standing on the plinth.":"This being is a principle rather than a person: show it as a vast form, never as an ordinary human.";
  if(kind==="phenomenon") return forStatue?"Render the phenomenon as a small sculptural diorama on the plinth.":"Show the phenomenon itself as the subject.";
  if(kind==="object") return forStatue?"Render it as a detailed object sculpture on the plinth.":"The object itself is the subject; any spirit is only hinted at.";
  return "";
}

function plateScene(e){
  const art=BAND_ART[e.band], r=e.radar;
  return [sentence(art.env),sentence(axisVisual(1,r[1])),sentence(axisVisual(3,r[3])),sentence(axisVisual(4,r[4])),sentence(axisVisual(5,r[5]))].join(" ");
}

function buildImagePrompt(e,kind){
  const band=BANDS.find(b=>b.key===e.band), art=BAND_ART[e.band], c=canonOf(e), r=e.radar;

  if(kind==="plate") return [
`Create one finished illustration. Vertical 4:5 aspect ratio, highest detail.`,
`This is a plate from the illustrated codex 「靈體圖鑑 · 本體光譜」 (Spirit Codex · An Ontological Spectrum), band 「${band.seal}」 ${band.en}.`,
``,
`SETTING`,
plateScene(e),
``,
`SUBJECT`,
`${nameOf(e)}: ${c.look}.`,
`Pose: ${c.pose}.`+(c.props?` Attributes: ${c.props}.`:""),
kindNote(c.kind,false),
``,
`CAMERA AND LIGHT`,
`${sentence(powerCamera(r[0]))} ${sentence(art.light)} ${sentence(valenceLight(r[2]))}`,
``,
`STYLE`,
`Museum-quality digital painting that joins Chinese gongbi line work with Western chiaroscuro: painterly but precise, fine paper grain, sharp detail on the subject and quiet, simplified background. Mood: ${art.mood}. Palette: ${art.palette}.`,
``,
`SIGNATURE`,
`Behind the subject, a thin glowing hexagonal radar sigil like a halo: six spokes and one irregular hexagon, drawn in ${art.hex}.`,
``,
`TEXT`,
`Only one small vermilion seal stamp reading "${band.seal}" in the lower-right corner. No other letters, captions, watermark, border or frame.`,
``,
`AVOID`,
`${art.avoid}; cluttered backgrounds; extra limbs or fingers; modern objects that are not described.`
  ].filter(l=>l!==undefined).join("\n").replace(/\n{3,}/g,"\n\n");

  if(kind==="ref") return [
`Create one image: a studio reference photograph of a physical collectible statue, made for image-to-3D reconstruction. Square 1:1.`,
``,
`SUBJECT`,
`A statue of ${enName(e)} (${e.cn}): ${c.look}.`,
`Pose: ${c.pose}.`+(c.props?` Attributes: ${c.props}.`:""),
kindNote(c.kind,true),
``,
`MATERIAL`,
`${sentence(c.mat)} Finished like a museum collectible, with the colour held in the material itself.`,
``,
`BASE`,
sentence(art.plinth),
``,
`CAMERA`,
`Three-quarter front view from slightly above eye level, 85mm lens with minimal perspective distortion. The whole statue and plinth fit inside the frame with about 10% empty margin on every side.`,
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
`Keep identical: the statue, its proportions, every detail and colour, the plinth, the scale in frame, the flat mid-grey background (#808080) and the soft even light with no shadows.`,
`Camera at the statue's mid-height, orthographic-style, no perspective distortion, whole statue in frame with the same margin.`,
`Invent the unseen back consistently with the front${c.props?`, including the back of: ${c.props}`:""}.`,
`No text.`
  ].join("\n");

  if(kind==="depth") return [
`Using the image I just uploaded (${nameOf(e)}), create its depth map.`,
`Exactly the same framing and aspect ratio. Grayscale only: pure white = closest to the camera, pure black = farthest background.`,
`Smooth continuous gradients that follow the forms of the body, face and attributes; the halo sigil and background stay near black; hair, smoke and mist are soft mid-greys.`,
`No texture, no outlines, no text.`
  ].join("\n");

  if(kind==="meshy") return meshyPrompt(e);
  if(kind==="texture") return meshyTexturePrompt(e);
  return "";
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
  return fitParts([
    {t:`${cap(lead)} ${enName(e)}`,pri:99,drop:false},
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
`- three-quarter front view from slightly above eye level, 85mm lens, whole statue and plinth in frame with about 10% margin`,
`- soft even low-contrast front light, no cast shadows, no rim glow, no depth of field, seamless flat mid-grey background (#808080)`,
`- one solid connected object; thicken wire-thin parts; smoke, flames, water and light are carved solid and attached, never floating`,
`- base: ${art.plinth}`,
`- no text`,
``];
  const body=list.map((e,i)=>{
    const c=canonOf(e), note=kindNote(c.kind,true);
    return `${i+1}. ${enName(e)} (${e.cn}): ${c.look}. Pose: ${c.pose}.${c.props?` Attributes: ${c.props}.`:""} Material: ${c.mat}.${note?` ${note}`:""}`;
  });
  return head.concat(body).join("\n");
}
