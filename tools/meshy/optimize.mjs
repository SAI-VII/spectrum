/* 把 Meshy 原始高模轉成網頁用的兩個版本:
 *   assets/models/{編號}.glb       抽屜立體台用:≤ 60,000 三角面、貼圖 ≤ 2048 WebP
 *   assets/models/lod/{編號}.glb   星宇 3D 用:  ≤ 4,000 三角面、貼圖 256 WebP
 * 兩者都先置中、把腳底放在原點,方便 app 統一擺放。
 * 輸入可以是 Draco 壓縮的 GLB;輸出預設用 KHR_mesh_quantization(瀏覽器不需任何解碼器)。
 *
 *   cd tools/meshy && npm install          (第一次)
 *   node tools/meshy/optimize.mjs          處理所有未優化的模型
 *   node tools/meshy/optimize.mjs --only 121 --force
 *
 *   node tools/meshy/optimize.mjs --meshopt   改用 Meshopt 壓縮(檔案再細一半,但瀏覽器要用 WebAssembly 解碼;
 *                                            claude.ai Artifact 這類嚴格環境不准,只適合自架網站)
 * 不用 Draco 與 KTX2:兩者的解碼器要額外下載,在嚴格環境同樣會被擋。 */
import fs from "node:fs";
import path from "node:path";
import { NodeIO, Logger } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, weld, simplify, textureCompress, meshopt, quantize, reorder, center, getBounds } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier } from "meshoptimizer";
import sharp from "sharp";
import draco3d from "draco3dgltf";
import { P, exists, args } from "./paths.mjs";
import { writeManifest } from "./manifest.mjs";

const o = args();
const LEVELS = [
  { name: "showcase", dir: P.models, tris: Number(o.tris || 60000), tex: Number(o.tex || 2048), error: 0.0015 },
  { name: "lod", dir: P.lod, tris: Number(o["lod-tris"] || 4000), tex: Number(o["lod-tex"] || 256), error: 0.02 }
];

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  "meshopt.encoder": MeshoptEncoder, "meshopt.decoder": MeshoptDecoder,
  "draco3d.decoder": await draco3d.createDecoderModule()   // 讀得到 Draco 壓縮的輸入
});

const triCount = doc => doc.getRoot().listMeshes().reduce((n, m) => n + m.listPrimitives().reduce((k, p) => {
  const idx = p.getIndices(), pos = p.getAttribute("POSITION");
  return k + (idx ? idx.getCount() : pos ? pos.getCount() : 0) / 3;
}, 0), 0);

async function build(src, level) {
  const doc = await io.read(src);
  doc.setLogger(new Logger(Logger.Verbosity.WARN));
  const before = triCount(doc);
  await doc.transform(
    dedup(), prune(), weld(),
    center({ pivot: "below" }),
    simplify({ simplifier: MeshoptSimplifier, ratio: Math.min(1, level.tris / Math.max(before, 1)), error: level.error }),
    textureCompress({ encoder: sharp, targetFormat: "webp", resize: [level.tex, level.tex], quality: level.name === "lod" ? 70 : 85 }),
    prune(),
    ...(o.meshopt ? [meshopt({ encoder: MeshoptEncoder, level: "medium" })]
                  : [reorder({ encoder: MeshoptEncoder }), quantize()])
  );
  /* 輸入若用了 Draco,輸出時拿走這個擴充(資料已解壓) */
  doc.getRoot().listExtensionsUsed().filter(x => x.extensionName === "KHR_draco_mesh_compression").forEach(x => x.dispose());
  const out = path.join(level.dir, path.basename(src));
  await io.write(out, doc);
  const box = getBounds(doc.getRoot().listScenes()[0]);
  return { before, after: triCount(doc), bytes: fs.statSync(out).size, height: box.max[1] - box.min[1] };
}

const files = fs.readdirSync(P.raw).filter(f => /^\d+\.glb$/.test(f))
  .filter(f => !o.only || String(o.only).split(",").includes(f.replace(".glb", "")));
let n = 0;
for (const f of files) {
  const src = path.join(P.raw, f);
  const todo = LEVELS.filter(l => o.force || !exists(path.join(l.dir, f)) || fs.statSync(path.join(l.dir, f)).mtimeMs < fs.statSync(src).mtimeMs);
  if (!todo.length) continue;
  for (const l of todo) {
    try {
      const r = await build(src, l);
      console.log(`#${f.replace(".glb", "").padEnd(4)} ${l.name.padEnd(8)} ${Math.round(r.before).toLocaleString().padStart(9)} → ${Math.round(r.after).toLocaleString().padStart(7)} 面 · ${(r.bytes / 1024).toFixed(0).padStart(5)} KB`);
    } catch (err) { console.error(`#${f} ${l.name} 失敗:${err.message}`); }
  }
  n++;
}
console.log(`\n優化 ${n} 個模型;assets/models.js:${writeManifest()} 位靈體有 3D 素材。下一步:node tools/meshy/thumbs.mjs`);
