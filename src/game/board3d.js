/* 《十二宮》立體版圖:一座夜裏的石灰石衛城,三層台階向中心升高,終宮在頂。
   外圍一圈火盆就是時間:每過一輪熄一盞,最後四盞是紅色的。考驗時,神像從所在的宮位升起。
   神像用 assets/models.js 登記的 GLB(有的話),否則用程序生成的石像;高度按圖鑑的實力等級。
   依賴 three(importmap)、src/stage3d.js 的 loadThree 與 GLB、src/data/lore.js。 */
const Board3D=(()=>{
  let T,renderer,scene,camera,controls,composer,host,raf=0,clock,ro;
  let pawns=[],stations=[],braziers=[],godGroup=null,beam=null,telosFire=null,moon=null,hemi=null;
  let camGoal=null,ready=false,failed=false,last=null;
  const S60=60, TIER_Y=[0,.34,.68,1.02], STONE=0xd8cfbb;
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ringOf=h=>h>=13?4:Math.ceil(h/4);
  /* 與平面版圖同一套座標(600 × 600,中心 300),換成世界座標 */
  function flat(h){ if(h>=13) return [0,0]; const r=[215,140,68][ringOf(h)-1]/S60, k=(h-1)%4; return [[-r,r],[-r,-r],[r,-r],[r,r]][k]; }
  const posOf=h=>{ const [x,z]=flat(h); return new T.Vector3(x,TIER_Y[ringOf(h)-1],z); };

  function stoneMat(color,rough){ return new T.MeshStandardMaterial({color:color??STONE,roughness:rough??.88,metalness:.02}); }
  const gold=()=>new T.MeshStandardMaterial({color:0xcda85e,roughness:.35,metalness:.85,emissive:0x5a4012,emissiveIntensity:.5});
  function mesh(geo,mat,x,y,z,cast){ const m=new T.Mesh(geo,mat); m.position.set(x,y,z); m.castShadow=cast!==false; m.receiveShadow=true; scene.add(m); return m; }

  function column(x,y,z,h,r,broken){
    const g=new T.Group(), m=stoneMat(0xe6dfcf,.8);
    const shaft=new T.Mesh(new T.CylinderGeometry(r*.86,r,h,14),m); shaft.position.y=h/2;
    g.add(shaft);
    if(!broken){ const cap=new T.Mesh(new T.CylinderGeometry(r*1.5,r*.9,r*.7,14),m); cap.position.y=h+r*.35;
      const ab=new T.Mesh(new T.BoxGeometry(r*3.2,r*.45,r*3.2),m); ab.position.y=h+r*.9; g.add(cap,ab); }
    g.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } });
    g.position.set(x,y,z); scene.add(g); return g;
  }

  function buildWorld(n){
    /* 酒色之海 */
    const sea=new T.Mesh(new T.CircleGeometry(60,64),new T.MeshStandardMaterial({color:0x100c18,roughness:.32,metalness:.7}));
    sea.rotation.x=-Math.PI/2; sea.position.y=-.42; sea.receiveShadow=true; scene.add(sea);
    /* 三層台階 + 終宮圓台 */
    [[9.4,-.2,.4],[6.3,.14,.4],[3.7,.48,.4]].forEach(([w,y,h],i)=>{ mesh(new T.BoxGeometry(w,h,w),stoneMat(i?0xdcd3c0:0xcfc6b2),0,y,0,false);
      mesh(new T.BoxGeometry(w+.16,.05,w+.16),gold(),0,y-h/2+.02,0,false); });
    mesh(new T.CylinderGeometry(1.02,1.1,.34,48),stoneMat(0xe6dfcf),0,TIER_Y[3]-.17,0,false);
    for(let i=0;i<8;i++){ const a=i/8*Math.PI*2+.39; column(Math.cos(a)*.86,TIER_Y[3],Math.sin(a)*.86,i%3===1?.45:.95,.07,i%3===1); }
    /* 四角的高柱,給版圖一個輪廓 */
    [[-1,0],[0,-1],[1,0],[0,1]].forEach(([a,b],i)=>column(a*4.4,0,b*4.4,i===3?.7:1.7,.12,i===3));
    /* 路:沿螺旋鋪金線 */
    const pts=[]; for(let h=1;h<=12;h++){ const p=posOf(h); pts.push(p); if(h%4===0){ const nr=h<12?[140,68][h/4-1]/S60:0; pts.push(new T.Vector3(-nr,p.y,p.z)); if(h<12) pts.push(new T.Vector3(-nr,TIER_Y[h/4],p.z)); else pts.push(new T.Vector3(0,TIER_Y[3],0)); } }
    const gm=gold();
    for(let i=0;i<pts.length-1;i++){ const a=pts[i], b=pts[i+1], d=b.clone().sub(a), len=d.length(); if(len<.01) continue;
      const s=new T.Mesh(new T.BoxGeometry(.05,.012,len),gm); s.position.copy(a).add(b).multiplyScalar(.5); s.position.y+=.012; s.lookAt(b.x,b.y+.012,b.z); s.receiveShadow=true; scene.add(s); }
    /* 宮位:石盤與金環 */
    for(let h=1;h<=13;h++){ const p=posOf(h), R=h===13?.5:.4;
      const disc=mesh(new T.CylinderGeometry(R,R,.05,40),new T.MeshStandardMaterial({color:0x2a2233,roughness:.6,metalness:.2,emissive:0xcda85e,emissiveIntensity:0}),p.x,p.y+.025,p.z,false);
      const ring=new T.Mesh(new T.TorusGeometry(R,.018,8,48),gold()); ring.rotation.x=Math.PI/2; ring.position.set(p.x,p.y+.052,p.z); scene.add(ring);
      stations[h]={disc,ring,p,label:label(HOUSE_VERB[h],p,R)}; }
    /* 時間火盆 */
    for(let i=0;i<n;i++){ const a=-Math.PI/2+i/n*Math.PI*2, x=Math.cos(a)*6.1, z=Math.sin(a)*6.1, dusk=i>=n-4;
      mesh(new T.CylinderGeometry(.05,.08,.5,8),stoneMat(0x4b4354,.7),x,-.17,z);
      mesh(new T.CylinderGeometry(.16,.07,.12,12),gold(),x,.12,z);
      const col=dusk?0xff5a36:0xffc56a;
      const flame=new T.Mesh(new T.SphereGeometry(.1,10,8),new T.MeshBasicMaterial({color:col})); flame.position.set(x,.26,z); flame.scale.y=1.5; scene.add(flame);
      const glow=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:col,transparent:true,blending:T.AdditiveBlending,depthWrite:false,opacity:.7})); glow.scale.setScalar(1.3); glow.position.copy(flame.position); scene.add(glow);
      braziers.push({flame,glow,lit:1,goal:1,ph:i*1.7}); }
    /* 終宮的火 */
    telosFire=new T.PointLight(0xffb866,6,7,1.6); telosFire.position.set(0,TIER_Y[3]+.6,0); scene.add(telosFire);
    const tf=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:0xffc878,transparent:true,blending:T.AdditiveBlending,depthWrite:false,opacity:.55})); tf.scale.setScalar(1.6); tf.position.set(0,TIER_Y[3]+.3,0); scene.add(tf);
    /* 星 */
    const sp=new Float32Array(900*3); for(let i=0;i<900;i++){ const a=Math.random()*Math.PI*2, e=.08+Math.random()*1.3, r=48; sp[i*3]=Math.cos(a)*Math.cos(e)*r; sp[i*3+1]=Math.sin(e)*r; sp[i*3+2]=Math.sin(a)*Math.cos(e)*r; }
    const sg=new T.BufferGeometry(); sg.setAttribute("position",new T.BufferAttribute(sp,3));
    scene.add(new T.Points(sg,new T.PointsMaterial({color:0xe9e2d2,size:.16,sizeAttenuation:true,transparent:true,opacity:.75,fog:false})));
  }
  const HOUSE_VERB=[null,"戴","認","造","承","辯","結","聽","擔","潛","開","議","越","終"];
  let _glow=null;
  function glowTex(){ if(_glow) return _glow; const c=document.createElement("canvas"); c.width=c.height=128; const g=c.getContext("2d"), r=g.createRadialGradient(64,64,0,64,64,64);
    r.addColorStop(0,"rgba(255,255,255,1)"); r.addColorStop(.35,"rgba(255,255,255,.35)"); r.addColorStop(1,"rgba(255,255,255,0)"); g.fillStyle=r; g.fillRect(0,0,128,128); return _glow=new T.CanvasTexture(c); }
  function label(txt,p,R){ const c=document.createElement("canvas"); c.width=c.height=128; const g=c.getContext("2d");
    g.font="400 84px 'Noto Serif TC','Songti TC',serif"; g.textAlign="center"; g.textBaseline="middle"; g.fillStyle="#E9E2D2"; g.fillText(txt,64,70);
    const t=new T.CanvasTexture(c); t.colorSpace=T.SRGBColorSpace;
    const m=new T.Mesh(new T.PlaneGeometry(R*1.5,R*1.5),new T.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,opacity:.9})); m.rotation.x=-Math.PI/2; m.position.set(p.x,p.y+.056,p.z); scene.add(m); return m; }

  function pawnFor(p,n){
    const col=new T.Color(getComputedStyle(document.documentElement).getPropertyValue("--p"+p.i).trim()||"#E0B354");
    const m=new T.MeshStandardMaterial({color:col,roughness:.5,metalness:.25,emissive:col,emissiveIntensity:.25,transparent:true});
    const g=new T.Group(), body=new T.Mesh(new T.CylinderGeometry(.045,.1,.26,12),m), head=new T.Mesh(new T.SphereGeometry(.06,12,10),m), base=new T.Mesh(new T.CylinderGeometry(.11,.11,.03,16),m);
    body.position.y=.16; head.position.y=.34; base.position.y=.015; g.add(base,body,head); g.traverse(o=>{ if(o.isMesh) o.castShadow=true; });
    scene.add(g); return {g,m,goal:new T.Vector3(),hop:0};
  }
  function slot(p,n){ const s=stations[Math.min(p.house,13)], R=(p.house>=13?.5:.4)+.26, a=-Math.PI/2+p.i/n*Math.PI*2+.6; return new T.Vector3(s.p.x+Math.cos(a)*R,s.p.y,s.p.z+Math.sin(a)*R); }

  /* 程序生成的石像:長袍、肩、頭、冠;等級越高越大 */
  function proceduralGod(e,col){
    const g=new T.Group(), m=stoneMat(0xece5d6,.7);
    const robe=new T.Mesh(new T.CylinderGeometry(.13,.24,.62,16),m); robe.position.y=.31;
    const chest=new T.Mesh(new T.CylinderGeometry(.17,.13,.24,16),m); chest.position.y=.74;
    const head=new T.Mesh(new T.SphereGeometry(.1,16,12),m); head.position.y=.98;
    const crown=new T.Mesh(new T.TorusGeometry(.085,.016,8,24),gold()); crown.rotation.x=Math.PI/2; crown.position.y=1.06;
    const plinth=new T.Mesh(new T.CylinderGeometry(.27,.3,.08,20),stoneMat(0xbfb6a2)); plinth.position.y=.0;
    g.add(plinth,robe,chest,head,crown); g.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } });
    return g;
  }
  async function showGod(e,house,wrath){
    if(!ready) return; hideGod();
    const tier=powerTier(e.radar[0]), H=.55+tier.vis*.17, col=new T.Color(BAND_ART[e.band].hex), s=stations[house];
    const g=new T.Group(); godGroup=g; g.userData={t:0,wrath};
    g.position.set(s.p.x,s.p.y-H,s.p.z); g.userData.y=s.p.y+.05;
    let body=proceduralGod(e,col); body.scale.setScalar(H/1.1);
    g.add(body); if(house<13){ g.lookAt(0,g.position.y,0); g.rotateY(Math.PI); }
    const light=new T.PointLight(wrath?0xff5a36:col,wrath?3.2:2.2,5,1.6); light.position.set(0,H*1.25,.5); g.add(light); g.userData.light=light;
    beam=new T.Mesh(new T.CylinderGeometry(.5,.34,9,24,1,true),new T.MeshBasicMaterial({color:wrath?0xff5a36:col,transparent:true,opacity:.05,blending:T.AdditiveBlending,side:T.DoubleSide,depthWrite:false}));
    beam.position.set(g.position.x,s.p.y+4.5,g.position.z); scene.add(beam);
    scene.add(g); focus(house,true);
    const entry=(window.SPECTRUM_MODELS||{})[e.rank], url=entry&&(entry.lod||entry.glb);
    if(url&&typeof GLB!=="undefined"){ try{ const gltf=await GLB.load(url); if(godGroup!==g) return;
        const root=gltf.scene, box=new T.Box3().setFromObject(root), size=box.getSize(new T.Vector3()), c=box.getCenter(new T.Vector3()), k=H/Math.max(size.y,1e-6);
        root.scale.setScalar(k); root.position.set(-c.x*k,-box.min.y*k,-c.z*k); root.traverse(o=>{ if(o.isMesh){ o.castShadow=true; } });
        g.remove(body); g.add(root); }catch(err){ console.warn("神像模型未能載入,改用石像",err); } }
  }
  function hideGod(){ if(godGroup){ scene.remove(godGroup); godGroup=null; } if(beam){ scene.remove(beam); beam.geometry.dispose(); beam=null; } }

  function focus(house,close){
    const p=stations[Math.min(house,13)].p, out=new T.Vector3(p.x,0,p.z); if(out.lengthSq()<.01) out.set(0,0,1); out.normalize();
    const d=close?4.2:8.5;
    camGoal={target:close?new T.Vector3(p.x,p.y+.55,p.z):new T.Vector3(p.x*.5,p.y+.3,p.z*.5),pos:new T.Vector3(p.x+out.x*d+out.z*1.4,p.y+(close?2.1:5.2),p.z+out.z*d-out.x*1.4)};
    controls.autoRotate=false;
  }
  function overview(){ camGoal={target:new T.Vector3(0,.2,0),pos:new T.Vector3(9.2,10.4,13.2)}; if(controls) controls.autoRotate=!reduced; }

  function update(S){
    last=S; if(!ready) return;
    if(pawns.length!==S.players.length){ pawns.forEach(p=>scene.remove(p.g)); pawns=S.players.map(p=>pawnFor(p,S.players.length)); pawns.forEach((pw,i)=>pw.g.position.copy(slot(S.players[i],S.players.length))); }
    S.players.forEach((p,i)=>{ const pw=pawns[i], goal=slot(p,S.players.length); if(goal.distanceTo(pw.goal)>.01){ pw.goal.copy(goal); pw.hop=1; } pw.m.opacity=p.threads?1:.28; pw.m.emissiveIntensity=p.threads?.25:.05; });
    braziers.forEach((b,i)=>{ b.goal=i<S.round?0:1; });
    const cur=S.phase==="trial"?S.players[S.turn]:null;
    for(let h=1;h<=13;h++) stations[h].disc.material.emissiveIntensity=cur&&cur.threads&&Math.min(cur.house,13)===h?.55:0;
    /* 時間越少,世界越暗 */
    const left=1-S.round/S.deck; if(moon) moon.intensity=.5+left*1.1; if(hemi) hemi.intensity=.18+left*.3;
    if(cur&&cur.threads) focus(cur.house,false); else overview();
  }

  function tick(){
    const dt=Math.min(clock.getDelta(),.05), t=clock.elapsedTime;
    pawns.forEach(pw=>{ pw.g.position.lerp(pw.goal,1-Math.pow(.002,dt)); if(pw.hop>0){ pw.hop=Math.max(0,pw.hop-dt*1.6); pw.g.position.y=pw.goal.y+Math.sin(pw.hop*Math.PI)*.35; } });
    braziers.forEach(b=>{ b.lit+=(b.goal-b.lit)*Math.min(1,dt*2.5); const f=b.lit*(1+Math.sin(t*7+b.ph)*.12); b.flame.scale.set(f,f*1.5,f); b.glow.material.opacity=.7*b.lit; });
    if(telosFire) telosFire.intensity=6+Math.sin(t*9)*.7+Math.sin(t*5.3)*.5;
    if(godGroup){ const u=godGroup.userData; u.t=Math.min(1,u.t+dt*.9); const k=1-Math.pow(1-u.t,3); godGroup.position.y=u.y-(1-k)*1.6+.04;
      if(u.wrath) u.light.intensity=3+Math.sin(t*13)*1.1; if(beam) beam.material.opacity=.02+k*.035+Math.sin(t*2)*.006; }
    if(camGoal){ const a=1-Math.pow(.02,dt); camera.position.lerp(camGoal.pos,a); controls.target.lerp(camGoal.target,a); if(camera.position.distanceTo(camGoal.pos)<.03) camGoal=null; }
    controls.update(); composer.render();
  }
  function resize(){ if(!host) return; const w=host.clientWidth, h=host.clientHeight; if(!w||!h) return; renderer.setSize(w,h,false); composer.setSize(w,h); camera.aspect=w/h; camera.fov=w/h<1?46:36; camera.updateProjectionMatrix(); }

  async function mount(el,S){
    if(failed) return false;
    if(ready){ if(host!==el){ host=el; el.appendChild(renderer.domElement); ro.disconnect(); ro.observe(el); resize(); } update(S); return true; }
    try{
      T=await loadThree();
      const [{OrbitControls},{EffectComposer},{RenderPass},{UnrealBloomPass},{OutputPass}]=await Promise.all([
        import("three/addons/controls/OrbitControls.js"),import("three/addons/postprocessing/EffectComposer.js"),import("three/addons/postprocessing/RenderPass.js"),
        import("three/addons/postprocessing/UnrealBloomPass.js"),import("three/addons/postprocessing/OutputPass.js")]);
      renderer=new T.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
      renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFSoftShadowMap;
      renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05;
      scene=new T.Scene(); scene.background=new T.Color().setRGB(.0075,.0055,.0125,T.LinearSRGBColorSpace); scene.fog=new T.FogExp2(0x0d0a14,.028);
      camera=new T.PerspectiveCamera(36,1,.1,200); camera.position.set(9.2,10.4,13.2);
      hemi=new T.HemisphereLight(0x8a94c8,0x1a1220,.48); scene.add(hemi);
      moon=new T.DirectionalLight(0xbcc8ff,1.6); moon.position.set(-7,11,5); moon.castShadow=true; moon.shadow.mapSize.set(2048,2048);
      Object.assign(moon.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:1,far:30}); moon.shadow.bias=-.0006; moon.shadow.radius=4; scene.add(moon);
      const warm=new T.DirectionalLight(0xffb070,.5); warm.position.set(8,3,-6); scene.add(warm);
      host=el; el.appendChild(renderer.domElement);
      const cv=renderer.domElement; cv.setAttribute("role","img"); cv.setAttribute("aria-label","立體版圖:三層台階的迷宮,外圍的火盆是時間。拖曳可旋轉。");
      controls=new OrbitControls(camera,cv); Object.assign(controls,{enableDamping:true,dampingFactor:.07,enablePan:false,minDistance:3.5,maxDistance:19,maxPolarAngle:Math.PI*.47,autoRotate:!reduced,autoRotateSpeed:.35});
      controls.target.set(0,.4,0); controls.addEventListener("start",()=>{ camGoal=null; controls.autoRotate=false; });
      composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera));
      composer.addPass(new UnrealBloomPass(new T.Vector2(512,512),.42,.55,.9)); composer.addPass(new OutputPass());
      clock=new T.Clock(); buildWorld(S.deck);
      ro=new ResizeObserver(resize); ro.observe(el); resize();
      ready=true; update(S);
      const loop=()=>{ raf=requestAnimationFrame(loop); if(!document.hidden&&host.isConnected) tick(); }; loop();
      return true;
    }catch(err){ console.warn("立體版圖未能載入,改用平面版圖",err); failed=true; return false; }
  }
  /* 新一局的時間牌數目可能不同,整個場景重建 */
  function reset(){ if(!ready) return; cancelAnimationFrame(raf); ro.disconnect(); renderer.domElement.remove(); renderer.dispose(); ready=false; pawns=[]; stations=[]; braziers=[]; godGroup=null; beam=null; }
  return {mount,update,showGod,hideGod,reset,get ok(){ return ready; },get failed(){ return failed; }};
})();
