# 靈體圖鑑 · 圖像與 3D 指令(第二版)

給 **ChatGPT Images 2.5**(2026 年 9 月推出)與 **Meshy 7.1** 用的完整指令系統。

第二版與第一版的分別:每一位靈體都有一條人手寫的「視覺正典」(外形、法器、姿態、材質,見 `src/data/canon.js`),指令由正典、所屬環的美術方向與六軸數值組成,並按 OpenAI 建議的次序分段。237 位全部覆蓋,不再只有已立傳的 79 位。

| 你想做甚麼 | 用哪份 |
|---|---|
| 某一位的任何指令 | app 內打開該靈體 →「圖像與 3D 指令」,六種即時生成 |
| 一環全部插畫 | [`prompts/plates/`](prompts/plates/)(七個檔,每環一個) |
| 一環全部 3D 參考圖 | [`prompts/refs/`](prompts/refs/)(每 4 位一批,附存檔編號清單) |
| 直接在 Meshy 網頁貼 | [`prompts/meshy-prompts.csv`](prompts/meshy-prompts.csv)(237 行:文字指令與貼圖指令) |
| 全自動 3D 化 | [`meshy-pipeline.md`](meshy-pipeline.md) |

指令用英文寫,因為圖像與 3D 模型對英文名詞、材質、鏡頭用語的理解最準;靈體名稱同時附中文。

---

## 1. 使用流程

1. **開新對話,先貼風格聖經**(第 2 節)。同一對話內的圖會保持同一畫風。
2. **一環一個對話**。畫風開始漂移時,把該環第一張完成圖重新上傳,加一句 `Match the style, palette and lighting of this image.`;Images 2.5 對參考圖的保留比 2.0 好得多。
3. **貼指令,檢查,再修**。要改細節時只說要改的地方,並列出要保留的東西,例如 `Keep the face, crown and robe unchanged; only make the waves smaller.`
4. **存檔**:插畫存 `assets/portraits/{編號}.webp`;3D 參考圖存 `assets/refs/{編號}.png`;四視圖存 `assets/refs/{編號}/front.png、right.png、back.png、left.png`。

---

## 2. 風格聖經

```text
You are illustrating plates for a codex called 「靈體圖鑑 · 本體光譜」 (Spirit Codex · An Ontological Spectrum).
It arranges 237 gods, monsters, ancestors and ghosts on one spectrum, from cosmic Law down to plain Matter.
Its thesis: the most powerful beings do not know you; the least powerful ones come looking for you.

Keep these rules for every image in this conversation:
1. Ground: ink-black #0E1015 with a subtle paper grain. Highlights in bone-white #ECE6D9.
2. Each plate is dominated by its band colour:
   法 Law #AEBAC9 · 權 Sovereigns #9B86D9 · 力 Force at the edge #D5664A
   信 Gods among us #F2BD5C · 念 Those we keep #D58C6E · 懼 At the threshold #6FB0A4 · 物 Matter #7C7F86
3. Signature motif: a thin hexagonal radar sigil (six spokes, one irregular hexagon) glows behind the subject like a halo.
4. Medium: museum-quality digital painting that joins Chinese gongbi line work with Western chiaroscuro.
5. Power is shown by camera and scale (low wide angles for the mighty, close quiet framing for the small);
   warmth toward humans is shown by the temperature and softness of the light.
6. Text: only a small vermilion seal stamp with the band character in the lower-right corner, written exactly as given.
7. Hong Kong folk deities follow real Cantonese temple iconography (face colour, crown, robe, attributes).
Reply only "明白" and wait for my first plate.
```

---

## 3. 指令是怎樣組成的

### 數據如何變成畫面

| 來源 | 變成 |
|---|---|
| 視覺正典:外形、法器、姿態 | SUBJECT 段的具體名詞 |
| 視覺正典:材質 | 3D 參考圖與 Meshy 指令的材質 |
| 所屬環 | 場景、燈光配方、色板、底座、要避免的東西 |
| 本體權能 | 鏡頭:≥ 80 極低角度 24mm;≥ 55 低角度 35mm;≥ 35 平視 50mm;其餘微俯 85mm |
| 向人性 | 光:≥ 70 溫暖柔光;≥ 45 中性;≥ 25 硬側光;其餘冷底光 |
| 影響半徑 | 空間:由整個宇宙,到一條街,到床邊 |
| 可協商度 | 供品:滿地香火,到完全沒有供品 |
| 信仰熱度 | 燈火:滿堂燈籠,到積塵無光 |
| 臨界性 | 霧:身體一部分化成霧,到完全屬於此世 |

### 例一:圖鑑插畫(#121 天后)

