/* 立體台:抽屜內的 3D 舞台(three.js,經 import map 由 CDN 載入)
   三種內容,依素材自動選擇:
   1. GLB 模型   —— Meshy 等 image-to-3D 工具匯出的真 3D 模型,以展示櫃規格呈現:
                    所屬環色調的攝影棚環境光、暖白主光＋環色輪廓光、接觸陰影、光環地台、可拖曳縮放
   2. 肖像＋深度 —— ChatGPT 生成的圖像,以深度圖把平面推成浮雕,游標移動即見視差
                    沒有深度圖時,以亮度＋中心權重自動估算(近似,暗底圖版效果最好)
   3. 六軸晶體   —— 無素材時的預設:把雷達多邊形擠出成晶體,形狀即身份 */

const loadThree=(()=>{ let p=null; return ()=>p||(p=import("three").catch(err=>{p=null;throw err;})); })();

/* GLB 讀取器
   · 直接讀 File/Blob 的位元組,不用 fetch(blob:)——claude.ai Artifact 這類嚴格環境會擋住這種讀法
   · 內嵌貼圖用 <img> 解碼,不用 Chrome 預設的 ImageBitmapLoader(它同樣靠 fetch)
   · 只在模型真的用了 Meshopt 壓縮時才載入解碼器(它需要 WebAssembly,嚴格環境可能不准)
   · 讀之前先檢查檔頭與擴充,失敗時說出原因(格式不對、Draco、KTX2、file://、路徑錯⋯) */
