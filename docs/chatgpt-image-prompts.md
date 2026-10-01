# 靈體圖鑑 · 圖像與 3D 指令(第三版)

給 **ChatGPT Images 2.5**(2026 年 9 月推出)與 **Meshy 7.1** 用的完整指令系統。

## 第三版改了甚麼

第二版的圖不夠好,原因有三:

1. **每張圖背後都有一個六邊形。** 它在畫面上沒有意義,看圖的人讀不出任何資訊,卻搶走了視線。
2. **指令像一張表格。** 場景、霧、供品各自從數值翻譯出一句,拼在一起,畫面沒有焦點,也沒有故事。
3. **看不出實力。** 宙斯和土地公都是「一個站着的神」。普通人看完,仍然不知道誰強誰弱、強幾多、管甚麼。

這個圖鑑的重點,是讓普通人看懂神靈之間、以及神靈與人之間的實力差距和職權。所以第三版每一張圖都要答三條問題:

| 問題 | 畫面怎樣答 | 數據來源 |
|---|---|---|
| **祂有幾強?** | 七個實力等級,各有體型、構圖與鏡頭:宇宙級撐滿整個天空,一人級只是床邊一個半透明的影 | 本體權能 → `POWER_TIERS`(`src/data/lore.js`) |
| **同凡人差幾遠?** | 每張圖都有一個**普通人**作比例:在宙斯腳下只是懸崖上一粒塵,在土地公旁邊就是街坊 | 等級 ＋ 文化(希臘農夫、香港街坊、歐洲村民) |
| **祂管甚麼?** | 畫祂**正在行使職權**的一刻:宙斯一揮手,全希臘的雷雲回應;天后令颱風在漁船四周平息 | 職權實景 `src/data/realm.js`(237 位逐一寫) |

此外,**普通人的反應**畫出祂對人的態度:跪拜、遮眼、逃走、被安慰,或者根本未被察覺。圖中不再放任何幾何光環、圖表或介面元素;數值留給 app 去顯示。

| 你想做甚麼 | 用哪份 |
|---|---|
| 某一位的任何指令 | app 內打開該靈體 →「圖像與 3D 指令」,六種即時生成 |
| 一環全部插畫 | [`prompts/plates/`](prompts/plates/)(每環一個檔,每位附實力等級與職權) |
| 實力對照群像(體型對照圖) | [`prompts/lineups.md`](prompts/lineups.md):全光譜、七環、七級 |
| 一環全部 3D 參考圖 | [`prompts/refs/`](prompts/refs/)(每 4 位一批,附存檔編號清單) |
| 直接在 Meshy 網頁貼 | [`prompts/meshy-prompts.csv`](prompts/meshy-prompts.csv)(237 行:文字指令與貼圖指令) |
| 全自動 3D 化 | [`meshy-pipeline.md`](meshy-pipeline.md) |

指令用英文寫,因為圖像與 3D 模型對英文名詞、材質、鏡頭用語的理解最準;靈體名稱同時附中文。

---

## 1. 使用流程

1. **開一個新對話。** 如果之前在某個對話貼過第二版的風格聖經,那個對話會一直記住「六邊形」,不要再用。
2. **先貼風格聖經**(第 2 節),再逐張貼指令。同一對話內的圖會保持同一畫風。
3. **一環一個對話。** 畫風開始漂移時,把該環最滿意的一張重新上傳,加一句 `Match the style, palette and lighting of this image.`
4. **檢查三件事:** 看得出祂有多大嗎?那個普通人在哪裏?看得出祂正在做甚麼嗎?任何一樣不清楚,用第 6 節的修圖句子改。
5. **存檔**:插畫存 `assets/portraits/{編號}.webp`;3D 參考圖存 `assets/refs/{編號}.png`;四視圖存 `assets/refs/{編號}/front.png、right.png、back.png、left.png`;群像存 `assets/bands/{環}.webp`。

---

## 2. 風格聖經

