/* 掃描 assets/ 內已有的模型與縮圖,寫出 assets/models.js(app 會自動讀取)。
   用法:node tools/meshy/manifest.mjs
         node tools/meshy/manifest.mjs --lite   只登記輕量版與縮圖(發佈到容量有限的地方,例如 Artifact) */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { P, ROOT, exists, readState } from "./paths.mjs";

export function writeManifest({ lite = false } = {}) {
  const st = readState().entities || {};
  const rel = f => path.relative(ROOT, f).split(path.sep).join("/");
  const out = {};
  const ranks = new Set();
  for (const d of [P.models, P.lod, P.thumbs]) for (const f of fs.readdirSync(d)) { const m = f.match(/^(\d+)\./); if (m) ranks.add(+m[1]); }
  for (const r of [...ranks].sort((a, b) => a - b)) {
    const e = {};
    const glb = path.join(P.models, `${r}.glb`), lod = path.join(P.lod, `${r}.glb`);
    const thumb = ["webp", "png"].map(x => path.join(P.thumbs, `${r}.${x}`)).find(exists);
    if (exists(glb) && !lite) e.glb = rel(glb);
    if (exists(lod)) e.lod = rel(lod);
    if (thumb) e.thumb = rel(thumb);
    const s = st[r];
    if (s?.mode) e.source = `meshy ${s.model || ""} ${s.mode}`.replace(/\s+/g, " ").trim();
    if (Object.keys(e).length) out[r] = e;
  }
  const js = `/* 由 tools/meshy/manifest.mjs 自動產生,請勿手改。
   每位靈體的 3D 模型與縮圖:glb = 抽屜立體台(高質),lod = 星宇 3D(輕量),thumb = 圖鑑印記旁的縮圖。 */
window.SPECTRUM_MODELS = ${JSON.stringify(out, null, 1)};
`;
  fs.writeFileSync(P.manifest, js);
  return Object.keys(out).length;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const lite = process.argv.includes("--lite");
  console.log(`assets/models.js:${writeManifest({ lite })} 位靈體有 3D 素材${lite ? "(只登記輕量版)" : ""}`);
}