class ModelError extends Error{ constructor(code,message){ super(message); this.code=code; } }
const GLB=(()=>{
  let base=null;
  const mb=n=>(n/1048576).toFixed(n<10485760?1:0)+" MB";
  const fail=(code,msg)=>{ throw new ModelError(code,msg); };
  function loader(){
    return base||(base=Promise.all([loadThree(),import("three/addons/loaders/GLTFLoader.js"),import("three/addons/loaders/DRACOLoader.js")])
      .then(([T,{GLTFLoader},{DRACOLoader}])=>{
        const l=new GLTFLoader();
        const d=new DRACOLoader(); d.setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/draco/gltf/"); l.setDRACOLoader(d);
        l.register(parser=>{ parser.textureLoader=new T.TextureLoader(parser.options.manager); return {name:"spectrum_img_textures"}; });
        return {T,l};
      }).catch(err=>{ base=null; throw err; }));
  }
  async function bytes(src){
    if(src instanceof Blob) return src.arrayBuffer();
    if(location.protocol==="file:"&&!/^(blob|data|https?):/i.test(src))
      fail("file","以 file:// 直接打開網頁時,瀏覽器不准讀取模型檔。請用本機伺服器開啟(python3 -m http.server),或把 GLB 直接拖進立體台。");
    let res;
    try{ res=await fetch(src); }catch{ fail("blocked",`這個環境不准讀取 ${src}。請把 GLB 直接拖進立體台。`); }
    if(!res.ok) fail("http",res.status===404?`找不到檔案 ${src}。請檢查 assets/models.js 或 manifest.js 的路徑與檔名。`:`讀取 ${src} 失敗(HTTP ${res.status})。`);
    return res.arrayBuffer();
  }
  /* 看檔頭:GLB 以 "glTF" 開頭;其餘常見 3D 格式給出對應提示 */
  function inspect(buf){
    const info={bytes:buf.byteLength,ext:[]};
    const head=new Uint8Array(buf,0,Math.min(64,buf.byteLength)), text=new TextDecoder().decode(head);
    if(buf.byteLength>=20&&text.startsWith("glTF")){
      const dv=new DataView(buf), len=dv.getUint32(12,true), type=dv.getUint32(16,true);
      if(type!==0x4E4F534A||20+len>buf.byteLength) fail("corrupt","這個 GLB 檔不完整(可能下載未完成),請重新下載。");
      const json=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,20,len)));
      info.ext=json.extensionsUsed||[];
      return info;
    }
    if(text.trimStart().startsWith("{")){
      let json=null; try{ json=JSON.parse(new TextDecoder().decode(buf)); }catch{}
      if(json?.asset){
        const external=[...(json.buffers||[]),...(json.images||[])].some(x=>x.uri&&!/^data:/.test(x.uri));
        if(external) fail("gltf",".gltf 檔需要旁邊的 .bin 與貼圖檔,單獨匯入讀不到。請改為匯出單一檔案的 .glb(glTF Binary)。");
        info.ext=json.extensionsUsed||[]; return info;
      }
    }
    fail("format",notGlb(text));
  }
  /* 由檔頭認出常見的其他 3D 格式,給出對應提示;是 GLB/glTF 則回傳 null */
  function notGlb(text){
    if(text.startsWith("glTF")||text.trimStart().startsWith("{")) return null;
    const kind=text.startsWith("Kaydara FBX")||/FBXHeader/.test(text)?"FBX":text.startsWith("PK")?"壓縮檔(.zip 或 .usdz)":
      text.startsWith("solid")?"STL":/^(#|v |o |mtllib|g )/m.test(text)?"OBJ":text.startsWith("BLENDER")?"Blender (.blend)":null;
    return kind?`這是 ${kind},不是 GLB。請在 Meshy 下載時選擇 GLB 格式${kind.startsWith("壓縮")?",或先解壓再選裏面的 .glb":""}。`:"這不是 GLB 檔(檔頭不是 glTF)。請確認下載的是 .glb 格式。";
  }
  /* 放入前先看頭 64 bytes:是 GLB 回傳 null,否則回傳原因 */
  async function check(file){ return notGlb(new TextDecoder().decode(new Uint8Array(await file.slice(0,64).arrayBuffer()))); }
  async function load(src){
    const buf=await bytes(src), info=inspect(buf);
    const {l}=await loader();
    if(info.ext.includes("KHR_texture_basisu")) fail("ktx2","這個 GLB 的貼圖是 KTX2 格式,這裏讀不到。請先執行 node tools/meshy/optimize.mjs,會轉成 WebP。");
    if(info.ext.includes("EXT_meshopt_compression")){
      try{ const {MeshoptDecoder}=await import("three/addons/libs/meshopt_decoder.module.js"); await MeshoptDecoder.ready; l.setMeshoptDecoder(MeshoptDecoder); }
      catch{ fail("meshopt","這個 GLB 用了 Meshopt 壓縮,但這個環境不允許 WebAssembly 解碼。請用 node tools/meshy/optimize.mjs 重新輸出(預設已不用 Meshopt)。"); }
    }
    try{ return await l.parseAsync(buf,""); }
    catch(err){
      if(info.ext.includes("KHR_draco_mesh_compression")) fail("draco","這個 GLB 用了 Draco 壓縮,這個環境載入不到解碼器。請先執行 node tools/meshy/optimize.mjs(會轉成不需解碼器的格式),或在下載時不選壓縮。");
      fail("parse",`GLB 解析失敗:${err?.message||err}`);
    }
  }
  /* 手機顯示卡最大只收 4096(部分 2048)的貼圖;Meshy 的 4K/8K 貼圖先縮細,避免變黑或當機 */
  function capTextures(root,limit){
    const done=new Set();
    root.traverse(o=>{ [].concat(o.material||[]).forEach(m=>{ for(const k in m){ const t=m[k];
      if(!t?.isTexture||done.has(t)||!t.image) continue; done.add(t);
      const w=t.image.width, h=t.image.height; if(!(w>limit||h>limit)) continue;
      const s=limit/Math.max(w,h), c=document.createElement("canvas"); c.width=Math.round(w*s); c.height=Math.round(h*s);
      c.getContext("2d").drawImage(t.image,0,0,c.width,c.height); t.image=c; t.needsUpdate=true;
    } }); });
  }
  return {load,check,capTextures,mb};
})();
const loadGLTF=src=>GLB.load(src);

/* 所屬環色調的攝影棚:暖白柔光箱在左上前方,兩條環色燈條在後方,地面微弱反光。
   以 PMREM 轉成環境光,令模型的金屬、漆面、大理石都反射出同一環的顏色。 */
function bandEnvironment(T,renderer,hex,cache){
  if(cache.has(hex)) return cache.get(hex);
  const s=new T.Scene(), band=new T.Color(hex);
  s.add(new T.Mesh(new T.BoxGeometry(12,12,12),new T.MeshBasicMaterial({color:0x07080b,side:T.BackSide})));
  const panel=(w,h,color,k,pos)=>{ const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(color).multiplyScalar(k),side:T.DoubleSide})); m.position.set(...pos); m.lookAt(0,0,0); s.add(m); };
  panel(4.5,3,0xfff1de,7,[-3.2,3.6,3.2]);
  panel(1.1,7,band,6,[4.6,1,-3.4]);
  panel(1.1,7,band,4,[-4.6,1,-3.4]);
  panel(8,1.2,0x2c2723,1.4,[0,-5.4,0]);
  const pm=new T.PMREMGenerator(renderer), tex=pm.fromScene(s,.03).texture;
  pm.dispose(); s.traverse(o=>{ o.geometry?.dispose(); o.material?.dispose(); });
  cache.set(hex,tex); return tex;
}
function shadowCanvas(){
  const c=document.createElement("canvas"); c.width=c.height=256;
  const g=c.getContext("2d"), r=g.createRadialGradient(128,128,0,128,128,128);
  r.addColorStop(0,"rgba(0,0,0,.6)"); r.addColorStop(.5,"rgba(0,0,0,.22)"); r.addColorStop(1,"rgba(0,0,0,0)");
  g.fillStyle=r; g.fillRect(0,0,256,256); return c;
}