```text
You are painting plates for a codex called 「靈體圖鑑 · 本體光譜」 (Spirit Codex).
It ranks 237 gods, monsters, ancestors and ghosts by their real power, from cosmic laws down to the ghost who visits one person in a dream.
Its purpose: to let an ordinary person feel how strong each being is, how far that is from a human, and what it rules.

Keep these rules for every image in this conversation:
1. Every image shows the being at the true scale of its power, with at least one ordinary human in the scene for comparison. The higher the tier, the smaller the human becomes:
   Cosmic: the being fills the sky; the human is a speck of light far below.
   World-shaping: mountains reach its knees; the human stands on a cliff, tiny.
   Divine: a colossus taller than a temple; the human reaches its ankle.
   Legendary: larger than life; soldiers or villagers are dwarfed.
   Regional: rises above the crowd in one temple, harbour or valley.
   Local: about human size, right next to the person.
   Personal: no bigger than a person, half there, close beside one human.
2. Every image shows the being using its power: the storm answering, the sea calming, the night falling, the dream arriving. Never a still pose in an empty background.
3. The human's reaction shows how the being treats people: kneeling in gratitude, shielding their eyes, fleeing, comforted, or not noticed at all.
4. Each band has its own light and palette:
   法 Law: silver-blue #AEBAC9 on ink black · 權 Sovereigns: violet #9B86D9 with marble and gold
   力 Force at the edge: vermilion #D5664A and firelight · 信 Gods among us: amber #F2BD5C, temple red and gold
   念 Those we keep: clay-orange #D58C6E lamplight · 懼 At the threshold: teal #6FB0A4 fog with one sodium lamp
   物 Matter: graphite #7C7F86, clinical and disenchanted
5. Finish: museum-quality epic painting with cinematic realism. One unmistakable focal point, a strong readable silhouette, dramatic value contrast, deep atmospheric perspective.
6. Hong Kong folk deities follow real Cantonese temple iconography (face colour, crown, robe, attributes).
7. No geometric halos, symbol rings, charts, frames, borders or interface elements. If any earlier instruction asked for a hexagonal sigil or radar halo, ignore it.
8. No text except one small vermilion seal stamp with the band character in the lower-right corner, written exactly as given.
Reply only "明白" and wait for my first plate.
```

---

## 3. 指令是怎樣組成的

### 七個實力等級

由「本體權能」決定。普通人的權能定為 5,作為所有比較的起點。

| 等級 | 權能 | 位數 | 例子 | 體型 | 畫面中的普通人 | 鏡頭 |
|---|---|---|---|---|---|---|
| 宇宙級 | ≥ 95 | 4 | 命運三女神、混沌、安那刻、克羅諾斯 | 星系如塵 | 遠處岩石上一點光 | 地面仰望,14mm |
| 創世級 | 85–94 | 6 | 宙斯、哈得斯、尼克斯、蓋婭 | 山脈只到膝 | 懸崖邊一粒塵 | 人身後極低角度,16mm |
| 神域級 | 70–84 | 20 | 雅典娜、阿波羅、赫卡忒、提豐 | 高過神廟 | 只到腳踝 | 人群中仰望,24mm |
| 傳說級 | 55–69 | 49 | 關帝、觀音、美杜莎、城隍 | 一人敵一軍 | 被壓倒、四散 | 低角度動態,35mm |
| 一方級 | 40–54 | 99 | 天后、北帝、黃大仙、普羅米修斯 | 高出人群 | 眾人之一,仰望 | 微仰,35mm |
| 街坊級 | 25–39 | 26 | 土地公、紅帽妖、小精靈 | 人的大小 | 近在身邊 | 平視,50mm |
| 一人級 | < 25 | 33 | 夢訪靈、影子人、地縛靈 | 半透明 | 床邊、房內、一個人 | 貼近,85mm |

### 數據如何變成畫面

| 來源 | 變成 |
|---|---|
| 本體權能 → 實力等級 | 開場句、體型、普通人的位置與大小、鏡頭、觀者的感受 |
| 職權實景(`realm.js`) | THE MOMENT:祂一出手,世界正在發生甚麼 |
| 向人性 ＋ 可協商度 | HOW IT TREATS PEOPLE:普通人的反應;光落在人身上的溫度 |
| 視覺正典(`canon.js`) | 外形、姿態、法器 |
| 所屬環 | 燈光配方、畫風、色板、要避免的東西 |
| 文化 | 普通人是誰:希臘農夫、香港街坊、歐洲村民、今天的路人 |

### 例一:創世級 · #7 宙斯