```text
Create one finished illustration. Vertical 4:5 aspect ratio, highest detail.
This is a plate from the illustrated codex 「靈體圖鑑 · 本體光譜」 (Spirit Codex · An Ontological Spectrum), band 「信」 Gods among us.

SETTING
A Hong Kong temple interior at dusk: giant spiral incense coils hanging from dark beams, red lanterns, joss paper, carved roof ridges with ceramic figurines, worshippers' offerings. The space opens wide behind the subject, with glimpses of vast land or sea. Offerings, incense and handwritten prayers around it: approachable. Crowded with devotion: many small lights and lanterns. It is solidly of this world, with no mist.

SUBJECT
天后（媽祖） / Tin Hau (Mazu): a serene sea goddess in an embroidered red-and-gold imperial robe and a beaded mian crown with hanging tassels.
Pose: standing calmly on a boat's prow as the waves settle. Attributes: jade tablet (hu), stylised waves at her feet.

CAMERA AND LIGHT
Eye level, 50mm lens, the subject at human scale. Warm amber practical light from lanterns and candles, incense haze catching the light, soft gold bounce. Warm, soft wrap-around light on the face.

STYLE
Museum-quality digital painting that joins Chinese gongbi line work with Western chiaroscuro: painterly but precise, fine paper grain, sharp detail on the subject and quiet, simplified background. Mood: warm, protective, lived-in. Palette: amber #F2BD5C, temple red, gold leaf, soot-dark wood.

SIGNATURE
Behind the subject, a thin glowing hexagonal radar sigil like a halo: six spokes and one irregular hexagon, drawn in #F2BD5C.

TEXT
Only one small vermilion seal stamp reading "信" in the lower-right corner. No other letters, captions, watermark, border or frame.

AVOID
Japanese or Western styling, generic fantasy costume; cluttered backgrounds; extra limbs or fingers; modern objects that are not described.
```

### 例二:3D 參考圖(#6 哈得斯)

灰底、平光、3/4 前側、85mm、雕塑規則。這些條件都是為了讓 Meshy 的 Image to 3D 讀得準。

```text
Create one image: a studio reference photograph of a physical collectible statue, made for image-to-3D reconstruction. Square 1:1.

SUBJECT
A statue of Hades (哈得斯): a stern bearded king in heavy dark robes and an iron crown, the helm of darkness resting beside him, three-headed Cerberus crouched at his feet.
Pose: enthroned on a basalt throne. Attributes: bident, key of the underworld, helm of darkness.

MATERIAL
Dark basalt and blackened bronze with gold. Finished like a museum collectible, with the colour held in the material itself.

BASE
A low hexagonal marble plinth with a Greek key border.

CAMERA
Three-quarter front view from slightly above eye level, 85mm lens with minimal perspective distortion. The whole statue and plinth fit inside the frame with about 10% empty margin on every side.

LIGHT AND BACKGROUND
Soft, even, low-contrast studio light from the front. No cast shadows, no rim glow, no bloom, no depth of field. Seamless flat mid-grey background (#808080) with nothing else in it.

SCULPTURAL RULES (these matter for 3D)
One solid, connected object. Thicken anything wire-thin (threads, strings, whiskers, spear shafts, feathers) the way a sculptor would. Smoke, flames, water, mist and light are carved as solid sculpted forms attached to the statue, never floating free. No transparent or mirror-like parts that would hide the shape behind them.

TEXT
None.
```

### 例三:四視圖(接着例二用)

```text
Using the statue of Hades in the image above, create 4 separate square images of exactly the same statue for multi-view 3D reconstruction:
1. front view  2. right side view (turned 90°)  3. back view  4. left side view.

Keep identical: the statue, its proportions, every detail and colour, the plinth, the scale in frame, the flat mid-grey background (#808080) and the soft even light with no shadows.
Camera at the statue's mid-height, orthographic-style, no perspective distortion, whole statue in frame with the same margin.
Invent the unseen back consistently with the front, including the back of: bident, key of the underworld, helm of darkness.
No text.
```

### 例四:Meshy 文字指令與貼圖指令(#121 天后)

最重要的詞放最前;超過 600 字元時,由最不重要的一段開始刪減。

```text
Collectible statue of Tin Hau, a serene sea goddess in an embroidered red-and-gold imperial robe and a beaded mian crown with hanging tassels, standing calmly on a boat's prow as the waves settle, with jade tablet (hu), stylised waves at her feet, painted wood with red lacquer and gold leaf, a low hexagonal red-lacquer altar plinth with gold trim, museum-quality sculpture, clean readable silhouette, thick sturdy details, single connected object, no floating particles, no background
```