let GLOW_CANVAS=null;
function glowCanvas(){
  if(GLOW_CANVAS) return GLOW_CANVAS;
  const c=document.createElement("canvas"); c.width=c.height=128;
  const g=c.getContext("2d"), r=g.createRadialGradient(64,64,0,64,64,64);
  r.addColorStop(0,"rgba(255,255,255,1)"); r.addColorStop(.25,"rgba(255,255,255,.45)"); r.addColorStop(1,"rgba(255,255,255,0)");
  g.fillStyle=r; g.fillRect(0,0,128,128);
  return GLOW_CANVAS=c;
}

function loadImage(src){
  return new Promise((res,rej)=>{ const i=new Image(); i.decoding="async"; i.onload=()=>res(i); i.onerror=()=>rej(new Error("image failed: "+src)); i.src=src; });
}

/* 深度圖處理:灰階化、正規化、輕度模糊(避免浮雕出現尖刺) */
function boxBlur(a,W,H,r){
  const t=new Float32Array(a.length);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let s=0,n=0;for(let k=-r;k<=r;k++){const xx=x+k;if(xx>=0&&xx<W){s+=a[y*W+xx];n++;}}t[y*W+x]=s/n;}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let s=0,n=0;for(let k=-r;k<=r;k++){const yy=y+k;if(yy>=0&&yy<H){s+=t[yy*W+x];n++;}}a[y*W+x]=s/n;}
}
function depthCanvas(img,{auto}){
  const W=auto?128:256, H=Math.max(1,Math.round(W*img.naturalHeight/img.naturalWidth));
  const c=document.createElement("canvas"); c.width=W; c.height=H;
  const g=c.getContext("2d",{willReadFrequently:true});
  g.drawImage(img,0,0,W,H);
  const d=g.getImageData(0,0,W,H), p=d.data, L=new Float32Array(W*H);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const i=y*W+x, lum=(.2126*p[i*4]+.7152*p[i*4+1]+.0722*p[i*4+2])/255;
    if(auto){ const dx=(x/W-.5)*2, dy=(y/H-.45)*1.8, rad=Math.max(0,1-Math.sqrt(dx*dx+dy*dy)); L[i]=.55*lum+.45*rad; }
    else L[i]=lum;
  }
  boxBlur(L,W,H,auto?3:1); if(auto) boxBlur(L,W,H,2);
  let lo=1,hi=0; for(const v of L){ if(v<lo)lo=v; if(v>hi)hi=v; }
  for(let i=0;i<L.length;i++){ const v=Math.round((L[i]-lo)/((hi-lo)||1)*255); p[i*4]=p[i*4+1]=p[i*4+2]=v; p[i*4+3]=255; }
  g.putImageData(d,0,0);
  return c;
}

