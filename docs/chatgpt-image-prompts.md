# 靈體圖鑑 · ChatGPT 圖像指令集

這份文件是把「靈體圖鑑 · 本體光譜」變成有圖像的圖鑑的完整指令集。寫給 **ChatGPT Images 2.0(gpt-image-2)** 用:它支援最高 2K 解析度、1:3 至 3:1 的畫幅、一次生成最多 8 張角色一致的圖,而且中文字渲染已經可靠,所以印章字可以放心寫進圖裏。

指令用英文寫,因為英文對構圖、光線、材質的控制最精準;靈體名稱保留中文,ChatGPT 兩種語言都讀得明白。每段都可以直接複製貼上。

> 每一位靈體的指令其實不必逐段抄:打開 app 任何一位靈體 → 按「ChatGPT 圖像指令」,會按祂的六軸數值即時組出四種指令(圖鑑肖像、3D 建模用、四視圖、深度圖)。79 位已立傳靈體的完整清單另見 [`prompts/flagship-prompts.md`](prompts/flagship-prompts.md)。

---

## 1. 使用流程

1. **開一個新對話,先貼「風格聖經」**(第 2 節)。它把畫風、色彩、構圖規則鎖住,之後同一對話裏生成的每張圖都會保持一致。
2. 按需要貼各環主視覺(第 3 節)、介面素材(第 4 節)或靈體肖像(第 5 節)。
3. 生成後下載,放到專案:
   - 肖像 → `assets/portraits/{rank}.webp`
   - 深度圖 → `assets/depth/{rank}.png`
   - 3D 模型 → `assets/models/{rank}.glb`
   然後在 `assets/manifest.js` 登記。或者更快:直接把圖拖進 app 抽屜頂部的「立體台」,即時變成 3D。
4. 想立體化,按第 6 節的 3D 指令,再跟 [`3d-pipeline.md`](3d-pipeline.md) 的步驟走。

**保持一致的竅門**

- 同一環的靈體盡量在同一個對話裏生成;畫風漂移時,加一句 `Match the style, palette and lighting of the first plate in this conversation.`
- 需要系列圖時,一次要多張:`Generate 4 plates in one set: …`(gpt-image-2 的多圖生成會保持角色與畫風一致)。
- 每張都寫明畫幅(4:5、3:1、1:1),不寫的話模型會自選。
- 不要讓模型寫長段文字。印章一個字最穩定。

---

## 2. 風格聖經(每個新對話先貼這段)

```text
You are illustrating plates for a codex called 「靈體圖鑑 · 本體光譜」 (Spirit Codex · An Ontological Spectrum).
It arranges 237 gods, monsters, ancestors and ghosts on one spectrum, from cosmic Law down to plain Matter.
Its thesis: the most powerful beings do not know you; the least powerful ones come looking for you.

Keep these rules for every image in this conversation:
1. Ground: ink-black #0E1015 with a subtle paper grain. Highlights in bone-white #ECE6D9.
2. Each plate is dominated by its band colour:
   法 Law #AEBAC9 (silver-blue) · 權 Sovereigns #9B86D9 (violet) · 力 Force at the edge #D5664A (vermilion)
   信 Gods among us #F2BD5C (amber) · 念 Those we keep #D58C6E (clay-tangerine)
   懼 At the threshold #6FB0A4 (teal) · 物 The tide goes out #7C7F86 (graphite)
3. Signature motif: a thin hexagonal radar sigil (six spokes, one irregular hexagon) glows behind the subject like a halo.
4. Medium: museum-quality digital painting that joins Chinese gongbi line work with Western chiaroscuro. Soft volumetric light, restrained detail, no glossy game-art look.
5. Composition: vertical 4:5 unless told otherwise. Subject centred, calm negative space above, crisp silhouette that separates cleanly from the background.
6. Text: none, except one small vermilion seal stamp in the lower-right corner holding the band character (法 權 力 信 念 懼 物).
7. Power is scale and cold distance; intimacy is warmth and nearness. The more powerful the being, the colder and further away it feels. The more it is remembered, the warmer and closer.
Reply only "明白" and wait for my first plate.
```

---

## 3. 七環主視覺(3:1 橫幅,用作每一環的頁首)

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

