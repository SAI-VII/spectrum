<!-- 由 tools/gen-print-prompts.js 自動產生;請改該檔或 src/data/canon.js 後重新執行,不要手改 -->

# 《十二宮》3D 打印:Meshy 指令全集

配合 [規則 v0.2](rules-v0.2.md)。共 **39 個模型**(打印 51 件),全部用 Meshy 的 **Text to 3D**,每條指令已控制在 600 字元內。

## 點數

| 做法 | 每個 | 39 個 | 連重做一次 |
|---|---|---|---|
| 只要形狀(單色打印,不做貼圖) | 20 | 780 | 1560 |
| 連貼圖(想在 Meshy 預覽上色效果,或做多色打印) | 30 | 1170 | 2340 |

你有四千多點,兩種做法都夠用,而且每個模型可以重做一至兩次挑最好的。點數以 Meshy 當時的收費為準,生成前請看一眼版面上顯示的數字。

## Meshy 設定

- **模式**:Text to 3D,用最新模型。
- **貼圖**:單色打印不需要,略過 Refine 可以省點數。
- **姿勢**:人像不要選 A-pose 或 T-pose,指令已寫明姿勢。
- **下載**:選 **STL** 或 **3MF**;打印前不需要經過本專案的網頁優化流程(那是給 app 顯示用的)。
- 不滿意時先改指令再重做,比連按幾次重新生成有效。最常見的問題和改法見文末。

## 打印(Bambu Studio)

- 我不確定 X2D 的打印床尺寸。這份清單最大的一件是終宮(直徑 120 mm),其餘地貌是 90 × 90 mm,任何 180 mm 以上的打印床都放得下。
- **尺寸在切片軟件裏設定**:匯入後鎖定比例,把高度(地貌則是邊長)改成下表「尺寸」一欄的數字。Meshy 輸出的模型沒有真實尺寸。
- 28–40 mm 的小像:0.2 mm 噴嘴、0.08–0.12 mm 層高;樹狀支撐。50 mm 以上用 0.4 mm 噴嘴、0.12–0.16 mm 層高即可。
- 如果你的機器是雙噴嘴,第二個噴嘴放支撐專用線材,小像底部會乾淨很多。
- 匯入後如果 Bambu Studio 提示模型有破面,按它的「修復」即可。
- 你已經做好的 50 個法環、權環神像,同樣按等級設定高度:宇宙級 90 mm、創世級 80 mm、神域級 65 mm、傳說級 50 mm、一方級 40 mm。

## 不用 Meshy 做的東西

這些是規則的平面配件,用 Meshy 會浪費點數而且尺寸不準;之後我可以用程式直接產生 STL:時間軌圓環、傲慢/業/名聲三條記錄軌、渡河錢幣、神像的統一底座與名牌。卡牌(四德牌、缺陷牌、神罰牌、來世之籤、陰影牌)是紙。

---

## A 宮位地貌

每塊中央留一個平坦的圓形空位,用來放神像;景物都靠邊。匯入切片軟件後把邊長設為 90 mm。

### 第 1 宮 Persona 人格面具 ·「戴」

90 × 90 mm,高約 35 mm · 打印 1 件 · 檔名 `tile-01`

```text
Ancient Greek theatre: a semicircle of stone seating steps curving around three sides, one large tragic mask and one comic mask leaning against the back row, a small altar of Dionysus with carved ivy at one edge, Square tabletop terrain tile for FDM 3D printing, low scenery kept to the edges, an empty flat round clearing in the centre for a miniature to stand on, flat solid underside, thick sturdy shapes, no thin spikes, no floating parts, no people or figures
```

### 第 2 宮 Hamartia 致死缺陷 ·「認」

90 × 90 mm,高約 35 mm · 打印 1 件 · 檔名 `tile-02`

```text
Ruined sanctuary floor split by one deep jagged crack, a toppled fluted column broken into three drums, a fallen crested helmet, a single thick arrow stuck upright in the ground, Square tabletop terrain tile for FDM 3D printing, low scenery kept to the edges, an empty flat round clearing in the centre for a miniature to stand on, flat solid underside, thick sturdy shapes, no thin spikes, no floating parts, no people or figures
```

### 第 3 宮 Poiesis 創生技藝 ·「造」

