# 靈體圖鑑 · 本體光譜

由「法則」到「物質」的一條光譜:237 位神、怪、祖先與鬼,分作七環,每位以六條軸量度。權力最大的那個認不得你,權力最小的那個專程來找你。

這個版本在原作(`original/spectrum.html`)之上加入 3D 星宇、3D 雕像展示台、237 位靈體的視覺正典與圖像/3D 指令、Meshy 全自動 3D 化流程,以及一系列實用和好玩的功能。

## 開啟

```bash
# 直接雙擊 index.html 就能用。
# 要載入 assets/ 內的肖像與模型,請用本機伺服器(瀏覽器不准 file:// 圖像進入 WebGL):
python3 -m http.server 8000
# 然後打開 http://localhost:8000
```

3D 需要 WebGL,並會從 cdn.jsdelivr.net 載入 three.js 0.170。載入失敗時自動退回平面圖鑑,其他功能照常。

## 功能

**視覺**
- **星宇 3D · 光譜塔**:237 粒六軸晶體疊成七環;塔身寬窄由各環平均「影響半徑」計出,在「念」收得最窄。泛光、香火餘燼、退潮微粒。
- **星宇 3D · 軸空間**:任選三軸作 X/Y/Z,即時顯示相關係數。
- **立體台**:每位靈體的抽屜頂部。有 3D 模型時以展示櫃呈現(本環色調攝影棚光、輪廓光、接觸陰影、可拖曳縮放、全螢幕);否則是可旋轉的六軸晶體;放入肖像即以深度圖變成浮雕。
- **雕像縮圖**:3D 化後,圖鑑的印記換成統一渲染的雕像縮圖,「光照」照樣重新點亮。
- **星宇雕像**:已 3D 化的靈體在星宇內按遠近逐個由晶體換成雕像;加上暗角、色散與菲林顆粒的調色。
- 印記游標傾斜與光澤、紙紋、翻牌動畫。

**實用**
- 相似靈體、同環前後導航、最多三位比較(自動解讀)
- 收藏、遇見、收集進度、只看收藏
- 1080×1350 分享卡
- 每位靈體六種圖像與 3D 指令(圖鑑插畫、3D 參考圖、四視圖、Meshy 文字、Meshy 貼圖、深度圖)
- 網址錨點:`#e121` 打開天后、`#cosmos`、`#omen`、`#quiz`
- 鍵盤:`/` 搜尋、`Esc` 關閉、`← →` 同環換靈

**好玩**
- 今日靈籤(宜忌由六軸決定)、本命靈測驗、每環一個和弦的聲景
- 在 Claude 內開啟時:「深掘立傳」與「向祂問一句」,由 AI 以該環語域續寫或以第一身回答

## 文件

| 文件 | 內容 |
|---|---|
| [`docs/visual-excellence.md`](docs/visual-excellence.md) | **視覺最佳級別**:五件最重要的事、七個支柱、四級路線、品質檢查表 |
| [`docs/meshy-pipeline.md`](docs/meshy-pipeline.md) | **Meshy 全部 3D 化**:操作步驟、參數、點數與時間、疑難 |
| [`docs/chatgpt-image-prompts.md`](docs/chatgpt-image-prompts.md) | 圖像與 3D 指令第二版:風格聖經、指令組成、例子、七環主視覺、介面素材 |
| [`docs/prompts/`](docs/prompts/) | 237 位的插畫指令、3D 參考圖批次指令、Meshy 指令 CSV(自動產生) |
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
```

詳見 [`docs/meshy-pipeline.md`](docs/meshy-pipeline.md)。

## 加入插畫

1. 在 app 打開靈體 → 「圖像與 3D 指令」→ 複製,貼到 ChatGPT。
2. 把生成的圖拖到抽屜頂部的立體台,即時立體化(只存在你的瀏覽器)。
3. 要永久加入:存到 `assets/portraits/{編號}.webp`(深度圖放 `assets/depth/`),再在 `assets/manifest.js` 登記。

改了視覺正典(`src/data/canon.js`)或指令產生器後,重新產生指令集:

```bash
node tools/gen-prompts.js
```

## 結構

```
index.html              頁面骨架、import map
src/styles.css          樣式
src/data/entities.js    237 位靈體(原資料,未改動)
src/data/lore.js        六軸、七環、語域、美術方向、測驗、靈籤、聲景
src/data/canon.js       237 位靈體的視覺正典(外形、法器、姿態、材質)
src/prompts.js          圖像與 3D 指令產生器(ChatGPT 與 Meshy)
src/core.js             圖鑑、印記、法陣、抽屜、AI
src/features.js         收藏、立像、比較、分享卡、測驗、靈籤、聲景
src/stage3d.js          立體台
src/cosmos3d.js         星宇 3D
src/main.js             啟動與事件
assets/manifest.js      立像登記冊(手寫)
assets/models.js        3D 模型登記冊(Meshy 流程自動產生)
assets/refs/            ChatGPT 3D 參考圖(Meshy 用)
tools/gen-prompts.js    指令集產生器
tools/meshy/            Meshy 批量生成、網頁優化、縮圖渲染
original/spectrum.html  原作
```