## 4. 介面素材

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

## 5. 精選立傳肖像(16 位,手寫加強版)

以下每段已含該靈體的六軸特徵與美術方向,直接貼即可。

### 法 · 安那刻(必然)Ananke · #2

```text
Vertical 4:5 plate: 安那刻 (Ananke), Necessity, older than the gods.
She is barely a figure: a colossal veiled silhouette formed from the threads of fate, seated beyond the stars, her spindle turning the axis of the cosmos. The gods of Olympus appear tiny at her feet, bound by threads they cannot see.
Band 法 Law: silver-blue #AEBAC9 light, engraved celestial chart, concentric orbits. Overwhelming scale, entirely indifferent to prayer: no offerings anywhere.
Hexagonal radar sigil glowing behind her like a halo. Seal stamp 「法」 lower right. No other text.
```

### 法 · 克羅諾斯(時間神)Chronos · #1

```text
Vertical 4:5 plate: 克羅諾斯 (Chronos), Time itself, not the Titan Cronus.
A serpent-coiled column of light winding upward through the frame, carrying falling sand, turning leaves, cities rising and crumbling on its coils. It has no face. Everything it carries flows one way only.
Band 法 Law: silver-blue #AEBAC9, thread-thin lines of light, ink black, immense silence.
Hexagonal radar sigil behind. Seal stamp 「法」 lower right. No other text.
```

### 權 · 哈得斯 Hades · #6

```text
Vertical 4:5 plate: 哈得斯 (Hades), lord of the order after death and of the wealth under the earth.
Seated on a throne cut from dark basalt, a key and a bident across his knees, his face calm and unreadable. Behind him a vast closed gate; veins of gold and gemstones glitter in the rock walls; a thin river of pale souls flows past below.
Band 權 Sovereigns: violet #9B86D9 aura, marble and basalt, restrained gold. He stands on the threshold between life and death: mist around the gate.
Hexagonal radar sigil behind. Seal stamp 「權」 lower right. No other text.
```

### 權 · 赫卡忒 Hecate · #14

```text
Vertical 4:5 plate: 赫卡忒 (Hecate), goddess of crossroads, thresholds and night.
Three faces looking three ways, one woman holding two torches at a three-way crossroads under a full moon. A black hound at her side, a doorway behind her, offerings of bread and eggs at her feet. The road on the left leads to the living, the road on the right into mist.
Band 權 Sovereigns: violet #9B86D9 with torch-fire accents. Threshold atmosphere: parts of the scene dissolve into mist.
Hexagonal radar sigil behind. Seal stamp 「權」 lower right. No other text.
```

### 力 · 美杜莎 Medusa · #44

```text
Vertical 4:5 plate: 美杜莎 (Medusa), the cursed priestess before she became a monster.
A woman in a ruined temple, serpents for hair, looking down and away so that her gaze turns no one to stone. Her expression is grief, not rage. Stone statues of would-be heroes stand in the shadows behind her.
Band 力 Force at the edge: vermilion #D5664A rim light, charcoal shadows, Greek black-figure pottery motifs faintly on the walls. Unsettling, but the viewer should feel sorrow for her.
Hexagonal radar sigil behind. Seal stamp 「力」 lower right. No other text.
```

### 力 · 提豐 Typhon · #26

```text
Vertical 4:5 plate: 提豐 (Typhon), father of monsters, the last enemy of order.
A storm-giant rising from a volcano, a hundred serpent heads breathing fire into a hurricane sky; Zeus's thunderbolts strike him from above. The mountain is cracking open beneath him.
Band 力 Force at the edge: vermilion #D5664A lava light, black smoke, ember sparks, kinetic diagonal composition. Colossal and hostile.
Hexagonal radar sigil behind, half-shattered by the storm. Seal stamp 「力」 lower right. No other text.
```

### 信 · 天后(媽祖)Tin Hau · #121

