/* 產生桌遊《十二宮 · 輪迴迷宮》所有要 3D 打印的 Meshy 文字指令(Text to 3D)。
   神像由視覺正典(src/data/canon.js)組成;地貌、棋子、配件在這裏手寫。
   每條指令不超過 Meshy 的 600 字元上限。用法:node tools/gen-print-prompts.js */
const fs=require("fs"), path=require("path");
const C=require("./lib/codex.cjs").load();
const MAX=600, OUT=path.join(C.ROOT,"docs/boardgame");
const byRank=r=>C.ENTITIES.find(e=>e.rank===r);
const en=e=>(e.en||e.cn).replace(/\s*\([^)]*\)\s*/g," ").trim();
/* 打印高度跟實力等級(規則 v0.2 第 1 節) */
const HEIGHT={cosmic:90,world:80,divine:65,legend:50,regional:40,local:32,personal:28};

const FIG="tabletop miniature for FDM 3D printing, one solid piece on a round flat base, compact pose with arms and props close to the body, thick sturdy limbs, weapons and thin parts thickened, no floating parts, no thin spikes, clean readable silhouette, no background";
const tile=shape=>`${shape} tabletop terrain tile for FDM 3D printing, low scenery kept to the edges, an empty flat round clearing in the centre for a miniature to stand on, flat solid underside, thick sturdy shapes, no thin spikes, no floating parts, no people or figures`;

function fit(parts){ let P=parts.filter(Boolean), s=P.join(", ");
  while(s.length>MAX&&P.length>2){ const i=P.length-2; const cut=P[i].lastIndexOf(", "); if(cut>40) P[i]=P[i].slice(0,cut); else P.splice(i,1); s=P.join(", "); }
  if(s.length>MAX) throw new Error("too long: "+s.slice(0,60));
  return s; }

/* A. 宮位地貌:十二宮 + 終宮 */
const TILES=[
 [1,"Persona 人格面具","戴","Ancient Greek theatre: a semicircle of stone seating steps curving around three sides, one large tragic mask and one comic mask leaning against the back row, a small altar of Dionysus with carved ivy at one edge"],
 [2,"Hamartia 致死缺陷","認","Ruined sanctuary floor split by one deep jagged crack, a toppled fluted column broken into three drums, a fallen crested helmet, a single thick arrow stuck upright in the ground"],
 [3,"Poiesis 創生技藝","造","Workshop of Hephaestus and the Muses: a stone forge with bellows and an anvil along one edge, an upright weaving loom along another, a lyre resting on a block of half-carved marble"],
 [4,"Oikos 血脈家屋","承","Courtyard of a Greek house: a round stone hearth with stylised solid flames at one edge, a doorway with a heavy lintel and a large key hanging beside it, a wall niche shrine holding small funeral urns"],
 [5,"Logos 真言理性","辯","Stoa colonnade: four Doric columns with an entablature along the back edge, a tall law stele covered in carved lines of text, two stone benches, an owl perched on a column"],
 [6,"Eros 慾望結合","結","Walled rose garden: two raised paths that spiral around each other, rose bushes with large blossoms along the walls, a low round fountain basin at one corner, a bow and quiver left on a stone bench"],
 [7,"Daimon 守護靈","聽","Oracle of Delphi: the egg-shaped omphalos stone covered in a carved knotted net, a bronze tripod holding a bowl, a crack in the rock with rising vapour carved as solid curls, laurel branches"],
 [8,"Atlas 重擔與契約","擔","Bare mountain summit: a huge celestial sphere engraved with constellations resting in a cradle of rock at one corner, a stone oath pillar carved with river waves, heavy broken chains on the ground"],
 [9,"Katabasis 冥界之旅","潛","Entrance to the Greek underworld: a spiral stone staircase descending into a pit at one corner, a riverbank with a mooring post and a small ferry boat, a bare poplar tree, a few skulls"],
 [10,"Elpis 潘多拉的希望","開","A giant clay pithos storage jar taller than a person lying tilted at one edge, its round lid fallen beside it, wisps escaping from the mouth carved as solid low curls along the ground, one small bird on the rim"],
 [11,"Polis 城邦群體","議","Athenian agora: a curved speaker's platform of three stone steps along one edge, a stone voting urn surrounded by scattered pottery shards, two olive trees, a carved boundary stone"],
 [12,"Ekstasis 狂喜出離","越","Dionysian grove: grapevines heavy with grapes climbing a rough rock, a bonfire of stacked logs with stylised solid flames, a thyrsus staff topped with a pine cone planted in the ground, a wine krater, a tambourine"],
 [0,"Telos 終宮","揭","Round Greek tholos temple platform: three concentric circular steps, a ring of eight short broken columns around the rim, the floor carved with a spiral labyrinth groove leading to the centre"]
].map(([n,name,verb,theme])=>({id:n?`tile-${String(n).padStart(2,"0")}`:"tile-telos",group:"A 宮位地貌",name:(n?`第 ${n} 宮 `:"")+name+` ·「${verb}」`,size:n?"90 × 90 mm,高約 35 mm":"直徑 120 mm,高約 30 mm",qty:1,
  prompt:fit([theme,tile(n?"Square":"Round")])}));

