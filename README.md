# 靈體圖鑑 · 本體光譜

237 位神、怪、祖先與鬼的**實力圖鑑**:每位都有本體權能、影響半徑、向人性、可協商度、信仰熱度、臨界性六項能力,再按本體權能分成七個實力等級,由宇宙級到一人級,最底是你。重點是讓普通人一眼看懂:祂有多強、同你差幾遠、管的是甚麼。

這個版本在原作(`original/spectrum.html`)之上加入實力卡、實力階梯、3D 星宇、3D 雕像展示台(旁邊站着一個按等級縮小的你)、237 位靈體的視覺正典與圖像/3D 指令、Meshy 全自動 3D 化流程,以及一系列實用和好玩的功能。

## 開啟

```bash
# 直接雙擊 index.html 就能用。
# 要載入 assets/ 內的肖像與模型,請用本機伺服器(瀏覽器不准 file:// 圖像進入 WebGL):
python3 -m http.server 8000
# 然後打開 http://localhost:8000
```

3D 需要 WebGL,並會從 cdn.jsdelivr.net 載入 three.js 0.170。載入失敗時自動退回平面圖鑑,其他功能照常。

## 功能

**實力(重點)**
- **實力卡**:每位靈體的抽屜頂部。大字本體權能、等級(第幾級 / 7)、全圖排名、一句話講差距(「一怒可以毀滅一座城」)、你與祂在 0–100 實力尺上的位置、七級階梯、比你高幾級,再列出職權、手段、範圍與對你的態度。「強一點 / 弱一點」可沿實力順序逐位看。
- **實力階梯**:第三個檢視。七級由宇宙級排到一人級,每級寫明管轄範圍與差距,格子大小隨等級遞減,最底一格是「你 · 凡人」。每級一個按鈕,複製該級的 ChatGPT 群像指令。
- **實力環**:圖鑑每格是一個圓環加數字,環越滿、格越大,力量越大;切換「光照」,圓環改顯示該項能力。
- **六項能力條**:每項附白話解釋、本環平均、全圖平均、「高過幾 % 靈體」,權能與範圍兩項標出你的位置。
- **立體台的凡人比例**:3D 雕像或實力晶體旁邊站着一個小人,就是你;高度按等級縮小(一人級與你等高,宇宙級只剩一點)。

**視覺**
- **星宇 3D · 光譜塔**:237 粒晶體疊成七環,晶體大小按本體權能的平方放大;塔身寬窄由各環平均「影響半徑」計出,在「念」收得最窄。泛光、香火餘燼、退潮微粒。
- **星宇 3D · 軸空間**:任選三軸作 X/Y/Z,即時顯示相關係數。
- **立體台**:有 3D 模型時以展示櫃呈現(本環色調攝影棚光、輪廓光、接觸陰影、可拖曳縮放、全螢幕);否則是實力晶體;放入肖像即以深度圖變成浮雕。
- **雕像縮圖**:3D 化後,圖鑑格換成統一渲染的雕像縮圖,右下角保留數值。
- **星宇雕像**:已 3D 化的靈體在星宇內按遠近逐個由晶體換成雕像;加上暗角、色散與菲林顆粒的調色。
- 游標傾斜與光澤、紙紋、翻牌動畫。

**實用**
- 相似靈體、同環前後導航、最多三位比較(實力尺、並排能力條、自動解讀差距)
- 收藏、遇見、收集進度、只看收藏
- 1080×1350 分享卡(實力環、等級、差距、六項能力條)
- 每位靈體六種圖像與 3D 指令(實力插畫、3D 參考圖、四視圖、Meshy 文字、Meshy 貼圖、深度圖)
- 網址錨點:`#e121` 打開天后、`#ladder`、`#cosmos`、`#omen`、`#quiz`
- 鍵盤:`/` 搜尋、`Esc` 關閉、`← →` 同環換靈

**好玩**
- 今日靈籤(宜忌由六軸決定)、本命靈測驗、每環一個和弦的聲景
- 在 Claude 內開啟時:「深掘立傳」與「向祂問一句」,由 AI 以該環語域續寫或以第一身回答