```text
Vertical 4:5 plate: 天后 / 媽祖 (Tin Hau, Mazu), protector of fishermen in Hong Kong.
A serene goddess in a red-gold robe and beaded crown, standing on the prow of a wooden fishing junk in a stormy night sea; the waves calm where her light falls. Behind her, the Tin Hau temple on the shore glows with incense coils and lanterns; fishermen on the boats hold up joss sticks.
Band 信 Gods among us: amber #F2BD5C lantern light, incense haze, modern gongbi with photographic warmth. Warm, protective, approachable: offerings and handwritten prayers everywhere.
Hexagonal radar sigil behind her like a halo. Seal stamp 「信」 lower right. No other text.
```

### 信 · 黃大仙 Wong Tai Sin · #130

```text
Vertical 4:5 plate: 黃大仙 (Wong Tai Sin), the immortal who answers every request.
A kindly Taoist immortal in simple robes, holding a gourd and a whisk, seated above the crowded courtyard of Sik Sik Yuen temple. Below him, worshippers kneel and shake bamboo fortune sticks; one stick is falling out of its cylinder. Clouds of incense rise to him.
Band 信 Gods among us: amber #F2BD5C and red-gold, dense devotion, many small lights. Warm and patient.
Hexagonal radar sigil behind. Seal stamp 「信」 lower right. No other text.
```

### 信 · 灶君 Kitchen God · #193

```text
Vertical 4:5 plate: 灶君 (Zao Jun, the Kitchen God).
A small, watchful god in a paper-print altar above an old Hong Kong kitchen stove, a ledger in his hand recording the family's year. Sticky malt sugar has been smeared on his lips so he will speak sweetly to heaven. Steam rises from a wok; a child peeks around the doorway.
Band 信 Gods among us: amber #F2BD5C, the warm light of a single kitchen bulb, lived-in clutter. The god closest to the family, and the one who sees the most.
Hexagonal radar sigil behind. Seal stamp 「信」 lower right. No other text.
```

### 念 · 祖先靈(香港)Ancestral spirits · #186

```text
Vertical 4:5 plate: 祖先靈 (ancestral spirits in a Hong Kong home).
Not gods: a grandfather and grandmother, translucent and warm, standing behind the family altar in a small flat. Spirit tablets, one oil lamp, three cups of tea, a red packet for a new baby. A young mother holds the baby up toward the altar as if introducing them.
Band 念 Those we keep: clay-tangerine #D58C6E lamplight, film grain, deep brown shadows. Intimate close space. Remembered, not worshipped.
Hexagonal radar sigil behind, faint. Seal stamp 「念」 lower right. No other text.
```

### 念 · 夢訪靈 Dream Visitor · #253

```text
Vertical 4:5 plate: 夢訪靈 (the Dream Visitor), the last and least powerful entry in the codex.
A person sleeps in a narrow bed. At the edge of the bed sits someone they have lost, made of soft warm light, one hand resting on the blanket, about to say one last sentence. The room is dark except for this glow. The window shows the first blue of dawn: the dream is about to end.
Band 念 Those we keep: clay-tangerine #D58C6E, film grain, very quiet. Almost no power at all, yet the warmest image in the book. The figure dissolves into mist at the edges.
Hexagonal radar sigil behind, barely visible. Seal stamp 「念」 lower right. No other text.
```

### 懼 · 白衣女鬼 White Lady (HK) · #218

```text
Vertical 4:5 plate: 白衣女鬼 (the White Lady of Hong Kong).
The far end of a long, dim hospital corridor in an old building. A woman in white stands with her back to the viewer, long black hair, perfectly still. The fluorescent tubes flicker; the nearest one has just gone out. Her reflection in the polished floor faces the viewer.
Band 懼 At the threshold: cold teal #6FB0A4 light, sodium-orange accents, fog at floor level. Second-person dread: the viewer is the one being followed.
Hexagonal radar sigil faintly etched on the corridor wall. Seal stamp 「懼」 lower right. No other text.
```

### 懼 · 水鬼 Water Ghost · #214

```text
Vertical 4:5 plate: 水鬼 (the water ghost waiting for a replacement).
Night at a Hong Kong pier. Seen from just below the surface, a pale hand reaches up toward the rippling reflection of a swimmer's legs above. The water is cold teal, a single streetlamp shimmers on the surface. The ghost's face is hidden in shadow.
Band 懼 At the threshold: teal #6FB0A4, deep black water, bubbles and floating hair. Hostile and patient.
Hexagonal radar sigil distorted in the ripples. Seal stamp 「懼」 lower right. No other text.
```

