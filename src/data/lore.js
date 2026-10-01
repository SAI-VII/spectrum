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
  band:"每格旁邊的圓環,就係那隻靈體的本體權能——環越滿,力量越大;一個凡人只得 5。撳落去看實力卡:等級、職權、同你相差幾遠;撥動上面的「光照」,用任何一條軸重新點亮整片圖鑑。",
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

/* 每環的美術方向:供 ChatGPT 圖像與 Meshy 3D 指令使用(英文,生成模型最穩定)。
   env 插圖場景 · light 燈光配方 · palette 色彩 · statue 雕像預設材質 · plinth 底座 · avoid 該環要避免的東西 */
const BAND_ART={
  law:{hex:"#AEBAC9",mood:"cold, silent, immense",
    env:"deep space drawn as an engraved celestial chart: concentric orbits, hair-thin lines of light, star fields, nothing human except perhaps one tiny silhouette for scale",
    light:"no warm light at all; a single cold silver-blue rim light from behind, faint starlight fill, deep blacks",
    palette:"silver-blue #AEBAC9 on ink black #0E1015, bone-white #ECE6D9 hairlines",
    statue:"pale silver-blue stone with engraved silver lines, like a museum astronomical instrument",
    plinth:"a low round plinth of black stone engraved with a star chart",
    avoid:"faces with human warmth, cute features, bright saturated colour"},
  sovereign:{hex:"#9B86D9",mood:"majestic, ceremonial, divine",
    env:"a Greek sanctuary at dusk: marble colonnade, Aegean sky, votive offerings far below the god",
    light:"soft violet ambient light, a warm gold key light from high above like sunlight through a temple roof, crisp rim light",
    palette:"violet #9B86D9 aura, warm white marble, restrained gold leaf",
    statue:"white Parian marble with restrained gold-leaf details, museum sculpture",
    plinth:"a low round marble plinth with a Greek key border",
    avoid:"modern clothing, fantasy-game armour, anime faces"},
  edge:{hex:"#D5664A",mood:"kinetic, dangerous, fated",
    env:"the edge of the known world: a battlefield, a cliff above a stormy sea, or a labyrinth, with Greek black-figure pottery motifs faint in the smoke",
    light:"hard vermilion rim light, low charcoal fill, ember sparks as practical light, strong chiaroscuro",
    palette:"vermilion #D5664A, charcoal black, ember orange, bronze",
    statue:"dark patinated bronze with vermilion enamel accents",
    plinth:"a low rough-hewn base of cracked black basalt with a bronze rim",
    avoid:"gore, splatter, comic-book style"},
  folk:{hex:"#F2BD5C",mood:"warm, protective, lived-in",
    env:"a Hong Kong temple interior at dusk: giant spiral incense coils hanging from dark beams, red lanterns, joss paper, carved roof ridges with ceramic figurines, worshippers' offerings",
    light:"warm amber practical light from lanterns and candles, incense haze catching the light, soft gold bounce",
    palette:"amber #F2BD5C, temple red, gold leaf, soot-dark wood",
    statue:"carved camphor wood temple statue painted in red lacquer and gold leaf, softly darkened by incense smoke",
    plinth:"a low rectangular red-lacquer altar base with gold trim",
    avoid:"Japanese or Western styling, generic fantasy costume"},
  kin:{hex:"#D58C6E",mood:"tender, quiet, remembered",
    env:"a small Hong Kong home at night: the family altar, framed black-and-white photographs, a tea set, a window with city lights",
    light:"one small oil lamp as the key light, warm clay-orange glow, deep brown shadows, gentle film grain",
    palette:"clay-tangerine #D58C6E, sandalwood brown, faded photograph tones",
    statue:"warm carved sandalwood with a soft hand-rubbed finish",
    plinth:"a low square wooden altar base with brass trim",
    avoid:"horror, ghoulish faces, divine glory"},
  threshold:{hex:"#6FB0A4",mood:"liminal, eerie, second-person dread",
    env:"a threshold at night: an empty corridor, a flooded pier, a crossroads under a sodium lamp, a bedroom doorway, a foggy moor",
    light:"cold teal moonlight, one sodium-orange practical lamp, heavy fog, the figure lit only at its edges",
    palette:"teal #6FB0A4, sodium orange accent, deep blue-black",
    statue:"frosted translucent teal resin, like a figure half made of mist",
    plinth:"a low irregular base of wet dark stone",
    avoid:"jump-scare gore, cartoon ghosts, bright daylight"},
  matter:{hex:"#7C7F86",mood:"dry, precise, disenchanted",
    env:"a 19th-century natural history plate: specimen layout, measured leader lines, blank labels, cross-sections",
    light:"flat, even, clinical light with no drama",
    palette:"graphite #7C7F86, paper white, one faint phosphor-green trace",
    statue:"white museum plaster with engraved measurement lines and clear glass parts",
    plinth:"a low rectangular plaster base with a brass scale ruler",
    avoid:"mystical glow, supernatural drama"}
};