90 × 90 mm,高約 35 mm · 打印 1 件 · 檔名 `tile-03`

```text
Workshop of Hephaestus and the Muses: a stone forge with bellows and an anvil along one edge, an upright weaving loom along another, a lyre resting on a block of half-carved marble, Square tabletop terrain tile for FDM 3D printing, low scenery kept to the edges, an empty flat round clearing in the centre for a miniature to stand on, flat solid underside, thick sturdy shapes, no thin spikes, no floating parts, no people or figures
```

### 第 4 宮 Oikos 血脈家屋 ·「承」

90 × 90 mm,高約 35 mm · 打印 1 件 · 檔名 `tile-04`

```text
Courtyard of a Greek house: a round stone hearth with stylised solid flames at one edge, a doorway with a heavy lintel and a large key hanging beside it, a wall niche shrine holding small funeral urns, Square tabletop terrain tile for FDM 3D printing, low scenery kept to the edges, an empty flat round clearing in the centre for a miniature to stand on, flat solid underside, thick sturdy shapes, no thin spikes, no floating parts, no people or figures
```

### 第 5 宮 Logos 真言理性 ·「辯」

90 × 90 mm,高約 35 mm · 打印 1 件 · 檔名 `tile-05`

```text
Stoa colonnade: four Doric columns with an entablature along the back edge, a tall law stele covered in carved lines of text, two stone benches, an owl perched on a column, Square tabletop terrain tile for FDM 3D printing, low scenery kept to the edges, an empty flat round clearing in the centre for a miniature to stand on, flat solid underside, thick sturdy shapes, no thin spikes, no floating parts, no people or figures
```

### 第 6 宮 Eros 慾望結合 ·「結」

90 × 90 mm,高約 35 mm · 打印 1 件 · 檔名 `tile-06`

```text
Walled rose garden: two raised paths that spiral around each other, rose bushes with large blossoms along the walls, a low round fountain basin at one corner, a bow and quiver left on a stone bench, Square tabletop terrain tile for FDM 3D printing, low scenery kept to the edges, an empty flat round clearing in the centre for a miniature to stand on, flat solid underside, thick sturdy shapes, no thin spikes, no floating parts, no people or figures
```

### 第 7 宮 Daimon 守護靈 ·「聽」

90 × 90 mm,高約 35 mm · 打印 1 件 · 檔名 `tile-07`

```text
Oracle of Delphi: the egg-shaped omphalos stone covered in a carved knotted net, a bronze tripod holding a bowl, a crack in the rock with rising vapour carved as solid curls, laurel branches, Square tabletop terrain tile for FDM 3D printing, low scenery kept to the edges, an empty flat round clearing in the centre for a miniature to stand on, flat solid underside, thick sturdy shapes, no thin spikes, no floating parts, no people or figures
```

### 第 8 宮 Atlas 重擔與契約 ·「擔」

90 × 90 mm,高約 35 mm · 打印 1 件 · 檔名 `tile-08`

```text
Bare mountain summit: a huge celestial sphere engraved with constellations resting in a cradle of rock at one corner, a stone oath pillar carved with river waves, heavy broken chains on the ground, Square tabletop terrain tile for FDM 3D printing, low scenery kept to the edges, an empty flat round clearing in the centre for a miniature to stand on, flat solid underside, thick sturdy shapes, no thin spikes, no floating parts, no people or figures
```

### 第 9 宮 Katabasis 冥界之旅 ·「潛」

90 × 90 mm,高約 35 mm · 打印 1 件 · 檔名 `tile-09`

```text
Entrance to the Greek underworld: a spiral stone staircase descending into a pit at one corner, a riverbank with a mooring post and a small ferry boat, a bare poplar tree, a few skulls, Square tabletop terrain tile for FDM 3D printing, low scenery kept to the edges, an empty flat round clearing in the centre for a miniature to stand on, flat solid underside, thick sturdy shapes, no thin spikes, no floating parts, no people or figures
```

### 第 10 宮 Elpis 潘多拉的希望 ·「開」

90 × 90 mm,高約 35 mm · 打印 1 件 · 檔名 `tile-10`

