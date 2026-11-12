// Deterministic timeline effects: preview, scrubbing and export share the same clock.
let effectsBasePass=false,effectBuffer=null;
function effectAmount(){return Math.max(0,Math.min(1,Number($('effectIntensity').value)/100))}
function currentSceneName(t=motionClock){return typeof sceneAtTime==='function'&&state.template!=='framed'?sceneAtTime(t)?.definition?.[0]||'':''}
function uploadOrLoadingScene(t=motionClock){const name=currentSceneName(t);if(name)return name==='Photo upload'||name==='Loading animation';const p=Math.max(0,Math.min(1,t/duration()));return state.template==='collage'&&$('uploadScene').checked&&p>=.5&&p<.88||state.template==='styles'&&p>=.14&&p<.46}
// Use the actual duration-editor scene boundaries. In One photo, many styles,
// disclosure belongs only to Original and Style results—not upload, loader, or end card.
function watermarkVisibleForScene(t=motionClock){const name=currentSceneName(t);if(state.template==='styles'&&name)return name==='Original'||name==='Style results';const p=Math.max(0,Math.min(1,t/duration()));return p<effectEnd()&&!uploadOrLoadingScene(t)}
// The overlay follows the same editable scene-duration boundaries as disclosure.
// It is deliberately absent from the upload, loader, and end-card footage.
function overlayGradientVisibleForScene(t=motionClock){const name=currentSceneName(t);if(state.template==='styles'&&name)return name==='Original'||name==='Style results';const p=Math.max(0,Math.min(1,t/duration()));return p<effectEnd()&&!uploadOrLoadingScene(t)}
function effectEnabled(name){const chosen=$('effects').value,p=Math.max(0,Math.min(1,motionClock/duration())),atEndCard=p>=effectEnd();if(originalStylesSceneActive()||uploadOrLoadingScene()||effectAmount()<=0||atEndCard)return false;return chosen==='all'||chosen===name}
// "Mix of effects" assigns one effect to each cut. Previously several passes
// shared the same modulo slot, which stacked vertical bands into white pillars.
function effectMixSlot(index,slot,t=motionClock){return $('effects').value!=='all'||index%6===slot&&!effectCuts().some((cut,candidate)=>candidate>index&&cut<=t)}
function specialEffectActive(name,p){return effectEnabled(name)&&p>=.46&&p<effectEnd()}
function effectEnd(){if(state.template==='framed')return framedEndStart()/duration();return state.template==='collage'&&$('uploadScene').checked ? .94 : .82}
function effectCuts(){if(state.template==='framed')return framedCuts();let values;
 if(state.template==='collage')values=$('uploadScene').checked?[0,.185,.37,.5,.88,.94]:[0,.185,.37,.56,.82];
 else if(state.template==='styles'){const segment=styleResultSegment();values=[0,.14,.46,...Array.from({length:styleResultCount()-1},(_,index)=>.46+(index+1)*segment),.82]}
 else if(state.template==='steps')values=[0,.275,.55,.82];
 else if(state.template==='before')values=[0,.22,.44,.82];
 else values=[0,.2,.4,.6,.8,.82];
 return values.map(v=>v*duration());
}
// Camera flash is intentionally separate from the generic effect window. The
// shutter and flare are both calculated from the scene cut, so preview and
// exported frames share exactly the same cinematic timing.
function cameraFlashState(t){
 if(!effectEnabled('flash'))return null;
 const speed=Number($('effectSpeed').value)||1,flashPeak=.05/speed,flashEnd=.35/speed,flareStart=.025/speed,span=.68/speed;
 for(const [index,cut] of effectCuts().entries()){
  if(!index)continue;
  const age=t-cut;
  if(age<0||age>span)continue;
  if(!effectMixSlot(index,2,t))continue;
  const flash=age<flashPeak?age/flashPeak:age<flashEnd?1-(age-flashPeak)/(flashEnd-flashPeak):0;
  const flareProgress=Math.max(0,Math.min(1,(age-flareStart)/(span-flareStart)));
  const flare=flareProgress<.5?2*flareProgress*flareProgress:1-Math.pow(-2*flareProgress+2,2)/2;
  return {index,progress:age/span,flash,flare};
 }
 return null;
}
function whiteFlashWipeState(t){
 if(!effectEnabled('white'))return null;
 const speed=Number($('effectSpeed').value)||1,span=.72/speed;
 for(const [index,cut] of effectCuts().entries()){
  if(!index)continue;
  const age=t-cut;
  if(age<0||age>span)continue;
  if(!effectMixSlot(index,3,t))continue;
  const progress=age/span;
  // Symmetric ease-in-out keeps the band from snapping on or off screen.
  const eased=progress<.5?2*progress*progress:1-Math.pow(-2*progress+2,2)/2;
  // A short full-frame screen flash peaks when the diagonal band crosses the
  // centre, then falls away before the new image has settled.
  const flash=Math.pow(Math.sin(Math.PI*progress),8);
  return {index,progress,eased,flash};
 }
 return null;
}
function fadeThroughBlackState(t){
 if(!effectEnabled('fade'))return null;
 const speed=Number($('effectSpeed').value)||1,half=.5/speed;
 for(const [index,cut] of effectCuts().entries()){
  if(!index)continue;
  const age=t-(cut-half);
  if(age<0||age>half*2)continue;
  if(!effectMixSlot(index,0,t))continue;
  const progress=age/(half*2),phase=progress<.5?progress*2:(progress-.5)*2;
  const eased=phase<.5?2*phase*phase:1-Math.pow(-2*phase+2,2)/2;
  return {index,progress,blackOpacity:progress<.5?eased:1-eased,imageOpacity:progress<.5?1-eased:eased};
 }
 return null;
}
function multicolorLightLeakState(t){
 if(!effectEnabled('leak'))return null;
 const speed=Number($('effectSpeed').value)||1,span=1.2/speed;
 for(const [index,cut] of effectCuts().entries()){
  if(!index)continue;
  const age=t-cut;
  if(age<0||age>span)continue;
  if(!effectMixSlot(index,1,t))continue;
  const progress=age/span,eased=progress<.5?2*progress*progress:1-Math.pow(-2*progress+2,2)/2;
  return {index,progress,eased,opacity:Math.sin(Math.PI*progress)};
 }
 return null;
}
// A dedicated full-canvas gold sweep, rather than a generic effect-window
// stripe. It starts and ends outside the frame so each scene cut gets a
// complete, elegant light pass in preview and export alike.
function goldenLightSweepState(t){
 if(!effectEnabled('gold'))return null;
 const speed=Number($('effectSpeed').value)||1,span=1/speed;
 for(const [index,cut] of effectCuts().entries()){
  if(!index)continue;
  const age=t-cut;
  if(age<0||age>span)continue;
  if(!effectMixSlot(index,4,t))continue;
  const progress=age/span,eased=progress<.5?2*progress*progress:1-Math.pow(-2*progress+2,2)/2;
  return {index,progress,eased,opacity:Math.sin(Math.PI*progress)};
 }
 return null;
}
function floatingHeartsState(t){
 if(!effectEnabled('hearts'))return null;
 const speed=Number($('effectSpeed').value)||1,span=1.8/speed;
 let latest=null;
 for(const [index,cut] of effectCuts().entries()){
  if(!index)continue;
  const age=t-cut;
  if(age>=0&&age<=span&&effectMixSlot(index,5,t))latest={index,age,span};
 }
 return latest;
}
function drawCameraFlashFlare(w,h,state){
 if(!state)return;
 const strength=effectAmount();
 if(state.flash>0){
  // A real shutter flash washes the entire frame out before fading over 300ms.
  ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=state.flash*strength;ctx.fillStyle='white';ctx.fillRect(0,0,w,h);ctx.restore();
 }
 if(state.flare<=0)return;
 const x=-w*.14+w*1.28*state.flare,y=h*.5,alpha=Math.sin(Math.PI*Math.min(1,state.flare))*strength,thickness=Math.max(48,h*.075);
 // A vertical gradient creates a genuinely horizontal band: it is feathered
 // above and below, spans the frame without hard X edges, and is brightened by
 // a small circular source that glides left-to-right along its centre.
 ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.min(.38,alpha);
 const streak=ctx.createLinearGradient(0,y-thickness,0,y+thickness);
 streak.addColorStop(0,'rgba(255,220,150,0)');streak.addColorStop(.22,'rgba(255,208,120,.08)');streak.addColorStop(.43,'rgba(255,239,196,.34)');streak.addColorStop(.5,'rgba(255,255,255,.62)');streak.addColorStop(.57,'rgba(255,239,196,.34)');streak.addColorStop(.78,'rgba(255,208,120,.08)');streak.addColorStop(1,'rgba(255,220,150,0)');
 ctx.fillStyle=streak;ctx.fillRect(0,y-thickness,w,thickness*2);
 const radius=Math.max(64,Math.min(w,h)*.18),source=ctx.createRadialGradient(x,y,0,x,y,radius);
 source.addColorStop(0,'rgba(255,255,255,.94)');source.addColorStop(.16,'rgba(255,246,211,.62)');source.addColorStop(.46,'rgba(255,203,105,.18)');source.addColorStop(1,'rgba(255,203,105,0)');
 ctx.globalAlpha=Math.min(.68,alpha);ctx.fillStyle=source;ctx.fillRect(x-radius,y-radius,radius*2,radius*2);ctx.restore();
}
function drawWhiteFlashWipe(w,h,state){
 if(!state)return;
 const strength=effectAmount(),diagonal=Math.hypot(w,h),band=Math.max(190,diagonal*.22),x=-diagonal-band+(diagonal*2+band*2)*state.eased;
 // Draw in a rotated coordinate system so the band travels bottom-left to
 // top-right. The gradient is measured across the band, producing transparent,
 // feathered edges rather than a hard rectangular wipe.
 ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.min(.9,strength);
 ctx.translate(w*.5,h*.5);ctx.rotate(-.36);
 const wipe=ctx.createLinearGradient(x-band,0,x+band,0);
 wipe.addColorStop(0,'rgba(255,255,255,0)');wipe.addColorStop(.18,'rgba(235,244,255,.06)');wipe.addColorStop(.34,'rgba(255,255,255,.38)');wipe.addColorStop(.5,'rgba(255,255,255,.96)');wipe.addColorStop(.66,'rgba(255,255,255,.38)');wipe.addColorStop(.82,'rgba(235,244,255,.06)');wipe.addColorStop(1,'rgba(255,255,255,0)');
 ctx.fillStyle=wipe;ctx.fillRect(x-band,-diagonal,band*2,diagonal*2);ctx.restore();
 // The bright shutter moment is a screen-composited full-frame washout, not
 // a separate opaque layer; it flashes only while the band crosses the image.
 if(state.flash>0){ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.min(.58,state.flash*.58*strength);ctx.fillStyle='white';ctx.fillRect(0,0,w,h);ctx.restore()}
}
function drawFadeThroughBlack(w,h,state){
 if(!state)return;
 ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=state.blackOpacity*effectAmount();ctx.fillStyle='#000000';ctx.fillRect(0,0,w,h);ctx.restore();
}
function drawMulticolorLightLeak(w,h,state){
 if(!state)return;
 const strength=effectAmount(),u=state.eased,alpha=state.opacity*strength;
 // Each bloom has transparent outer stops and is composited with screen, which
 // lets the image show through instead of laying an opaque colour rectangle on it.
 const bloom=(x,y,r,core,mid,opacity)=>{ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.min(.72,opacity);const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,core);g.addColorStop(.24,mid);g.addColorStop(.68,'rgba(255,255,255,.035)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore()};
 const x=-w*.24+w*1.48*u,y=h*(.10+.76*u);
 bloom(x,y,w*.62,'rgba(255,242,202,.88)','rgba(255,122,40,.48)',alpha);
 bloom(x-w*.30,y-h*.24,w*.58,'rgba(255,172,226,.70)','rgba(229,52,190,.38)',alpha*.82);
 bloom(x+w*.28,y+h*.16,w*.54,'rgba(185,244,255,.68)','rgba(49,167,255,.34)',alpha*.76);
}
function drawGoldenLightSweep(w,h,state){
 if(!state)return;
 const strength=effectAmount(),band=Math.max(190,w*.32),x=-band+(w+band*2)*state.eased;
 // Screen compositing makes this read as emitted light. The broad, transparent
 // gradient and a soft centre glow avoid the flat-yellow-rectangle appearance.
 ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.min(.8,state.opacity*strength);
 const sweep=ctx.createLinearGradient(x-band,0,x+band,0);
 sweep.addColorStop(0,'rgba(255,198,56,0)');
 sweep.addColorStop(.18,'rgba(245,176,65,.08)');
 sweep.addColorStop(.36,'rgba(255,193,7,.38)');
 sweep.addColorStop(.5,'rgba(255,248,204,.92)');
 sweep.addColorStop(.64,'rgba(255,193,7,.38)');
 sweep.addColorStop(.82,'rgba(245,176,65,.08)');
 sweep.addColorStop(1,'rgba(255,198,56,0)');
 ctx.fillStyle=sweep;ctx.fillRect(x-band,0,band*2,h);
 const glow=ctx.createRadialGradient(x,h*.5,0,x,h*.5,Math.max(w,h)*.56);
 glow.addColorStop(0,'rgba(255,230,144,.25)');glow.addColorStop(.32,'rgba(255,190,45,.11)');glow.addColorStop(1,'rgba(255,190,45,0)');
 ctx.globalAlpha=Math.min(.45,state.opacity*strength);ctx.fillStyle=glow;ctx.fillRect(x-Math.max(w,h)*.56,h*.5-Math.max(w,h)*.56,Math.max(w,h)*1.12,Math.max(w,h)*1.12);ctx.restore();
}
// The reveal is calculated once per frame and is used by both the preview and
// export renderer. Keep this separate from the visual overlay pass: blurring a
// completed canvas after it has been painted leaves the sharp frame underneath
// it, which is the source of the previous ghost/double-exposure artefact.
function blurRevealState(t){
 if(!effectEnabled('blur'))return null;
 const speed=Number($('effectSpeed').value)||1;
 let age=t;
 for(const cut of effectCuts())if(cut<=t)age=t-cut;
 const progress=Math.max(0,Math.min(1,age/Math.max(.12,.72/speed)));
 // Ease-out cubic: strong defocus at the entrance, then a natural settle.
 const eased=1-Math.pow(1-progress,3);
 const strength=effectAmount();
 return {blur:Math.max(0,(1-eased)*24*strength),opacity:.5+.5*eased};
}
function drawBlurRevealBase(reveal){
 if(!reveal||reveal.blur<.05)return;
 if(!effectBuffer)effectBuffer=document.createElement('canvas');
 if(effectBuffer.width!==canvas.width||effectBuffer.height!==canvas.height){effectBuffer.width=canvas.width;effectBuffer.height=canvas.height}
 const buffer=effectBuffer.getContext('2d');
 buffer.setTransform?.(1,0,0,1,0,0);
 buffer.clearRect(0,0,canvas.width,canvas.height);
 buffer.drawImage(canvas,0,0);
 // Replace, never paint over, the base frame. The single blurred layer avoids
 // stale pixels and makes every output frame deterministic.
 ctx.save();
 ctx.setTransform(1,0,0,1,0,0);
 ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.fillStyle=canvasBackground;
 ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.globalAlpha=reveal.opacity;
 ctx.filter=`blur(${reveal.blur.toFixed(2)}px)`;
 ctx.drawImage(effectBuffer,0,0);
 ctx.restore();
}
function drawOverlayGradient(w,h){const overlay=state.overlayGradient;if(!overlay?.enabled)return;const clamp=value=>Math.max(0,Math.min(100,Number(value)||0));const rgba=(color,opacity)=>{const number=parseInt(String(color||'#000000').slice(1),16),r=number>>16&255,g=number>>8&255,b=number&255;return `rgba(${r},${g},${b},${clamp(opacity)/100})`};const stops=[overlay.top,overlay.bottom].sort((a,b)=>clamp(a.position)-clamp(b.position));const vector=overlay.vector||{x1:.5,y1:0,x2:.5,y2:.15};ctx.save();setLayoutTransform();const gradient=ctx.createLinearGradient(w*vector.x1,h*vector.y1,w*vector.x2,h*vector.y2);for(const stop of stops)gradient.addColorStop(clamp(stop.position)/100,rgba(stop.color,stop.opacity));ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);ctx.restore()}
function drawOverlayGradientHandles(w,h){const overlay=state.overlayGradient;if(exporting||!$('overlayCanvasEdit').checked||!overlay?.enabled||!overlayGradientVisibleForScene(time))return;const vector=overlay.vector||{x1:.5,y1:0,x2:.5,y2:.15},x1=w*vector.x1,y1=h*vector.y1,x2=w*vector.x2,y2=h*vector.y2,size=Math.max(16,Math.min(w,h)*.024);ctx.save();setLayoutTransform();ctx.lineWidth=2;ctx.strokeStyle='rgba(255,255,255,.94)';ctx.shadowColor='rgba(0,0,0,.9)';ctx.shadowBlur=5;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.fillStyle='rgba(15,20,24,.84)';for(const [x,y] of [[x1,y1],[x2,y2]]){ctx.fillRect(x-size/2,y-size/2,size,size);ctx.strokeRect(x-size/2,y-size/2,size,size)}ctx.restore()}
function drawSafeAreaGuides(w,h){if(exporting||!$('safeAreaGuides').checked)return;const safe=safeAreaBounds(w,h);ctx.save();setLayoutTransform();ctx.fillStyle='rgba(244,63,94,.10)';ctx.fillRect(0,0,w,safe.top);ctx.fillRect(0,h-safe.bottom,w,safe.bottom);ctx.setLineDash([10,8]);ctx.lineWidth=2;ctx.strokeStyle='rgba(255,105,130,.96)';ctx.beginPath();ctx.moveTo(0,safe.top);ctx.lineTo(w,safe.top);ctx.moveTo(0,h-safe.bottom);ctx.lineTo(w,h-safe.bottom);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='rgba(255,226,231,.95)';ctx.font='700 14px Urbanist,Arial,sans-serif';ctx.textAlign='left';ctx.textBaseline='bottom';ctx.fillText('AD UI SAFE BOUNDARY',safe.left,safe.top-8);ctx.textBaseline='top';ctx.fillText('BOTTOM UI SAFE BOUNDARY',safe.left,h-safe.bottom+8);ctx.restore()}
function effectGlow(x,y,r,color,alpha){if(alpha<=0)return;ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.min(.72,alpha);let g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(255,255,255,.72)');g.addColorStop(.18,color);g.addColorStop(.62,'transparent');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore()}
function effectHeart(x,y,size,alpha,color,rotation=0){ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.scale(size,size);ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.min(.68,alpha);ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=Math.max(6,size*.38);ctx.beginPath();ctx.moveTo(0,.3);ctx.bezierCurveTo(-1,-.3,-.5,-1,0,-.45);ctx.bezierCurveTo(.5,-1,1,-.3,0,.3);ctx.fill();ctx.restore()}
function drawFloatingHearts(w,h,state){
 if(!state)return;
 const colors=['#ff6f9c','#ff8db8','#e9a7ff','#ffca72','#d981ff'];
 const speed=Number($('effectSpeed').value)||1,particleCount=18;
 for(let i=0;i<particleCount;i++){
  // Stable pseudo-random values produce the same frame for scrubbing/export,
  // while still giving every heart its own launch point, speed and size.
  const seed=(i*.61803398875+state.index*.17320508)%1;
  const spawn=(i/(particleCount-1))*.58/state.span;
  const life=.58+((i*37)%43)/100;
  const progress=(state.age/state.span-spawn)/life;
  if(progress<0||progress>1)continue;
  const eased=1-Math.pow(1-progress,2.25),edge=Math.pow(Math.sin(Math.PI*progress),.72);
  const size=11+seed*19,x0=w*(.04+seed*.92),y0=h+size*2;
  const sway=Math.sin(progress*Math.PI*2.2+i*2.47)*w*(.024+seed*.025);
  const x=x0+sway,y=y0-(h+size*4)*eased;
  const rotation=Math.sin(progress*Math.PI*2+i*1.71)*(.22+seed*.30)+progress*(seed-.5)*.65;
  effectHeart(x,y,size,edge*effectAmount()*(.34+seed*.28),colors[i%colors.length],rotation);
 }
}
function effectRevealText(line,x,y,size,align){let age=motionClock/duration()<effectEnd()?motionAge:motionClock-duration()*effectEnd(),span=Math.min(.6/(Number($('effectSpeed').value)||1),duration()*(1-effectEnd())*.8),reveal=easeLoader(age/Math.max(.1,span)),width=ctx.measureText(line).width,left=align==='center'?x-width/2:align==='right'?x-width:x;ctx.save();ctx.beginPath();let pad=$('textOutline').checked?(Number($('textOutlineWidth').value)||2)+3:3;ctx.rect(left-pad,y-pad-3,(width+pad*2)*reveal,size*1.4+pad*2);ctx.clip();paintText(line,x,y);ctx.restore()}
function effectEndBackground(w,h){if(!effectEnabled('endcard'))return;let g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#1576ff');g.addColorStop(.55,'#6b29dc');g.addColorStop(1,$('effectColor').value);ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}
function render(t){
 deferredTypography=[];effectsBasePass=true;try{renderBase(t)}finally{effectsBasePass=false}
 const typography=deferredTypography;deferredTypography=null;const [w,h]=layoutSize(),p=t/duration(),blurReveal=blurRevealState(t);
 // Apply blur before overlays and deferred typography, keeping text, guides and
 // the watermark crisp while the image itself resolves from soft to sharp.
 drawBlurRevealBase(blurReveal);
 if(overlayGradientVisibleForScene(t))drawOverlayGradient(w,h);drawingForegroundTypography=true;try{for(const command of typography)text(...command)}finally{drawingForegroundTypography=false}const strength=effectAmount(),speed=Number($('effectSpeed').value)||1,color=$('effectColor').value;
 if(!uploadOrLoadingScene(t)&&strength&&$('effects').value!=='none'){
  ctx.save();setLayoutTransform();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  drawCameraFlashFlare(w,h,cameraFlashState(t));
  drawWhiteFlashWipe(w,h,whiteFlashWipeState(t));
  drawFadeThroughBlack(w,h,fadeThroughBlackState(t));
  drawMulticolorLightLeak(w,h,multicolorLightLeakState(t));
  drawGoldenLightSweep(w,h,goldenLightSweepState(t));
  drawFloatingHearts(w,h,floatingHeartsState(t));
  if(specialEffectActive('sparkle',p)&&$('effects').value!=='all'){let age=Math.max(0,t-duration()*effectEnd()),u=Math.min(1,age*speed/1.05),yy=h*.65;for(let i=0;i<45;i++){let seed=(i*.75487766)%1,x=w*(u*1.15-.1)+Math.sin(i*9.2)*w*.15,y=yy+Math.cos(i*5.7)*h*.13,twinkle=(.5+.5*Math.sin(age*13+i*3))*strength;ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=twinkle*(u<1?1:.45);ctx.strokeStyle=i%3===0?'white':color;ctx.lineWidth=1.5;let r=2+seed*6;ctx.beginPath();ctx.moveTo(x-r,y);ctx.lineTo(x+r,y);ctx.moveTo(x,y-r);ctx.lineTo(x,y+r);ctx.stroke();ctx.restore()}}
  ctx.restore();
 }
 // Keep the disclosure legible and anchored after full-frame effects.
 if(watermarkVisibleForScene(t)){ctx.save();setLayoutTransform();watermark(w,h,'#626a60');ctx.restore();}
 drawSafeAreaGuides(w,h);drawOverlayGradientHandles(w,h);
}
function previewSelectedEffect(){if(exporting)return;const selected=$('effects').value;if(selected==='none'){changed();return}if(!playing){const speed=Number($('effectSpeed').value)||1,cut=selected==='fade'?duration()*(state.template==='collage'&&$('uploadScene').checked ? .5 : effectEnd()):(effectCuts().find((value,index)=>index>0&&value/duration()>=.46)||effectCuts()[1]||duration()*.5),offset=selected==='fade'?0:.18/speed;time=Math.max(0,Math.min(duration()-.01,cut+offset));last=0;render(time)}changed()}
for(const eventName of ['input','change'])$('effects').addEventListener(eventName,previewSelectedEffect);

buildTemplates();updateTimeline();refreshClipEditor();render(0);// Project recovery is handled by project-library.js.
