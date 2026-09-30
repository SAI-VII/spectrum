/* 用 Meshy API 把靈體批量 3D 化。
 *
 *   MESHY_API_KEY=msy_xxx node tools/meshy/generate.mjs --dry-run          先看計劃與預計點數
 *   MESHY_API_KEY=msy_xxx node tools/meshy/generate.mjs --flagship --budget 2400
 *   node tools/meshy/generate.mjs --test --only 121                          用 Meshy 官方測試金鑰,不扣點數
 *
 * 每位靈體自動選來源(--mode auto):
 *   multi  assets/refs/{編號}/ 內有 2–4 張視圖(front / right / back / left)→ Multi-Image to 3D
 *   image  assets/refs/{編號}.png|jpg|webp → Image to 3D
 *   text   沒有參考圖 → Text to 3D(先 preview 生網格,再 refine 上貼圖)
 *
 * 可以隨時中斷再執行:已提交的任務會繼續追蹤,不會重複扣點;已完成的會略過(除非 --redo)。
 * 結果:assets/models/raw/{編號}.glb(原始高模)。之後執行 optimize.mjs 與 thumbs.mjs。 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { load, P, exists, sleep, args, select, readState, writeState } from "./paths.mjs";
import { writeManifest } from "./manifest.mjs";

const o = args();
const C = load();
const TEST_KEY = "msy_dummy_api_key_for_test_mode_12345678";  // Meshy 官方測試金鑰:回傳示範模型,不扣點數
const KEY = o.test ? TEST_KEY : process.env.MESHY_API_KEY;
const BASE = (process.env.MESHY_BASE_URL || "https://api.meshy.ai").replace(/\/$/, "");
const CONC = Math.max(1, Number(o.concurrency || 8));
const POLL_MS = Number(o.poll || 10000);
const SETTINGS = {
  ai_model: o.model || "latest",                 // latest = 目前的 meshy-7.1
  topology: o.topology || "triangle",
  target_polycount: Number(o.polycount || 100000),
  enable_pbr: !o["no-pbr"],
  texture_resolution: o.texture || null,         // "2k" | "4k" | "8k"
  geometry_resolution: o.geometry || null        // "standard" | "2k" | "4k"(4k 需 meshy-7.1)
};

/* 預計點數(Meshy 公佈的 API 價目,2026 年 9 月):
   Text to 3D:preview 20 + refine 10(8K 貼圖 15);Image / Multi-Image(含貼圖)30(8K 35);
   geometry_resolution 2k / 4k 每次 +5。實際以 Meshy 帳戶扣數為準。 */
function estimate(mode) {
  const hi = SETTINGS.texture_resolution === "8k" ? 5 : 0;
  const geo = SETTINGS.geometry_resolution && SETTINGS.geometry_resolution !== "standard" ? 5 : 0;
  if (mode === "text") return 20 + geo + 10 + hi;
  return 30 + hi + geo;
}

const EXT = ["png", "jpg", "jpeg", "webp"];
const MIME = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp" };
const VIEWS = ["front", "right", "back", "left"];
function refsFor(rank) {
  const dir = path.join(P.refs, String(rank));
  const views = exists(dir) ? VIEWS.map(v => EXT.map(x => path.join(dir, `${v}.${x}`)).find(exists)).filter(Boolean) : [];
  const single = EXT.map(x => path.join(P.refs, `${rank}.${x}`)).find(exists);
  return { views, single };
}
function pickMode(e) {
  const r = refsFor(e.rank), want = o.mode || "auto";
  if (want === "multi") return r.views.length >= 2 ? "multi" : null;
  if (want === "image") return r.single || r.views[0] ? "image" : null;
  if (want === "text") return "text";
  return r.views.length >= 2 ? "multi" : (r.single ? "image" : "text");
}
const dataUri = f => {
  const buf = fs.readFileSync(f);
  if (buf.length > 20 * 1024 * 1024) throw new Error(`${path.basename(f)} 超過 Meshy 的 20 MB 上限`);
  return `data:${MIME[path.extname(f).slice(1).toLowerCase()]};base64,${buf.toString("base64")}`;
};

/* ───── HTTP ───── */
async function api(method, url, body) {
  for (let attempt = 0; ; attempt++) {
    let res;
    try {
      res = await fetch(BASE + url, {
        method, headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined
      });
    } catch (err) {
      if (attempt < 5) { await sleep(2000 * 2 ** attempt); continue; }
      throw new Error(`網絡錯誤:${err.message}`);
    }
    const text = await res.text();
    let json = null; try { json = JSON.parse(text); } catch {}
    if (res.status === 429) {
      /* NoMoreConcurrentTasks = 佇列已滿(Pro 10、Studio 20);RateLimitExceeded = 每秒請求太多 */
      const queue = /NoMoreConcurrentTasks/i.test(text);
      await sleep(queue ? 20000 : 2000);
      continue;
    }
    if (res.status >= 500 && attempt < 5) { await sleep(3000 * 2 ** attempt); continue; }
    if (!res.ok) {
      const msg = json?.message || text.slice(0, 300);
      const err = new Error(`HTTP ${res.status}:${msg}`); err.status = res.status; throw err;
    }
    return json;
  }
}
const ENDPOINT = {
  text: { create: "/openapi/v2/text-to-3d", get: id => `/openapi/v2/text-to-3d/${id}` },
  image: { create: "/openapi/v1/image-to-3d", get: id => `/openapi/v1/image-to-3d/${id}` },
  multi: { create: "/openapi/v1/multi-image-to-3d", get: id => `/openapi/v1/multi-image-to-3d/${id}` }
};
const clean = obj => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== ""));

