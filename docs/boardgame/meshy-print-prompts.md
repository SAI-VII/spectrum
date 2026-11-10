<!-- 由 tools/gen-print-prompts.js 自動產生;請改該檔或 src/data/canon.js 後重新執行,不要手改 -->

# 《十二宮》3D 打印:參考圖與 Meshy 指令全集

配合 [規則 v0.2](rules-v0.2.md)。共 **39 個模型**(打印 51 件)。每件有兩條指令:

- **ChatGPT 參考圖**:先出圖,滿意才交給 Meshy 的 Image to 3D。
- **Meshy 文字**:不出圖、直接用 Text to 3D 時用;已控制在 600 字元內。簡單的配件(D 組)用這條就夠。

## 流程

1. 在 ChatGPT 開一個**新對話**,貼上下面的「開場設定」,等它回覆 Ready。
2. 逐件貼「ChatGPT 參考圖」指令。**全部 39 件在同一個對話內做**,風格才會統一。畫風開始走樣時,上傳最滿意的一張,說 `Match this image exactly in stone, detail level and carving style.`
3. 每張圖檢查四件事:只有一件東西;細節是凹凸而不是花紋;沒有幼於鉛筆的部分;地貌中央是空的。不合格就叫它改,這一步不花 Meshy 點數。
4. (建議用於地貌和神像)再貼「背面」指令取得第二張圖,在 Meshy 用多圖模式,背面會準確得多。
5. 把圖上傳到 Meshy 的 **Image to 3D**,下載 STL 或 3MF。
6. 在 Bambu Studio 鎖定比例,按每件標明的尺寸設定大小。

## 開場設定(整個對話只貼一次)

```text
You are designing the physical pieces of one board game set, "Twelve Houses", based on ancient Greek mythology. I will ask for one reference image at a time. Each image will be turned into a 3D model and 3D printed, so every image must follow these rules exactly:

1. LOOK: every piece is an unpainted architectural maquette carved from one single material, matte pale limestone. No paint, no colour, no gold, no patterns that exist only as colour. It should look like a museum model of ancient Greece.
2. DETAIL: all detail is real carved depth: bold chiselled grooves, deep relief, strong steps and edges. Nothing thinner than a pencil. No hair-thin spears, strings, twigs or leaves; thicken them like a stone carver would. Smoke, flames, mist and water are carved as solid stone curls attached to the piece.
3. PROPORTION: chunky, slightly simplified tabletop-miniature proportions, with a clear silhouette that still reads when the piece is only 3 cm tall.
4. ONE OBJECT: one solid connected object per image, whole object inside the frame with about 10% empty margin, nothing else in the picture.
5. PHOTO: square 1:1 studio photograph, seamless flat mid-grey background (#808080), soft even light from the front, no cast shadows, no glow, no depth of field, no text or labels.
6. TERRAIN TILES: a square stone slab with plain straight sides, as thick as one tenth of its width. Scenery stands only along the edges and corners and is no taller than half the slab's width. The centre is an empty, flat, round clearing one third of the slab's width. No people. Camera looks down from 45 degrees at one corner, so the top and two sides are visible.
7. FIGURES AND PROPS: standing on a thick plain round disc base. Compact pose, arms and objects held against the body. Camera at three-quarter front view from slightly above.
8. Keep the same stone, the same level of detail and the same carving style in every image of this conversation.

Reply only "Ready" and wait for the first piece.
```

## 背面(每件出圖後可接着貼)

```text
Show exactly the same piece from the opposite side (turned 180 degrees). Same stone, same details, same size in frame, same background and light. Invent the unseen side consistently.
```

## 為甚麼全部是「未上色的石灰石」

- Meshy 常把細節畫在貼圖上而不是做成凹凸,打印出來是平的。參考圖只有一種材質、沒有顏色,它就只能靠形狀表達細節。
- 全套同一種石材,擺在一起像博物館的古希臘建築模型;打印時用石色或大理石色的啞面線材即可。
- 所以 Meshy 那邊**不需要貼圖**:生成時可以略過貼圖步驟。

## 點數

| 做法 | 每個 | 39 個 | 每個重做一次 |
|---|---|---|---|
| 不要貼圖 | 約 20 | 780 | 1560 |
| 連貼圖 | 約 30 | 1170 | 2340 |

點數以 Meshy 版面當時顯示的數字為準。

## 打印(Bambu X2D)