/* 本體權能 → 鏡頭語言:權能越高,鏡頭越低、越廣角、主體越壓迫;權能越低,鏡頭越近越平視 */
function powerCamera(v){
  if(v>=80) return "extreme low angle, 24mm wide lens, the subject so large it overflows the frame";
  if(v>=55) return "low angle, 35mm lens, the subject towering over the viewer";
  if(v>=35) return "eye level, 50mm lens, the subject at human scale";
  return "slightly high angle, 85mm lens, close and quiet, the subject small in its space";
}
/* 向人性 → 光的溫度 */
function valenceLight(v){
  if(v>=70) return "{P} light falls warmly and softly on the people, protective";
  if(v>=45) return "the light is impartial: brilliant on the being, indifferent to the people";
  if(v>=25) return "hard side light leaves half of every face in shadow";
  return "cold under-lighting, the being's eyes lost in hard shadow";
}
/* 六軸 → 視覺語彙:讓圖像本身也「編碼」數值(形狀即身份的延伸)。門檻由高至低。 */
const AXIS_VISUAL=[
  [[80,"an overwhelming, cosmic-scale presence that dwarfs the frame"],[55,"a commanding, godlike stature"],[35,"a grounded, human-scale presence"],[0,"a faint, fragile, barely-there presence"]],
  [[80,"the space around the subject feels infinite, opening onto the whole cosmos"],[55,"the space opens wide behind the subject, with glimpses of vast land or sea"],[35,"the space is the size of one town, one street or one temple"],[0,"the space is close and intimate: a room, an altar, a bedside"]],
  [[70,"warm, protective, benevolent light"],[45,"an impartial, neutral mood"],[25,"an unsettling, dangerous undertone"],[0,"hostile, predatory menace"]],
  [[70,"offerings, incense and handwritten prayers around it: approachable"],[40,"ritual objects hint at bargains and exchange"],[0,"no offerings anywhere: untouchable, indifferent to prayer"]],
  [[70,"crowded with devotion: many small lights and lanterns"],[40,"a few traces of worship remain"],[0,"forgotten, dusty and unlit"]],
  [[75,"it stands on a threshold (doorway, shoreline, the edge of sleep) and parts of it dissolve into mist"],[50,"twilight atmosphere between two states"],[0,"it is solidly of this world, with no mist"]]
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

/* ───────── 實力尺度(v3) ─────────
   這個圖鑑的重點:讓普通人一眼看懂每位神靈的實力、同凡人的差距、管甚麼。
   等級由「本體權能」決定;每級有中文讀法(app 用)與畫面語言(圖像指令用)。
   size 寫體型,mortal 寫凡人在畫面中的位置,camera 寫構圖,feel 寫觀者的感受。
   {N} = 靈體名稱,{M} = 該文化的一個普通人。 */
const POWER_TIERS=[
 {min:95,key:"cosmic",cn:"宇宙級",en:"Cosmic",
  reach:"整個宇宙,連眾神都受其約束",gap:"眾神在祂面前也只是塵埃;凡人,連被看見的資格都沒有",
  intro:"at the true scale of {P} power, so that anyone can feel at a glance how infinitely far beyond an ordinary human {N} is",
  size:"{N} exists at cosmic scale: planets, moons and whole galaxies drift around {O} like dust, and even the gods would be specks beside {O}",
  mortal:"Far below, {M} stands alone on a bare rock: one tiny silhouette, smaller than a grain of sand against {N}, the only warm point of light in the whole image",
  camera:"From the ground looking straight up, ultra-wide 14mm lens. {N} fills the sky from edge to edge and keeps going beyond the frame; the human is a minute silhouette in the lower third",
  feel:"awe and total insignificance"},
 {min:85,key:"world",cn:"創世級",en:"World-shaping",
  reach:"世界的一大根本:天空、大地、海洋、黑夜或冥府",gap:"一個念頭,整個世界就換了天色",
  intro:"at the true scale of {P} power, so that anyone can feel at a glance how far beyond an ordinary human {N} is, and what {N} rules",
  size:"{N} is as vast as {P} domain: mountain ranges reach only to {P} knees, and storms, seas or shadows move around {O} like {P} own garments",
  mortal:"In the foreground, {M} stands at the edge of a cliff, a tiny speck against {N}",
  camera:"Very low angle from just behind the human, ultra-wide 16mm lens. The human is small in the lower foreground; {N} rises over the horizon and fills two-thirds of the frame",
  feel:"awe"},
 {min:70,key:"divine",cn:"神域級",en:"Divine",
  reach:"一個神職遍及天下:天候、海洋、戰爭、太陽、愛、死亡",gap:"一怒可以毀滅一座城",
  intro:"at the true scale of {P} power, so that anyone can feel at a glance how far beyond an ordinary human {N} is, and what {N} rules",
  size:"{N} appears at full divine scale, a colossus taller than any temple, radiating the force of {P} office",
  mortal:"At the feet of {N}, {M} reaches no higher than {P} ankle",
  camera:"Low angle from among the people at {P} feet, 24mm lens. The head of {N} is high in the frame against the sky; the people are small along the bottom edge",
  feel:"reverence and fear"},
 {min:55,key:"legend",cn:"傳說級",en:"Legendary",
  reach:"一場戰爭、一座城、一片荒野或海域",gap:"一百個士兵也擋不住",
  intro:"at the true scale of {P} power, so that anyone can feel at a glance how far beyond an ordinary human {N} is",
  size:"{N} is larger than life, carrying the force of an army in one body, as huge as the legend describes",
  mortal:"In the foreground, {M} is dwarfed; no wall or weapon of theirs would make any difference",
  camera:"Low, dynamic angle, 35mm lens. {N} is caught in mid-action, the people in the foreground bracing or scattering",
  feel:"adrenaline and dread"},
 {min:40,key:"regional",cn:"一方級",en:"Regional",
  reach:"一個港口、一個區、一座山或一間大廟的信眾",gap:"可以庇佑或禍害一整區的人",
  intro:"at the true scale of {P} power: far stronger than any person, holding one whole place and everyone in it",
  size:"{N} appears larger than life over the place in {P} care, rising well above the people",
  mortal:"Many ordinary people are within {P} reach; one of them, {M}, is in the foreground looking up at {N}",
  camera:"Slightly low angle, 35mm lens. {N} rises above the people, with the whole place {N} watches over visible behind",
  feel:"reverence"},
 {min:25,key:"local",cn:"街坊級",en:"Local",
  reach:"一條街、一間屋、一個山口",gap:"只管得到身邊幾戶人;但對一個人來說,已經足夠",
  intro:"as {N} really is: close to human scale, reaching only one street, one house or one pass, right beside the people within {P} reach",
  size:"{N} is about human size and lives right next to people",
  mortal:"{M} is right beside {N} in the same place, close enough to touch",
  camera:"Eye level, 50mm lens. {N} and the person share the frame at similar size",
  feel:["the comforting closeness of something next door","the uncanny closeness of something next door"]},
 {min:0,key:"personal",cn:"一人級",en:"Personal",
  reach:"只及一個人、一個夢",gap:"幾乎沒有力量,只能找上一個人",
  intro:"as {N} really is: barely stronger than a person, able to reach only one human life",
  size:"{N} is no bigger than a person and only half there, faint at the edges",
  mortal:"{N} is close beside {M} in one small space",
  camera:"Close and intimate, 85mm lens. The person is sharp; {N} is soft and half-transparent beside them",
  feel:"intimacy"}
];
/* 凡人基準:所有比較都以「你」為起點 */
const HUMAN={power:5,scope:5,cn:"你 · 凡人",reach:"自己的生活,和身邊幾個人"};
function powerTier(v){ return POWER_TIERS.find(t=>v>=t.min)||POWER_TIERS[POWER_TIERS.length-1]; }
/* 對人的態度:由向人性與可協商度決定,同時寫出畫面中凡人的反應 */
function attitude(e){
  const [p,,v,n]=e.radar;
  if(p>=85&&n<=12) return {cn:"不知道你存在",en:"{N} does not notice the human at all. Prayer cannot reach {O}; the human is simply caught in {P} working like everything else"};
  if(v>=70&&n>=70) return {cn:"庇佑凡人,有求必應",en:"{N} protects people and answers prayers: the person is safe within {P} light, offering incense or giving thanks, and the whole scene feels sheltered"};
  if(v>=70) return {cn:"善待凡人,但按自己的方式",en:"{N} is kind to people, but on its own terms: the person is comforted, though not in control"};
  if(v>=45&&n>=55) return {cn:"不偏不倚,但肯聽供奉",en:"{N} is impartial but will listen to offerings: the person approaches carefully, gifts in hand"};
  if(v>=45) return {cn:"不偏不倚,按自己的法則",en:"{N} is impartial and judges by {P} own law, neither kind nor cruel: the person bows low or shields their eyes from {P} power"};
  if(v>=25) return {cn:"危險,對凡人帶惡意",en:"{N} is dangerous: the person keeps their distance, afraid, and the light around them feels unsafe"};
  return {cn:"獵食凡人",en:"{N} preys on people: the person is in danger, about to be taken or already running. Suggest the threat; show no gore"};
}

/* 各環的畫風(v3):每環一種一眼認得出、又有衝擊力的視覺語言 */
const BAND_STYLE={
  law:"The cosmic sublime: a vast, silent painting in silver-blue and ink black with the precision of an astronomical engraving and the scale of a deep-space photograph. Hair-thin lines of light, deep blacks, enormous negative space",
  sovereign:"Epic mythological painting with cinematic realism, in the grand tradition of Baroque ceiling frescoes: luminous marble-pale skin, wind-blown drapery, a golden-hour sky with violet atmosphere and restrained gold",
  edge:"Dark Romantic action painting with the energy of film key art: firelight and smoke, flying debris, hard vermilion rim light against charcoal, Greek black-figure pottery motifs hidden in the smoke",
  folk:"Cinematic Hong Kong temple realism with the richness of a Chinese temple mural: amber incense haze, shafts of lantern light, red lacquer and gold leaf, crowded with devotion",
  kin:"A quiet Hong Kong film still at night: warm, tender and grainy, lit by a single oil lamp, nothing grand or divine",
  threshold:"Liminal night photography fused with dark folklore painting: cold teal fog, one sodium-orange lamp, the figure seen mostly as silhouette and edge light. Dread, not gore",
  matter:"A 19th-century natural-history plate made cinematic: the eerie scene on one side resolves into a clean, measured scientific cutaway on the other"
};
/* 每環預設的「普通人」;希臘、香港、歐洲、現代各自不同 */
function mortalOf(e){
  const s=e.system||"";
  if(e.band==="law") return "one ordinary human";
  if(/希臘|羅馬/.test(s)) return "an ordinary ancient Greek farmer in a plain wool tunic";
  if(/都市|現代|網路|當代/.test(s)) return "an ordinary person of today";
  if(/香港|華人/.test(s)) return e.band==="kin"?"an ordinary Hong Kong family member of today":e.band==="threshold"?"an ordinary Hong Kong person of today, alone at night":"an ordinary Hong Kong worshipper";
  if(/歐|英|愛爾蘭|蘇格蘭|北歐|冰島|德語|凱爾特|阿爾卑斯|奧克尼|日耳曼/.test(s)) return "an ordinary villager of old Europe";
  return "an ordinary person";
}
