/* 匯入你自己下載的 GLB(例如在 Meshy 網站逐個生成、檔名是 Meshy_AI_Tin_Hau_0930.glb 這類)。
 *
 *   node tools/meshy/import.mjs ~/Downloads/meshy               整個資料夾
 *   node tools/meshy/import.mjs a.glb b.glb --dry-run            只看配對,不複製
 *   node tools/meshy/import.mjs ~/Downloads/meshy --build        配對後立即優化與渲染縮圖
 *   node tools/meshy/import.mjs Meshy_AI_xxx.glb --as 121        指定編號
 *
 * 配對次序:① 檔名以編號開頭(121.glb、121_tinhau.glb、#121 天后.glb)
 *           ② 檔名包含靈體英文名或中文名(取最長的那個,避免 Pan 配到 Pandora)
 *           檔名中間的數字(Meshy 的日期、時間)不會被當成編號。
 * 配對成功的檔案複製到 assets/models/raw/{編號}.glb,之後照常執行 optimize.mjs 與 thumbs.mjs。 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { load, P, ROOT, args } from "./paths.mjs";

const o = args();
const C = load();
const VALUED = new Set(["--as", "--chromium"]);
const inputs = process.argv.slice(2).filter((a, i, arr) => !a.startsWith("--") && !VALUED.has(arr[i - 1]));
if (!inputs.length) { console.error("用法:node tools/meshy/import.mjs <資料夾或 .glb 檔> [--dry-run] [--build] [--as 編號]"); process.exit(1); }

const files = inputs.flatMap(p => {
  if (!fs.existsSync(p)) { console.error(`找不到 ${p}`); return []; }
  return fs.statSync(p).isDirectory() ? fs.readdirSync(p).map(f => path.join(p, f)) : [p];
}).filter(f => fs.statSync(f).isFile() && /\.(glb|gltf|fbx|obj|usdz|stl|zip)$/i.test(f));

const norm = s => String(s || "").toLowerCase().normalize("NFKC").replace(/[\s_\-.()（）·'’]/g, "");
const names = C.ENTITIES.flatMap(e => {
  const en = (e.en || "").replace(/\s*\([^)]*\)/g, "");
  return [en, e.en, e.cn, e.cn.replace(/（.*?）/g, "")].filter(Boolean).map(n => ({ e, key: norm(n) })).filter(x => x.key.length >= 3 || /[一-鿿]{2,}/.test(x.key));
});

function match(file) {
  if (o.as) return { e: C.ENTITIES.find(x => x.rank === Number(o.as)), how: "指定" };
  const base = path.basename(file).replace(/\.[^.]+$/, "");
  const lead = base.match(/^#?(\d{1,3})(?:[^0-9]|$)/);
  if (lead) { const e = C.ENTITIES.find(x => x.rank === Number(lead[1])); if (e) return { e, how: `編號 ${lead[1]}` }; }
  const b = norm(base);
  const hits = names.filter(x => b.includes(x.key)).sort((a, z) => z.key.length - a.key.length);
  if (!hits.length) return null;
  const best = hits.filter(h => h.key.length === hits[0].key.length && h.e !== hits[0].e);
  if (best.length) return { ambiguous: [hits[0].e, ...best.map(h => h.e)] };
  return { e: hits[0].e, how: `名稱「${hits[0].key}」` };
}

const head = f => { const b = Buffer.alloc(32); const fd = fs.openSync(f, "r"); fs.readSync(fd, b, 0, 32, 0); fs.closeSync(fd); return b.toString("latin1"); };

let ok = 0;
const used = new Map();
for (const f of files) {
  const name = path.basename(f), h = head(f);
  if (!h.startsWith("glTF")) {
    const kind = h.startsWith("Kaydara FBX") ? "FBX" : h.startsWith("PK") ? "壓縮檔" : h.trimStart().startsWith("{") ? ".gltf(需要旁邊的 .bin 與貼圖)" : "非 GLB";
    console.log(`✗ ${name}:${kind},請在 Meshy 下載 GLB 格式`); continue;
  }
  const m = match(f);
  if (!m) { console.log(`? ${name}:認不出是哪一位,請把檔名改成編號(例如 121.glb)或用 --as 編號`); continue; }
  if (m.ambiguous) { console.log(`? ${name}:同時像 ${m.ambiguous.map(e => `#${e.rank} ${e.cn}`).join("、")},請用 --as 編號`); continue; }
  if (used.has(m.e.rank)) { console.log(`? ${name}:#${m.e.rank} 已由 ${used.get(m.e.rank)} 佔用,略過`); continue; }
  used.set(m.e.rank, name);
  const dst = path.join(P.raw, `${m.e.rank}.glb`);
  console.log(`✓ ${name} → #${m.e.rank} ${m.e.cn}(${m.how})${fs.existsSync(dst) ? ",取代舊檔" : ""}`);
  if (!o["dry-run"]) fs.copyFileSync(f, dst);
  ok++;
}
console.log(`\n${o["dry-run"] ? "可匯入" : "已匯入"} ${ok} / ${files.length} 個檔案到 assets/models/raw/`);
if (ok && !o["dry-run"]) {
  if (o.build) {
    const only = ["--only", [...used.keys()].join(","), "--force"];
    execFileSync(process.execPath, [path.join(ROOT, "tools/meshy/optimize.mjs"), ...only], { stdio: "inherit" });
    execFileSync(process.execPath, [path.join(ROOT, "tools/meshy/thumbs.mjs"), ...only, ...(o.chromium ? ["--chromium", o.chromium] : [])], { stdio: "inherit" });
  } else console.log("下一步:node tools/meshy/optimize.mjs,然後 node tools/meshy/thumbs.mjs(或加 --build 一次做完)");
}