- 打印床 256 × 256 mm(雙噴嘴同時使用時約 235 × 256 mm)。清單內最大的一件是終宮(直徑 120 mm),地貌是 90 × 90 mm:**一次可以排 4 塊地貌**,全部 13 塊四個打印盤就完成。
- 28–40 mm 的小像:0.2 mm 噴嘴、0.08–0.12 mm 層高、樹狀支撐。50 mm 以上用 0.4 mm 噴嘴、0.12–0.16 mm 層高。
- 輔助噴嘴放支撐專用線材,小像底面會乾淨很多。
- 地貌頂面可以開「熨平」;用啞面線材,不要用絲光線材。
- 匯入後如果提示模型有破面,用 Bambu Studio 的修復功能。
- 你已做好的 50 個神像同樣按等級設定高度:宇宙級 90 mm、創世級 80 mm、神域級 65 mm、傳說級 50 mm、一方級 40 mm。

## 不用 Meshy 做的東西

時間軌圓環、傲慢/業/名聲記錄軌、渡河錢幣、神像統一底座、三層台階、石路與外框:這些要準確尺寸,之後用程式直接產生 STL。卡牌是紙。

---

## A 宮位地貌

每塊中央留一個平坦的圓形空位,用來放神像;景物都靠邊。匯入切片軟件後把邊長設為 90 mm。這一組最值得先出圖再做。

### 第 1 宮 Persona 人格面具 ·「戴」

90 × 90 mm,高約 35 mm · 打印 1 件 · 檔名 `tile-01`

ChatGPT 參考圖:

```text
Terrain tile (rule 6), square slab. Ancient Greek theatre: a semicircle of stone seating steps curving around three sides, one large tragic mask and one comic mask leaning against the back row, a small altar of Dionysus with carved ivy at one edge. Follow all the style rules.
```

Meshy 文字:

```text
Ancient Greek theatre: a semicircle of stone seating steps curving around three sides, one large tragic mask and one comic mask leaning against the back row, a small altar of Dionysus with carved ivy at one edge, Square tabletop terrain tile on a thick plain slab for FDM 3D printing, scenery kept to the edges, the centre an empty flat round clearing, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, flat solid underside, no thin spikes, no floating parts, no people
```

### 第 2 宮 Hamartia 致死缺陷 ·「認」

90 × 90 mm,高約 35 mm · 打印 1 件 · 檔名 `tile-02`

ChatGPT 參考圖:

```text
Terrain tile (rule 6), square slab. Ruined sanctuary floor split by one deep jagged crack, a toppled fluted column broken into three drums, a fallen crested helmet, a single thick arrow stuck upright in the ground. Follow all the style rules.
```

Meshy 文字:

```text
Ruined sanctuary floor split by one deep jagged crack, a toppled fluted column broken into three drums, a fallen crested helmet, a single thick arrow stuck upright in the ground, Square tabletop terrain tile on a thick plain slab for FDM 3D printing, scenery kept to the edges, the centre an empty flat round clearing, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, flat solid underside, no thin spikes, no floating parts, no people
```

### 第 3 宮 Poiesis 創生技藝 ·「造」

90 × 90 mm,高約 35 mm · 打印 1 件 · 檔名 `tile-03`

ChatGPT 參考圖:

```text
Terrain tile (rule 6), square slab. Workshop of Hephaestus and the Muses: a stone forge with bellows and an anvil along one edge, an upright weaving loom along another, a lyre resting on a block of half-carved marble. Follow all the style rules.
```

Meshy 文字:

```text
Workshop of Hephaestus and the Muses: a stone forge with bellows and an anvil along one edge, an upright weaving loom along another, a lyre resting on a block of half-carved marble, Square tabletop terrain tile on a thick plain slab for FDM 3D printing, scenery kept to the edges, the centre an empty flat round clearing, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, flat solid underside, no thin spikes, no floating parts, no people
```

### 第 4 宮 Oikos 血脈家屋 ·「承」

90 × 90 mm,高約 35 mm · 打印 1 件 · 檔名 `tile-04`

ChatGPT 參考圖:

```text
Terrain tile (rule 6), square slab. Courtyard of a Greek house: a round stone hearth with stylised solid flames at one edge, a doorway with a heavy lintel and a large key hanging beside it, a wall niche shrine holding small funeral urns. Follow all the style rules.
```

Meshy 文字:

```text
Courtyard of a Greek house: a round stone hearth with stylised solid flames at one edge, a doorway with a heavy lintel and a large key hanging beside it, a wall niche shrine holding small funeral urns, Square tabletop terrain tile on a thick plain slab for FDM 3D printing, scenery kept to the edges, the centre an empty flat round clearing, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, flat solid underside, no thin spikes, no floating parts, no people
```

### 第 5 宮 Logos 真言理性 ·「辯」

90 × 90 mm,高約 35 mm · 打印 1 件 · 檔名 `tile-05`

ChatGPT 參考圖:

```text
Terrain tile (rule 6), square slab. Stoa colonnade: four Doric columns with an entablature along the back edge, a tall law stele covered in carved lines of text, two stone benches, an owl perched on a column. Follow all the style rules.
```

Meshy 文字:

```text
Stoa colonnade: four Doric columns with an entablature along the back edge, a tall law stele covered in carved lines of text, two stone benches, an owl perched on a column, Square tabletop terrain tile on a thick plain slab for FDM 3D printing, scenery kept to the edges, the centre an empty flat round clearing, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, flat solid underside, no thin spikes, no floating parts, no people
```

### 第 6 宮 Eros 慾望結合 ·「結」

90 × 90 mm,高約 35 mm · 打印 1 件 · 檔名 `tile-06`

ChatGPT 參考圖:

```text
Terrain tile (rule 6), square slab. Walled rose garden: two raised paths that spiral around each other, rose bushes with large blossoms along the walls, a low round fountain basin at one corner, a bow and quiver left on a stone bench. Follow all the style rules.
```

Meshy 文字:

```text
Walled rose garden: two raised paths that spiral around each other, rose bushes with large blossoms along the walls, a low round fountain basin at one corner, a bow and quiver left on a stone bench, Square tabletop terrain tile on a thick plain slab for FDM 3D printing, scenery kept to the edges, the centre an empty flat round clearing, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, flat solid underside, no thin spikes, no floating parts, no people
```

### 第 7 宮 Daimon 守護靈 ·「聽」

90 × 90 mm,高約 35 mm · 打印 1 件 · 檔名 `tile-07`

ChatGPT 參考圖:

```text
Terrain tile (rule 6), square slab. Oracle of Delphi: the egg-shaped omphalos stone covered in a carved knotted net, a bronze tripod holding a bowl, a crack in the rock with rising vapour carved as solid curls, laurel branches. Follow all the style rules.
```

Meshy 文字:

```text
Oracle of Delphi: the egg-shaped omphalos stone covered in a carved knotted net, a bronze tripod holding a bowl, a crack in the rock with rising vapour carved as solid curls, laurel branches, Square tabletop terrain tile on a thick plain slab for FDM 3D printing, scenery kept to the edges, the centre an empty flat round clearing, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, flat solid underside, no thin spikes, no floating parts, no people
```

### 第 8 宮 Atlas 重擔與契約 ·「擔」

90 × 90 mm,高約 35 mm · 打印 1 件 · 檔名 `tile-08`

ChatGPT 參考圖:

```text
Terrain tile (rule 6), square slab. Bare mountain summit: a huge celestial sphere engraved with constellations resting in a cradle of rock at one corner, a stone oath pillar carved with river waves, heavy broken chains on the ground. Follow all the style rules.
```

Meshy 文字:

```text
Bare mountain summit: a huge celestial sphere engraved with constellations resting in a cradle of rock at one corner, a stone oath pillar carved with river waves, heavy broken chains on the ground, Square tabletop terrain tile on a thick plain slab for FDM 3D printing, scenery kept to the edges, the centre an empty flat round clearing, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, flat solid underside, no thin spikes, no floating parts, no people
```

### 第 9 宮 Katabasis 冥界之旅 ·「潛」

90 × 90 mm,高約 35 mm · 打印 1 件 · 檔名 `tile-09`

ChatGPT 參考圖:

```text
Terrain tile (rule 6), square slab. Entrance to the Greek underworld: a spiral stone staircase descending into a pit at one corner, a riverbank with a mooring post and a small ferry boat, a bare poplar tree, a few skulls. Follow all the style rules.
```

Meshy 文字:

```text
Entrance to the Greek underworld: a spiral stone staircase descending into a pit at one corner, a riverbank with a mooring post and a small ferry boat, a bare poplar tree, a few skulls, Square tabletop terrain tile on a thick plain slab for FDM 3D printing, scenery kept to the edges, the centre an empty flat round clearing, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, flat solid underside, no thin spikes, no floating parts, no people
```

### 第 10 宮 Elpis 潘多拉的希望 ·「開」

90 × 90 mm,高約 35 mm · 打印 1 件 · 檔名 `tile-10`

ChatGPT 參考圖:

```text
Terrain tile (rule 6), square slab. A giant clay pithos storage jar taller than a person lying tilted at one edge, its round lid fallen beside it, wisps escaping from the mouth carved as solid low curls along the ground, one small bird on the rim. Follow all the style rules.
```

Meshy 文字:

```text
A giant clay pithos storage jar taller than a person lying tilted at one edge, its round lid fallen beside it, wisps escaping from the mouth carved as solid low curls along the ground, one small bird on the rim, Square tabletop terrain tile on a thick plain slab for FDM 3D printing, scenery kept to the edges, the centre an empty flat round clearing, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, flat solid underside, no thin spikes, no floating parts, no people
```

### 第 11 宮 Polis 城邦群體 ·「議」

90 × 90 mm,高約 35 mm · 打印 1 件 · 檔名 `tile-11`

ChatGPT 參考圖:

```text
Terrain tile (rule 6), square slab. Athenian agora: a curved speaker's platform of three stone steps along one edge, a stone voting urn surrounded by scattered pottery shards, two olive trees, a carved boundary stone. Follow all the style rules.
```

Meshy 文字:

```text
Athenian agora: a curved speaker's platform of three stone steps along one edge, a stone voting urn surrounded by scattered pottery shards, two olive trees, a carved boundary stone, Square tabletop terrain tile on a thick plain slab for FDM 3D printing, scenery kept to the edges, the centre an empty flat round clearing, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, flat solid underside, no thin spikes, no floating parts, no people
```

### 第 12 宮 Ekstasis 狂喜出離 ·「越」

90 × 90 mm,高約 35 mm · 打印 1 件 · 檔名 `tile-12`

ChatGPT 參考圖:

```text
Terrain tile (rule 6), square slab. Dionysian grove: grapevines heavy with grapes climbing a rough rock, a bonfire of stacked logs with stylised solid flames, a thyrsus staff topped with a pine cone planted in the ground, a wine krater, a tambourine. Follow all the style rules.
```

Meshy 文字:

```text
Dionysian grove: grapevines heavy with grapes climbing a rough rock, a bonfire of stacked logs with stylised solid flames, a thyrsus staff topped with a pine cone planted in the ground, a wine krater, a tambourine, Square tabletop terrain tile on a thick plain slab for FDM 3D printing, scenery kept to the edges, the centre an empty flat round clearing, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, flat solid underside, no thin spikes, no floating parts, no people
```

### Telos 終宮 ·「揭」

直徑 120 mm,高約 30 mm · 打印 1 件 · 檔名 `tile-telos`

ChatGPT 參考圖:

```text
Terrain tile (rule 6), but the slab is round instead of square. Round Greek tholos temple platform: three concentric circular steps, a ring of eight short broken columns around the rim, the floor carved with a spiral labyrinth groove leading to the centre. The centre stays an empty flat clearing. Follow all the style rules.
```

Meshy 文字:

```text
Round Greek tholos temple platform: three concentric circular steps, a ring of eight short broken columns around the rim, the floor carved with a spiral labyrinth groove leading to the centre, Round tabletop terrain tile on a thick plain slab for FDM 3D printing, scenery kept to the edges, the centre an empty flat round clearing, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, flat solid underside, no thin spikes, no floating parts, no people
```

## B 補做的神像

外形取自圖鑑的視覺正典,所以和你已做的 50 個神像是同一套設定。這 14 位是規則和你那張命盤圖用得着的;你的 Gemini app 如果還會派出其他力環的神,把名單給我,我照樣補上。

### #45 赫拉克勒斯 Heracles

高 65 mm(神域級) · 打印 1 件 · 名聲之路的原型 · 檔名 `god-45`

ChatGPT 參考圖:

```text
Figure (rule 7). Heracles from Greek mythology: a massively muscled bearded hero wearing the Nemean lion's pelt as a hooded cloak. Pose: resting his weight on the club. Attributes: olive-wood club, lion skin, bow. Follow all the style rules.
```

Meshy 文字:

```text
Miniature statue of Heracles from Greek mythology, a massively muscled bearded hero wearing the Nemean lion's pelt as a hooded cloak, resting his weight on the club, with olive-wood club, lion skin, bow, tabletop miniature for FDM 3D printing, one solid piece on a thick round disc base, compact pose with arms and props against the body, thick limbs, thin parts thickened, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no floating parts, no background
```

### #56 奧菲斯 Orpheus

高 50 mm(傳說級) · 打印 1 件 · 第 9 宮「奧菲斯之規」;缺陷牌「深情」的原型 · 檔名 `god-56`

ChatGPT 參考圖:

```text
Figure (rule 7). Orpheus from Greek mythology: a young musician-poet with a lyre, eyes lowered in grief. Pose: playing while glancing back over his shoulder. Attributes: lyre. Follow all the style rules.
```

Meshy 文字:

```text
Miniature statue of Orpheus from Greek mythology, a young musician-poet with a lyre, eyes lowered in grief, playing while glancing back over his shoulder, with lyre, tabletop miniature for FDM 3D printing, one solid piece on a thick round disc base, compact pose with arms and props against the body, thick limbs, thin parts thickened, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no floating parts, no background
```

### #79 阿特拉斯 Atlas

高 40 mm(一方級) · 打印 1 件 · 你的命盤第 8 宮;第 8 宮預設守護神 · 檔名 `god-79`

ChatGPT 參考圖:

```text
Figure (rule 7). Atlas from Greek mythology: a straining titan kneeling under the weight of the celestial sphere on his shoulders. Pose: kneeling, bearing the globe. Attributes: celestial globe. Follow all the style rules.
```

Meshy 文字:

```text
Miniature statue of Atlas from Greek mythology, a straining titan kneeling under the weight of the celestial sphere on his shoulders, kneeling, bearing the globe, with celestial globe, tabletop miniature for FDM 3D printing, one solid piece on a thick round disc base, compact pose with arms and props against the body, thick limbs, thin parts thickened, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no floating parts, no background
```

### #88 厄庇米修斯 Epimetheus

高 40 mm(一方級) · 打印 1 件 · 第 10 宮(潘多拉之罐) · 檔名 `god-88`

ChatGPT 參考圖:

```text
Figure (rule 7). Epimetheus from Greek mythology: a titan looking backward over his shoulder, full of regret. Pose: holding the opened jar too late. Attributes: an opened jar. Follow all the style rules.
```

Meshy 文字:

```text
Miniature statue of Epimetheus from Greek mythology, a titan looking backward over his shoulder, full of regret, holding the opened jar too late, with an opened jar, tabletop miniature for FDM 3D printing, one solid piece on a thick round disc base, compact pose with arms and props against the body, thick limbs, thin parts thickened, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no floating parts, no background
```

### #90 厄里斯 Eris

高 40 mm(一方級) · 打印 1 件 · 欣賞傲慢的神 · 檔名 `god-90`

ChatGPT 參考圖:

```text
Figure (rule 7). Eris from Greek mythology: a wild-haired winged goddess of strife with a mocking smile. Pose: tossing the golden apple. Attributes: golden apple. Follow all the style rules.
```

Meshy 文字:

```text
Miniature statue of Eris from Greek mythology, a wild-haired winged goddess of strife with a mocking smile, tossing the golden apple, with golden apple, tabletop miniature for FDM 3D printing, one solid piece on a thick round disc base, compact pose with arms and props against the body, thick limbs, thin parts thickened, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no floating parts, no background
```

### #91 塔納托斯 Thanatos

高 40 mm(一方級) · 打印 1 件 · 死神:藏在時間牌堆最後 4 張,翻到時放上時間軌 · 檔名 `god-91`

ChatGPT 參考圖:

```text
Figure (rule 7). Thanatos from Greek mythology: a winged, gentle-faced young man, the calm face of death. Pose: standing quietly, torch pointed down. Attributes: inverted torch. Follow all the style rules.
```

Meshy 文字:

```text
Miniature statue of Thanatos from Greek mythology, a winged, gentle-faced young man, the calm face of death, standing quietly, torch pointed down, with inverted torch, tabletop miniature for FDM 3D printing, one solid piece on a thick round disc base, compact pose with arms and props against the body, thick limbs, thin parts thickened, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no floating parts, no background
```

### #94 拉達曼迪斯 Rhadamanthys

高 40 mm(一方級) · 打印 1 件 · 靈界判官 · 檔名 `god-94`

ChatGPT 參考圖:

```text
Figure (rule 7). Rhadamanthys from Greek mythology: an elderly bearded judge of the dead in long heavy robes with a stern calm face. Pose: seated on a plain block throne. Attributes: a thick sceptre in one hand, a rolled scroll on his knee. Follow all the style rules.
```

Meshy 文字:

```text
Miniature statue of Rhadamanthys from Greek mythology, an elderly bearded judge of the dead in long heavy robes with a stern calm face, seated on a plain block throne, with a thick sceptre in one hand, a rolled scroll on his knee, tabletop miniature for FDM 3D printing, one solid piece on a thick round disc base, compact pose with arms and props against the body, thick limbs, thin parts thickened, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no floating parts, no background
```

### #95 普羅米修斯 Prometheus

高 40 mm(一方級) · 打印 1 件 · 第 10 宮預設守護神;欣賞傲慢的神 · 檔名 `god-95`

ChatGPT 參考圖:

```text
Figure (rule 7). Prometheus from Greek mythology: a muscular bearded titan with a broken chain hanging from one wrist. Pose: striding forward, shielding the fire against his chest. Attributes: a thick fennel stalk with a carved flame at its tip. Follow all the style rules.
```

Meshy 文字:

```text
Miniature statue of Prometheus from Greek mythology, a muscular bearded titan with a broken chain hanging from one wrist, striding forward, shielding the fire against his chest, with a thick fennel stalk with a carved flame at its tip, tabletop miniature for FDM 3D printing, one solid piece on a thick round disc base, compact pose with arms and props against the body, thick limbs, thin parts thickened, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no floating parts, no background
```

### #104 潘多拉 Pandora

高 40 mm(一方級) · 打印 1 件 · 第 10 宮預設守護神 · 檔名 `god-104`

ChatGPT 參考圖:

```text
Figure (rule 7). Pandora from Greek mythology: a young woman lifting the lid of a large clay jar as dark spirits escape, one small light left inside. Pose: lifting the lid. Attributes: large clay jar. Follow all the style rules.
```