```text
Painted wood with red lacquer and gold leaf, palette amber #F2BD5C, temple red, gold leaf, soot-dark wood, hand-painted museum statue finish with a subtle dark wash in the crevices and gentle wear on the edges, crisp painted detail on jade tablet (hu), stylised waves at her feet, no baked lighting or shadows, no text, no logos
```

---

## 4. 七環主視覺(3:1 橫幅)

完成後存成 `assets/bands/{環}.webp`,並在 `assets/manifest.js` 加上 `bands: { folk: "assets/bands/folk.webp", … }`,圖鑑每一環的頁首就會出現主視覺。

### 法 · 法則 Law

```text
Ultra-wide 3:1 banner for the band 「法 · 法則」.
A silent cosmos drawn as an engraved celestial chart made of light: concentric orbits, one unbroken thread of time running through them from left to right, a lattice of fate-lines tying the stars. No figure; the law itself is the subject. At the very bottom, one tiny human silhouette looks up, for scale.
Silver-blue #AEBAC9 light on ink black, bone-white hairlines, enormous empty space. Cold, immense, indifferent.
Seal stamp 「法」 lower right. No other text.
```

### 權 · 主權諸神 Sovereigns

```text
Ultra-wide 3:1 banner for the band 「權 · 主權諸神」.
An Olympian frieze in the manner of a Hellenistic marble relief brought to life: Zeus with a coiled thunderbolt, Hades enthroned beside a closed gate, Athena, Apollo, Hermes and the smaller gods of justice, memory and victory arranged along a long colonnade, each holding the attribute of their office.
Violet #9B86D9 aura, warm marble, restrained gold leaf, ink-wash edges dissolving into black. Ceremonial and remote: they answer, but they do not love.
Seal stamp 「權」 lower right. No other text.
```

### 力 · 邊界之力 Force at the edge

```text
Ultra-wide 3:1 banner for the band 「力 · 邊界之力」.
The line where order meets chaos: on the left, heroes in bronze (Heracles, Perseus, Theseus) braced in a shield-wall; on the right, the monsters pressing in (Typhon's storm of heads, the Hydra, Medusa's serpents, the Minotaur in labyrinth shadow). Between them a jagged crack of vermilion light.
Vermilion #D5664A rim light, charcoal smoke, ember sparks, Greek black-figure pottery patterns faint in the background. Kinetic, fated.
Seal stamp 「力」 lower right. No other text.
```

### 信 · 人間之神 Gods among us

```text
Ultra-wide 3:1 banner for the band 「信 · 人間之神」.
A Hong Kong temple street at dusk seen as one continuous scroll: Tin Hau's seaside temple with fishing boats, the crowded courtyard of Wong Tai Sin with fortune sticks shaking, Man Mo Temple's giant incense coils hanging from the ceiling, a tiny roadside earth-god shrine between tenement blocks, a kitchen altar glowing through a window. Gods are present as warm, half-visible figures inside the smoke.
Amber #F2BD5C and red-gold lantern light, incense haze, joss paper, carved roof ridges with ceramic figurines. Modern gongbi with photographic warmth. Crowded, protective, lived-in.
Seal stamp 「信」 lower right. No other text.
```

### 念 · 念故者 Those we keep

```text
Ultra-wide 3:1 banner for the band 「念 · 念故者」.
A Hong Kong family living room at night. On the left, an ancestral altar with wooden spirit tablets, a small oil lamp, oranges and three cups of tea. Framed black-and-white photographs of grandparents. The light from the lamp reaches toward the right, where a person sleeps and a faint, warm figure sits at the edge of the bed, visiting in a dream.
Clay-tangerine #D58C6E lamplight, deep brown shadows, soft film grain. No gods, no temple: remembered, not worshipped. Tender and quiet.
Seal stamp 「念」 lower right. No other text.
```

### 懼 · 門檻之靈 At the threshold

```text
Ultra-wide 3:1 banner for the band 「懼 · 門檻之靈」.
A night panorama of thresholds: a long hospital corridor with a white-clad figure at the far end, a flooded pier where something waits under the water, a crossroads under a flickering sodium streetlamp, a bedroom doorway with a hat-shaped shadow. Everything is half-seen, at the edge of the frame or in reflections.
Cold teal #6FB0A4 light, sodium-orange accents, wet asphalt, low fog. Second-person dread: the viewer should feel watched.
Seal stamp 「懼」 lower right. No other text.
```

### 物 · 退潮:靈散為物 The tide goes out