```text
A giant clay pithos storage jar taller than a person lying tilted at one edge, its round lid fallen beside it, wisps escaping from the mouth carved as solid low curls along the ground, one small bird on the rim, Square tabletop terrain tile for FDM 3D printing, low scenery kept to the edges, an empty flat round clearing in the centre for a miniature to stand on, flat solid underside, thick sturdy shapes, no thin spikes, no floating parts, no people or figures
```

### 第 11 宮 Polis 城邦群體 ·「議」

90 × 90 mm,高約 35 mm · 打印 1 件 · 檔名 `tile-11`

```text
Athenian agora: a curved speaker's platform of three stone steps along one edge, a stone voting urn surrounded by scattered pottery shards, two olive trees, a carved boundary stone, Square tabletop terrain tile for FDM 3D printing, low scenery kept to the edges, an empty flat round clearing in the centre for a miniature to stand on, flat solid underside, thick sturdy shapes, no thin spikes, no floating parts, no people or figures
```

### 第 12 宮 Ekstasis 狂喜出離 ·「越」

90 × 90 mm,高約 35 mm · 打印 1 件 · 檔名 `tile-12`

```text
Dionysian grove: grapevines heavy with grapes climbing a rough rock, a bonfire of stacked logs with stylised solid flames, a thyrsus staff topped with a pine cone planted in the ground, a wine krater, a tambourine, Square tabletop terrain tile for FDM 3D printing, low scenery kept to the edges, an empty flat round clearing in the centre for a miniature to stand on, flat solid underside, thick sturdy shapes, no thin spikes, no floating parts, no people or figures
```

### Telos 終宮 ·「揭」

直徑 120 mm,高約 30 mm · 打印 1 件 · 檔名 `tile-telos`

```text
Round Greek tholos temple platform: three concentric circular steps, a ring of eight short broken columns around the rim, the floor carved with a spiral labyrinth groove leading to the centre, Round tabletop terrain tile for FDM 3D printing, low scenery kept to the edges, an empty flat round clearing in the centre for a miniature to stand on, flat solid underside, thick sturdy shapes, no thin spikes, no floating parts, no people or figures
```

## B 補做的神像

外形取自圖鑑的視覺正典,所以和你已做的 50 個神像是同一套設定。這 14 位是規則和你那張命盤圖用得着的;你的 Gemini app 如果還會派出其他力環的神,把名單給我,我照樣補上。

### #45 赫拉克勒斯 Heracles

高 65 mm(神域級) · 打印 1 件 · 名聲之路的原型 · 檔名 `god-45`

```text
Miniature statue of Heracles from Greek mythology, a massively muscled bearded hero wearing the Nemean lion's pelt as a hooded cloak, resting his weight on the club, with olive-wood club, lion skin, bow, tabletop miniature for FDM 3D printing, one solid piece on a round flat base, compact pose with arms and props close to the body, thick sturdy limbs, weapons and thin parts thickened, no floating parts, no thin spikes, clean readable silhouette, no background
```

### #56 奧菲斯 Orpheus

高 50 mm(傳說級) · 打印 1 件 · 第 9 宮「奧菲斯之規」;缺陷牌「深情」的原型 · 檔名 `god-56`

```text
Miniature statue of Orpheus from Greek mythology, a young musician-poet with a lyre, eyes lowered in grief, playing while glancing back over his shoulder, with lyre, tabletop miniature for FDM 3D printing, one solid piece on a round flat base, compact pose with arms and props close to the body, thick sturdy limbs, weapons and thin parts thickened, no floating parts, no thin spikes, clean readable silhouette, no background
```

### #79 阿特拉斯 Atlas

高 40 mm(一方級) · 打印 1 件 · 你的命盤第 8 宮;第 8 宮預設守護神 · 檔名 `god-79`

```text
Miniature statue of Atlas from Greek mythology, a straining titan kneeling under the weight of the celestial sphere on his shoulders, kneeling, bearing the globe, with celestial globe, tabletop miniature for FDM 3D printing, one solid piece on a round flat base, compact pose with arms and props close to the body, thick sturdy limbs, weapons and thin parts thickened, no floating parts, no thin spikes, clean readable silhouette, no background
```

### #88 厄庇米修斯 Epimetheus

高 40 mm(一方級) · 打印 1 件 · 第 10 宮(潘多拉之罐) · 檔名 `god-88`

