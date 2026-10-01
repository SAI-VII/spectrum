# 用 Meshy 把全部 237 位靈體 3D 化

這份是操作手冊。流程已經寫成程式(`tools/meshy/`),你只需要準備金鑰、按次序執行四條指令。所有步驟都可以中斷後再執行,已完成的會略過,已提交的任務會繼續追蹤,不會重複扣點數。

```
ChatGPT 參考圖(可選) ─┐
                       ├─► generate.mjs ─► optimize.mjs ─► thumbs.mjs ─► app 自動讀取
視覺正典 canon.js ─────┘   Meshy API       兩個網頁版本     統一縮圖       assets/models.js
```

---

## 0. 準備(一次)

1. **Meshy API 金鑰**:Meshy 網站 → API → Create API Key。Pro(每月 1,000 點)與 Studio(每月 4,000 點)都包含 API。
2. **Node.js 20 或以上**。
3. 安裝工具:

   ```bash
   cd tools/meshy
   npm install
   npx playwright install chromium     # 縮圖渲染用
   ```

4. 把金鑰放進環境變數(不要寫進任何檔案):

   ```bash
   export MESHY_API_KEY=msy_你的金鑰          # macOS / Linux
   setx MESHY_API_KEY msy_你的金鑰            # Windows(開新視窗後生效)
   ```

## 1. 試跑:不扣點數

```bash
node tools/meshy/generate.mjs --test --only 121
```

`--test` 用 Meshy 官方的測試金鑰,會回傳示範模型、不扣點數。這一步只為確認網絡、下載與後續步驟都正常。完成後刪除 `tools/meshy/state.json` 與 `assets/models/raw/121.glb`,以免示範模型混入正式結果。

## 2. 乾跑:看計劃與點數

```bash
node tools/meshy/generate.mjs --dry-run                # 全部 237 位
node tools/meshy/generate.mjs --dry-run --flagship     # 只看 79 位已立傳
node tools/meshy/generate.mjs --dry-run --band folk --show 10
```

會列出每位用哪種模式、預計扣多少點數,以及頭幾段 Meshy 指令。不會呼叫 API。

## 3. 生成

三條路線,可以混用。程式會按每位靈體手上有甚麼素材自動選擇(`--mode auto`)。

| 路線 | 你要做的事 | Meshy 端點 | 質素 | 點數/位 |
|---|---|---|---|---|
| **A · 全自動** | 甚麼都不用做 | Text to 3D(preview ＋ refine) | 好,形體由文字決定 | 30 |
| **B · 參考圖** | 用 ChatGPT 生成灰底雕像圖,存 `assets/refs/{編號}.png` | Image to 3D | 最好,形體與配色可控 | 30 |
| **C · 四視圖** | 再生成前、右、後、左四張,存 `assets/refs/{編號}/front.png` 等 | Multi-Image to 3D | 背面最準 | 30 |

**建議做法**:79 位已立傳的走 B(或 C),其餘 158 位走 A。

```bash
# 第一個月:已立傳 79 位,設上限避免超支
node tools/meshy/generate.mjs --flagship --budget 2600

# 第二個月:其餘 158 位
node tools/meshy/generate.mjs --budget 4800
```

B 路線的參考圖指令已按環分批寫好:[`prompts/refs/`](prompts/refs/)。每段一次生成 4 張,下載後按清單上的編號存檔即可。

### 常用參數

| 參數 | 預設 | 說明 |
|---|---|---|
| `--only 121,2` | — | 只處理這些編號 |
| `--band folk` | — | 只處理某一環(law、sovereign、edge、folk、kin、threshold、matter) |
| `--flagship` | — | 只處理已立傳的 79 位 |
| `--limit 20` | — | 最多處理幾位 |
| `--mode` | auto | auto、text、image、multi |
| `--budget 2000` | 無上限 | 本次最多提交多少點數的任務 |
| `--model` | latest | Meshy 模型;latest 目前即 meshy-7.1 |
| `--polycount` | 100000 | Meshy 產出的面數(100–300,000);網頁版會另外減面 |
| `--topology` | triangle | triangle 或 quad |
| `--texture` | Meshy 預設 | 2k、4k、8k(8k 每位多 5 點) |
| `--geometry` | Meshy 預設 | standard、2k、4k(2k/4k 每位多 5 點,4k 需 meshy-7.1) |
| `--no-pbr` | — | 不要金屬度、粗糙度、法線貼圖 |
| `--concurrency` | 8 | 同時追蹤幾個任務;Pro 佇列上限 10、Studio 20 |
| `--redo` | — | 已完成的也重新生成(配合 `--only` 用來重做個別靈體) |
| `--yes` | — | 略過開始前的確認 |