### 懼 · 影子人(帽子人)Shadow Person · #220

```text
Vertical 4:5 plate: 影子人 / 帽子人 (the Hat Man).
A bedroom at 3 a.m. seen from the sleeper's pillow. In the corner, where the wall meets the ceiling, a tall black silhouette wearing a wide-brimmed hat stands and watches. It has no face, only a deeper darkness. The clock on the bedside table glows 03:07.
Band 懼 At the threshold: cold teal #6FB0A4 moonlight, heavy shadows, a sense of weight on the chest. It stands on the edge between sleep and waking.
Hexagonal radar sigil faintly on the wall. Seal stamp 「懼」 lower right. No other text.
```

### 物 · 睡眠麻痺(科學對照)Sleep paralysis · #244

```text
Vertical 4:5 plate: 睡眠麻痺 (sleep paralysis, the scientific counterpart of the Hat Man).
A 19th-century medical engraving: a sleeper lying on their back, the head shown in cross-section with the brainstem highlighted; leader lines point to REM atonia and the active visual cortex. Above the sleeper, a ghostly hat-shaped shadow drawn in dotted lines, labelled with a blank specimen tag as "hallucination".
Band 物 Matter: desaturated graphite #7C7F86, clinical layout, one faint phosphor-green trace. Dry and precise.
Seal stamp 「物」 lower right. Only the blank tags, no other text.
```

### 物 · 鬼火(科學解釋向)Will-o'-the-wisp · #250

```text
Vertical 4:5 plate: 鬼火 (will-o'-the-wisp, explained).
A dark marsh at night: a drifting cold flame hovers over the reeds, and beside it the same flame is dissected like a specimen: bubbles of phosphine and methane rising from rotting leaves, a small chemical diagram, a measuring scale. A lantern-carrying traveller's footprints lead into the deeper water.
Band 物 Matter: graphite #7C7F86 with a single pale green glow. The last plate of the codex: the light is going out.
Seal stamp 「物」 lower right. No other text.
```

---

## 6. 立體化用指令

### 6.1 3D 建模用參考圖(給 image-to-3D 工具)

把 `{名稱}` 換成靈體名稱,`{外觀}` 換成一句描述。app 內「ChatGPT 圖像指令 → 3D 建模用」會自動填好。

```text
Create a square 1:1 image of {名稱} as a single collectible statue, made for image-to-3D reconstruction.
{外觀}
Requirements: one object only, fully inside the frame with margin on every side; 3/4 front view at eye level; neutral mid-grey seamless background (#808080); soft even studio light from the front; no cast shadows, no depth of field, no motion blur; no smoke, sparks or particles floating free of the body; one solid connected silhouette; matte painted materials; standing on a small hexagonal plinth. No text.
```

### 6.2 四視圖(接上一張用)

```text
Using the statue from the previous image, generate 4 separate images of exactly the same object with identical scale, lighting and grey background:
1. front view  2. left side view  3. back view  4. right side view.
Orthographic camera, object centred, no perspective distortion, no text. Keep every detail consistent between the views.
```

### 6.3 深度圖(先上傳肖像再貼)

```text
Using the image I just uploaded, create its depth map.
Exactly the same framing and aspect ratio. Grayscale only: pure white = closest to the camera, pure black = farthest background. Smooth continuous gradients that follow the forms of the body and face; the halo sigil and background stay dark. No texture, no outlines, no text.
```

> ChatGPT 生成的深度圖是「畫出來」的,不是量度出來的,形狀大致合理但不精確。要更準,用 Depth Anything 3 或 Apple Depth Pro(見 [`3d-pipeline.md`](3d-pipeline.md))。

### 6.4 分層視差(進階:前景／主體／背景分開)

```text
Split the image I uploaded into 3 separate layers with the same canvas size:
1. background only (subject removed and the gap filled naturally),
2. the subject alone on a flat pure green #00FF00 background,
3. foreground elements only (smoke, offerings, foreground objects) on a flat pure green #00FF00 background.
Keep positions identical to the original so the layers stack perfectly. No text.
```

三層去綠幕後疊起,就可以做多層視差或放進 3D 場景做「紙劇場」效果。