function payload(e, mode, stage, previewId) {
  const common = clean({
    ai_model: SETTINGS.ai_model, topology: SETTINGS.topology, target_polycount: SETTINGS.target_polycount,
    should_remesh: true, geometry_resolution: SETTINGS.geometry_resolution
  });
  if (mode === "text" && stage === "preview") return { mode: "preview", prompt: C.meshyPrompt(e), ...common };
  if (mode === "text" && stage === "refine") return clean({
    mode: "refine", preview_task_id: previewId, enable_pbr: SETTINGS.enable_pbr,
    texture_prompt: C.meshyTexturePrompt(e), texture_resolution: SETTINGS.texture_resolution
  });
  const r = refsFor(e.rank);
  const tex = clean({ should_texture: true, enable_pbr: SETTINGS.enable_pbr, texture_resolution: SETTINGS.texture_resolution,
    texture_prompt: o["texture-prompt"] ? C.meshyTexturePrompt(e) : null });
  if (mode === "image") return { image_url: dataUri(r.single || r.views[0]), ...common, ...tex };
  if (mode === "multi") return { image_urls: r.views.slice(0, 4).map(dataUri), ...common, ...tex };
  throw new Error("unknown mode " + mode);
}

/* ───── 狀態 ───── */
const state = readState();
state.entities ||= {};
const save = () => writeState(state);
const S = rank => (state.entities[rank] ||= {});
let spent = 0, done = 0, failed = 0;
const budget = o.budget ? Number(o.budget) : Infinity;
const t0 = Date.now();
const log = (e, msg) => console.log(`${new Date().toISOString().slice(11, 19)}  #${String(e.rank).padEnd(4)} ${e.cn.padEnd(10, "　")} ${msg}`);

async function waitTask(e, mode, id) {
  let last = -1;
  for (;;) {
    const t = await api("GET", ENDPOINT[mode].get(id));
    if (t.progress !== undefined && t.progress !== last && t.progress % 25 === 0) { log(e, `${t.status} ${t.progress}%`); last = t.progress; }
    if (t.status === "SUCCEEDED") return t;
    if (t.status === "FAILED" || t.status === "CANCELED" || t.status === "EXPIRED") {
      throw new Error(`任務 ${t.status}:${t.task_error?.message || "未提供原因"}`);
    }
    await sleep(POLL_MS);
  }
}

async function download(url, file) {
  for (let i = 0; i < 4; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      return;
    } catch (err) { if (i === 3) throw err; await sleep(2000 * 2 ** i); }
  }
}

async function submit(e, mode, stage, previewId) {
  const cost = stage === "refine" ? 0 : estimate(mode);   // text 的 refine 點數已計入 estimate
  if (spent + cost > budget) throw Object.assign(new Error("已達本次預算上限"), { budget: true });
  const res = await api("POST", ENDPOINT[mode].create, payload(e, mode, stage, previewId));
  if (!res?.result) throw new Error("Meshy 沒有回傳任務編號");
  spent += cost;
  return res.result;
}