## 4. 優化成網頁版本

```bash
node tools/meshy/optimize.mjs
```

每個原始模型(`assets/models/raw/`,通常 5–50 MB)產生兩個版本:

| 版本 | 位置 | 用途 | 規格 | 約大小 |
|---|---|---|---|---|
| 展示版 | `assets/models/{編號}.glb` | 抽屜立體台 | ≤ 60,000 面、貼圖 ≤ 2048 WebP、頂點量化 | 1–4 MB |
| 輕量版 | `assets/models/lod/{編號}.glb` | 星宇 3D | ≤ 4,000 面、貼圖 256 WebP、頂點量化 | 50–150 KB |

兩者都已置中、腳底對齊原點。輸出只用瀏覽器原生讀得懂的格式(WebP 貼圖、KHR_mesh_quantization 頂點量化),不需要任何解碼器,所以在 claude.ai Artifact 這類嚴格環境也能載入。輸入是 Draco 壓縮的 GLB 也可以,會自動解壓。

自架網站(例如 GitHub Pages)想檔案再細一半,可加 `--meshopt`;但 Meshopt 要用 WebAssembly 解碼,在 Artifact 內會載入失敗。

### 已經有 GLB?(例如在 Meshy 網站逐個生成)

```bash
node tools/meshy/import.mjs ~/Downloads/meshy --dry-run    # 先看配對
node tools/meshy/import.mjs ~/Downloads/meshy --build      # 匯入、優化、渲染縮圖一次做完
node tools/meshy/import.mjs Meshy_AI_xxx.glb --as 121       # 認不出的,指定編號
```

程式按檔名配對靈體:檔名以編號開頭(`121.glb`、`#121 天后.glb`),或檔名包含靈體的英文或中文名(Meshy 的檔名通常含指令開頭幾個字,例如 `Meshy_AI_Collectible_statue_of_Tin_Hau_…`)。配對成功的複製到 `assets/models/raw/{編號}.glb`。只放進 `assets/models/` 而沒有改成編號檔名的 GLB,app 是不會讀到的。

## 5. 渲染統一縮圖

```bash
node tools/meshy/thumbs.mjs
```

每位一張 384×384 透明背景 WebP(`assets/thumbs/`):同一鏡頭(3/4 前側、微俯)、同一暖白主光、所屬環色的輪廓光、同一接觸陰影。圖鑑的印記位置會改顯雕像縮圖,六軸印記縮到右下角。

## 6. 在 app 內檢查

四條指令都會自動更新 `assets/models.js`。用本機伺服器開啟 app:

```bash
python3 -m http.server 8000     # 然後打開 http://localhost:8000
```

- **圖鑑**:印記換成雕像縮圖,頁尾顯示「3D 化 n / 237」。
- **抽屜**:立體台以展示櫃呈現模型,可拖曳旋轉、滾輪縮放、全螢幕。
- **星宇 3D**:按離鏡頭遠近逐個載入雕像(手機上限 80 座)。