<!-- gen:plate:7 -->
```text
Create a breathtaking, cinematic illustration, vertical 4:5, maximum detail. It shows Zeus (宙斯) at the true scale of his power, so that anyone can feel at a glance how far beyond an ordinary human Zeus is, and what Zeus rules.

THE MOMENT: HIS POWER AT WORK
Storm clouds over all of Greece answer him; one thunderbolt splits the sky above Mount Olympus.

POWER AND SCALE: the heart of the image
Power tier 2 of 7, counting down from Cosmic: World-shaping (創世級). Zeus is as vast as his domain: mountain ranges reach only to his knees, and storms, seas or shadows move around him like his own garments. In the foreground, an ordinary ancient Greek farmer in a plain wool tunic stands at the edge of a cliff, a tiny speck against Zeus. The difference in power between Zeus and the ordinary person must be readable in one glance.

ZEUS
A powerful bearded king with long curling hair and a bare chest under a draped himation, an eagle on his shoulder. Pose: standing with one arm raised to hurl a thunderbolt. Attributes: thunderbolt, sceptre, eagle.

HOW ZEUS TREATS PEOPLE
Zeus is impartial and judges by his own law, neither kind nor cruel: the person bows low or shields their eyes from his power.

CAMERA AND LIGHT
Very low angle from just behind the human, ultra-wide 16mm lens. The human is small in the lower foreground; Zeus rises over the horizon and fills two-thirds of the frame. Soft violet ambient light, a warm gold key light from high above like sunlight through a temple roof, crisp rim light. The light is impartial: brilliant on the being, indifferent to the people.

STYLE
Epic mythological painting with cinematic realism, in the grand tradition of Baroque ceiling frescoes: luminous marble-pale skin, wind-blown drapery, a golden-hour sky with violet atmosphere and restrained gold. Palette: violet #9B86D9 aura, warm white marble, restrained gold leaf. One unmistakable focal point, a strong readable silhouette, dramatic value contrast, deep atmospheric perspective and rich surface detail. The viewer should feel awe.

KEEP OUT
No geometric halos, rings of symbols, charts, frames, borders or interface elements. No text, letters or numbers anywhere except one small vermilion seal stamp reading "權" in the lower-right corner. Avoid modern clothing, fantasy-game armour, anime faces; cluttered backgrounds; extra limbs or fingers; modern objects that are not described.
```
<!-- /gen -->

### 例二:一方級 · #121 天后

<!-- gen:plate:121 -->
```text
Create a breathtaking, cinematic illustration, vertical 4:5, maximum detail. It shows Tin Hau (天后) at the true scale of her power: far stronger than any person, holding one whole place and everyone in it.

THE MOMENT: HER POWER AT WORK
A typhoon over the South China Sea calms around the fishing fleet she protects; every Hong Kong harbour has her temple.

POWER AND SCALE: the heart of the image
Power tier 5 of 7, counting down from Cosmic: Regional (一方級). Tin Hau appears larger than life over the place in her care, rising well above the people. Many ordinary people are within her reach; one of them, an ordinary Hong Kong worshipper, is in the foreground looking up at Tin Hau. The difference in power between Tin Hau and the ordinary person must be readable in one glance.

TIN HAU
A serene sea goddess in an embroidered red-and-gold imperial robe and a beaded mian crown with hanging tassels. Pose: standing calmly on a boat's prow as the waves settle. Attributes: jade tablet (hu), stylised waves at her feet.

HOW TIN HAU TREATS PEOPLE
Tin Hau protects people and answers prayers: the person is safe within her light, offering incense or giving thanks, and the whole scene feels sheltered.

CAMERA AND LIGHT
Slightly low angle, 35mm lens. Tin Hau rises above the people, with the whole place Tin Hau watches over visible behind. Warm amber practical light from lanterns and candles, incense haze catching the light, soft gold bounce. Her light falls warmly and softly on the people, protective.

STYLE
Cinematic Hong Kong temple realism with the richness of a Chinese temple mural: amber incense haze, shafts of lantern light, red lacquer and gold leaf, crowded with devotion. Palette: amber #F2BD5C, temple red, gold leaf, soot-dark wood. One unmistakable focal point, a strong readable silhouette, dramatic value contrast, deep atmospheric perspective and rich surface detail. The viewer should feel reverence.

KEEP OUT
No geometric halos, rings of symbols, charts, frames, borders or interface elements. No text, letters or numbers anywhere except one small vermilion seal stamp reading "信" in the lower-right corner. Avoid Japanese or Western styling, generic fantasy costume; cluttered backgrounds; extra limbs or fingers; modern objects that are not described.
```
<!-- /gen -->