/* B. 還未有模型、遊戲會用到的希臘神祇與人物(力環) */
const WHY={113:"你的命盤第 2、10 宮",260:"你的命盤第 5 宮",79:"你的命盤第 8 宮;第 8 宮預設守護神",95:"第 10 宮預設守護神;欣賞傲慢的神",104:"第 10 宮預設守護神",105:"第 12 宮預設守護神;欣賞傲慢的神",
  91:"死神:藏在時間牌堆最後 4 張,翻到時放上時間軌",111:"靈界判官",94:"靈界判官",90:"欣賞傲慢的神",45:"名聲之路的原型",56:"第 9 宮「奧菲斯之規」;缺陷牌「深情」的原型",115:"命盤常見的醫神",88:"第 10 宮(潘多拉之罐)"};
const GODS=Object.keys(WHY).map(Number).map(r=>{ const e=byRank(r), c=C.canonOf(e), t=C.powerTier(e.radar[0]);
  return {id:`god-${r}`,group:"B 補做的神像",name:`#${r} ${e.cn.replace(/（.*?）/g,"")} ${en(e)}`,size:`高 ${HEIGHT[t.key]} mm(${t.cn})`,qty:1,note:WHY[r],
    prompt:fit([`Miniature statue of ${en(e)} from Greek mythology`,c.look,c.pose,c.props?`with ${c.props}`:"",FIG])}; });

/* C. 玩家棋子:五個凡人(即五種來世之籤)、陰魂、英雄之墳 */
const PAWN=(id,name,qty,size,desc,note)=>({id,group:"C 玩家棋子",name,size,qty,note,prompt:fit([desc,FIG])});
const PAWNS=[
 PAWN("mortal-king","凡人 · 帝王",1,"高 28 mm","Miniature of an ordinary ancient Greek king: an older bearded man in a long draped himation with a plain band crown, one hand holding a short thick sceptre against his chest, standing straight and heavy","五位玩家各一;同時對應來世之籤"),
 PAWN("mortal-warrior","凡人 · 戰士",1,"高 28 mm","Miniature of an ordinary ancient Greek hoplite soldier: a young man in a bronze cuirass and a crested helmet pushed back on his head, a large round shield held tight against his body, a short thick spear resting on his shoulder"),
 PAWN("mortal-craftswoman","凡人 · 工匠",1,"高 28 mm","Miniature of an ordinary ancient Greek craftswoman: a woman in a short work tunic and apron with her hair tied up, holding a hammer against her hip and cradling a small amphora in her other arm"),
 PAWN("mortal-priestess","凡人 · 祭司",1,"高 28 mm","Miniature of an ordinary ancient Greek priestess: a veiled woman in a long pleated peplos holding a shallow libation bowl in both hands in front of her chest, head slightly bowed"),
 PAWN("mortal-farmer","凡人 · 農夫",1,"高 28 mm","Miniature of an ordinary ancient Greek farmer: a lean man in a plain wool tunic and a wide straw hat, a sack over one shoulder, leaning on a thick walking staff held close to his side"),
 PAWN("shade","陰魂",5,"高 28 mm","Miniature of a shade of the dead from the Greek underworld: a faceless hooded figure in a long thin robe, head bowed, one hand reaching forward, the robe dissolving into mist carved as solid curls that merge into the base","命線斷盡的玩家換上;建議用半透明或灰色線材"),
 PAWN("hero-tomb","英雄之墳",5,"高 30 mm","Miniature of an ancient Greek hero's tomb: a low round burial mound with an upright grave stele carved with a warrior in relief, a laurel wreath hung on the stele, an offering bowl and a small amphora at its foot","接受英雄祭祀的玩家換上")
];