```text
Miniature statue of Epimetheus from Greek mythology, a titan looking backward over his shoulder, full of regret, holding the opened jar too late, with an opened jar, tabletop miniature for FDM 3D printing, one solid piece on a round flat base, compact pose with arms and props close to the body, thick sturdy limbs, weapons and thin parts thickened, no floating parts, no thin spikes, clean readable silhouette, no background
```

### #90 厄里斯 Eris

高 40 mm(一方級) · 打印 1 件 · 欣賞傲慢的神 · 檔名 `god-90`

```text
Miniature statue of Eris from Greek mythology, a wild-haired winged goddess of strife with a mocking smile, tossing the golden apple, with golden apple, tabletop miniature for FDM 3D printing, one solid piece on a round flat base, compact pose with arms and props close to the body, thick sturdy limbs, weapons and thin parts thickened, no floating parts, no thin spikes, clean readable silhouette, no background
```

### #91 塔納托斯 Thanatos

高 40 mm(一方級) · 打印 1 件 · 死神:藏在時間牌堆最後 4 張,翻到時放上時間軌 · 檔名 `god-91`

```text
Miniature statue of Thanatos from Greek mythology, a winged, gentle-faced young man, the calm face of death, standing quietly, torch pointed down, with inverted torch, tabletop miniature for FDM 3D printing, one solid piece on a round flat base, compact pose with arms and props close to the body, thick sturdy limbs, weapons and thin parts thickened, no floating parts, no thin spikes, clean readable silhouette, no background
```

### #94 拉達曼迪斯 Rhadamanthys

高 40 mm(一方級) · 打印 1 件 · 靈界判官 · 檔名 `god-94`

```text
Miniature statue of Rhadamanthys from Greek mythology, a stern judge of the dead, seated in judgment, with sceptre, scroll, tabletop miniature for FDM 3D printing, one solid piece on a round flat base, compact pose with arms and props close to the body, thick sturdy limbs, weapons and thin parts thickened, no floating parts, no thin spikes, clean readable silhouette, no background
```

### #95 普羅米修斯 Prometheus

高 40 mm(一方級) · 打印 1 件 · 第 10 宮預設守護神;欣賞傲慢的神 · 檔名 `god-95`

```text
Miniature statue of Prometheus from Greek mythology, a defiant titan, holding the fire up toward mankind, with a stalk of giant fennel with fire inside, tabletop miniature for FDM 3D printing, one solid piece on a round flat base, compact pose with arms and props close to the body, thick sturdy limbs, weapons and thin parts thickened, no floating parts, no thin spikes, clean readable silhouette, no background
```

### #104 潘多拉 Pandora

高 40 mm(一方級) · 打印 1 件 · 第 10 宮預設守護神 · 檔名 `god-104`

```text
Miniature statue of Pandora from Greek mythology, a young woman lifting the lid of a large clay jar as dark spirits escape, one small light left inside, lifting the lid, with large clay jar, tabletop miniature for FDM 3D printing, one solid piece on a round flat base, compact pose with arms and props close to the body, thick sturdy limbs, weapons and thin parts thickened, no floating parts, no thin spikes, clean readable silhouette, no background
```

### #105 潘恩 Pan

高 40 mm(一方級) · 打印 1 件 · 第 12 宮預設守護神;欣賞傲慢的神 · 檔名 `god-105`

```text
Miniature statue of Pan from Greek mythology, a goat-legged horned god of the wild with a wild grin, dancing on goat hooves, with pan pipes, tabletop miniature for FDM 3D printing, one solid piece on a round flat base, compact pose with arms and props close to the body, thick sturdy limbs, weapons and thin parts thickened, no floating parts, no thin spikes, clean readable silhouette, no background
```

### #111 米諾斯 Minos

高 40 mm(一方級) · 打印 1 件 · 靈界判官 · 檔名 `god-111`

```text
Miniature statue of Minos from Greek mythology, a crowned king-judge of the dead, enthroned, passing sentence, with sceptre, tabletop miniature for FDM 3D printing, one solid piece on a round flat base, compact pose with arms and props close to the body, thick sturdy limbs, weapons and thin parts thickened, no floating parts, no thin spikes, clean readable silhouette, no background
```

### #113 許普諾斯 Hypnos