Meshy 文字:

```text
Miniature statue of Pandora from Greek mythology, a young woman lifting the lid of a large clay jar as dark spirits escape, one small light left inside, lifting the lid, with large clay jar, tabletop miniature for FDM 3D printing, one solid piece on a thick round disc base, compact pose with arms and props against the body, thick limbs, thin parts thickened, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no floating parts, no background
```

### #105 潘恩 Pan

高 40 mm(一方級) · 打印 1 件 · 第 12 宮預設守護神;欣賞傲慢的神 · 檔名 `god-105`

ChatGPT 參考圖:

```text
Figure (rule 7). Pan from Greek mythology: a goat-legged horned god of the wild with a wild grin. Pose: dancing on goat hooves. Attributes: pan pipes. Follow all the style rules.
```

Meshy 文字:

```text
Miniature statue of Pan from Greek mythology, a goat-legged horned god of the wild with a wild grin, dancing on goat hooves, with pan pipes, tabletop miniature for FDM 3D printing, one solid piece on a thick round disc base, compact pose with arms and props against the body, thick limbs, thin parts thickened, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no floating parts, no background
```

### #111 米諾斯 Minos

高 40 mm(一方級) · 打印 1 件 · 靈界判官 · 檔名 `god-111`

ChatGPT 參考圖:

```text
Figure (rule 7). Minos from Greek mythology: a crowned bearded king and judge of the dead in heavy robes. Pose: seated on a throne carved with a bull's head, one arm stretched out pointing downward in sentence. Attributes: a thick sceptre across his lap. Follow all the style rules.
```

Meshy 文字:

```text
Miniature statue of Minos from Greek mythology, a crowned bearded king and judge of the dead in heavy robes, seated on a throne carved with a bull's head, one arm stretched out pointing downward in sentence, with a thick sceptre across his lap, tabletop miniature for FDM 3D printing, one solid piece on a thick round disc base, compact pose with arms and props against the body, thick limbs, thin parts thickened, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no floating parts, no background
```

### #113 許普諾斯 Hypnos

高 40 mm(一方級) · 打印 1 件 · 你的命盤第 2、10 宮 · 檔名 `god-113`

ChatGPT 參考圖:

```text
Figure (rule 7). Hypnos from Greek mythology: a winged youthful sleep god with small wings on his temples, eyes half closed. Pose: drowsily pouring sleep from the horn. Attributes: poppies, horn of sleep. Follow all the style rules.
```

Meshy 文字:

```text
Miniature statue of Hypnos from Greek mythology, a winged youthful sleep god with small wings on his temples, eyes half closed, drowsily pouring sleep from the horn, with poppies, horn of sleep, tabletop miniature for FDM 3D printing, one solid piece on a thick round disc base, compact pose with arms and props against the body, thick limbs, thin parts thickened, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no floating parts, no background
```

### #115 阿斯克勒庇俄斯 Asclepius

高 40 mm(一方級) · 打印 1 件 · 命盤常見的醫神 · 檔名 `god-115`

ChatGPT 參考圖:

```text
Figure (rule 7). Asclepius from Greek mythology: a bearded healer god with a kind face. Pose: leaning on the serpent staff. Attributes: staff entwined by a single serpent. Follow all the style rules.
```

Meshy 文字:

```text
Miniature statue of Asclepius from Greek mythology, a bearded healer god with a kind face, leaning on the serpent staff, with staff entwined by a single serpent, tabletop miniature for FDM 3D printing, one solid piece on a thick round disc base, compact pose with arms and props against the body, thick limbs, thin parts thickened, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no floating parts, no background
```

### #260 喀戎 Chiron

高 40 mm(一方級) · 打印 1 件 · 你的命盤第 5 宮 · 檔名 `god-260`

ChatGPT 參考圖:

```text
Figure (rule 7). Chiron from Greek mythology: an old bearded centaur with a calm wise face and a horse's body, all four hooves planted. Pose: one hand raised in teaching. Attributes: a lyre held against his side. Follow all the style rules.
```

Meshy 文字:

```text
Miniature statue of Chiron from Greek mythology, an old bearded centaur with a calm wise face and a horse's body, all four hooves planted, one hand raised in teaching, with a lyre held against his side, tabletop miniature for FDM 3D printing, one solid piece on a thick round disc base, compact pose with arms and props against the body, thick limbs, thin parts thickened, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no floating parts, no background
```

## C 玩家棋子

### 凡人 · 帝王

高 28 mm · 打印 1 件 · 五位玩家各一;同時對應來世之籤 · 檔名 `mortal-king`

ChatGPT 參考圖:

```text
Figure (rule 7). An ordinary ancient Greek king: an older bearded man in a long draped himation with a plain band crown, one hand holding a short thick sceptre against his chest, standing straight and heavy. Follow all the style rules.
```

