/* ChatGPT 圖像 prompt 產生器
   由每位靈體的資料(環、系統、職權、手段、六軸)組出可直接貼入 ChatGPT 的圖像指令。
   六軸數值會被翻譯成視覺語彙(AXIS_VISUAL),令圖像本身也編碼數據。
   瀏覽器與 tools/gen-prompts.js 共用;依賴 lore.js 的 BANDS、BAND_ART、axisVisual。 */

const PROMPT_KINDS=[
  {k:"plate",label:"圖鑑肖像",note:"4:5 直幅,與圖鑑同一美術語言。生成後把圖拖回上面的立體台。"},
  {k:"model",label:"3D 建模用",note:"灰底、全身、3/4 視角,餵給 Meshy / Tripo / Hunyuan3D 等 image-to-3D 工具。"},
  {k:"turn",label:"四視圖",note:"接著上一張使用,產出前、左、後、右四視圖,令 3D 重建更準。"},
  {k:"depth",label:"深度圖",note:"先上傳肖像,再貼這段。下載後拖到立體台的「深度圖」位置。"}
];

const AXIS_EN=["Ontological power","Radius of influence","Disposition toward humans","Negotiability","Devotion heat","Liminality"];

function promptLore(e){
  return [e.influence,e.means,e.brief].filter(s=>s&&s!=="—").join(" / ");
}

function buildImagePrompt(e,kind){
  const band=BANDS.find(b=>b.key===e.band), art=BAND_ART[e.band];
  const name=`${e.cn}${e.en?` (${e.en})`:""}`;
  const origin=[e.system,e.concept].filter(Boolean).join(", ");
  const abstract=e.band==="law"||e.band==="matter";
  const traits=e.radar.map((v,i)=>`- ${AXIS_EN[i]} ${v}/100: ${axisVisual(i,v)}`).join("\n");

  if(kind==="plate") return [
`Create a vertical 4:5 illustration: one plate from the codex "靈體圖鑑 · 本體光譜" (Spirit Codex · An Ontological Spectrum).`,
``,
`Subject: ${name}${origin?`. ${origin}`:""}.`,
`Lore (use for iconography, do not write as text): ${promptLore(e)||"—"}`,
`Band: 「${band.seal}」${band.cn} / ${band.en}. ${art.scene}`,
`Mood: ${art.mood}. Palette: ${art.palette}; dominant accent ${art.hex} on ink-black #0E1015 with bone-white #ECE6D9 highlights.`,
``,
`Encode these six traits visually:`,
traits,
``,
`Signature motif: behind the subject a thin hexagonal radar sigil (six spokes, one irregular hexagon whose points follow the six values above) glows like a halo in ${art.hex}.`,
`Composition: centred subject, calm dark negative space above, museum-quality digital painting, fine paper grain, soft volumetric light. Keep a crisp silhouette that separates cleanly from the background, because this image will be turned into 3D.`,
`Text: only a small vermilion seal stamp reading 「${band.seal}」 in the lower-right corner. No other text, no watermark, no border.`
  ].join("\n");

  if(kind==="model") return [
`Create a square 1:1 image of ${name} as a single collectible statue, made for image-to-3D reconstruction.`,
``,
`Design language: ${art.scene}`,
`Palette: ${art.palette}; accent ${art.hex}. Mood: ${art.mood}.`,
`Key traits: ${axisVisual(0,e.radar[0])}; ${axisVisual(2,e.radar[2])}; ${axisVisual(5,e.radar[5])}.`,
abstract?`This entity is abstract: render it as a sculptural object (for example an armillary sphere, an obelisk of light or a knot of orbits) standing on a small hexagonal plinth.`:`Show the full figure standing on a small hexagonal plinth.`,
``,
`Requirements: one object only, fully inside the frame with margin on every side; 3/4 front view at eye level; neutral mid-grey seamless background (#808080); soft even studio light from the front; no cast shadows, no depth of field, no motion blur; no smoke, sparks or particles floating free of the body; one solid connected silhouette; matte painted materials. No text.`
  ].join("\n");

  if(kind==="turn") return [
`Using the statue of ${name} from the previous image, generate 4 separate images of exactly the same object with identical scale, lighting and grey background:`,
`1. front view  2. left side view  3. back view  4. right side view.`,
`Orthographic camera, object centred, no perspective distortion, no text. Keep every detail consistent between the views.`
  ].join("\n");

  if(kind==="depth") return [
`Using the image I just uploaded (${name}), create its depth map.`,
`Exactly the same framing and aspect ratio. Grayscale only: pure white = closest to the camera, pure black = farthest background. Smooth continuous gradients that follow the forms of the body and face; the halo sigil and background stay dark. No texture, no outlines, no text.`
  ].join("\n");

  return "";
}