const Stage3D=(()=>{
  let T=null, renderer, scene, camera, clock, controls=null, raf=0, host=null, obj=null, ro=null, token=0, mixer=null, roomEnv=null;
  const pointer={x:0,y:0,tx:0,ty:0}, drag={x:0,y:0,on:false,px:0,py:0}, envCache=new Map();
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;

  async function init(){
    const [mod,{RoomEnvironment},{OrbitControls}]=await Promise.all([loadThree(),import("three/addons/environments/RoomEnvironment.js"),import("three/addons/controls/OrbitControls.js")]);
    T=mod;
    renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:"low-power"});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.outputColorSpace=T.SRGBColorSpace;
    renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=.9;
    scene=new T.Scene(); scene.environmentIntensity=.35;
    const pm=new T.PMREMGenerator(renderer);
    roomEnv=pm.fromScene(new RoomEnvironment(),.04).texture;
    pm.dispose();
    camera=new T.PerspectiveCamera(35,1,.05,100); camera.position.set(0,0,4.2);
    clock=new T.Clock();
    const cv=renderer.domElement;
    cv.setAttribute("role","img"); cv.setAttribute("aria-label","立體台:拖曳旋轉,模型可用滾輪或雙指縮放");
    controls=new OrbitControls(camera,cv);
    Object.assign(controls,{enableDamping:true,dampingFactor:.08,enablePan:false,minDistance:2.4,maxDistance:9,autoRotateSpeed:1.1,enabled:false});
    controls.addEventListener("start",()=>{ controls.autoRotate=false; });
    cv.addEventListener("pointermove",ev=>{
      const r=cv.getBoundingClientRect();
      pointer.tx=((ev.clientX-r.left)/r.width-.5)*2; pointer.ty=((ev.clientY-r.top)/r.height-.5)*2;
      if(drag.on&&!controls.enabled){ drag.y+=(ev.clientX-drag.px)*.01; drag.x=Math.max(-1,Math.min(1,drag.x+(ev.clientY-drag.py)*.01)); drag.px=ev.clientX; drag.py=ev.clientY; }
    });
    cv.addEventListener("pointerdown",ev=>{ drag.on=true; drag.px=ev.clientX; drag.py=ev.clientY; });
    ["pointerup","pointercancel","pointerleave"].forEach(t=>cv.addEventListener(t,()=>{ drag.on=false; if(t!=="pointerup"){pointer.tx=0;pointer.ty=0;} }));
    ro=new ResizeObserver(resize);
  }

  function resize(){
    if(!host) return;
    const w=host.clientWidth, h=host.clientHeight; if(!w||!h) return;
    renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
  }

  function dispose(o){
    if(!o) return;
    o.traverse(n=>{
      n.geometry?.dispose();
      [].concat(n.material||[]).forEach(m=>{ for(const k in m){ if(m[k]?.isTexture) m[k].dispose(); } m.dispose(); });
    });
    (o.userData.tex||[]).forEach(t=>t.dispose());
  }

  function lights(g,c){
    const key=new T.DirectionalLight(0xffffff,1.1); key.position.set(2,3,4);
    const rim=new T.PointLight(c,5,9); rim.position.set(-1.6,-1,-1.6);
    g.add(key,rim,new T.AmbientLight(0xffffff,.25));
  }

  function glowSprite(c,s){
    const tex=new T.CanvasTexture(glowCanvas());
    const sp=new T.Sprite(new T.SpriteMaterial({map:tex,color:c,transparent:true,opacity:.32,blending:T.AdditiveBlending,depthWrite:false}));
    sp.scale.set(s,s,1); sp.position.z=-.5;
    return [sp,tex];
  }

  function buildCrystal(e,col){
    const g=new T.Group(), c=new T.Color(col), R=1.05;
    g.userData.kind="crystal";
    const ang=i=>Math.PI/2-i*Math.PI/3;  // 與 2D 法陣同向:第一軸在正上,順時針
    const pts=e.radar.map((v,i)=>new T.Vector2(Math.cos(ang(i))*R*Math.max(v,6)/100,Math.sin(ang(i))*R*Math.max(v,6)/100));
    const geo=new T.ExtrudeGeometry(new T.Shape(pts),{depth:.22,bevelEnabled:true,bevelThickness:.06,bevelSize:.05,bevelSegments:4});
    geo.center();
    const mesh=new T.Mesh(geo,new T.MeshPhysicalMaterial({color:c,emissive:c,emissiveIntensity:.1,metalness:.1,roughness:.3,
      clearcoat:.6,clearcoatRoughness:.15,transparent:true,opacity:.9}));
    mesh.add(new T.LineSegments(new T.EdgesGeometry(geo,25),new T.LineBasicMaterial({color:c.clone().lerp(new T.Color(0xffffff),.4),transparent:true,opacity:.85})));
    const frame=[]; for(let i=0;i<=6;i++) frame.push(new T.Vector3(Math.cos(ang(i))*R,Math.sin(ang(i))*R,0));
    const half=frame.map(v=>v.clone().multiplyScalar(.5));
    const lm=new T.LineBasicMaterial({color:0xECE6D9,transparent:true,opacity:.16});
    const spokes=[]; for(let i=0;i<6;i++) spokes.push(new T.Vector3(),frame[i]);
    g.add(new T.Line(new T.BufferGeometry().setFromPoints(frame),lm),
          new T.Line(new T.BufferGeometry().setFromPoints(half),lm),
          new T.LineSegments(new T.BufferGeometry().setFromPoints(spokes),lm),mesh);
    const [sp,tex]=glowSprite(c,3.4); g.add(sp); g.userData.tex=[tex];
    lights(g,c);
    return g;
  }

  async function buildPortrait(imgUrl,depthUrl,col){
    const img=await loadImage(imgUrl);
    let dimg=null; if(depthUrl){ try{ dimg=await loadImage(depthUrl); }catch{ dimg=null; } }
    const dc=dimg?depthCanvas(dimg,{auto:false}):depthCanvas(img,{auto:true});
    const tex=new T.Texture(img); tex.colorSpace=T.SRGBColorSpace; tex.anisotropy=4; tex.needsUpdate=true;
    const dtex=new T.CanvasTexture(dc);
    const aspect=img.naturalWidth/img.naturalHeight, h=2.3, w=h*aspect;
    const geo=new T.PlaneGeometry(w,h,Math.round(Math.min(240,200*aspect)),Math.round(Math.min(240,200/aspect)));
    const mat=new T.ShaderMaterial({
      transparent:true, toneMapped:false,
      uniforms:{map:{value:tex},depth:{value:dtex},strength:{value:dimg?.6:.45},edge:{value:.04}},
      vertexShader:`uniform sampler2D depth;uniform float strength;varying vec2 vUv;varying float vD;
        void main(){vUv=uv;float d=texture2D(depth,uv).r;vD=d;vec3 p=position;p.z+=(d-.5)*strength;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
      fragmentShader:`uniform sampler2D map;uniform float edge;varying vec2 vUv;varying float vD;
        void main(){vec4 c=texture2D(map,vUv);
        float m=smoothstep(0.,edge,vUv.x)*smoothstep(0.,edge,1.-vUv.x)*smoothstep(0.,edge,vUv.y)*smoothstep(0.,edge,1.-vUv.y);
        gl_FragColor=vec4(c.rgb*(.8+.3*vD),c.a*m);
        #include <colorspace_fragment>
        }`
    });
    const g=new T.Group(); g.add(new T.Mesh(geo,mat));
    g.userData={kind:"portrait",w,h,tex:[tex,dtex]};
    return {obj:g,depth:!!dimg};
  }

  /* 展示櫃:模型高度統一為 2.1,腳底落在地台上;環色光環地台 ＋ 接觸陰影 ＋ 暖白主光與環色輪廓光 */
  async function buildModel(src,col){
    const gltf=await loadGLTF(src);
    const root=gltf.scene, c=new T.Color(col);
    GLB.capTextures(root,Math.min(renderer.capabilities.maxTextureSize,matchMedia("(max-width:720px)").matches?2048:4096));
    const box=new T.Box3().setFromObject(root), size=box.getSize(new T.Vector3()), ctr=box.getCenter(new T.Vector3());
    const s=Math.min(2.1/Math.max(size.y,1e-6),2.6/Math.max(size.x,size.z,1e-6));
    root.scale.setScalar(s); root.position.set(-ctr.x*s,-box.min.y*s-1.05,-ctr.z*s);
    root.traverse(n=>{ if(n.isMesh){ n.castShadow=false; [].concat(n.material||[]).forEach(m=>{ if(m.map) m.map.anisotropy=8; }); } });
    const g=new T.Group(); g.add(root); g.userData.kind="model";
    const foot=Math.max(size.x,size.z)*s;
    const stex=new T.CanvasTexture(shadowCanvas());
    const shadow=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:stex,transparent:true,depthWrite:false}));
    shadow.rotation.x=-Math.PI/2; shadow.scale.setScalar(foot*1.7); shadow.position.y=-1.049;
    const ring=new T.Mesh(new T.RingGeometry(foot*.62,foot*.66,96),new T.MeshBasicMaterial({color:c,transparent:true,opacity:.55,side:T.DoubleSide,depthWrite:false}));
    ring.rotation.x=-Math.PI/2; ring.position.y=-1.048;
    const gtex=new T.CanvasTexture(glowCanvas());
    const halo=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:gtex,color:c,transparent:true,opacity:.35,blending:T.AdditiveBlending,depthWrite:false}));
    halo.rotation.x=-Math.PI/2; halo.scale.setScalar(foot*2.4); halo.position.y=-1.047;
    const key=new T.DirectionalLight(0xfff4e6,1.8); key.position.set(-2.2,3.2,3.4);
    const rim=new T.DirectionalLight(c,3.2); rim.position.set(2.8,1.8,-3.2);
    const rim2=new T.DirectionalLight(c,1.6); rim2.position.set(-2.8,.8,-2.6);
    g.add(shadow,ring,halo,key,rim,rim2,new T.AmbientLight(0xffffff,.12));
    g.userData.tex=[stex,gtex];
    if(gltf.animations?.length){ g.userData.clips=gltf.animations; }
    return g;
  }

  async function show(el,e,col,assets,prefer){
    const my=++token;
    try{ if(!T) await init(); }
    catch(err){ console.warn("立體台未能載入 three.js",err); return {ok:false,label:"六軸側影 · 此環境未能載入 3D"}; }
    if(my!==token) return {ok:true,label:""};
    host=el; host.appendChild(renderer.domElement); ro.disconnect(); ro.observe(host); resize();
    drag.x=drag.y=0;
    let next=null, label="六軸晶體 · 拖曳旋轉", error=null;
    const wantModel=(assets?.model||assets?.modelBlob)&&!(prefer==="portrait"&&assets?.img);
    try{
      if(wantModel){ next=await buildModel(assets.modelBlob||assets.model,col); label=`3D 模型${assets.source?` · ${assets.source}`:""} · 拖曳旋轉、滾輪縮放`; }
      else if(assets?.img){ const r=await buildPortrait(assets.img,assets.depth,col); next=r.obj; label=r.depth?"肖像 · 深度圖立體化":"肖像 · 自動估算深度(近似)"; }
    }catch(err){
      console.warn("素材載入失敗",err); next=null;
      error=err instanceof ModelError?err.message:wantModel?`GLB 載入失敗:${err?.message||err}`:`圖像載入失敗:${err?.message||err}`;
      label=wantModel?"GLB 未能載入 · 暫顯六軸晶體":"圖像未能載入 · 暫顯六軸晶體";
    }
    if(my!==token){ dispose(next); return {ok:true,label:""}; }
    if(!next) next=buildCrystal(e,col);
    if(obj){ scene.remove(obj); dispose(obj); }
    mixer?.stopAllAction(); mixer=null;
    obj=next; scene.add(obj);
    const isModel=obj.userData.kind==="model";
    scene.environment=isModel?bandEnvironment(T,renderer,col,envCache):roomEnv;
    scene.environmentIntensity=isModel?1:.35;
    renderer.toneMappingExposure=isModel?1:.9;
    controls.enabled=isModel;
    renderer.domElement.style.touchAction=isModel?"none":"pan-y";
    if(isModel){
      camera.fov=32; camera.updateProjectionMatrix();
      camera.position.set(1.2,.5,5.2); controls.target.set(0,-.05,0); controls.autoRotate=!reduced; controls.update();
      if(obj.userData.clips){ mixer=new T.AnimationMixer(obj); mixer.clipAction(obj.userData.clips[0]).play(); }
    }else{ camera.fov=35; camera.updateProjectionMatrix(); }
    start();
    return {ok:true,label,error,kind:obj.userData.kind};
  }

  function tick(){
    const dt=clock.getDelta(), t=clock.elapsedTime;
    pointer.x+=(pointer.tx-pointer.x)*.08; pointer.y+=(pointer.ty-pointer.y)*.08;
    const sway=reduced?0:1;
    const k=obj?.userData.kind;
    if(k==="portrait"){
      const {w,h}=obj.userData, vh=2*camera.position.z*Math.tan(camera.fov*Math.PI/360), vw=vh*camera.aspect;
      obj.scale.setScalar(Math.min(1,vw*.92/w,vh*.92/h));
      camera.position.set(pointer.x*.65+Math.sin(t*.5)*.08*sway+drag.y*.4,-pointer.y*.45+Math.sin(t*.37)*.05*sway,4.2);
      camera.lookAt(0,0,0);
    }else if(k==="model"){
      mixer?.update(dt);
      controls.update();
    }else if(obj){
      camera.position.set(0,0,4.2); camera.lookAt(0,0,0);
      obj.rotation.y=drag.y+Math.sin(t*.6)*.7*sway+pointer.x*.35;
      obj.rotation.x=drag.x-pointer.y*.25;
    }
    renderer.render(scene,camera);
  }
  function start(){
    if(raf) return;
    clock.getDelta();
    const loop=()=>{ raf=requestAnimationFrame(loop); if(!document.hidden) tick(); };
    loop();
  }
  function stop(){ token++; cancelAnimationFrame(raf); raf=0; if(controls) controls.enabled=false; }

  return {show,stop};
})();