### 例三:一人級 · #253 夢訪靈

<!-- gen:plate:253 -->
```text
Create a breathtaking, cinematic illustration, vertical 4:5, maximum detail. It shows Dream Visitor (夢訪靈) as Dream Visitor really is: barely stronger than a person, able to reach only one human life.

THE MOMENT: ITS POWER AT WORK
One bedroom at night: someone lost returns in a dream to say goodbye.

POWER AND SCALE: the heart of the image
Power tier 7 of 7, counting down from Cosmic: Personal (一人級). Dream Visitor is no bigger than a person and only half there, faint at the edges. Dream Visitor is close beside an ordinary person in one small space. The difference in power between Dream Visitor and the ordinary person must be readable in one glance.

DREAM VISITOR
A soft, glowing figure of someone loved and lost, sitting at the edge of a bed, one hand resting on the blanket. Pose: sitting and leaning slightly forward as if about to speak.

HOW DREAM VISITOR TREATS PEOPLE
Dream Visitor is kind to people, but on its own terms: the person is comforted, though not in control.

CAMERA AND LIGHT
Close and intimate, 85mm lens. The person is sharp; Dream Visitor is soft and half-transparent beside them. One small oil lamp as the key light, warm clay-orange glow, deep brown shadows, gentle film grain. Its light falls warmly and softly on the people, protective.

STYLE
A quiet Hong Kong film still at night: warm, tender and grainy, lit by a single oil lamp, nothing grand or divine. Palette: clay-tangerine #D58C6E, sandalwood brown, faded photograph tones. One unmistakable focal point, a strong readable silhouette, dramatic value contrast, deep atmospheric perspective and rich surface detail. The viewer should feel intimacy.

KEEP OUT
No geometric halos, rings of symbols, charts, frames, borders or interface elements. No text, letters or numbers anywhere except one small vermilion seal stamp reading "念" in the lower-right corner. Avoid horror, ghoulish faces, divine glory; cluttered backgrounds; extra limbs or fingers; modern objects that are not described.
```
<!-- /gen -->

### 例四:3D 參考圖(#6 哈得斯)

灰底、平光、3/4 前側、85mm、雕塑規則,這些條件都是為了讓 Meshy 的 Image to 3D 讀得準。雕像本身不放比例人形:app 的立體台會按等級在雕像旁邊放一個凡人剪影。

<!-- gen:ref:6 -->
```text
Create one image: a studio reference photograph of a physical collectible statue, made for image-to-3D reconstruction. Square 1:1.

SUBJECT
A statue of Hades (哈得斯): a stern bearded king in heavy dark robes and an iron crown, the helm of darkness resting beside him, three-headed Cerberus crouched at his feet.
Pose: enthroned on a basalt throne. Attributes: bident, key of the underworld, helm of darkness.
Bearing: monumental, heavy and immovable, every line of the pose suggesting immense scale.

MATERIAL
Dark basalt and blackened bronze with gold. Finished like a museum collectible, with the colour held in the material itself.

BASE
A low round marble plinth with a Greek key border.

CAMERA
Three-quarter front view from slightly above eye level, 85mm lens with minimal perspective distortion. The whole statue and base fit inside the frame with about 10% empty margin on every side.

LIGHT AND BACKGROUND
Soft, even, low-contrast studio light from the front. No cast shadows, no rim glow, no bloom, no depth of field. Seamless flat mid-grey background (#808080) with nothing else in it.

SCULPTURAL RULES (these matter for 3D)
One solid, connected object. Thicken anything wire-thin (threads, strings, whiskers, spear shafts, feathers) the way a sculptor would. Smoke, flames, water, mist and light are carved as solid sculpted forms attached to the statue, never floating free. No transparent or mirror-like parts that would hide the shape behind them.

TEXT
None.
```
<!-- /gen -->

### 例五:四視圖(接着例四用)

<!-- gen:multiview:6 -->
```text
Using the statue of Hades in the image above, create 4 separate square images of exactly the same statue for multi-view 3D reconstruction:
1. front view  2. right side view (turned 90°)  3. back view  4. left side view.

Keep identical: the statue, its proportions, every detail and colour, the base, the scale in frame, the flat mid-grey background (#808080) and the soft even light with no shadows.
Camera at the statue's mid-height, orthographic-style, no perspective distortion, whole statue in frame with the same margin.
Invent the unseen back consistently with the front, including the back of: bident, key of the underworld, helm of darkness.
No text.
```
<!-- /gen -->