逐位按 [`visual-excellence.md` 的品質檢查表](visual-excellence.md#5-每一座雕像的品質檢查表)過一次,不合格的重做:

```bash
node tools/meshy/generate.mjs --only 44 --redo
node tools/meshy/optimize.mjs --only 44 --force
node tools/meshy/thumbs.mjs --only 44 --force
```

## 7. 提交與發佈

```bash
git add assets/models assets/thumbs assets/models.js assets/refs tools/meshy/state.json
git commit -m "Add Meshy models"
```

`assets/models/raw/` 已在 `.gitignore`,原始高模只留在你的電腦。

237 位的展示版合共約 300–600 MB。GitHub 單一檔案上限 100 MB、倉庫建議 1 GB 以內,放得下;但 claude.ai Artifact 每個版本上限 256 MB,所以:

- **GitHub Pages**(免費):完整體驗,抽屜用展示版。
- **Artifact**:只放輕量版與縮圖(約 25 MB),抽屜與星宇都用輕量版。

---

## 點數與時間

| 項目 | 點數 |
|---|---|
| Text to 3D(preview 20 ＋ refine 10) | 30 |
| Image / Multi-Image to 3D(含貼圖) | 30 |
| 8K 貼圖 | +5 |
| geometry 2k / 4k | +5 |
| Remesh | 5 |
| Auto-Rigging / 每段動畫 | 5 / 3 |

**全部 237 位 ≈ 7,110 點**(加 geometry 2k ≈ 8,300 點),再預留約 10% 給重做。

- Pro(1,000 點/月):約 8 個月,或另購點數。
- Studio(4,000 點/月):約 2 個月。
- 每個任務約 1–3 分鐘;Studio 佇列 20 個並行,全部跑完約 1–2 小時。

點數價目取自 Meshy 公佈的 API 價目(2026 年 9 月),以你帳戶實際扣數為準;`generate.mjs` 開始時會顯示帳戶餘額。

---

## GLB 匯入不了?

在 app 打開該靈體,立體台會用紅框寫出原因。對照下表:

| 立體台顯示 | 原因 | 處理 |
|---|---|---|
| 這是 FBX / OBJ / STL / 壓縮檔,不是 GLB | 下載時選錯格式,或改了副檔名 | 在 Meshy 的下載選單選 **GLB**;zip 先解壓 |
| .gltf 檔需要旁邊的 .bin 與貼圖檔 | 匯出成多檔的 glTF | 匯出時選 glTF Binary(.glb) |
| 這個 GLB 用了 Draco 壓縮 | 嚴格環境(claude.ai Artifact)載入不到 Draco 解碼器 | `node tools/meshy/import.mjs 檔案 --build`,輸出不再用 Draco |
| 這個 GLB 用了 Meshopt 壓縮 | 嚴格環境不准 WebAssembly | 重新執行 `optimize.mjs`(預設已不用 Meshopt) |
| 貼圖是 KTX2 格式 | 這裏讀不到 KTX2 | 重新執行 `optimize.mjs`,會轉成 WebP |
| 以 file:// 直接打開網頁 | 雙擊 index.html 開啟時,瀏覽器不准讀取模型檔 | `python3 -m http.server 8000` 再開 http://localhost:8000,或把 GLB 直接拖進立體台 |
| 找不到檔案 assets/models/… | 登記冊的路徑或檔名不對 | 用 `import.mjs` 匯入,或執行 `node tools/meshy/manifest.mjs` 重寫登記冊 |
| 這個 GLB 檔不完整 | 下載未完成 | 重新下載 |
| 瀏覽器未能儲存,重新整理後不會保留 | 私密瀏覽或儲存空間不足 | 改用 `import.mjs` 把檔案放進專案 |

另外兩個常見情況:

- **選檔時 .glb 是灰色、選不到**(iPhone、部分 Android):已修正,「GLB 模型」按鈕不再限制檔案類型,改為讀檔頭判斷。
- **模型出現但很慢或手機當機**:Meshy 原檔常有 4K/8K 貼圖與數十萬面。立體台會自動把貼圖縮到手機可承受的大小,但最好先用 `import.mjs --build` 產生網頁版本。

## 疑難

| 情況 | 處理 |
|---|---|
| `HTTP 401` | 金鑰錯或未設定 `MESHY_API_KEY` |
| `HTTP 402` 或提示點數不足 | 充值或等下月;已完成的不受影響,之後再執行會接著做 |
| 大量 `429` | 程式會自動等待;可把 `--concurrency` 調低 |
| 某位失敗 | 再執行同一指令即自動重試;原因寫在 `tools/meshy/state.json` |
| 下載連結過期 | 再執行即可:程式會重新向 Meshy 取該任務的新連結 |
| 模型有浮空碎片、背面怪異 | 改走 B 或 C 路線;參考圖指令已要求「一件連體實心雕塑」 |
| 臉部崩壞 | 參考圖改用更近的鏡頭、或在 canon.js 把該靈體的姿態改得更簡單,再 `--redo` |
| 想換整體材質 | 改 `src/data/lore.js` 的 `BAND_ART[環].statue`,重新執行 `node tools/gen-prompts.js` |

---

資料來源:
[Meshy API 價目與點數](https://help.meshy.ai/en/articles/16815622-how-many-credits-does-each-meshy-api-task-cost) ·
[Meshy API Changelog(meshy-7.1、geometry_resolution、texture_resolution)](https://docs.meshy.ai/en/api/changelog) ·
[Meshy Rate Limits](https://docs.meshy.ai/en/api/rate-limits) ·
[Meshy Text to 3D API](https://docs.meshy.ai/en/api/text-to-3d) ·
[Meshy Image to 3D API](https://docs.meshy.ai/en/api/image-to-3d) ·
[Meshy Multi-Image to 3D API](https://docs.meshy.ai/en/api/multi-image-to-3d) ·
[Meshy-guide(官方測試金鑰)](https://github.com/meshy-dev/Meshy-guide)