高 40 mm(一方級) · 打印 1 件 · 你的命盤第 2、10 宮 · 檔名 `god-113`

```text
Miniature statue of Hypnos from Greek mythology, a winged youthful sleep god with small wings on his temples, eyes half closed, drowsily pouring sleep from the horn, with poppies, horn of sleep, tabletop miniature for FDM 3D printing, one solid piece on a round flat base, compact pose with arms and props close to the body, thick sturdy limbs, weapons and thin parts thickened, no floating parts, no thin spikes, clean readable silhouette, no background
```

### #115 阿斯克勒庇俄斯 Asclepius

高 40 mm(一方級) · 打印 1 件 · 命盤常見的醫神 · 檔名 `god-115`

```text
Miniature statue of Asclepius from Greek mythology, a bearded healer god with a kind face, leaning on the serpent staff, with staff entwined by a single serpent, tabletop miniature for FDM 3D printing, one solid piece on a round flat base, compact pose with arms and props close to the body, thick sturdy limbs, weapons and thin parts thickened, no floating parts, no thin spikes, clean readable silhouette, no background
```

### #260 喀戎 Chiron

高 40 mm(一方級) · 打印 1 件 · 你的命盤第 5 宮 · 檔名 `god-260`

```text
Miniature statue of Chiron from Greek mythology, a wise, noble centaur teacher, raising a hand to teach, with bow, lyre, scroll, tabletop miniature for FDM 3D printing, one solid piece on a round flat base, compact pose with arms and props close to the body, thick sturdy limbs, weapons and thin parts thickened, no floating parts, no thin spikes, clean readable silhouette, no background
```

## C 玩家棋子

### 凡人 · 帝王

高 28 mm · 打印 1 件 · 五位玩家各一;同時對應來世之籤 · 檔名 `mortal-king`

```text
Miniature of an ordinary ancient Greek king: an older bearded man in a long draped himation with a plain band crown, one hand holding a short thick sceptre against his chest, standing straight and heavy, tabletop miniature for FDM 3D printing, one solid piece on a round flat base, compact pose with arms and props close to the body, thick sturdy limbs, weapons and thin parts thickened, no floating parts, no thin spikes, clean readable silhouette, no background
```

### 凡人 · 戰士

高 28 mm · 打印 1 件 · 檔名 `mortal-warrior`

```text
Miniature of an ordinary ancient Greek hoplite soldier: a young man in a bronze cuirass and a crested helmet pushed back on his head, a large round shield held tight against his body, a short thick spear resting on his shoulder, tabletop miniature for FDM 3D printing, one solid piece on a round flat base, compact pose with arms and props close to the body, thick sturdy limbs, weapons and thin parts thickened, no floating parts, no thin spikes, clean readable silhouette, no background
```

### 凡人 · 工匠

高 28 mm · 打印 1 件 · 檔名 `mortal-craftswoman`

```text
Miniature of an ordinary ancient Greek craftswoman: a woman in a short work tunic and apron with her hair tied up, holding a hammer against her hip and cradling a small amphora in her other arm, tabletop miniature for FDM 3D printing, one solid piece on a round flat base, compact pose with arms and props close to the body, thick sturdy limbs, weapons and thin parts thickened, no floating parts, no thin spikes, clean readable silhouette, no background
```

### 凡人 · 祭司

高 28 mm · 打印 1 件 · 檔名 `mortal-priestess`

```text
Miniature of an ordinary ancient Greek priestess: a veiled woman in a long pleated peplos holding a shallow libation bowl in both hands in front of her chest, head slightly bowed, tabletop miniature for FDM 3D printing, one solid piece on a round flat base, compact pose with arms and props close to the body, thick sturdy limbs, weapons and thin parts thickened, no floating parts, no thin spikes, clean readable silhouette, no background
```

### 凡人 · 農夫

高 28 mm · 打印 1 件 · 檔名 `mortal-farmer`

```text
Miniature of an ordinary ancient Greek farmer: a lean man in a plain wool tunic and a wide straw hat, a sack over one shoulder, leaning on a thick walking staff held close to his side, tabletop miniature for FDM 3D printing, one solid piece on a round flat base, compact pose with arms and props close to the body, thick sturdy limbs, weapons and thin parts thickened, no floating parts, no thin spikes, clean readable silhouette, no background
```