/* D. 配件 */
const PROP=(id,name,qty,size,desc,note)=>({id,group:"D 配件",name,size,qty,note,prompt:fit([desc,"tabletop game piece for FDM 3D printing, one solid piece on a round flat base, thick sturdy shapes, no thin spikes, no floating parts, clean readable silhouette, no background"])});
const PROPS=[
 PROP("ariadne-thread","阿里阿德涅之線",1,"高 25 mm","A large ball of wound thread resting on a low round stone pedestal carved with a labyrinth pattern, the loose end of the thread trailing down and around the pedestal as one thick cord","全局唯一的遺物:補回一條命線"),
 PROP("guide-staff","引路人權杖",1,"高 40 mm","The kerykeion herald's staff of Hermes planted upright in a small rock: a thick rod with two snakes coiled around it facing each other and a pair of short wings at the top","最先到達終宮的人取得"),
 PROP("moirai-spindle","命線架",1,"高 60 mm","A tall ancient Greek distaff and spindle standing upright on a heavy round base, wound with thick thread, a large pair of shears leaning against it, three thick loose thread ends hanging down the front","放在命運三女神神像旁;每人 3 條命線可用小夾或圓環掛上"),
 PROP("fate-bowl","命運骰盤",1,"直徑 90 mm","A wide shallow bronze offering bowl with a flat bottom and a thick rim, the outside carved with a Greek meander border and three women holding a thread, standing on three short lion-paw feet","擲命運骰用;放在安那刻神像前"),
 PROP("styx-pillar","冥河之誓柱",5,"高 30 mm","A short square stone pillar carved on all four sides with flowing river waves, a thick iron ring set in the top, a small flat ledge at the front","第 8 宮立約時,放在立誓玩家面前")
];

