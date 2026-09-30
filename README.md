# 靈體圖鑑 · 本體光譜

由「法則」到「物質」的一條光譜:237 位神、怪、祖先與鬼,分作七環,每位以六條軸量度。權力最大的那個認不得你,權力最小的那個專程來找你。

這個版本在原作(`original/spectrum.html`)之上加入 3D 星宇、立體肖像、ChatGPT 圖像指令與一系列實用和好玩的功能。

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
- **立體台**:每位靈體的抽屜頂部。無素材時是可旋轉的六軸晶體;放入肖像即以深度圖變成浮雕;放入 GLB 即顯示真 3D 模型。
- 印記游標傾斜與光澤、紙紋、翻牌動畫。

**實用**
- 相似靈體、同環前後導航、最多三位比較(自動解讀)
- 收藏、遇見、收集進度、只看收藏
- 1080×1350 分享卡
- 每位靈體四種 ChatGPT 圖像指令(肖像、3D 建模用、四視圖、深度圖)
- 網址錨點:`#e121` 打開天后、`#cosmos`、`#omen`、`#quiz`
- 鍵盤:`/` 搜尋、`Esc` 關閉、`← →` 同環換靈

**好玩**
- 今日靈籤(宜忌由六軸決定)、本命靈測驗、每環一個和弦的聲景
- 在 Claude 內開啟時:「深掘立傳」與「向祂問一句」,由 AI 以該環語域續寫或以第一身回答

## 文件

| 文件 | 內容 |
|---|---|
| [`docs/visual-research.md`](docs/visual-research.md) | 原作剖析(含資料審查)、視覺原則、技術選型、改版說明、路線圖 |
| [`docs/chatgpt-image-prompts.md`](docs/chatgpt-image-prompts.md) | ChatGPT 風格聖經、七環主視覺、介面素材、16 位精選肖像、立體化指令 |
| [`docs/prompts/flagship-prompts.md`](docs/prompts/flagship-prompts.md) | 79 位已立傳靈體的完整圖像指令(自動產生) |
| [`docs/3d-pipeline.md`](docs/3d-pipeline.md) | 由 ChatGPT 圖像到深度浮雕、GLB 模型的步驟與工具比較 |

## 加入圖像與模型

1. 在 app 打開靈體 → 「ChatGPT 圖像指令」→ 複製,貼到 ChatGPT。
2. 把生成的圖拖到抽屜頂部的立體台,即時立體化(只存在你的瀏覽器)。
3. 要永久加入:存到 `assets/portraits/{編號}.webp`(深度圖放 `assets/depth/`,模型放 `assets/models/`),再在 `assets/manifest.js` 登記。

改了 `src/prompts.js` 或資料後,重新產生指令集:

```bash
node tools/gen-prompts.js
```

## 結構

```
index.html              頁面骨架、import map
src/styles.css          樣式
src/data/entities.js    237 位靈體(原資料,未改動)
src/data/lore.js        六軸、七環、語域、美術方向、測驗、靈籤、聲景
src/prompts.js          ChatGPT 圖像指令產生器
src/core.js             圖鑑、印記、法陣、抽屜、AI
src/features.js         收藏、立像、比較、分享卡、測驗、靈籤、聲景
src/stage3d.js          立體台
src/cosmos3d.js         星宇 3D
src/main.js             啟動與事件
assets/manifest.js      立像登記冊
tools/gen-prompts.js    指令集產生器
original/spectrum.html  原作
```