### 例六:Meshy 文字指令與貼圖指令(#121 天后)

最重要的詞放最前;超過 600 字元時,由最不重要的一段開始刪減。神域級以上加上 Monumental。

<!-- gen:meshy:121 -->
```text
Collectible statue of Tin Hau, a serene sea goddess in an embroidered red-and-gold imperial robe and a beaded mian crown with hanging tassels, standing calmly on a boat's prow as the waves settle, with jade tablet (hu), stylised waves at her feet, painted wood with red lacquer and gold leaf, a low rectangular red-lacquer altar base with gold trim, museum-quality sculpture, clean readable silhouette, thick sturdy details, single connected object, no floating particles, no background
```
<!-- /gen -->

<!-- gen:texture:121 -->
```text
Painted wood with red lacquer and gold leaf, palette amber #F2BD5C, temple red, gold leaf, soot-dark wood, hand-painted museum statue finish with a subtle dark wash in the crevices and gentle wear on the edges, crisp painted detail on jade tablet (hu), stylised waves at her feet, no baked lighting or shadows, no text, no logos
```
<!-- /gen -->

---

## 4. 七環主視覺(實力群像)

主視覺不再是一幅風景,而是一張**體型對照圖**:由一個普通人開始,按權能由弱至強一字排開,每位按等級畫成相應大小,名字寫在腳下。一眼就看到「你」與眾神之間的距離。

- 七環各一張(3:1)、七級各一張、全光譜一張,全部在 [`prompts/lineups.md`](prompts/lineups.md)。
- 完成後存成 `assets/bands/{環}.webp`,在 `assets/manifest.js` 加上 `bands: { folk: "assets/bands/folk.webp", … }`,圖鑑每一環的頁首就會出現。
- app 的「實力階梯」每一級都有「複製本級群像指令」按鈕。
- 名牌出錯時,刪去 LABELS 一段,改成 `No text.`

### 全光譜:由你到宇宙法則(也可作首頁橫幅)

<!-- gen:lineup:spectrum -->
```text
Create one epic poster, ultra-wide 3:1, maximum detail: a power-scale lineup, like a size-comparison chart painted as a museum-quality epic painting. Its purpose is to let an ordinary person see at once how big the gaps in power are.

THE LINE
Everyone stands in one row on a single shared ground line, weakest on the left, strongest on the right. Each being is drawn at the size of its power, measured against the ordinary person on the far left:
0. You: an ordinary Hong Kong person of today in everyday clothes, ordinary human height, the yardstick for everyone else.
1. Dream Visitor (夢訪靈), power 10, Personal tier: about the height of the person, faint and half-transparent. A soft, glowing figure of someone loved and lost, sitting at the edge of a bed, one hand resting on the blanket.
2. Tudi Gong (土地公), power 38, Local tier: about human height. A smiling old earth god with a long white beard and a round belly in a red official's robe.
3. Tin Hau (天后), power 52, Regional tier: about twice the height of the person. A serene sea goddess in an embroidered red-and-gold imperial robe and a beaded mian crown with hanging tassels.
4. Guan Di (關帝), power 60, Legendary tier: four to five times the height of the person. A tall red-faced general with a long black beard to his chest, green robe over armour, fierce phoenix eyes.
5. Athena (雅典娜), power 82, Divine tier: a colossus about ten times the height of the person. A tall armoured goddess in a crested Corinthian helmet, the gorgon-faced aegis on her breastplate, an owl on her shoulder.
6. Zeus (宙斯), power 92, World-shaping tier: so vast that only his lower body fits in the frame, mountains reaching to his knees. A powerful bearded king with long curling hair and a bare chest under a draped himation, an eagle on his shoulder.
7. Ananke (安那刻), power 100, Cosmic tier: far beyond the frame: Ananke is the sky and the whole background behind the line. A colossal faceless goddess veiled in thousands of taut silver threads, the threads running out from her hands to bind a small turning world-axis, a serpent coiled around her lap.

THE SETTING
One continuous background that changes from left to right: a small Hong Kong bedroom at night, a temple street full of incense, a fishing harbour, a battlefield in smoke, the marble heights of Mount Olympus, and finally deep space full of stars.

LIGHT AND STYLE
Museum-quality epic painting with cinematic realism. Each being keeps the light of its own band: warm lamplight for the beloved dead, amber incense glow for the temple gods, vermilion firelight for monsters and heroes, violet and gold for the Olympians, cold silver-blue for the cosmic laws. Every figure has a strong, readable silhouette even when small. The jumps in size between neighbours must be dramatic and exact, so the eye climbs from the human to the largest power in one sweep.

LABELS
Under each figure, a small bone-white plaque with its name written exactly as given: 「你」, 「夢訪靈」, 「土地公」, 「天后」, 「關帝」, 「雅典娜」, 「宙斯」, 「安那刻」. No other text, letters or numbers.

KEEP OUT
No geometric halos, rings of symbols, charts, frames, borders or interface elements. No gore. No figure may hide another.
```
<!-- /gen -->

