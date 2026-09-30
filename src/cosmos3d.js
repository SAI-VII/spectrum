/* 星宇 3D:把整部圖鑑放進一座可旋轉的光譜塔
   · 光譜塔:七環由上(法)而下(物)疊起;每環半徑 = 該環平均「影響半徑」,所以塔身在「念」收得最窄——
     離中軸最近的,是被記得的人。晶體＝六軸側影擠出,大小＝本體權能,顏色與亮度隨「光照」而變。
   · 軸空間:任選三軸作 X/Y/Z,每位靈體落在對應座標;X↔Y 顯示相關係數,可以直接檢驗「權能與親密成反比」。 */

const Cosmos=(()=>{
  let T, renderer, scene, camera, controls, composer, clock, host, canvas, ro;
  let raf=0, ready=false, loading=null, failed=false, active=false;
  let layout="tower", mix=0, axes=[0,2,5], fly=null, lastInteract=0, hovered=null, pointerNdc=null, downAt=null, focusAfter=null;
  const nodes=[], towerFx=[], axisFx=[], axisLabels=[], geoCache=new Map();
  let embers=null, stars=null, glowTex=null;
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const BAND_Y={}, BAND_R={};
  BANDS.forEach((b,i)=>{
    BAND_Y[b.key]=66-i*22;
    const L=BAND_LISTS[b.key]; BAND_R[b.key]=6+L.reduce((s,e)=>s+e.radar[1],0)/L.length*.42;
  });
  const TOWER_CAM=[0,40,218], AXES_CAM=[150,78,170];
  /* 直幅螢幕把鏡頭拉遠,令整座塔放得入畫面 */
  const camAt=p=>new T.Vector3(...p).multiplyScalar(Math.max(1,.85/Math.max(camera.aspect,.3)));

  const hash=(n,k)=>{ let h=(n*2654435761+k*40503)>>>0; h^=h>>>15; h=Math.imul(h,2246822519)>>>0; h^=h>>>13; return (h%1000)/1000; };

  /* ─ 文字精靈(環名、軸名) ─ */
  function textSprite(draw,w,h,scale){
    const c=document.createElement("canvas"); c.width=w; c.height=h;
    draw(c.getContext("2d"),w,h);
    const tex=new T.CanvasTexture(c); tex.colorSpace=T.SRGBColorSpace;
    const sp=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthWrite:false,opacity:.9}));
    sp.scale.set(scale,scale*h/w,1);
    return sp;
  }

  function crystalGeo(vals){
    const key=vals.join(",");
    if(!geoCache.has(key)){
      const pts=vals.map((v,i)=>{ const a=Math.PI/2-i*Math.PI/3, r=Math.max(v,8)/100; return new T.Vector2(Math.cos(a)*r,Math.sin(a)*r); });
      const g=new T.ExtrudeGeometry(new T.Shape(pts),{depth:.16,bevelEnabled:true,bevelThickness:.05,bevelSize:.04,bevelSegments:2});
      g.center(); geoCache.set(key,g);
    }
    return geoCache.get(key);
  }

  function towerPos(e,i,n){
    const R=BAND_R[e.band], k=BAND_ORDER.indexOf(e.band), two=n>24;
    const a=k*.9+i/n*Math.PI*2, r=R*(.92+.16*e.radar[1]/100)+(two?(i%2?-2.3:2.3):0);
    const y=BAND_Y[e.band]+(e.radar[0]-50)*.06+(two?(i%2?-1.2:1.2):0);
    return new T.Vector3(Math.cos(a)*r,y,Math.sin(a)*r);
  }
  function axesPos(e){
    const j=k=>(hash(e.rank,k)-.5)*2.6;  // 同值的靈體稍微錯開,不至完全重疊
    return new T.Vector3((e.radar[axes[0]]-50)*.9+j(1),(e.radar[axes[1]]-50)*.9+j(2),(e.radar[axes[2]]-50)*.9+j(3));
  }

  function buildNodes(){
    BANDS.forEach(b=>{
      const L=BAND_LISTS[b.key];
      L.forEach((e,i)=>{
        const pivot=new T.Object3D(), size=1.1+e.radar[0]/100*2.2;
        const mat=new T.MeshStandardMaterial({metalness:.25,roughness:.35,transparent:true});
        const mesh=new T.Mesh(crystalGeo(e.radar),mat); mesh.scale.setScalar(size); mesh.userData.node=null;
        const glow=new T.Sprite(new T.SpriteMaterial({map:glowTex,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));
        glow.scale.setScalar(size*2.2);
        pivot.add(glow,mesh); scene.add(pivot);
        const tower=towerPos(e,i,L.length);
        const n={e,pivot,mesh,glow,size,tower,axes:new T.Vector3(),cur:tower.clone(),phase:hash(e.rank,9)*6.28,vis:true,hover:0};
        mesh.userData.node=n; pivot.position.copy(tower);
        nodes.push(n);
      });
    });
    placeAxes();
  }
  function placeAxes(){ nodes.forEach(n=>n.axes.copy(axesPos(n.e))); }

  function fx(list,obj,opacity){ list.push([obj,opacity]); scene.add(obj); return obj; }

  function buildTower(){
    const serif=cvar("--serif"), display=cvar("--display");
    /* 中軸:法 → 物 的漸變光柱 */
    const top=BAND_Y.law+16, bot=BAND_Y.matter-16, segs=48;
    const cyl=new T.CylinderGeometry(.16,.16,top-bot,8,segs,true); cyl.translate(0,(top+bot)/2,0);
    const cols=[], pos=cyl.attributes.position, stops=BANDS.map(b=>[BAND_Y[b.key],new T.Color(cvar(b.color))]);
    for(let i=0;i<pos.count;i++){
      const y=pos.getY(i); let c=stops[0][1];
      for(let s=0;s<stops.length-1;s++){ const [y0,c0]=stops[s],[y1,c1]=stops[s+1]; if(y<=y0&&y>=y1){ c=c0.clone().lerp(c1,(y0-y)/(y0-y1)); break; } if(y<stops[stops.length-1][0]) c=stops[stops.length-1][1]; }
      cols.push(c.r,c.g,c.b);
    }
    cyl.setAttribute("color",new T.Float32BufferAttribute(cols,3));
    fx(towerFx,new T.Mesh(cyl,new T.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.75})),.75);

    BANDS.forEach(b=>{
      const y=BAND_Y[b.key], R=BAND_R[b.key], col=new T.Color(cvar(b.color));
      const pts=[]; for(let i=0;i<=128;i++){ const a=i/128*Math.PI*2; pts.push(new T.Vector3(Math.cos(a)*R,y,Math.sin(a)*R)); }
      fx(towerFx,new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:col,transparent:true,opacity:.3})),.3);
      if(b.warm){   /* 暖帶:信與念兩環底下一片暖光 */
        const disc=new T.Mesh(new T.CircleGeometry(R*1.5,64),new T.MeshBasicMaterial({map:glowTex,color:col,transparent:true,opacity:.14,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));
        disc.rotation.x=-Math.PI/2; disc.position.y=y-.6; fx(towerFx,disc,.14);
        const lamp=new T.PointLight(col,500,R*2.6,1.6); lamp.position.set(0,y+2,0); scene.add(lamp); towerFx.push([lamp,500]);
      }
      const sp=textSprite((g,w,h)=>{
        g.fillStyle=cvar(b.color); g.font=`400 150px ${serif}`; g.textBaseline="middle"; g.textAlign="left"; g.fillText(b.seal,10,h/2+6);
        g.fillStyle="#ECE6D9"; g.font=`400 50px ${serif}`; g.fillText(b.cn,180,h/2-26);
        g.fillStyle="#9B968A"; g.font=`italic 400 40px ${display}`; g.fillText(b.en,180,h/2+34);
      },640,200,25);
      sp.position.set(-(R+13),y+1,0); fx(towerFx,sp,.9);
    });
  }

  function buildAxisFrame(){
    const box=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(90,90,90)),new T.LineBasicMaterial({color:0xECE6D9,transparent:true,opacity:.12}));
    fx(axisFx,box,.12);
    const o=new T.Vector3(-45,-45,-45), dirs=[[1,0,0],[0,1,0],[0,0,1]], cols=[0xF2BD5C,0x9B86D9,0x6FB0A4];
    dirs.forEach((d,i)=>{
      const end=o.clone().add(new T.Vector3(...d).multiplyScalar(96));
      fx(axisFx,new T.Line(new T.BufferGeometry().setFromPoints([o,end]),new T.LineBasicMaterial({color:cols[i],transparent:true,opacity:.8})),.8);
    });
    /* 0 與 100 的網格面,令讀數有參照 */
    const grid=new T.GridHelper(90,4,0x6C675D,0x2A2E36); grid.position.y=-45;
    grid.material.transparent=true; grid.material.opacity=.35; fx(axisFx,grid,.35);
    relabelAxes();
  }
  function relabelAxes(){
    axisLabels.forEach(s=>{ scene.remove(s); s.material.map.dispose(); s.material.dispose(); const k=axisFx.findIndex(f=>f[0]===s); if(k>=0) axisFx.splice(k,1); });
    axisLabels.length=0;
    const serif=cvar("--serif"), cols=["#F2BD5C","#9B86D9","#6FB0A4"], ends=[[56,-45,-45],[-45,56,-45],[-45,-45,56]];
    axes.forEach((ai,i)=>{
      const sp=textSprite((g,w,h)=>{ g.fillStyle=cols[i]; g.font=`400 64px ${serif}`; g.textAlign="center"; g.textBaseline="middle"; g.fillText(`${"XYZ"[i]} · ${AXES[ai].label}`,w/2,h/2); },560,120,22);
      sp.position.set(...ends[i]); axisLabels.push(fx(axisFx,sp,.95));
    });
    const zero=textSprite((g,w,h)=>{ g.fillStyle="#9B968A"; g.font=`400 56px ${cvar("--mono")}`; g.textAlign="center"; g.textBaseline="middle"; g.fillText("0",w/2,h/2); },120,120,5);
    zero.position.set(-49,-49,-49); axisLabels.push(fx(axisFx,zero,.9));
    axisFx.forEach(([o,op])=>setOpacity(o,op*mix));
  }

  function buildStars(){
    const N=2600, p=new Float32Array(N*3), c=new Float32Array(N*3), tint=BANDS.map(b=>new T.Color(cvar(b.color))), bone=new T.Color(0xECE6D9);
    for(let i=0;i<N;i++){
      const r=260+Math.random()*420, th=Math.random()*Math.PI*2, ph=Math.acos(2*Math.random()-1);
      p.set([r*Math.sin(ph)*Math.cos(th),r*Math.cos(ph),r*Math.sin(ph)*Math.sin(th)],i*3);
      const col=Math.random()<.18?tint[i%tint.length]:bone, k=.35+Math.random()*.65; c.set([col.r*k,col.g*k,col.b*k],i*3);
    }
    const g=new T.BufferGeometry(); g.setAttribute("position",new T.BufferAttribute(p,3)); g.setAttribute("color",new T.BufferAttribute(c,3));
    stars=new T.Points(g,new T.PointsMaterial({size:2.2,map:glowTex,vertexColors:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false}));
    scene.add(stars);
  }

  /* 微粒:暖帶的香火餘燼緩緩上升,塔底的「退潮」緩緩下沉 */
  function buildEmbers(){
    const N=420, p=new Float32Array(N*3), c=new Float32Array(N*3), meta=[];
    const warm=[["folk",.62],["kin",.18],["matter",.2]];
    for(let i=0;i<N;i++){
      const u=Math.random(); let band="folk",acc=0; for(const [b,w] of warm){ acc+=w; if(u<=acc){ band=b; break; } }
      const m={band,v:band==="matter"?-(1+Math.random()*1.5):1+Math.random()*2.2}; meta.push(m); spawn(p,i,m,true);
      const col=new T.Color(cvar(bandOf({band}).color)); c.set([col.r,col.g,col.b],i*3);
    }
    const g=new T.BufferGeometry(); g.setAttribute("position",new T.BufferAttribute(p,3)); g.setAttribute("color",new T.BufferAttribute(c,3));
    embers=new T.Points(g,new T.PointsMaterial({size:.9,map:glowTex,vertexColors:true,transparent:true,opacity:.6,depthWrite:false,blending:T.AdditiveBlending}));
    embers.userData.meta=meta; fx(towerFx,embers,.6);
  }
  function spawn(p,i,m,initial){
    const R=BAND_R[m.band]*1.3, a=Math.random()*Math.PI*2, r=Math.sqrt(Math.random())*R, y0=BAND_Y[m.band];
    const span=m.band==="matter"?[y0+26,y0-14]:[y0-2,y0+16];
    p[i*3]=Math.cos(a)*r; p[i*3+2]=Math.sin(a)*r;
    p[i*3+1]=initial?span[0]+(span[1]-span[0])*Math.random():span[0];
    m.end=span[1];
  }

  function setOpacity(o,op){
    if(o.isLight){ o.intensity=op; o.visible=op>1; return; }
    o.visible=op>.01;
    [].concat(o.material||[]).forEach(m=>{ m.opacity=op; });
  }

  async function init(){
    const [three,{OrbitControls},{EffectComposer},{RenderPass},{UnrealBloomPass},{OutputPass}]=await Promise.all([
      loadThree(),
      import("three/addons/controls/OrbitControls.js"),
      import("three/addons/postprocessing/EffectComposer.js"),
      import("three/addons/postprocessing/RenderPass.js"),
      import("three/addons/postprocessing/UnrealBloomPass.js"),
      import("three/addons/postprocessing/OutputPass.js")]);
    T=three;
    try{ await document.fonts?.ready; }catch{}
    renderer=new T.WebGLRenderer({antialias:false,powerPreference:"high-performance"});
    renderer.setPixelRatio(Math.min(devicePixelRatio,matchMedia("(max-width:720px)").matches?1.5:1.75));
    renderer.setClearColor(0x0E1015,1);
    renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=.95;
    canvas=renderer.domElement;
    canvas.setAttribute("role","img");
    canvas.setAttribute("aria-label","3D 星宇:拖曳旋轉、滾輪或雙指縮放,點選晶體打開圖鑑。完整鍵盤操作請用「圖鑑」檢視。");
    host.prepend(canvas);
    /* 背景經 ACES 色調映射後約等於頁面墨色 #0E1015(直接設 clearColor 在後期處理下會被當成線性值而偏灰) */
    scene=new T.Scene(); scene.background=new T.Color().setRGB(.0135,.0152,.021,T.LinearSRGBColorSpace);
    scene.fog=new T.FogExp2(0x0E1015,.0024);
    camera=new T.PerspectiveCamera(48,1,.5,2000);
    camera.position.set(0,190,40);
    controls=new OrbitControls(camera,canvas);
    controls.enableDamping=true; controls.dampingFactor=.07; controls.minDistance=16; controls.maxDistance=340; controls.autoRotateSpeed=.4;
    controls.target.set(0,BAND_Y.law,0);
    controls.addEventListener("start",()=>{ lastInteract=performance.now(); fly=null; });
    scene.add(new T.AmbientLight(0xffffff,.3),new T.HemisphereLight(0xAEBAC9,0x14161C,.6));
    const key=new T.DirectionalLight(0xffffff,1.1); key.position.set(60,120,80); scene.add(key);
    glowTex=new T.CanvasTexture(glowCanvas());
    buildStars(); buildTower(); buildAxisFrame(); buildEmbers(); buildNodes();
    axisFx.forEach(([o])=>setOpacity(o,0));

    const rt=new T.WebGLRenderTarget(2,2,{type:T.HalfFloatType,samples:4});
    composer=new EffectComposer(renderer,rt);
    composer.addPass(new RenderPass(scene,camera));
    composer.addPass(new UnrealBloomPass(new T.Vector2(2,2),.6,.42,.42));
    composer.addPass(new OutputPass());
    clock=new T.Clock();

    canvas.addEventListener("pointermove",ev=>{ const r=canvas.getBoundingClientRect(); pointerNdc=[((ev.clientX-r.left)/r.width)*2-1,-((ev.clientY-r.top)/r.height)*2+1,ev.clientX-r.left,ev.clientY-r.top]; });
    canvas.addEventListener("pointerleave",()=>{ pointerNdc=null; setHover(null); });
    canvas.addEventListener("pointerdown",ev=>{ downAt=[ev.clientX,ev.clientY,performance.now()]; });
    canvas.addEventListener("pointerup",ev=>{
      if(!downAt) return; const [x,y,t]=downAt; downAt=null;
      if(Math.hypot(ev.clientX-x,ev.clientY-y)>6||performance.now()-t>600) return;
      const r=canvas.getBoundingClientRect(), n=pick([((ev.clientX-r.left)/r.width)*2-1,-((ev.clientY-r.top)/r.height)*2+1]);
      if(n) openDetail(n.e.rank);
    });
    ro=new ResizeObserver(resize); ro.observe(host);
    ready=true;
    $("#cz-status").hidden=true;
    paint(); resize();
    const dest=camAt(layout==="tower"?TOWER_CAM:AXES_CAM);
    if(reduced){ camera.position.copy(dest); controls.target.set(0,0,0); }
    else fly={pos:dest,target:new T.Vector3(0,0,0),rate:.9};
    if(focusAfter){ focus(focusAfter); focusAfter=null; }
  }

  const ray=()=>ray.r||(ray.r=new T.Raycaster());
  function pick(ndc){
    const rc=ray(); rc.setFromCamera(new T.Vector2(ndc[0],ndc[1]),camera);
    const hit=rc.intersectObjects(nodes.filter(n=>n.vis).map(n=>n.mesh),false)[0];
    return hit?hit.object.userData.node:null;
  }
  function setHover(n){
    if(n===hovered) return;
    hovered=n; canvas?.classList.toggle("pick",!!n);
    const lab=$("#cz-label");
    if(!n){ lab.hidden=true; return; }
    const b=bandOf(n.e);
    lab.innerHTML=`${esc(n.e.cn)}<small>${esc(n.e.en||"")} · ${b.seal} ${b.cn} · ${esc(n.e.tier_label||n.e.tier)}</small>`;
    lab.hidden=false;
  }

  function resize(){
    if(!ready||!host) return;
    const w=host.clientWidth, h=host.clientHeight; if(!w||!h) return;
    renderer.setSize(w,h,false); composer.setSize(w,h);
    camera.aspect=w/h; camera.updateProjectionMatrix();
  }

  function tick(){
    const dt=Math.min(clock.getDelta(),.1), t=clock.elapsedTime, ease=1-Math.exp(-dt*3.2);
    mix+=((layout==="axes"?1:0)-mix)*ease;
    towerFx.forEach(([o,op])=>setOpacity(o,op*(1-mix)));
    axisFx.forEach(([o,op])=>setOpacity(o,op*mix));

    if(fly){
      const a=1-Math.exp(-dt*(fly.rate||2.4));
      camera.position.lerp(fly.pos,a); controls.target.lerp(fly.target,a);
      if(camera.position.distanceTo(fly.pos)<.4&&controls.target.distanceTo(fly.target)<.4) fly=null;
    }
    controls.autoRotate=!reduced&&!fly&&!hovered&&!state.current&&performance.now()-lastInteract>7000;
    controls.update();

    const q=camera.quaternion, tmp=new T.Vector3();
    nodes.forEach(n=>{
      n.cur.lerp(layout==="axes"?n.axes:n.tower,ease);
      n.pivot.position.copy(n.cur);
      if(mix>.5) n.pivot.quaternion.copy(q);
      else{ tmp.set(n.cur.x*2,n.cur.y,n.cur.z*2); n.pivot.lookAt(tmp); }
      n.mesh.rotation.y=reduced?0:Math.sin(t*.5+n.phase)*.4;
      n.hover+=((n===hovered||n.e.rank===state.current?1:0)-n.hover)*ease*2;
      const s=n.size*(1+.4*n.hover); n.mesh.scale.setScalar(s); n.glow.scale.setScalar(s*2.2);
    });

    if(embers&&!reduced&&mix<.99){
      const p=embers.geometry.attributes.position.array, meta=embers.userData.meta;
      meta.forEach((m,i)=>{ p[i*3+1]+=m.v*dt; if(m.v>0?p[i*3+1]>m.end:p[i*3+1]<m.end) spawn(p,i,m,false); });
      embers.geometry.attributes.position.needsUpdate=true;
    }
    if(stars&&!reduced) stars.rotation.y+=dt*.004;

    if(pointerNdc&&!downAt) setHover(pick(pointerNdc));
    if(hovered){
      const v=hovered.pivot.position.clone().project(camera), lab=$("#cz-label");
      lab.style.left=((v.x+1)/2*host.clientWidth)+"px"; lab.style.top=((1-v.y)/2*host.clientHeight)+"px";
    }
    composer.render();
  }

  function loop(){ raf=requestAnimationFrame(loop); if(!document.hidden&&host.clientWidth) tick(); }

  function correlation(){
    const L=nodes.filter(n=>n.vis).map(n=>n.e); if(L.length<3) return null;
    const xs=L.map(e=>e.radar[axes[0]]), ys=L.map(e=>e.radar[axes[1]]);
    const mx=xs.reduce((a,b)=>a+b)/L.length, my=ys.reduce((a,b)=>a+b)/L.length;
    let sxy=0,sx=0,sy=0; xs.forEach((x,i)=>{ sxy+=(x-mx)*(ys[i]-my); sx+=(x-mx)**2; sy+=(ys[i]-my)**2; });
    return sx&&sy?sxy/Math.sqrt(sx*sy):null;
  }
  function note(){
    const r=correlation();
    $("#cz-r").textContent=r==null?"":`${AXES[axes[0]].label} ↔ ${AXES[axes[1]].label}  r = ${r.toFixed(2)}`;
    $("#cz-note").innerHTML=layout==="tower"
      ?"塔身寬窄＝各環平均「影響半徑」。腰身最窄處是「念」:離中軸最近的,是被記得的人。<br>晶體＝六軸側影,大小＝本體權能。拖曳旋轉,滾輪縮放,點選晶體打開圖鑑。"
      :`每粒晶體按所選三軸定位。r 為 X 與 Y 的相關係數:負數＝此消彼長,接近 0＝互不相干。${r!=null&&r<-.2?"這裡看得見反比。":"想找「權能與親密成反比」?試把 X 設為本體權能,Y 設為向人性或臨界性。"}`;
  }

  function paint(){
    if(!ready) return;
    const li=lensIndex();
    nodes.forEach(n=>{
      const e=n.e, vis=visible(e), col=new T.Color(entColor(e));
      const k=li<0?1:.25+e.radar[li]/100*1.25;
      n.vis=vis;
      n.mesh.material.color.copy(col); n.mesh.material.emissive.copy(col);
      n.mesh.material.emissiveIntensity=vis?.16+.34*k:0;
      n.mesh.material.opacity=vis?.95:.06;
      n.glow.material.color.copy(col);
      n.glow.material.opacity=vis?(e.flagship?.3:.17)*k:0;
    });
    if(hovered&&!hovered.vis) setHover(null);
    note();
  }

  function flyToBand(key){
    if(layout!=="tower") setLayout("tower");
    const y=BAND_Y[key], R=BAND_R[key], dir=camera.position.clone().setY(0).normalize();
    if(!dir.lengthSq()) dir.set(0,0,1);
    fly={pos:dir.multiplyScalar(R*2.1+30).setY(y+16),target:new T.Vector3(0,y,0)};
    Sound.band(key);
  }
  function focus(rank){
    if(!active) return;
    if(!ready){ focusAfter=rank; return; }
    const n=nodes.find(x=>x.e.rank==rank); if(!n) return;
    const tgt=(layout==="axes"?n.axes:n.tower).clone();
    const out=layout==="axes"?camera.position.clone().sub(controls.target).normalize():tgt.clone().setY(0).normalize();
    fly={pos:tgt.clone().add(out.multiplyScalar(26)).add(new T.Vector3(0,5,0)),target:tgt};
  }
  function setLayout(l){
    layout=l;
    $$("#cosmos [data-layout]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.layout===l));
    $("#cz-axes").hidden=l!=="axes";
    if(ready) fly={pos:camAt(l==="axes"?AXES_CAM:TOWER_CAM),target:new T.Vector3(0,0,0),rate:1.6};
    note();
  }

  function setupUI(){
    $("#cz-bands").innerHTML=BANDS.map(b=>`<button type="button" data-band="${b.key}" style="color:${cvar(b.color)}" aria-label="飛到${b.cn}">${b.seal}</button>`).join("");
    $$("#cz-bands button").forEach(b=>b.addEventListener("click",()=>{ if(ready) flyToBand(b.dataset.band); }));
    $$("#cosmos [data-layout]").forEach(b=>b.addEventListener("click",()=>setLayout(b.dataset.layout)));
    ["#ax-x","#ax-y","#ax-z"].forEach((id,i)=>{
      const s=$(id); s.innerHTML=AXES.map((a,j)=>`<option value="${j}">${a.label}</option>`).join(""); s.value=axes[i];
      s.addEventListener("change",()=>{ axes[i]=+s.value; if(ready){ placeAxes(); relabelAxes(); } note(); });
    });
    note();
  }
  let uiReady=false;

  return {
    async start(el){
      host=el; active=true;
      if(!uiReady){ setupUI(); uiReady=true; }
      if(failed) return;
      if(!ready){
        loading=loading||init().catch(err=>{
          failed=true; console.warn("星宇未能載入",err);
          const s=$("#cz-status"); s.hidden=false;
          s.innerHTML="此環境未能載入 3D 星宇(需要 WebGL,並能連線到 cdn.jsdelivr.net 載入 three.js)。<br>圖鑑檢視的所有功能照常可用。";
        });
        await loading;
        if(failed||!active) return;
      }
      resize();
      if(!raf){ clock.getDelta(); loop(); }
    },
    stop(){ active=false; cancelAnimationFrame(raf); raf=0; setHover(null); },
    paint,
    focus,
    flyToBand:key=>{ if(ready) flyToBand(key); }
  };
})();
