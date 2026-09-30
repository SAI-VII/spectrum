/* 為每個優化後的模型渲染統一風格的縮圖:assets/thumbs/{編號}.webp(透明背景,384×384)。
 * 同一鏡頭(3/4 前側、微俯)、同一燈光(暖白主光 ＋ 所屬環色的輪廓光)、同一陰影,令整部圖鑑一致。
 *
 *   cd tools/meshy && npm install && npx playwright install chromium   (第一次)
 *   node tools/meshy/thumbs.mjs            只渲染未有縮圖的
 *   node tools/meshy/thumbs.mjs --force    全部重新渲染
 *   node tools/meshy/thumbs.mjs --chromium /path/to/chrome  指定瀏覽器 */
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { chromium } from "playwright";
import sharp from "sharp";
import { load, P, ROOT, exists, args } from "./paths.mjs";
import { writeManifest } from "./manifest.mjs";

const o = args(), C = load();
const HEX = Object.fromEntries(Object.entries(C.BAND_ART).map(([k, v]) => [k, v.hex]));
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".glb": "model/gltf-binary", ".json": "application/json", ".wasm": "application/wasm" };

const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!f.startsWith(ROOT) || !exists(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({
  executablePath: o.chromium || process.env.CHROMIUM_PATH || undefined,
  args: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
});
const page = await browser.newPage({ viewport: { width: 768, height: 768 } });
page.on("pageerror", e => console.error("頁面錯誤:", e.message));
await page.goto(`http://127.0.0.1:${port}/tools/meshy/thumb.html`);
await page.waitForFunction(() => window.thumbReady === true, null, { timeout: 30000 });

let n = 0;
const files = fs.readdirSync(P.models).filter(f => /^\d+\.glb$/.test(f))
  .filter(f => !o.only || String(o.only).split(",").includes(f.replace(".glb", "")));
for (const f of files) {
  const rank = +f.replace(".glb", ""), out = path.join(P.thumbs, `${rank}.webp`);
  if (!o.force && exists(out) && fs.statSync(out).mtimeMs > fs.statSync(path.join(P.models, f)).mtimeMs) continue;
  const e = C.ENTITIES.find(x => x.rank === rank); if (!e) continue;
  try {
    const url = await page.evaluate(([u, h]) => window.renderThumb(u, h), [`/assets/models/${f}`, HEX[e.band]]);
    const png = Buffer.from(url.split(",")[1], "base64");
    await sharp(png).trim({ threshold: 1 }).resize(384, 384, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 88, alphaQuality: 90 }).toFile(out);
    console.log(`#${rank} ${e.cn} ✓`); n++;
  } catch (err) { console.error(`#${rank} 失敗:${err.message}`); }
}
await browser.close(); server.close();
console.log(`\n渲染 ${n} 張縮圖;assets/models.js:${writeManifest()} 位靈體有 3D 素材。`);