### 信 · 人間之神

<!-- gen:lineup:folk -->
```text
Create one epic poster, ultra-wide 3:1, maximum detail: a power-scale lineup, like a size-comparison chart painted as a museum-quality epic painting. Its purpose is to let an ordinary person see at once how big the gaps in power are among the band 「信 · 人間之神」 (Gods among us).

THE LINE
Everyone stands in one row on a single shared ground line, weakest on the left, strongest on the right. Each being is drawn at the size of its power, measured against the ordinary person on the far left:
0. You: an ordinary Hong Kong worshipper, ordinary human height, the yardstick for everyone else.
1. Tudi Gong (土地公), power 38, Local tier: about human height. A smiling old earth god with a long white beard and a round belly in a red official's robe.
2. Wong Tai Sin (黃大仙), power 46, Regional tier: about twice the height of the person. A kindly Taoist immortal in a simple robe and scholar's cap with a long white beard.
3. Tin Hau (天后), power 52, Regional tier: about twice the height of the person. A serene sea goddess in an embroidered red-and-gold imperial robe and a beaded mian crown with hanging tassels.
4. Pak Tai (北帝), power 53, Regional tier: about twice the height of the person. A martial Taoist god with long loose hair and a black-and-gold armoured robe, bare feet planted on a turtle and a snake.
5. Guanyin (觀音), power 56, Legendary tier: four to five times the height of the person. A compassionate bodhisattva in flowing white robes and a white hood, eyes half closed, a gentle smile.
6. Guan Di (關帝), power 60, Legendary tier: four to five times the height of the person. A tall red-faced general with a long black beard to his chest, green robe over armour, fierce phoenix eyes.

THE SETTING
A Hong Kong temple interior at dusk: giant spiral incense coils hanging from dark beams, red lanterns, joss paper, carved roof ridges with ceramic figurines, worshippers' offerings.

LIGHT AND STYLE
Cinematic Hong Kong temple realism with the richness of a Chinese temple mural: amber incense haze, shafts of lantern light, red lacquer and gold leaf, crowded with devotion. Palette: amber #F2BD5C, temple red, gold leaf, soot-dark wood. Every figure has a strong, readable silhouette even when small. The jumps in size between neighbours must be dramatic and exact, so the eye climbs from the human to the largest power in one sweep.

LABELS
Under each figure, a small bone-white plaque with its name written exactly as given: 「你」, 「土地公」, 「黃大仙」, 「天后」, 「北帝」, 「觀音」, 「關帝」. No other text, letters or numbers.

KEEP OUT
No geometric halos, rings of symbols, charts, frames, borders or interface elements. No gore. No figure may hide another.
```
<!-- /gen -->

---

## 5. 介面素材

### App 圖示(1:1)

```text
Square 1:1 app icon. On an ink-black #0E1015 ground, one tiny warm human silhouette stands at the bottom centre; above it, a single column of light rises and widens, passing seven faint bands of colour (silver-blue, violet, vermilion, amber, clay-orange, teal, graphite) until it fills the top of the icon. Simple, centred, generous padding, readable at 64 px. No text, no geometric frames.
```

### 今日靈籤卡背(5:7)

```text
Vertical 5:7 playing-card back for a daily spirit omen. Ink-black ground with a subtle paper grain, a thin gold border with rounded corners, a faint rising thread of incense smoke from bottom to top. In the centre the character 「籤」 in gold leaf, brushed calligraphy, with a soft amber glow. Symmetrical, elegant, no other text.
```

