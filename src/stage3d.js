/* 立體台:抽屜內的 3D 舞台(three.js,經 import map 由 CDN 載入)
   三種內容,依素材自動選擇:
   1. GLB 模型   —— image-to-3D 工具(Meshy、Tripo、Hunyuan3D⋯)匯出的真 3D 模型
   2. 肖像＋深度 —— ChatGPT 生成的圖像,以深度圖把平面推成浮雕,游標移動即見視差
                    沒有深度圖時,以亮度＋中心權重自動估算(近似,暗底圖版效果最好)
   3. 六軸晶體   —— 無素材時的預設:把雷達多邊形擠出成晶體,形狀即身份 */

const loadThree=(()=>{ let p=null; return ()=>p||(p=import("three").catch(err=>{p=null;throw err;})); })();

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
  let T=null, renderer, scene, camera, clock, raf=0, host=null, obj=null, ro=null, token=0;
  const pointer={x:0,y:0,tx:0,ty:0}, drag={x:0,y:0,on:false,px:0,py:0};
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;

  async function init(){
    const [mod,{RoomEnvironment}]=await Promise.all([loadThree(),import("three/addons/environments/RoomEnvironment.js")]);
    T=mod;
    renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:"low-power"});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.outputColorSpace=T.SRGBColorSpace;
    renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=.9;
    scene=new T.Scene(); scene.environmentIntensity=.35;
    const pm=new T.PMREMGenerator(renderer);
    scene.environment=pm.fromScene(new RoomEnvironment(),.04).texture;
    pm.dispose();
    camera=new T.PerspectiveCamera(35,1,.1,100); camera.position.set(0,0,4.2);
    clock=new T.Clock();
    const cv=renderer.domElement;
    cv.setAttribute("role","img"); cv.setAttribute("aria-label","立體台:移動游標看視差,拖曳旋轉");
    cv.addEventListener("pointermove",ev=>{
      const r=cv.getBoundingClientRect();
      pointer.tx=((ev.clientX-r.left)/r.width-.5)*2; pointer.ty=((ev.clientY-r.top)/r.height-.5)*2;
      if(drag.on){ drag.y+=(ev.clientX-drag.px)*.01; drag.x=Math.max(-1,Math.min(1,drag.x+(ev.clientY-drag.py)*.01)); drag.px=ev.clientX; drag.py=ev.clientY; }
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
      [].concat(n.material||[]).forEach(m=>m.dispose());
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

  async function buildModel(url,col){
    const [{GLTFLoader},{DRACOLoader}]=await Promise.all([import("three/addons/loaders/GLTFLoader.js"),import("three/addons/loaders/DRACOLoader.js")]);
    const loader=new GLTFLoader();
    const draco=new DRACOLoader(); draco.setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/draco/gltf/");
    loader.setDRACOLoader(draco);
    const gltf=await loader.loadAsync(url);
    const root=gltf.scene, box=new T.Box3().setFromObject(root), size=box.getSize(new T.Vector3()), center=box.getCenter(new T.Vector3());
    root.position.sub(center);
    const inner=new T.Group(); inner.add(root); inner.scale.setScalar(2.2/Math.max(size.x,size.y,size.z,1e-6));
    const g=new T.Group(); g.add(inner); g.userData.kind="model";
    lights(g,new T.Color(col));
    return g;
  }

  async function show(el,e,col,assets){
    const my=++token;
    try{ if(!T) await init(); }
    catch(err){ console.warn("立體台未能載入 three.js",err); return {ok:false,label:"六軸側影 · 此環境未能載入 3D"}; }
    if(my!==token) return {ok:true,label:""};
    host=el; host.appendChild(renderer.domElement); ro.disconnect(); ro.observe(host); resize();
    drag.x=drag.y=0;
    let next=null, label="六軸晶體 · 拖曳旋轉";
    try{
      if(assets?.model){ next=await buildModel(assets.model,col); label="GLB 模型 · 拖曳旋轉"; }
      else if(assets?.img){ const r=await buildPortrait(assets.img,assets.depth,col); next=r.obj; label=r.depth?"肖像 · 深度圖立體化":"肖像 · 自動估算深度(近似)"; }
    }catch(err){ console.warn("素材載入失敗",err); next=null; label="素材未能載入 · 改顯六軸晶體"; }
    if(my!==token){ dispose(next); return {ok:true,label:""}; }
    if(!next) next=buildCrystal(e,col);
    if(obj){ scene.remove(obj); dispose(obj); }
    obj=next; scene.add(obj);
    start();
    return {ok:true,label};
  }

  function tick(){
    const t=clock.getElapsedTime();
    pointer.x+=(pointer.tx-pointer.x)*.08; pointer.y+=(pointer.ty-pointer.y)*.08;
    const sway=reduced?0:1;
    if(obj?.userData.kind==="portrait"){
      const {w,h}=obj.userData, vh=2*camera.position.z*Math.tan(camera.fov*Math.PI/360), vw=vh*camera.aspect;
      obj.scale.setScalar(Math.min(1,vw*.92/w,vh*.92/h));
      camera.position.set(pointer.x*.65+Math.sin(t*.5)*.08*sway+drag.y*.4,-pointer.y*.45+Math.sin(t*.37)*.05*sway,4.2);
      camera.lookAt(0,0,0);
    }else if(obj){
      camera.position.set(0,0,4.2); camera.lookAt(0,0,0);
      const spin=obj.userData.kind==="model"?t*.4:Math.sin(t*.6)*.7;
      obj.rotation.y=drag.y+spin*sway+pointer.x*.35;
      obj.rotation.x=drag.x-pointer.y*.25;
    }
    renderer.render(scene,camera);
  }
  function start(){
    if(raf) return;
    const loop=()=>{ raf=requestAnimationFrame(loop); if(!document.hidden) tick(); };
    loop();
  }
  function stop(){ token++; cancelAnimationFrame(raf); raf=0; }

  return {show,stop};
})();
