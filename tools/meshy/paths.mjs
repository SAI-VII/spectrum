/* 共用路徑與小工具 */
import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
export const { load, ROOT } = require("../lib/codex.cjs");

export const P = {
  refs: path.join(ROOT, "assets/refs"),
  raw: path.join(ROOT, "assets/models/raw"),
  models: path.join(ROOT, "assets/models"),
  lod: path.join(ROOT, "assets/models/lod"),
  thumbs: path.join(ROOT, "assets/thumbs"),
  manifest: path.join(ROOT, "assets/models.js"),
  state: path.join(ROOT, "tools/meshy/state.json"),
};
for (const d of [P.raw, P.models, P.lod, P.thumbs, P.refs]) fs.mkdirSync(d, { recursive: true });

export const exists = f => { try { fs.accessSync(f); return true; } catch { return false; } };
export const sleep = ms => new Promise(r => setTimeout(r, ms));

/* 解析 --key value / --flag 形式的參數 */
export function args(argv = process.argv.slice(2)) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const k = a.slice(2), n = argv[i + 1];
    if (n === undefined || n.startsWith("--")) o[k] = true; else { o[k] = n; i++; }
  }
  return o;
}

/* 依 --only / --band / --flagship / --limit 篩選靈體;預設次序:已立傳優先,再按環、按權能 */
export function select(C, o) {
  const order = C.BANDS.map(b => b.key);
  let list = [...C.ENTITIES].sort((a, b) => (b.flagship - a.flagship) || (order.indexOf(a.band) - order.indexOf(b.band)) || (b.radar[0] - a.radar[0]));
  if (o.only) { const s = new Set(String(o.only).split(",").map(Number)); list = list.filter(e => s.has(e.rank)); }
  if (o.band) { const s = new Set(String(o.band).split(",")); list = list.filter(e => s.has(e.band)); }
  if (o.flagship) list = list.filter(e => e.flagship);
  if (o.limit) list = list.slice(0, Number(o.limit));
  return list;
}

export function readState() {
  try { return JSON.parse(fs.readFileSync(P.state, "utf8")); } catch { return { version: 1, entities: {} }; }
}
export function writeState(s) {
  const tmp = P.state + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(s, null, 2));
  fs.renameSync(tmp, P.state);
}