### 分享卡底紋(4:5)

```text
Vertical 4:5 background texture only, no subject: ink-black #0E1015 paper with subtle fibres and grain, a soft warm glow rising from the bottom edge and fading upward, gentle vignette. Designed to sit behind text and bars. No text, no objects, no shapes.
```

### 空狀態 / 載入畫面(16:9)

```text
16:9 illustration for a loading screen: a lone incense stick in a small bronze burner on an ink-black ground, its smoke rising in one long thread toward a faint field of stars at the top of the frame. Warm amber ember at the tip, bone-white smoke. Minimal, quiet, lots of negative space. No text.
```

### 七枚印章(1:1,一次生成 7 張)

```text
Generate 7 square 1:1 images as one consistent set: vermilion seal stamps on off-white rice paper, each carved with one character in seal script: 法, 權, 力, 信, 念, 懼, 物. Same stamp size, same ink texture, same slightly uneven pressure, centred with padding. Perfectly legible characters. No other text.
```

---

## 6. 修圖句子

ChatGPT 的圖可以在同一對話內逐步修改。只說要改的地方,並列出要保留的東西。

| 問題 | 貼這句 |
|---|---|
| 舊圖有六邊形 | `Remove the hexagonal sigil and any geometric halo behind the figure. Fill the space with the sky and atmosphere around it. Keep everything else exactly the same.` |
| 看不出祂有多大 | `Add one ordinary human in the lower foreground for scale, tiny compared with the god, looking up. Keep the god unchanged.` |
| 普通人太大 | `Make the human in the foreground about half as tall and move them further from the camera. Keep everything else unchanged.` |
| 看不出祂在做甚麼 | `Show the god's power at work: [從 THE MOMENT 段抄一句]. Keep the god's face, pose and costume unchanged.` |
| 太平淡 | `Push the lighting: stronger rim light on the god, deeper shadows, more atmospheric depth behind. Keep the composition.` |
| 畫風漂移 | 上傳同環最滿意的一張:`Match the style, palette and lighting of this image.` |
| 多了文字 | `Remove all text except the small vermilion seal stamp in the lower-right corner.` |

---

## 7. 深度圖與分層

### 深度圖(先上傳插畫再貼)

```text
Using the image I just uploaded, create its depth map.
Exactly the same framing and aspect ratio. Grayscale only: pure white = closest to the camera, pure black = farthest background. Smooth continuous gradients that follow the forms of the body and face; the small human figure is a separate mid-grey shape at its own depth; sky and far background stay near black. No texture, no outlines, no text.
```

> ChatGPT 生成的深度圖是「畫出來」的,不是量度出來的,形狀大致合理但不精確。要更準,用 Depth Anything 3 或 Apple Depth Pro(見 [`3d-pipeline.md`](3d-pipeline.md))。

### 分層視差(進階)

```text
Split the image I uploaded into 3 separate layers with the same canvas size:
1. background only (subject removed and the gap filled naturally),
2. the subject alone on a flat pure green #00FF00 background,
3. foreground elements only (the human, smoke, offerings) on a flat pure green #00FF00 background.
Keep positions identical to the original so the layers stack perfectly. No text.
```

三層去綠幕後疊起,就可以做多層視差或放進 3D 場景做「紙劇場」效果:前景的凡人與後面的神分開移動,體型差距會更明顯。

---

資料來源:
[ChatGPT Images 2.5 發佈(Let's Data Science)](https://letsdatascience.com/news/openai-launches-chatgpt-images-25-and-sketch-40be4950) ·
[ChatGPT Images 2.0(Neurohive)](https://neurohive.io/en/news/chatgpt-images-2-0-openai-launches-image-generation-model-with-reasoning-2k-resolution-and-multilingual-text/) ·
[GPT Image 提示指南(OpenAI Cookbook)](https://developers.openai.com/cookbook/examples/multimodal/image-gen-models-prompting-guide) ·
[GPT Image 2 提示技巧(Cuty)](https://www.cuty.ai/article/models/gpt-image-2-prompting-guide) ·
[Meshy Prompting Best Practices](https://docs.meshy.ai/en/webapp/guides/prompting) ·
[Meshy 3D Prompt Guide](https://www.meshy.ai/tutorials/3d-prompt-guide)
