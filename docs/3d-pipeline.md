# 立體化流程:由 ChatGPT 圖像到 3D

目標:把 ChatGPT 生成的平面圖像,一步步變成圖鑑內可以轉動、有視差、甚至可以 360° 旋轉的立體靈體。

整個流程分四級,每一級都可以單獨停下來用。前兩級 app 已經內建,第三級 app 已支援載入,第四級是之後的方向。

| 級別 | 做法 | 效果 | 成本 | app 狀態 |
|---|---|---|---|---|
| L0 · 2.5D | CSS 3D 變換:印記傾斜、光澤、翻牌 | 介面有厚度 | 零 | 已完成 |
| L1 · 深度浮雕 | 肖像 ＋ 深度圖 → 在 WebGL 把平面推成浮雕 | 游標一動就有真視差,像全息卡 | 每張圖 1 分鐘 | 已完成(拖放即用) |
| L2 · 真 3D 模型 | Meshy 批量生成 GLB | 可 360° 旋轉、放進星宇 | 每位 30 點、1–3 分鐘 | 全自動流程已完成 |
| L3 · 3D 場景 | Gaussian Splatting、3D 世界生成 | 整座廟、整條街變成可走入的空間 | 高 | 路線圖 |

---

## L1 · 深度浮雕(最快見效)

### 原理

深度圖是一張灰階圖:白 = 近,黑 = 遠。立體台(`src/stage3d.js`)把肖像貼在一塊切成約 200×200 格的平面上,再按深度圖把每個頂點向前推。鏡頭跟游標微微移動,前景和背景移動的幅度不同,於是出現真實的視差。這就是手機「3D 相片」的做法。

### 步驟

1. **生成肖像**:在 app 打開靈體 → 「圖像與 3D 指令」→「圖鑑插畫」→ 複製 → 貼到 ChatGPT。
   指令已要求「剪影清晰、與背景分離」,這一點對深度效果最重要。
2. **取得深度圖**(三選一):

   | 方法 | 做法 | 質素 |
   |---|---|---|
   | app 自動估算 | 什麼都不用做,放入肖像就會按亮度＋中心權重估算 | 近似。暗底、主體明亮的圖版效果最好 |
   | ChatGPT | 上傳肖像,貼「深度圖」指令 | 形狀合理,但是「畫出來」的,不精確 |
   | Depth Anything 3 / Apple Depth Pro | 到 Hugging Face 的線上示範頁上傳肖像,下載深度圖 | 最準確,邊緣最乾淨,推薦 |

   Depth Anything 3(2025 年 11 月發佈)可由單張圖估算深度;Apple Depth Pro 約 0.3 秒就能出一張 2.25 百萬像素、邊緣銳利的深度圖。兩者都有 Hugging Face Spaces 的網頁版,不用安裝。

3. **放進 app**:
   - 即時試看:打開該靈體,把肖像拖到抽屜頂部的立體台;再把深度圖拖進去(檔名含 `depth` 或「深度」會自動當作深度圖),或按「深度圖」按鈕選檔。素材只存在這部裝置的瀏覽器(IndexedDB)。
   - 永久加入:把檔案放到 `assets/portraits/{編號}.webp` 和 `assets/depth/{編號}.png`,在 `assets/manifest.js` 登記:

     ```js
     window.SPECTRUM_ASSETS = {
       121: { img: "assets/portraits/121.webp", depth: "assets/depth/121.png" },
     };
     ```

### 質素要點

- 肖像建議 4:5、至少 1024×1280;存成 WebP(品質 85)可把檔案壓到 200–400 KB。
- 深度圖不用太大,512 寬已足夠;太銳利反而會出現「拉絲」,app 會輕度模糊處理。
- 頭髮、煙霧、光暈等半透明位置在深度圖應是中灰,不要純白,否則會被扯出尖刺。
- 背景越乾淨(暗底、無雜物),浮雕越好看。