```text
Ultra-wide 3:1 banner for the band 「物 · 退潮」.
The tide goes out and the spirits turn back into matter: a 19th-century natural-history engraving layout. Left, a marsh with a floating will-o'-the-wisp shown next to its chemical diagram (phosphine, methane). Right, a sleeper in REM sleep with an annotated brain cross-section explaining sleep paralysis. Measured leader lines, specimen labels drawn as blank tags.
Desaturated graphite #7C7F86 with a single faint phosphor-green trace. Dry, precise, disenchanted. The light is going out.
Seal stamp 「物」 lower right. No other text.
```

---

## 5. 介面素材

### 首頁光譜橫幅(3:1)

```text
Ultra-wide 3:1 hero image for 「靈體圖鑑 · 本體光譜」.
Seven glowing seal characters float in a row across a black cosmos, left to right: 法 權 力 信 念 懼 物, each one a light source in its band colour (#AEBAC9, #9B86D9, #D5664A, #F2BD5C, #D58C6E, #6FB0A4, #7C7F86). Thin arrows of light join them into one spectrum. The two middle characters 信 and 念 are the warmest and brightest, with incense smoke rising around them; the far left is cold and vast, the far right fades into grey dust.
Characters rendered as carved seal-script glyphs, perfectly legible. No other text.
```

### App 圖示(1:1)

```text
Square 1:1 app icon. A single faceted crystal in the shape of an irregular hexagon (a radar chart turned into a gem), glowing amber #F2BD5C from within, floating on ink-black #0E1015 with a faint silver hexagonal frame behind it. Centred, generous padding, readable at 64 px. No text.
```

### 今日靈籤卡背(5:7)

```text
Vertical 5:7 playing-card back for a daily spirit omen. Ink-black ground, a fine repeating lattice of tiny hexagons in bone-white at low contrast, a thin gold border with rounded corners. In the centre the character 「籤」 in gold leaf, brushed calligraphy, with a soft amber glow. Symmetrical, elegant, no other text.
```

### 分享卡底紋(4:5)

```text
Vertical 4:5 background texture only, no subject: ink-black #0E1015 paper with subtle fibres and grain, a very faint hexagonal radar grid centred in the upper half, soft vignette. Designed to sit behind text. No text, no objects.
```

### 空狀態 / 載入畫面(16:9)

```text
16:9 illustration for a loading screen: a lone incense stick in a small bronze burner on an ink-black ground, its smoke rising and slowly curling into the shape of a hexagon. Warm amber ember at the tip, bone-white smoke. Minimal, quiet, lots of negative space. No text.
```

### 七枚印章(1:1,一次生成 7 張)

```text
Generate 7 square 1:1 images as one consistent set: vermilion seal stamps on off-white rice paper, each carved with one character in seal script: 法, 權, 力, 信, 念, 懼, 物. Same stamp size, same ink texture, same slightly uneven pressure, centred with padding. Perfectly legible characters. No other text.
```

---

---

## 6. 深度圖與分層

### 深度圖(先上傳插畫再貼)

```text
Using the image I just uploaded, create its depth map.
Exactly the same framing and aspect ratio. Grayscale only: pure white = closest to the camera, pure black = farthest background. Smooth continuous gradients that follow the forms of the body and face; the halo sigil and background stay dark. No texture, no outlines, no text.
```

> ChatGPT 生成的深度圖是「畫出來」的,不是量度出來的,形狀大致合理但不精確。要更準,用 Depth Anything 3 或 Apple Depth Pro(見 [`3d-pipeline.md`](3d-pipeline.md))。

### 分層視差(進階)

```text
Split the image I uploaded into 3 separate layers with the same canvas size:
1. background only (subject removed and the gap filled naturally),
2. the subject alone on a flat pure green #00FF00 background,
3. foreground elements only (smoke, offerings, foreground objects) on a flat pure green #00FF00 background.
Keep positions identical to the original so the layers stack perfectly. No text.
```

三層去綠幕後疊起,就可以做多層視差或放進 3D 場景做「紙劇場」效果。

---

資料來源:
[ChatGPT Images 2.5 發佈(Let's Data Science)](https://letsdatascience.com/news/openai-launches-chatgpt-images-25-and-sketch-40be4950) ·
[ChatGPT Images 2.0(Neurohive)](https://neurohive.io/en/news/chatgpt-images-2-0-openai-launches-image-generation-model-with-reasoning-2k-resolution-and-multilingual-text/) ·
[GPT Image 提示指南(OpenAI Cookbook)](https://developers.openai.com/cookbook/examples/multimodal/image-gen-models-prompting-guide) ·
[GPT Image 2 提示技巧(Cuty)](https://www.cuty.ai/article/models/gpt-image-2-prompting-guide) ·
[Meshy Prompting Best Practices](https://docs.meshy.ai/en/webapp/guides/prompting) ·
[Meshy 3D Prompt Guide](https://www.meshy.ai/tutorials/3d-prompt-guide)
