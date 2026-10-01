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
    `先在 ChatGPT 貼上[風格聖經](../../chatgpt-image-prompts.md#2-風格聖經),再逐段貼。每張圖都畫出祂的實力等級、正在行使的職權,以及旁邊一個普通人作比例。完成後存成 \`assets/portraits/{編號}.webp\`。\n`;
  for(const e of list){
    const t=C.powerTier(e.radar[0]);
    md+=`\n## #${e.rank} ${e.cn}${e.en?` · ${e.en}`:""}${e.flagship?" · 已立傳":""}\n\n`+
      `**${t.cn}**(本體權能 ${e.radar[0]},凡人 ${C.HUMAN.power})· 職權:${e.influence} · 手段:${e.means}\n\n`+fence(C.buildImagePrompt(e,"plate"));
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
/* 實力對照群像:全光譜一張、每環一張、每級一張 */
let lu=head("實力對照群像指令")+
  "像「體型對照圖」:由一個普通人開始,按本體權能由弱至強一字排開,每位按等級畫成相應大小。"+
  "每環一張可作該環主視覺(存成 `assets/bands/{環}.webp`,見 [chatgpt-image-prompts.md](../chatgpt-image-prompts.md#4-七環主視覺實力群像))。\n"+
  "\n## 全光譜:由你到宇宙法則\n\n"+fence(C.buildLineup(C.SPECTRUM_LINEUP.map(r=>C.ENTITIES.find(e=>e.rank===r))));
for(const b of C.BANDS){
  const pick=C.lineupPick(C.byBand(b.key),6);
  lu+=`\n## ${b.seal} · ${b.cn}(3:1 主視覺)\n\n`+pick.map(e=>`${e.cn} ${e.radar[0]}`).join(" → ")+"\n\n"+
    fence(C.buildLineup(pick,{title:`the band 「${b.seal} · ${b.cn}」 (${b.en})`,aspect:"ultra-wide 3:1"}));
}
for(const t of C.POWER_TIERS){
  const list=C.ENTITIES.filter(e=>C.powerTier(e.radar[0])===t);
  if(!list.length) continue;
  const pick=C.lineupPick(list,6);
  lu+=`\n## ${t.cn}(${list.length} 位)\n\n`+pick.map(e=>`${e.cn} ${e.radar[0]}`).join(" → ")+"\n\n"+
    fence(C.buildLineup(pick,{title:`the ${t.en.toLowerCase()}-tier beings`}));
}
fs.writeFileSync(path.join(OUT,"lineups.md"),lu);

fs.writeFileSync(path.join(OUT,"meshy-prompts.csv"),"﻿"+rows.join("\n")+"\n");
/* 說明文件內的例子:<!-- gen:種類:編號 --> 與 <!-- /gen --> 之間的內容每次重新產生,保持與產生器一致 */
const DOC=path.join(C.ROOT,"docs/chatgpt-image-prompts.md");
if(fs.existsSync(DOC)){
  const byRank=r=>C.ENTITIES.find(e=>e.rank===Number(r));
  const gen=(kind,arg)=>{
    if(kind==="lineup"){
      if(arg==="spectrum") return C.buildLineup(C.SPECTRUM_LINEUP.map(byRank),{aspect:"ultra-wide 3:1"});
      const b=C.BANDS.find(x=>x.key===arg);
      return C.buildLineup(C.lineupPick(C.byBand(arg),6),{title:`the band 「${b.seal} · ${b.cn}」 (${b.en})`,aspect:"ultra-wide 3:1"});
    }
    return C.buildImagePrompt(byRank(arg),kind);
  };
  const doc=fs.readFileSync(DOC,"utf8").replace(/<!-- gen:(\w+):(\w+) -->[\s\S]*?<!-- \/gen -->/g,
    (m,kind,arg)=>`<!-- gen:${kind}:${arg} -->\n`+fence(gen(kind,arg))+`<!-- /gen -->`);
  fs.writeFileSync(DOC,doc);
}

const old=path.join(OUT,"flagship-prompts.md"); if(fs.existsSync(old)) fs.unlinkSync(old);
console.log("wrote docs/prompts: plates/*.md, refs/*.md, lineups.md, meshy-prompts.csv ("+(rows.length-1)+" rows)");