---

## L2 · 真 3D 模型(Meshy)

已經寫成全自動流程,完整步驟見 **[`meshy-pipeline.md`](meshy-pipeline.md)**。摘要:

1. (可選但建議)用 [`prompts/refs/`](prompts/refs/) 的指令請 ChatGPT 生成灰底雕像參考圖,存成 `assets/refs/{編號}.png`。
2. `node tools/meshy/generate.mjs`:有參考圖的走 Image to 3D,有四視圖的走 Multi-Image to 3D,其餘走 Text to 3D。可中斷、可續、可設點數上限。
3. `node tools/meshy/optimize.mjs`:每位產生展示版(≤ 60,000 面)與星宇用的輕量版(≤ 4,000 面),WebP 貼圖 ＋ 頂點量化(不需解碼器)。
   已經自己下載了 GLB?用 `node tools/meshy/import.mjs 資料夾 --build` 按檔名配對匯入。
4. `node tools/meshy/thumbs.mjs`:以統一鏡頭與燈光渲染透明背景縮圖。
5. app 自動讀取 `assets/models.js`:圖鑑顯示雕像縮圖,抽屜變成展示櫃,星宇按遠近載入雕像。

其他工具(Tripo、Rodin、Hunyuan3D、TRELLIS)匯出的 GLB 也可以放進 `assets/models/raw/{編號}.glb`,再從第 3 步開始。

## L3 · 3D 場景(路線圖)

下一步是把「環」本身變成場景,而不只是一粒粒晶體:

- **Gaussian Splatting**:用手機繞著真實的天后廟、祖先神台拍一圈影片生成 splat,或把七環主視覺交給 World Labs Marble 之類的「圖生 3D 世界」工具,再以 Spark 或 three.js r186 起內建的 splat 渲染器放進星宇的對應環。「信」與「念」兩環會變成真實空間。
- **3D 世界生成**:把第 3 節的七環主視覺交給「圖生 3D 場景」類工具,生成可環視的背景,作為每一環的天空盒。
- **星宇替換**:已完成。有輕量版模型的靈體,星宇會按離鏡頭遠近逐個把晶體換成雕像。

---

## 常見問題

**拖放後立體台仍是晶體?**
檢查檔案類型:肖像要是圖像檔(PNG、JPG、WebP),模型要是 `.glb`。檔名含 `depth` 或「深度」的圖會被當作深度圖,單有深度圖不會顯示。

**浮雕看起來像被扯開的膠布?**
深度圖太銳利,或前景與背景深度差太大。用較柔和的深度圖,或在 `src/stage3d.js` 把 `strength` 調低(目前:有深度圖 0.6,自動估算 0.45)。

**在 claude.ai 看不到 3D?**
Artifact 只允許從 cdn.jsdelivr.net 等少數網站載入程式;公司網絡若擋住該網站,3D 會退回平面顯示,其他功能照常。

---

資料來源:
[Best AI 3D Model Generators in 2026](https://medium.com/ideas-with-wings/best-ai-3d-model-generators-in-2026-tripo-ai-vs-meshy-rodin-kaedim-and-more-7eea7b05eb11) ·
[Best image-to-3D tools 2026(3D AI Studio)](https://www.3daistudio.com/de/3d-generator-ai-comparison-alternatives-guide/best-image-to-3d-tools-2026) ·
[Depth Anything 3(Roboflow)](https://blog.roboflow.com/depth-anything-3/) ·
[Apple Depth Pro(Hackster)](https://hackster.io/news/apple-researchers-release-depth-pro-a-one-shot-model-for-sub-second-depth-mapping-on-any-image-ef8e5e8e4683) ·
[ChatGPT Images 2.0(Neurohive)](https://neurohive.io/en/news/chatgpt-images-2-0-openai-launches-image-generation-model-with-reasoning-2k-resolution-and-multilingual-text/)
