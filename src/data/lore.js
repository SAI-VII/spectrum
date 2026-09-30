/* 靈體圖鑑 · 本體光譜 — 六軸、七環、語域(原檔常數,逐字保留)
   其後為新增:圖像美術方向、軸→視覺語彙、測驗、靈籤宜忌。 */
const AXES=[
  {k:"power",label:"本體權能"},{k:"scope",label:"影響半徑"},{k:"valence",label:"向人性"},
  {k:"nego",label:"可協商度"},{k:"vivid",label:"信仰熱度"},{k:"liminal",label:"臨界性"}
];
const AXIS_READ=[
 [[90,"撼動世界的本源之力"],[70,"神格級,可改寫局部現實"],[50,"一方之主,力有專司"],[30,"在地小神,範圍有限"],[15,"微弱,僅及一隅"],[0,"近乎無力,輕如夢影"]],
 [[90,"遍及整個宇宙"],[70,"跨域,一界之大"],[50,"一地、一海、一城"],[30,"一街、一村、一山口"],[15,"一屋、一身之內"],[0,"僅及一人、一夢"]],
 [[75,"庇佑型,待人以暖"],[55,"大致善意,願意回應"],[45,"中性,不偏不倚"],[30,"危險,帶惡意"],[15,"敵意,會傷人"],[0,"純粹兇厄,吞噬奪命"]],
 [[75,"香火可動其心,有求必應"],[55,"可祭可求,願聽"],[35,"須儀式或條件交換"],[20,"極難打動"],[0,"不可祈求,只能承受"]],
 [[80,"香火鼎盛,全城皆知"],[60,"廣為流傳"],[40,"有名有姓,流傳中"],[20,"漸被遺忘,小眾"],[0,"近乎無人記得,已祛魅"]],
 [[80,"立於生死、夢醒之界"],[60,"近門檻,過渡之靈"],[40,"半在界上"],[20,"大致在人間之內"],[0,"全然此世,無關門檻"]]
];
function axisRead(i,v){for(const[t,s] of AXIS_READ[i]){if(v>=t)return s;}return"";}
const REGISTER={
 law:"冷峻、克制的文言。視角超然於人類之上,語氣不帶情感。此存在不可被祈求,只能被承受。",
 epic:"莊嚴的史詩體,文白相間,意象恢宏。此神有職司、有神話,可被凡人祈求或觸怒。",
 hero:"英雄敘事或怪談張力,著重力量、對抗與宿命。",
 folk:"溫暖、親切的香港書面語,可帶少量粵語口語(如「佢」「嗰」「啲」「唔」),像一個老香港同你講開嗰位街坊神。",
 kin:"家祠口吻,溫煦而帶敬意,粵語書面語。關於思念、血脈與「被記得」。",
 threshold:"都市傳說式的低語,粵語書面語,帶寒意,多用第二人稱「你」,令人脊背發涼。",
 matter:"乾燥、精準的科普語氣。徹底祛魅——指出這裡沒有靈,只有被誤讀的物理或生理現象。",
 coda:"終章的、夢一般的低語。溫柔,克制,帶一點告別的重量。"
};
const BANDS=[
  {key:"law",seal:"法",cn:"法則",en:"Law",cls:"seal-law",color:"--c-law",tier:"S",
   essence:"連神亦受制。不可祈求,只能承受——它不是聽禱的,它是令禱告得以成立的前提。"},
  {key:"sovereign",seal:"權",cn:"主權諸神",en:"Sovereigns",cls:"seal-sov",color:"--c-sov",tier:"S · A · C",
   essence:"立法者與裁決者,以及替宇宙司職的眾神——由執雷的王,到掌管正義、記憶、勝利與健康的小神。向他們求,不是求恩,是求一次各司其職的回應。"},
  {key:"edge",seal:"力",cn:"邊界之力",en:"Force at the edge",cls:"seal-edge",color:"--c-edge",tier:"B",
   essence:"秩序與混沌的角力。每一隻怪都有剋星,每一個英雄都有死穴。"},
  {key:"folk",seal:"信",cn:"人間之神",en:"Gods among us",cls:"seal-folk",color:"--c-folk",tier:"C",
   essence:"靠眾人香火維生的神。有廟、有誕期、有求必應——陌生人的虔誠養住祂。",warm:"rgba(242,189,92,.10)"},
  {key:"kin",seal:"念",cn:"念故者",en:"Those we keep",cls:"seal-kin",color:"--c-kin",tier:"C · F · H",
   essence:"被記得的死者。冇廟、冇誕、冇香客,只有屋企人。本體之力近乎零,親密卻是全圖最高——因為能越過門檻的,從來唔係權力,係思念。一旦無人惦記,就會慢慢墮向下一環。",warm:"rgba(213,140,110,.11)"},
  {key:"threshold",seal:"懼",cn:"門檻之靈",en:"At the threshold",cls:"seal-thr",color:"--c-thr",tier:"D – F",
   essence:"睡眠、死亡、路口與夜。陌生而帶惡意的亡者與妖——大多只是恐懼在邊界上長出的形狀。"},
  {key:"matter",seal:"物",cn:"退潮:靈散為物",en:"The tide goes out",cls:"seal-mat",color:"--c-mat",tier:"F · 科學",
   essence:"潮水退去。「靈」被還原成一件被誤讀的物理事件。圖鑑到這裡,光熄了。"}
];
const VOICE_NAME={law:"冷峻文言",epic:"莊嚴史詩",hero:"英雄敘事",folk:"溫暖港式口語",kin:"家祠口吻",threshold:"都市怪談",matter:"乾燥科普",coda:"終章 · 夢的低語"};
const VOICE_OF={law:"law",sovereign:"epic",edge:"hero",folk:"folk",kin:"kin",threshold:"threshold",matter:"matter"};
const HINTS={
  band:"每枚印記,就係那隻靈體的雷達側影——形狀即身份。撳落去看完整法陣;撥動上面的「光照」,用任何一條軸重新點亮整片圖鑑。",
  power:"鏡頭:本體權能。越往上越亮——這正是傳統段位榜的排法,看起來理所當然。",
  scope:"鏡頭:影響半徑。法則管整個宇宙,屋企神只管你那條街——光從頂層鋪到中段,再向下收細。",
  valence:"鏡頭:向人性。兩條暖帶一齊亮起——「信」的諸神與「念」的故人;發暗的是吞噬、拖拽、奪命的那些。",
  nego:"鏡頭:可協商度。能用香火和許願打動的,集中在「人間之神」;<b>對「必然」祈禱,沒有用。</b>",
  vivid:"鏡頭:信仰熱度。看「信」環燒起,而「念」環依然安靜——<b>最被愛的故人,從來唔係最有名的神。</b>熱度不等於親密,這正是落差所在。",
  liminal:"鏡頭:臨界性。發亮的都站在門檻上——生與死、夢與醒、岸與海之間;「念」與「懼」兩環,正是門檻的兩面。"
};