async function processOne(e) {
  const s = S(e.rank);
  const glbFile = path.join(P.raw, `${e.rank}.glb`);
  if (s.status === "done" && exists(glbFile) && !o.redo) return;
  if (o.redo && s.status === "done") { delete state.entities[e.rank]; save(); return processOne(e); }
  const mode = s.mode || pickMode(e);
  if (!mode) { log(e, `略過:--mode ${o.mode} 需要 assets/refs/ 內的參考圖`); return; }
  Object.assign(s, { mode, model: SETTINGS.ai_model, name: e.cn });
  try {
    let task;
    if (mode === "text") {
      if (!s.previewId) { s.previewId = await submit(e, "text", "preview"); s.status = "preview"; save(); log(e, `已提交 preview(Text to 3D)`); }
      if (!s.refineId) {
        await waitTask(e, "text", s.previewId);
        s.refineId = await submit(e, "text", "refine", s.previewId); s.status = "refine"; save(); log(e, "已提交 refine(上貼圖)");
      }
      task = await waitTask(e, "text", s.refineId);
    } else {
      if (!s.taskId) { s.taskId = await submit(e, mode, "single"); s.status = "running"; save(); log(e, `已提交(${mode === "multi" ? "Multi-Image" : "Image"} to 3D)`); }
      task = await waitTask(e, mode, s.taskId);
    }
    const url = task.model_urls?.glb;
    if (!url) throw new Error("任務完成但沒有 GLB 連結");
    await download(url, glbFile);
    if (task.thumbnail_url) await download(task.thumbnail_url, path.join(P.raw, `${e.rank}.thumb.png`)).catch(() => {});
    Object.assign(s, { status: "done", finishedAt: new Date().toISOString(), error: undefined });
    save(); done++;
    log(e, `完成 ✓ ${(fs.statSync(glbFile).size / 1048576).toFixed(1)} MB`);
  } catch (err) {
    if (err.budget) { log(e, "略過:已達預算上限"); return; }
    s.error = err.message; s.attempts = (s.attempts || 0) + 1;
    /* 失敗的任務下次重新提交;preview 已成功的 text 任務只重做 refine */
    if (/任務 (FAILED|CANCELED|EXPIRED)/.test(err.message)) {
      if (s.refineId) delete s.refineId; else { delete s.previewId; delete s.taskId; }
    }
    s.status = "failed"; save(); failed++;
    log(e, `失敗 ✗ ${err.message}`);
  }
}

async function pool(list, n, fn) {
  const queue = [...list];
  await Promise.all(Array.from({ length: Math.min(n, queue.length) }, async () => {
    while (queue.length) await fn(queue.shift());
  }));
}

/* ───── 主程序 ───── */
const list = select(C, o).filter(e => o.redo || !(S(e.rank).status === "done" && exists(path.join(P.raw, `${e.rank}.glb`))));
const plan = list.map(e => ({ e, mode: S(e.rank).mode || pickMode(e) })).filter(x => x.mode);
const count = m => plan.filter(x => x.mode === m).length;
const fresh = plan.filter(x => !S(x.e.rank).previewId && !S(x.e.rank).taskId);
const need = fresh.reduce((n, x) => n + estimate(x.mode), 0);

console.log(`\n靈體圖鑑 · Meshy 3D 化${o.test ? "(測試模式:Meshy 示範模型,不扣點數)" : ""}`);
console.log(`模型 ${SETTINGS.ai_model} · ${SETTINGS.topology} ${SETTINGS.target_polycount.toLocaleString()} 面 · PBR ${SETTINGS.enable_pbr ? "開" : "關"}` +
  (SETTINGS.texture_resolution ? ` · 貼圖 ${SETTINGS.texture_resolution}` : "") + (SETTINGS.geometry_resolution ? ` · 幾何 ${SETTINGS.geometry_resolution}` : ""));
console.log(`待處理 ${plan.length} 位:Multi-Image ${count("multi")} · Image ${count("image")} · Text ${count("text")}`);
console.log(`預計新扣點數 ≈ ${need.toLocaleString()}${isFinite(budget) ? `(本次上限 ${budget.toLocaleString()})` : ""}`);

if (o["dry-run"]) {
  for (const x of plan.slice(0, Number(o.show || 5))) {
    console.log(`\n── #${x.e.rank} ${x.e.cn} · ${x.mode}`);
    if (x.mode === "text") console.log(C.meshyPrompt(x.e));
    else console.log(`參考圖:${refsFor(x.e.rank).views.length ? refsFor(x.e.rank).views.join(", ") : refsFor(x.e.rank).single}`);
  }
  console.log(`\n(乾跑:沒有呼叫 API。用 --show 20 可看更多指令。)`);
  process.exit(0);
}
if (!KEY) { console.error("\n請先設定 MESHY_API_KEY(Meshy 網站 → API → Create API Key),或加 --test 用官方測試金鑰。"); process.exit(1); }

try {
  const b = await api("GET", "/openapi/v1/balance");
  if (b && b.balance !== undefined) console.log(`帳戶餘額 ${Number(b.balance).toLocaleString()} 點`);
} catch { /* 餘額查詢失敗不影響生成 */ }

if (!o.yes && !o.test && need > 0) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ans = await rl.question(`\n確定開始?將提交 ${fresh.length} 個新任務 [y/N] `);
  rl.close();
  if (!/^y(es)?$/i.test(ans.trim())) { console.log("已取消。"); process.exit(0); }
}

await pool(plan.map(x => x.e), CONC, processOne);
const n = writeManifest();
const mins = ((Date.now() - t0) / 60000).toFixed(1);
console.log(`\n完成 ${done} · 失敗 ${failed} · 本次新扣點數 ≈ ${spent} · 用時 ${mins} 分鐘`);
console.log(`下一步:node tools/meshy/optimize.mjs,然後 node tools/meshy/thumbs.mjs(目前 ${n} 位已有網頁用素材)`);
if (failed) console.log("失敗的靈體再執行一次同一指令即可重試;原因記錄在 tools/meshy/state.json。");