## 文件

| 文件 | 內容 |
|---|---|
| [`docs/visual-excellence.md`](docs/visual-excellence.md) | **視覺最佳級別**:五件最重要的事、七個支柱、四級路線、品質檢查表 |
| [`docs/meshy-pipeline.md`](docs/meshy-pipeline.md) | **Meshy 全部 3D 化**:操作步驟、參數、點數與時間、疑難 |
| [`docs/chatgpt-image-prompts.md`](docs/chatgpt-image-prompts.md) | **圖像與 3D 指令第三版**:每張圖畫出實力等級、職權與凡人比例;風格聖經、七個等級、例子、實力群像、修圖句子 |
| [`docs/prompts/`](docs/prompts/) | 237 位的實力插畫指令、實力對照群像、3D 參考圖批次指令、Meshy 指令 CSV(自動產生) |
| [`docs/visual-research.md`](docs/visual-research.md) | 第一輪研究:原作剖析(含資料審查)、視覺原則、技術選型 |
| [`docs/3d-pipeline.md`](docs/3d-pipeline.md) | 立體化四級:深度浮雕、Meshy 模型、3D 場景 |

## 全部靈體 3D 化(Meshy)

```bash
cd tools/meshy && npm install && npx playwright install chromium   # 第一次
export MESHY_API_KEY=msy_你的金鑰
node tools/meshy/generate.mjs --dry-run      # 看計劃與預計點數
node tools/meshy/generate.mjs --flagship     # 生成(可中斷再續)
node tools/meshy/optimize.mjs                # 兩個網頁版本
node tools/meshy/thumbs.mjs                  # 統一縮圖
node tools/meshy/import.mjs ~/Downloads --build   # 已在 Meshy 網站下載的 GLB:按檔名配對匯入
```

GLB 匯入不了?立體台會寫出原因,對照 [`docs/meshy-pipeline.md`](docs/meshy-pipeline.md#glb-匯入不了) 的表。

詳見 [`docs/meshy-pipeline.md`](docs/meshy-pipeline.md)。

## 加入插畫

1. 在 ChatGPT 開一個新對話,先貼[風格聖經](docs/chatgpt-image-prompts.md#2-風格聖經);然後在 app 打開靈體 → 「圖像與 3D 指令」→「實力插畫」→ 複製,貼過去。
2. 把生成的圖拖到抽屜頂部的立體台,即時立體化(只存在你的瀏覽器)。
3. 要永久加入:存到 `assets/portraits/{編號}.webp`(深度圖放 `assets/depth/`),再在 `assets/manifest.js` 登記。

改了視覺正典(`src/data/canon.js`)、職權實景(`src/data/realm.js`)或指令產生器後,重新產生指令集(同時更新說明文件內的例子):

```bash
node tools/gen-prompts.js
```

## 結構

```
index.html              頁面骨架、import map
src/styles.css          樣式
src/data/entities.js    237 位靈體(原資料,未改動)
src/data/lore.js        六軸、七環、七個實力等級、語域、美術方向、測驗、靈籤、聲景
src/data/canon.js       237 位靈體的視覺正典(外形、法器、姿態、材質)
src/data/realm.js       237 位靈體的職權實景(祂一出手,世界正在發生甚麼)
src/prompts.js          圖像與 3D 指令產生器(ChatGPT 與 Meshy)、實力對照群像
src/core.js             圖鑑、實力環、抽屜、AI
src/power.js            實力卡、實力尺、六項能力條、實力階梯
src/features.js         收藏、立像、比較、分享卡、測驗、靈籤、聲景
src/stage3d.js          立體台
src/cosmos3d.js         星宇 3D
src/main.js             啟動與事件
assets/manifest.js      立像登記冊(手寫)
assets/models.js        3D 模型登記冊(Meshy 流程自動產生)
assets/refs/            ChatGPT 3D 參考圖(Meshy 用)
tools/gen-prompts.js    指令集產生器
tools/meshy/            Meshy 批量生成、匯入已下載 GLB、網頁優化、縮圖渲染
original/spectrum.html  原作
```
