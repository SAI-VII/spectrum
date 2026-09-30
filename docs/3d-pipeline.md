# 立體化流程:由 ChatGPT 圖像到 3D

目標:把 ChatGPT 生成的平面圖像,一步步變成圖鑑內可以轉動、有視差、甚至可以 360° 旋轉的立體靈體。

整個流程分四級,每一級都可以單獨停下來用。前兩級 app 已經內建,第三級 app 已支援載入,第四級是之後的方向。

| 級別 | 做法 | 效果 | 成本 | app 狀態 |
|---|---|---|---|---|
| L0 · 2.5D | CSS 3D 變換:印記傾斜、光澤、翻牌 | 介面有厚度 | 零 | 已完成 |
| L1 · 深度浮雕 | 肖像 ＋ 深度圖 → 在 WebGL 把平面推成浮雕 | 游標一動就有真視差,像全息卡 | 每張圖 1 分鐘 | 已完成(拖放即用) |
| L2 · 真 3D 模型 | image-to-3D 工具生成 GLB | 可 360° 旋轉、可放進 3D 場景 | 每位 5–15 分鐘 | 已支援載入 GLB |
| L3 · 3D 場景 | Gaussian Splatting、3D 世界生成 | 整座廟、整條街變成可走入的空間 | 高 | 路線圖 |

---

## L1 · 深度浮雕(最快見效)

### 原理

深度圖是一張灰階圖:白 = 近,黑 = 遠。立體台(`src/stage3d.js`)把肖像貼在一塊切成約 200×200 格的平面上,再按深度圖把每個頂點向前推。鏡頭跟游標微微移動,前景和背景移動的幅度不同,於是出現真實的視差。這就是手機「3D 相片」的做法。

### 步驟

1. **生成肖像**:在 app 打開靈體 → 「ChatGPT 圖像指令」→「圖鑑肖像」→ 複製 → 貼到 ChatGPT。
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

## L2 · 真 3D 模型(image-to-3D)

### 1. 生成建模用參考圖

在 app 打開靈體 → 「ChatGPT 圖像指令」→「3D 建模用」。這段指令刻意要求:

- 單一物件、全身入鏡、四邊留白
- 3/4 前側視角、中灰無縫背景(#808080)
- 平均柔光、無投影、無景深、無動態模糊
- 沒有和身體分離的煙霧、火花、粒子
- 剪影連成一體、啞光材質、站在六角底座上

這些都是 image-to-3D 工具最容易出錯的地方。抽象的靈體(法則、物質兩環)會改為要求一件「雕塑物件」,例如渾天儀、光之方尖碑。

需要更準的背面時,接著貼「四視圖」指令,一次拿到前、左、後、右四張一致的圖。

### 2. 轉成 3D

| 工具 | 特點 | 適合 |
|---|---|---|
| **Tripo** | 綜合質素、工作流、API、多圖輸入最平衡 | 首選,尤其用四視圖時 |
| **Meshy 6** | 最普及;水密幾何、Low Poly 模式、原生四邊面重拓撲 | 要放進遊戲或即時場景 |
| **Rodin Gen-2.5(Hyper3D)** | 幾何細節最豐富,可達千萬面 | 要做高精度雕塑或 3D 列印 |
| **Hunyuan3D(騰訊)** | 開源權重,可自行部署 | 要大量生成、控制成本 |
| **TRELLIS.2(微軟)** | 研究前沿 | 試驗 |

一般做法:上傳參考圖(或四視圖)→ 生成 → 選「帶貼圖」→ 匯出 **GLB**。

### 3. 優化

放進網頁前,模型要瘦身。建議上限:5 萬個三角面、2K 貼圖、單檔 10 MB 以內。

```bash
# 需要 Node.js;一次過做去重、焊接、簡化、貼圖轉 WebP
npx @gltf-transform/cli optimize input.glb assets/models/121.glb --texture-compress webp --simplify-ratio 0.5
```

app 已接上 Draco 解碼器,Draco 壓縮的 GLB 在一般網頁可直接讀;但在 claude.ai 的 Artifact 內,外部解碼檔案會被擋,所以要在 Artifact 內展示的模型,優化時請不要用 Draco 壓縮。

### 4. 放進 app

- 即時試看:把 `.glb` 拖到立體台,或按「GLB 模型」。
- 永久加入:放到 `assets/models/{編號}.glb`,在 `assets/manifest.js` 加 `model: "assets/models/121.glb"`。有模型時,立體台會優先顯示模型,並自動置中、縮放、打光、緩慢旋轉。

### 5. 可選:Blender 修整

image-to-3D 的模型常見問題與修法:

| 問題 | 修法 |
|---|---|
| 底部破洞、懸空碎片 | Blender:Select Linked → 刪除碎片;Fill Holes |
| 貼圖接縫明顯 | 用工具內建的 re-texture,或在 Blender 以 Texture Paint 補 |
| 方向不對 | 旋轉後 Apply Transform(Ctrl+A)再匯出 |
| 太多面 | Decimate 修改器(Ratio 0.3–0.5) |

---

## L3 · 3D 場景(路線圖)

下一步是把「環」本身變成場景,而不只是一粒粒晶體:

- **Gaussian Splatting**:用手機繞著真實的天后廟、祖先神台拍一圈影片,用 Luma、Polycam 或 Postshot 生成 splat,再以 three.js 的 splat 載入器放進星宇的對應環。「信」與「念」兩環會變成真實空間。
- **3D 世界生成**:把第 3 節的七環主視覺交給「圖生 3D 場景」類工具,生成可環視的背景,作為每一環的天空盒。
- **星宇替換**:79 位已立傳靈體都有 GLB 之後,星宇的晶體可按距離切換:遠看是晶體,拉近就換成模型(Level of Detail)。

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