Meshy 文字:

```text
Miniature of an ordinary ancient Greek king: an older bearded man in a long draped himation with a plain band crown, one hand holding a short thick sceptre against his chest, standing straight and heavy, tabletop miniature for FDM 3D printing, one solid piece on a thick round disc base, compact pose with arms and props against the body, thick limbs, thin parts thickened, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no floating parts, no background
```

### 凡人 · 戰士

高 28 mm · 打印 1 件 · 檔名 `mortal-warrior`

ChatGPT 參考圖:

```text
Figure (rule 7). An ordinary ancient Greek hoplite soldier: a young man in a cuirass and a crested helmet pushed back on his head, a large round shield held tight against his body, a short thick spear resting on his shoulder. Follow all the style rules.
```

Meshy 文字:

```text
Miniature of an ordinary ancient Greek hoplite soldier: a young man in a cuirass and a crested helmet pushed back on his head, a large round shield held tight against his body, a short thick spear resting on his shoulder, tabletop miniature for FDM 3D printing, one solid piece on a thick round disc base, compact pose with arms and props against the body, thick limbs, thin parts thickened, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no floating parts, no background
```

### 凡人 · 工匠

高 28 mm · 打印 1 件 · 檔名 `mortal-craftswoman`

ChatGPT 參考圖:

```text
Figure (rule 7). An ordinary ancient Greek craftswoman: a woman in a short work tunic and apron with her hair tied up, holding a hammer against her hip and cradling a small amphora in her other arm. Follow all the style rules.
```

Meshy 文字:

```text
Miniature of an ordinary ancient Greek craftswoman: a woman in a short work tunic and apron with her hair tied up, holding a hammer against her hip and cradling a small amphora in her other arm, tabletop miniature for FDM 3D printing, one solid piece on a thick round disc base, compact pose with arms and props against the body, thick limbs, thin parts thickened, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no floating parts, no background
```

### 凡人 · 祭司

高 28 mm · 打印 1 件 · 檔名 `mortal-priestess`

ChatGPT 參考圖:

```text
Figure (rule 7). An ordinary ancient Greek priestess: a veiled woman in a long pleated peplos holding a shallow libation bowl in both hands in front of her chest, head slightly bowed. Follow all the style rules.
```

Meshy 文字:

```text
Miniature of an ordinary ancient Greek priestess: a veiled woman in a long pleated peplos holding a shallow libation bowl in both hands in front of her chest, head slightly bowed, tabletop miniature for FDM 3D printing, one solid piece on a thick round disc base, compact pose with arms and props against the body, thick limbs, thin parts thickened, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no floating parts, no background
```

### 凡人 · 農夫

高 28 mm · 打印 1 件 · 檔名 `mortal-farmer`

ChatGPT 參考圖:

```text
Figure (rule 7). An ordinary ancient Greek farmer: a lean man in a plain wool tunic and a wide straw hat, a sack over one shoulder, leaning on a thick walking staff held close to his side. Follow all the style rules.
```

Meshy 文字:

```text
Miniature of an ordinary ancient Greek farmer: a lean man in a plain wool tunic and a wide straw hat, a sack over one shoulder, leaning on a thick walking staff held close to his side, tabletop miniature for FDM 3D printing, one solid piece on a thick round disc base, compact pose with arms and props against the body, thick limbs, thin parts thickened, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no floating parts, no background
```

### 陰魂

高 28 mm · 打印 5 件 · 命線斷盡的玩家換上;建議用半透明或灰色線材 · 檔名 `shade`

ChatGPT 參考圖:

```text
Figure (rule 7). A shade of the dead from the Greek underworld: a faceless hooded figure in a long thin robe, head bowed, one hand reaching forward, the robe dissolving into mist carved as solid curls that merge into the base. Follow all the style rules.
```

Meshy 文字:

```text
Miniature of a shade of the dead from the Greek underworld: a faceless hooded figure in a long thin robe, head bowed, one hand reaching forward, the robe dissolving into mist carved as solid curls that merge into the base, tabletop miniature for FDM 3D printing, one solid piece on a thick round disc base, compact pose with arms and props against the body, thick limbs, thin parts thickened, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no floating parts, no background
```

### 英雄之墳

高 30 mm · 打印 5 件 · 接受英雄祭祀的玩家換上 · 檔名 `hero-tomb`

ChatGPT 參考圖:

```text
Figure (rule 7). An ancient Greek hero's tomb: a low round burial mound with an upright grave stele carved with a warrior in relief, a laurel wreath hung on the stele, an offering bowl and a small amphora at its foot. Follow all the style rules.
```

Meshy 文字:

```text
Miniature of an ancient Greek hero's tomb: a low round burial mound with an upright grave stele carved with a warrior in relief, a laurel wreath hung on the stele, an offering bowl and a small amphora at its foot, tabletop miniature for FDM 3D printing, one solid piece on a thick round disc base, compact pose with arms and props against the body, thick limbs, thin parts thickened, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no floating parts, no background
```

## D 配件

### 阿里阿德涅之線

高 25 mm · 打印 1 件 · 全局唯一的遺物:補回一條命線 · 檔名 `ariadne-thread`

ChatGPT 參考圖:

```text
Prop (rule 7). A large ball of wound thread resting on a low round stone pedestal carved with a labyrinth pattern, the loose end of the thread trailing down and around the pedestal as one thick cord. Follow all the style rules.
```

Meshy 文字:

```text
A large ball of wound thread resting on a low round stone pedestal carved with a labyrinth pattern, the loose end of the thread trailing down and around the pedestal as one thick cord, tabletop game piece for FDM 3D printing, one solid piece on a thick round disc base, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no thin spikes, no floating parts, no background
```

### 引路人權杖

高 40 mm · 打印 1 件 · 最先到達終宮的人取得 · 檔名 `guide-staff`

ChatGPT 參考圖:

```text
Prop (rule 7). The kerykeion herald's staff of Hermes planted upright in a small rock: a thick rod with two snakes coiled around it facing each other and a pair of short wings at the top. Follow all the style rules.
```

Meshy 文字:

```text
The kerykeion herald's staff of Hermes planted upright in a small rock: a thick rod with two snakes coiled around it facing each other and a pair of short wings at the top, tabletop game piece for FDM 3D printing, one solid piece on a thick round disc base, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no thin spikes, no floating parts, no background
```

### 命線架

高 60 mm · 打印 1 件 · 放在命運三女神神像旁;每人 3 條命線可用小夾或圓環掛上 · 檔名 `moirai-spindle`

ChatGPT 參考圖:

```text
Prop (rule 7). A tall ancient Greek distaff and spindle standing upright on a heavy round base, wound with thick thread, a large pair of shears leaning against it, three thick loose thread ends hanging down the front. Follow all the style rules.
```

Meshy 文字:

```text
A tall ancient Greek distaff and spindle standing upright on a heavy round base, wound with thick thread, a large pair of shears leaning against it, three thick loose thread ends hanging down the front, tabletop game piece for FDM 3D printing, one solid piece on a thick round disc base, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no thin spikes, no floating parts, no background
```

### 命運骰盤

直徑 90 mm · 打印 1 件 · 擲命運骰用;放在安那刻神像前 · 檔名 `fate-bowl`

ChatGPT 參考圖:

```text
Prop (rule 7). A wide shallow offering bowl with a flat bottom and a thick rim, the outside carved with a Greek meander border and three women holding a thread, standing on three short lion-paw feet. Follow all the style rules.
```

Meshy 文字:

```text
A wide shallow offering bowl with a flat bottom and a thick rim, the outside carved with a Greek meander border and three women holding a thread, standing on three short lion-paw feet, tabletop game piece for FDM 3D printing, one solid piece on a thick round disc base, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no thin spikes, no floating parts, no background
```

### 冥河之誓柱

高 30 mm · 打印 5 件 · 第 8 宮立約時,放在立誓玩家面前 · 檔名 `styx-pillar`

ChatGPT 參考圖:

```text
Prop (rule 7). A short square stone pillar carved on all four sides with flowing river waves, a thick ring set in the top, a small flat ledge at the front. Follow all the style rules.
```

Meshy 文字:

```text
A short square stone pillar carved on all four sides with flowing river waves, a thick ring set in the top, a small flat ledge at the front, tabletop game piece for FDM 3D printing, one solid piece on a thick round disc base, every detail sculpted as deep bold relief with chiselled grooves, chunky simplified forms, no fine surface texture, unpainted pale stone, no thin spikes, no floating parts, no background
```

---

## 生成結果不理想時

| 問題 | 對 ChatGPT 說,或加在 Meshy 指令最前面 |
|---|---|
| 地貌中央沒有留空位 | `The centre of the tile is completely empty and flat.` |
| 地貌出現了人 | `Scenery only, absolutely no people.` |
| 手臂、武器太幼,打印會斷 | `Chunky stylised proportions, every part at least as thick as a finger.` |
| 姿勢張得太開,支撐太多 | `Arms held against the torso, feet together.` |
| 底座不見了 | `Standing on a thick round disc base.` |
| 細節太碎,28 mm 印不出 | `Simplified bold shapes, large details only.` |
| 細節只是花紋,沒有凹凸 | `Carve every pattern at least 2 mm deep. No painted or printed patterns.` |
| 圖中多了其他東西或陰影 | `Only the one piece on a plain grey background, no shadows.` |
