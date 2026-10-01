/* 在 Node 內載入圖鑑資料與指令產生器(與瀏覽器共用同一份原始碼)。
   lore.js 以 const 宣告,屬於腳本作用域,所以在同一個 vm context 內執行後再取出。 */
const fs=require("fs"), path=require("path"), vm=require("vm");
const ROOT=path.join(__dirname,"..","..");
const FILES=["src/data/entities.js","src/data/lore.js","src/data/canon.js","src/data/realm.js","src/prompts.js"];

function load(){
  const ctx={window:{},console};
  vm.createContext(ctx);
  for(const f of FILES) vm.runInContext(fs.readFileSync(path.join(ROOT,f),"utf8"),ctx,{filename:f});
  vm.runInContext(`this.out={ENTITIES:window.ENTITIES,CANON:window.CANON,BANDS,BAND_ART,AXES,PROMPT_KINDS,
    buildImagePrompt,meshyPrompt,meshyTexturePrompt,buildRefBatch,canonOf,
    buildLineup,lineupPick,SPECTRUM_LINEUP,POWER_TIERS,powerTier,HUMAN,REALM:window.REALM};`,ctx);
  const o=ctx.out;
  o.ROOT=ROOT;
  o.byBand=key=>o.ENTITIES.filter(e=>e.band===key).sort((a,b)=>b.radar[0]-a.radar[0]);
  return o;
}
module.exports={load,ROOT};