/* ───────── 新增 ───────── */

/* 3D 光譜塔:每環的高度(由上而下 = 由法則到物質)。環的半徑由該環平均「影響半徑」計出,見 cosmos3d.js。 */
const BAND_ORDER=BANDS.map(b=>b.key);

/* 每環的圖像美術方向:供 ChatGPT 圖像 prompt 使用(英文,生成模型最穩定)。 */
const BAND_ART={
  law:{hex:"#AEBAC9",mood:"cold, silent, immense",
    scene:"The entity is a principle, not a person: vast concentric orbits, thread-thin lines of light, an engraved celestial chart rendered in light. Any figure is veiled, faceless or made of geometry.",
    palette:"silver-blue light on ink black, faint bone-white engraving lines"},
  sovereign:{hex:"#9B86D9",mood:"majestic, ceremonial, divine",
    scene:"A classical Greek divinity as a luminous fresco-statue: marble skin, gold-leaf details, attributes of office held with calm authority, Hellenistic sculpture lighting with ink-wash edges.",
    palette:"violet aura, warm marble, restrained gold leaf"},
  edge:{hex:"#D5664A",mood:"kinetic, dangerous, fated",
    scene:"A mythic battle plate: the monster or hero caught at the decisive moment, dramatic chiaroscuro, smoke and sparks, faint Greek black-figure pottery motifs in the background.",
    palette:"vermilion rim light, charcoal shadows, ember sparks"},
  folk:{hex:"#F2BD5C",mood:"warm, protective, lived-in",
    scene:"Hong Kong temple devotion: coiled incense spirals hanging from the ceiling, lantern glow, joss paper, carved roof ridges, a neighbourhood shrine at dusk. Painted like a modern gongbi scroll with photographic warmth.",
    palette:"amber and red-gold lantern light, soft incense haze"},
  kin:{hex:"#D58C6E",mood:"tender, quiet, remembered",
    scene:"A family ancestral altar at home: one small oil lamp, framed old photographs, a bowl of fruit, tea cups, a presence felt rather than seen. Remembered, not worshipped.",
    palette:"clay-tangerine lamplight, film grain, deep brown shadows"},
  threshold:{hex:"#6FB0A4",mood:"liminal, eerie, second-person dread",
    scene:"An urban legend at the threshold: night street or shoreline, wet asphalt, sodium streetlamps, fog, the figure half-seen at the edge of the frame or reflected where it should not be.",
    palette:"cold teal light, sodium orange accents, deep fog"},
  matter:{hex:"#7C7F86",mood:"dry, precise, disenchanted",
    scene:"A scientific specimen plate: the 'spirit' shown as a physical phenomenon, with cross-sections, measured diagram lines and a clinical layout, like a 19th-century natural-history engraving.",
    palette:"desaturated graphite grey, one faint phosphor-green trace"}
};

