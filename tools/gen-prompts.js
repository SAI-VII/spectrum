/* 產生 docs/prompts/flagship-prompts.md:79 位已立傳靈體的 ChatGPT 圖像指令
   與 app 內「ChatGPT 圖像指令」按鈕共用同一個產生器(src/prompts.js)。
   用法:node tools/gen-prompts.js */
const fs=require("fs"), path=require("path"), vm=require("vm");
const root=path.join(__dirname,"..");
const ctx={window:{}};
vm.createContext(ctx);
for(const f of ["src/data/entities.js","src/data/lore.js","src/prompts.js"])
  vm.runInContext(fs.readFileSync(path.join(root,f),"utf8"),ctx,{filename:f});
/* lore.js 以 const 宣告,屬於腳本作用域,須在同一 context 內取出 */
vm.runInContext("this.ENTITIES=window.ENTITIES;this.BANDS=BANDS;this.buildImagePrompt=buildImagePrompt;",ctx);

const {ENTITIES,BANDS,buildImagePrompt}=ctx;
let md=`# 79 位已立傳靈體 · ChatGPT 圖像指令

由 \`tools/gen-prompts.js\` 自動產生(請勿手改;改 \`src/prompts.js\` 或資料後重新執行)。
每一段都已把該靈體的六軸數值翻譯成視覺語彙。先在 ChatGPT 貼上 [風格聖經](../chatgpt-image-prompts.md#2-風格聖經每個新對話先貼這段),再逐段貼。
生成後存成 \`assets/portraits/{編號}.webp\`,並在 \`assets/manifest.js\` 登記。

`;
for(const b of BANDS){
  const list=ENTITIES.filter(e=>e.band===b.key&&e.flagship).sort((x,y)=>y.radar[0]-x.radar[0]);
  if(!list.length) continue;
  md+=`\n## ${b.seal} · ${b.cn} ${b.en}(${list.length} 位)\n`;
  for(const e of list){
    md+=`\n### #${e.rank} ${e.cn}${e.en?` · ${e.en}`:""}\n\n六軸:${e.radar.join(" / ")}\n\n\`\`\`text\n${buildImagePrompt(e,"plate")}\n\`\`\`\n\n<details><summary>3D 建模用</summary>\n\n\`\`\`text\n${buildImagePrompt(e,"model")}\n\`\`\`\n\n</details>\n`;
  }
}
fs.writeFileSync(path.join(root,"docs/prompts/flagship-prompts.md"),md);
console.log("wrote docs/prompts/flagship-prompts.md",md.length,"chars");
