/* 產生 docs/prompts/ 下的指令集(全部 237 位靈體)。
   與 app 內「圖像與 3D 指令」按鈕共用同一個產生器(src/prompts.js ＋ src/data/canon.js)。
   用法:node tools/gen-prompts.js */
const fs=require("fs"), path=require("path");
const {load}=require("./lib/codex.cjs");
const C=load(), OUT=path.join(C.ROOT,"docs/prompts");
fs.mkdirSync(path.join(OUT,"plates"),{recursive:true});
fs.mkdirSync(path.join(OUT,"refs"),{recursive:true});
const head=t=>`<!-- 由 tools/gen-prompts.js 自動產生;請改 src/data/canon.js 或 src/prompts.js 後重新執行,不要手改 -->\n\n# ${t}\n\n`;
const fence=s=>"```text\n"+s+"\n```\n";
const csv=v=>`"${String(v).replace(/"/g,'""')}"`;

let rows=[["rank","band","cn","en","kind","meshy_prompt","texture_prompt"].join(",")];
for(const b of C.BANDS){
  const list=C.byBand(b.key);
  /* 插畫 */
  let md=head(`${b.seal} · ${b.cn} ${b.en} · 圖鑑插畫指令(${list.length} 位)`)+
    `先在 ChatGPT 貼上[風格聖經](../../chatgpt-image-prompts.md#2-風格聖經),再逐段貼。完成後存成 \`assets/portraits/{編號}.webp\`。\n`;
  for(const e of list){
    md+=`\n## #${e.rank} ${e.cn}${e.en?` · ${e.en}`:""}${e.flagship?" · 已立傳":""}\n\n六軸 ${e.radar.join(" / ")}\n\n`+fence(C.buildImagePrompt(e,"plate"));
  }
  fs.writeFileSync(path.join(OUT,"plates",`${b.key}.md`),md);

  /* 3D 參考圖:每 4 位一批 */
  let rd=head(`${b.seal} · ${b.cn} ${b.en} · 3D 參考圖指令(${list.length} 位)`)+
    `每段一次生成 4 張灰底雕像參考圖。下載後按編號存成 \`assets/refs/{編號}.png\`,再執行 \`node tools/meshy/generate.mjs --mode image\`。\n`+
    `想要更準的背面:對單張圖再貼「四視圖」指令(見 app 內該靈體的「圖像與 3D 指令 → 四視圖」),存成 \`assets/refs/{編號}/front.png、right.png、back.png、left.png\`。\n`;
  for(let i=0;i<list.length;i+=4){
    const batch=list.slice(i,i+4);
    rd+=`\n## 第 ${i/4+1} 批\n\n`+batch.map((e,j)=>`- [ ] 第 ${j+1} 張 → \`assets/refs/${e.rank}.png\` · ${e.cn}${e.en?` · ${e.en}`:""}`).join("\n")+"\n\n"+fence(C.buildRefBatch(batch));
  }
  fs.writeFileSync(path.join(OUT,"refs",`${b.key}.md`),rd);

  for(const e of list){
    const c=C.canonOf(e);
    rows.push([e.rank,b.key,e.cn,e.en||"",c.kind,C.meshyPrompt(e),C.meshyTexturePrompt(e)].map(csv).join(","));
  }
}
fs.writeFileSync(path.join(OUT,"meshy-prompts.csv"),"﻿"+rows.join("\n")+"\n");
const old=path.join(OUT,"flagship-prompts.md"); if(fs.existsSync(old)) fs.unlinkSync(old);
console.log("wrote docs/prompts: plates/*.md, refs/*.md, meshy-prompts.csv ("+(rows.length-1)+" rows)");