### 陰魂

高 28 mm · 打印 5 件 · 命線斷盡的玩家換上;建議用半透明或灰色線材 · 檔名 `shade`

```text
Miniature of a shade of the dead from the Greek underworld: a faceless hooded figure in a long thin robe, head bowed, one hand reaching forward, the robe dissolving into mist carved as solid curls that merge into the base, tabletop miniature for FDM 3D printing, one solid piece on a round flat base, compact pose with arms and props close to the body, thick sturdy limbs, weapons and thin parts thickened, no floating parts, no thin spikes, clean readable silhouette, no background
```

### 英雄之墳

高 30 mm · 打印 5 件 · 接受英雄祭祀的玩家換上 · 檔名 `hero-tomb`

```text
Miniature of an ancient Greek hero's tomb: a low round burial mound with an upright grave stele carved with a warrior in relief, a laurel wreath hung on the stele, an offering bowl and a small amphora at its foot, tabletop miniature for FDM 3D printing, one solid piece on a round flat base, compact pose with arms and props close to the body, thick sturdy limbs, weapons and thin parts thickened, no floating parts, no thin spikes, clean readable silhouette, no background
```

## D 配件

### 阿里阿德涅之線

高 25 mm · 打印 1 件 · 全局唯一的遺物:補回一條命線 · 檔名 `ariadne-thread`

```text
A large ball of wound thread resting on a low round stone pedestal carved with a labyrinth pattern, the loose end of the thread trailing down and around the pedestal as one thick cord, tabletop game piece for FDM 3D printing, one solid piece on a round flat base, thick sturdy shapes, no thin spikes, no floating parts, clean readable silhouette, no background
```

### 引路人權杖

高 40 mm · 打印 1 件 · 最先到達終宮的人取得 · 檔名 `guide-staff`

```text
The kerykeion herald's staff of Hermes planted upright in a small rock: a thick rod with two snakes coiled around it facing each other and a pair of short wings at the top, tabletop game piece for FDM 3D printing, one solid piece on a round flat base, thick sturdy shapes, no thin spikes, no floating parts, clean readable silhouette, no background
```

### 命線架

高 60 mm · 打印 1 件 · 放在命運三女神神像旁;每人 3 條命線可用小夾或圓環掛上 · 檔名 `moirai-spindle`

```text
A tall ancient Greek distaff and spindle standing upright on a heavy round base, wound with thick thread, a large pair of shears leaning against it, three thick loose thread ends hanging down the front, tabletop game piece for FDM 3D printing, one solid piece on a round flat base, thick sturdy shapes, no thin spikes, no floating parts, clean readable silhouette, no background
```

### 命運骰盤

直徑 90 mm · 打印 1 件 · 擲命運骰用;放在安那刻神像前 · 檔名 `fate-bowl`

```text
A wide shallow bronze offering bowl with a flat bottom and a thick rim, the outside carved with a Greek meander border and three women holding a thread, standing on three short lion-paw feet, tabletop game piece for FDM 3D printing, one solid piece on a round flat base, thick sturdy shapes, no thin spikes, no floating parts, clean readable silhouette, no background
```

### 冥河之誓柱

高 30 mm · 打印 5 件 · 第 8 宮立約時,放在立誓玩家面前 · 檔名 `styx-pillar`

```text
A short square stone pillar carved on all four sides with flowing river waves, a thick iron ring set in the top, a small flat ledge at the front, tabletop game piece for FDM 3D printing, one solid piece on a round flat base, thick sturdy shapes, no thin spikes, no floating parts, clean readable silhouette, no background
```

---

## 生成結果不理想時

| 問題 | 在指令最前面加上或改成 |
|---|---|
| 地貌中央沒有留空位 | `The centre of the tile is completely empty and flat.` |
| 地貌出現了人 | `Scenery only, absolutely no people.` |
| 手臂、武器太幼,打印會斷 | `Chunky stylised proportions, every part at least as thick as a finger.` |
| 姿勢張得太開,支撐太多 | `Arms held against the torso, feet together.` |
| 底座不見了 | `Standing on a thick round disc base.` |
| 細節太碎,28 mm 印不出 | `Simplified bold shapes, large details only.` |