const ALL=[...TILES,...GODS,...PAWNS,...PROPS];
const n=ALL.length, prints=ALL.reduce((s,x)=>s+x.qty,0);
let md=`<!-- 由 tools/gen-print-prompts.js 自動產生;請改該檔或 src/data/canon.js 後重新執行,不要手改 -->

# 《十二宮》3D 打印:Meshy 指令全集

配合 [規則 v0.2](rules-v0.2.md)。共 **${n} 個模型**(打印 ${prints} 件),全部用 Meshy 的 **Text to 3D**,每條指令已控制在 ${MAX} 字元內。

## 點數

| 做法 | 每個 | ${n} 個 | 連重做一次 |
|---|---|---|---|
| 只要形狀(單色打印,不做貼圖) | 20 | ${n*20} | ${n*40} |
| 連貼圖(想在 Meshy 預覽上色效果,或做多色打印) | 30 | ${n*30} | ${n*60} |

你有四千多點,兩種做法都夠用,而且每個模型可以重做一至兩次挑最好的。點數以 Meshy 當時的收費為準,生成前請看一眼版面上顯示的數字。

## Meshy 設定

- **模式**:Text to 3D,用最新模型。
- **貼圖**:單色打印不需要,略過 Refine 可以省點數。
- **姿勢**:人像不要選 A-pose 或 T-pose,指令已寫明姿勢。
- **下載**:選 **STL** 或 **3MF**;打印前不需要經過本專案的網頁優化流程(那是給 app 顯示用的)。
- 不滿意時先改指令再重做,比連按幾次重新生成有效。最常見的問題和改法見文末。

## 打印(Bambu Studio)

- 我不確定 X2D 的打印床尺寸。這份清單最大的一件是終宮(直徑 120 mm),其餘地貌是 90 × 90 mm,任何 180 mm 以上的打印床都放得下。
- **尺寸在切片軟件裏設定**:匯入後鎖定比例,把高度(地貌則是邊長)改成下表「尺寸」一欄的數字。Meshy 輸出的模型沒有真實尺寸。
- 28–40 mm 的小像:0.2 mm 噴嘴、0.08–0.12 mm 層高;樹狀支撐。50 mm 以上用 0.4 mm 噴嘴、0.12–0.16 mm 層高即可。
- 如果你的機器是雙噴嘴,第二個噴嘴放支撐專用線材,小像底部會乾淨很多。
- 匯入後如果 Bambu Studio 提示模型有破面,按它的「修復」即可。
- 你已經做好的 50 個法環、權環神像,同樣按等級設定高度:宇宙級 90 mm、創世級 80 mm、神域級 65 mm、傳說級 50 mm、一方級 40 mm。

## 不用 Meshy 做的東西

這些是規則的平面配件,用 Meshy 會浪費點數而且尺寸不準;之後我可以用程式直接產生 STL:時間軌圓環、傲慢/業/名聲三條記錄軌、渡河錢幣、神像的統一底座與名牌。卡牌(四德牌、缺陷牌、神罰牌、來世之籤、陰影牌)是紙。

---
`;
let grp="";
for(const x of ALL){
  if(x.group!==grp){ grp=x.group; md+=`\n## ${grp}\n`;
    if(grp[0]==="A") md+=`\n每塊中央留一個平坦的圓形空位,用來放神像;景物都靠邊。匯入切片軟件後把邊長設為 90 mm。\n`;
    if(grp[0]==="B") md+=`\n外形取自圖鑑的視覺正典,所以和你已做的 50 個神像是同一套設定。這 ${GODS.length} 位是規則和你那張命盤圖用得着的;你的 Gemini app 如果還會派出其他力環的神,把名單給我,我照樣補上。\n`; }
  md+=`\n### ${x.name}\n\n${x.size} · 打印 ${x.qty} 件${x.note?` · ${x.note}`:""} · 檔名 \`${x.id}\`\n\n\`\`\`text\n${x.prompt}\n\`\`\`\n`;
}
md+=`
---

## 生成結果不理想時

| 問題 | 在指令最前面加上或改成 |
|---|---|
| 地貌中央沒有留空位 | \`The centre of the tile is completely empty and flat.\` |
| 地貌出現了人 | \`Scenery only, absolutely no people.\` |
| 手臂、武器太幼,打印會斷 | \`Chunky stylised proportions, every part at least as thick as a finger.\` |
| 姿勢張得太開,支撐太多 | \`Arms held against the torso, feet together.\` |
| 底座不見了 | \`Standing on a thick round disc base.\` |
| 細節太碎,28 mm 印不出 | \`Simplified bold shapes, large details only.\` |
`;
fs.mkdirSync(OUT,{recursive:true});
fs.writeFileSync(path.join(OUT,"meshy-print-prompts.md"),md);
const csv=v=>`"${String(v??"").replace(/"/g,'""')}"`;
fs.writeFileSync(path.join(OUT,"meshy-print-prompts.csv"),"﻿"+[["id","group","name","size","qty","prompt"].join(",")].concat(ALL.map(x=>[x.id,x.group,x.name,x.size,x.qty,x.prompt].map(csv).join(","))).join("\n")+"\n");
console.log(`${n} models, ${prints} prints, longest prompt ${Math.max(...ALL.map(x=>x.prompt.length))} chars`);