/* 六軸 → 視覺語彙:讓圖像本身也「編碼」數值(形狀即身份的延伸)。門檻由高至低。 */
const AXIS_VISUAL=[
  [[80,"an overwhelming, cosmic-scale presence that dwarfs the frame"],[55,"a commanding, godlike stature"],[35,"a grounded, human-scale presence"],[0,"a faint, fragile, barely-there presence"]],
  [[80,"the background opens onto an entire cosmos"],[55,"a vast landscape or open sea stretches behind"],[35,"set in one town, one street or one temple"],[0,"an intimate close space: a room, an altar, a bedside"]],
  [[70,"warm, protective, benevolent light"],[45,"an impartial, neutral mood"],[25,"an unsettling, dangerous undertone"],[0,"hostile, predatory menace"]],
  [[70,"offerings, incense and handwritten prayers around it: approachable"],[40,"ritual objects hint at bargains and exchange"],[0,"no offerings anywhere: untouchable, indifferent to prayer"]],
  [[70,"crowded with devotion: many small lights and lanterns"],[40,"a few traces of worship remain"],[0,"forgotten, dusty and unlit"]],
  [[75,"it stands on a threshold (doorway, shoreline, the edge of sleep) and parts of it dissolve into mist"],[50,"twilight atmosphere between two states"],[0,"solidly of this world, in clear light"]]
];
function axisVisual(i,v){for(const[t,s] of AXIS_VISUAL[i]){if(v>=t)return s;}return"";}

/* 今日靈籤:最高軸定「宜」,最低軸定「忌」。 */
const AXIS_OMEN=[
  {yi:"定大事、立規矩",ji:"逞強出頭"},
  {yi:"遠行、見新的人",ji:"貪多務得"},
  {yi:"探望故人、請人食飯",ji:"冷言冷語"},
  {yi:"開口相求、談條件",ji:"討價還價"},
  {yi:"上香、公開發表",ji:"高調張揚"},
  {yi:"早睡、記低個夢",ji:"深夜獨行"}
];

/* 本命靈測驗:每題對應一條軸,答案即該軸數值。 */
const QUIZ=[
  {axis:0,q:"如果可以改寫一條規則,你會改⋯⋯",a:[["宇宙的某條定律",95],["一座城的命運",68],["身邊人的處境",38],["其實,我只想改寫自己",12]]},
  {axis:1,q:"你希望你的名字,被幾遠的人聽見?",a:[["每一個世界",95],["一個國度、一片海",70],["一條街、一條村",32],["一個人就夠",8]]},
  {axis:2,q:"深夜,有個陌生人喺你門口迷咗路。",a:[["開門,煲杯熱茶俾佢",90],["指條路,但唔開門",55],["由佢,各有各命",32],["佢嘅恐懼,正好係我嘅食糧",8]]},
  {axis:3,q:"有人帶住供品,求你破一次例。",a:[["有求必應,人哋專程嚟咗",90],["可以,但要講條件",55],["好難打動,要睇誠意",25],["規則就係規則,求都無用",4]]},
  {axis:4,q:"你寧願被萬人記住,定係被一個人記一世?",a:[["萬人香火,越旺越好",92],["有名有姓,流傳落去就好",62],["幾個知己記得就夠",35],["被遺忘,都唔緊要",10]]},
  {axis:5,q:"你最常流連喺邊個時刻?",a:[["正午,一切清清楚楚",12],["黃昏,日夜交界",55],["凌晨三點,半夢半醒",82],["生與死、岸與海之間",95]]}
];

/* 聲景:每環一個和弦(Hz)與波形;由 features.js 的 Soundscape 使用。 */
const BAND_TONE={
  law:{f:[55,82.4,110],type:"sine",cut:500},
  sovereign:{f:[110,164.8,196,277.2],type:"triangle",cut:1400},
  edge:{f:[73.4,77.8,110],type:"sawtooth",cut:420},
  folk:{f:[196,246.9,293.7,392],type:"triangle",cut:1800},
  kin:{f:[174.6,220,261.6,329.6],type:"sine",cut:1200},
  threshold:{f:[92.5,130.8,138.6],type:"sine",cut:700},
  matter:{f:[0],type:"noise",cut:900}
};
