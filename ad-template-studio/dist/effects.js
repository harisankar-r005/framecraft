// Deterministic timeline effects: preview, scrubbing and export share the same clock.
let effectsBasePass=false,effectBuffer=null;
function effectAmount(){return Math.max(0,Math.min(1,Number($('effectIntensity').value)/100))}
function uploadOrLoadingScene(t=motionClock){const p=Math.max(0,Math.min(1,t/duration()));return state.template==='collage'&&$('uploadScene').checked&&p>=.5&&p<.88||state.template==='styles'&&p<.46}
function effectEnabled(name){const chosen=$('effects').value,endcardAnimated=$('endcardEffect').value==='animated',p=Math.max(0,Math.min(1,motionClock/duration())),atEndCard=p>=effectEnd();if(uploadOrLoadingScene()||effectAmount()<=0)return false;if(atEndCard)return endcardAnimated&&['endcard','hearts','sparkle'].includes(name);return chosen==='all'||chosen===name}
function specialEffectActive(name,p){return effectEnabled(name)&&(p>=effectEnd()||$('effects').value===name&&p>=.46&&p<effectEnd())}
function effectEnd(){if(state.template==='framed')return framedEndStart()/duration();return state.template==='collage'&&$('uploadScene').checked?.94:.82}
function effectCuts(){if(state.template==='framed')return framedCuts();let values;
 if(state.template==='collage')values=$('uploadScene').checked?[0,.185,.37,.5,.88,.94]:[0,.185,.37,.56,.82];
 else if(state.template==='styles'){const segment=styleResultSegment();values=[0,.14,.46,...Array.from({length:styleResultCount()-1},(_,index)=>.46+(index+1)*segment),.82]}
 else if(state.template==='steps')values=[0,.275,.55,.82];
 else if(state.template==='before')values=[0,.22,.44,.82];
 else values=[0,.2,.4,.6,.8,.82];
 return values.map(v=>v*duration());
}
function effectWindow(t,offset=0){const speed=Number($('effectSpeed').value)||1,length=.68/speed;let best=null;for(let [i,cut] of effectCuts().entries()){if(!i)continue;let age=t-cut-offset;if(age>=-length*.25&&age<length*.75)best={p:(age+length*.25)/length,index:i,cut}}return best}
function drawOverlayGradient(w,h){const overlay=state.overlayGradient;if(!overlay?.enabled)return;const clamp=value=>Math.max(0,Math.min(100,Number(value)||0));const rgba=stop=>{const color=String(stop.color||'#000000'),number=parseInt(color.slice(1),16),r=number>>16&255,g=number>>8&255,b=number&255;return `rgba(${r},${g},${b},${clamp(stop.opacity)/100})`};const stops=[overlay.top,overlay.bottom].sort((a,b)=>clamp(a.position)-clamp(b.position));ctx.save();setLayoutTransform();const gradient=overlay.direction==='bottom-up'?ctx.createLinearGradient(0,h,0,0):ctx.createLinearGradient(0,0,0,h);for(const stop of stops)gradient.addColorStop(clamp(stop.position)/100,rgba(stop));ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);ctx.restore()}
function effectGlow(x,y,r,color,alpha){if(alpha<=0)return;ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=alpha;let g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#ffffff');g.addColorStop(.15,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore()}
function effectHeart(x,y,size,alpha,color){ctx.save();ctx.translate(x,y);ctx.scale(size,size);ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,.3);ctx.bezierCurveTo(-1,-.3,-.5,-1,0,-.45);ctx.bezierCurveTo(.5,-1,1,-.3,0,.3);ctx.fill();ctx.restore()}
function effectRevealText(line,x,y,size,align){let age=motionClock/duration()<effectEnd()?motionAge:motionClock-duration()*effectEnd(),span=Math.min(.6/(Number($('effectSpeed').value)||1),duration()*(1-effectEnd())*.8),reveal=easeLoader(age/Math.max(.1,span)),width=ctx.measureText(line).width,left=align==='center'?x-width/2:align==='right'?x-width:x;ctx.save();ctx.beginPath();let pad=$('textOutline').checked?(Number($('textOutlineWidth').value)||2)+3:3;ctx.rect(left-pad,y-pad-3,(width+pad*2)*reveal,size*1.4+pad*2);ctx.clip();paintText(line,x,y);ctx.restore()}
function effectEndBackground(w,h){if(!effectEnabled('endcard'))return;let g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#1576ff');g.addColorStop(.55,'#6b29dc');g.addColorStop(1,$('effectColor').value);ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}
function render(t){
 deferredTypography=[];effectsBasePass=true;try{renderBase(t)}finally{effectsBasePass=false}
 const typography=deferredTypography;deferredTypography=null;const [w,h]=layoutSize(),p=t/duration();if(p<effectEnd())drawOverlayGradient(w,h);drawingForegroundTypography=true;try{for(const command of typography)text(...command)}finally{drawingForegroundTypography=false}const strength=effectAmount(),speed=Number($('effectSpeed').value)||1,color=$('effectColor').value;
 if(!uploadOrLoadingScene(t)&&strength&&$('effects').value!=='none'){
  ctx.save();setLayoutTransform();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  if(effectEnabled('blur')){let age=t;for(const cut of effectCuts())if(cut<=t)age=t-cut;let blur=(1-easeLoader(age/(.65/speed)))*11*strength;
   if(blur>.05){if(!effectBuffer)effectBuffer=document.createElement('canvas');if(effectBuffer.width!==canvas.width||effectBuffer.height!==canvas.height){effectBuffer.width=canvas.width;effectBuffer.height=canvas.height}let b=effectBuffer.getContext('2d');b.clearRect(0,0,canvas.width,canvas.height);b.drawImage(canvas,0,0);ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.filter=`blur(${blur}px)`;ctx.drawImage(effectBuffer,0,0);ctx.restore()}}
  const event=effectWindow(t);
  if(event){const u=event.p,peak=Math.sin(Math.PI*u)**4;
   if(effectEnabled('flash')&&($('effects').value!=='all'||event.index%3===1)){
    const x=w*(.35+.3*u),y=h*.43;effectGlow(x,y,w*.75,'#cceaff',peak*strength);ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=peak*strength;let g=ctx.createLinearGradient(0,y-12,0,y+12);g.addColorStop(0,'transparent');g.addColorStop(.5,'white');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(0,y-12,w,24);ctx.restore();
   }
   if(effectEnabled('white')&&($('effects').value!=='all'||event.index%3===2)){ctx.save();ctx.globalAlpha=peak*strength;ctx.fillStyle='white';ctx.fillRect(0,0,w,h);ctx.restore()}
   if(effectEnabled('leak')&&($('effects').value!=='all'||event.index%3===0)){const a=Math.sin(Math.PI*u)*strength;effectGlow(w*(-.25+1.5*u),h*.6,w*.85,color,a);effectGlow(w*(1.2-u),h*.25,w*.7,'#985aff',a*.8);effectGlow(w*.4,h*(1.2-u),w*.5,'#ff7045',a*.65)}
   if(effectEnabled('gold')&&($('effects').value!=='all'||event.index%3===2)){ctx.save();ctx.globalCompositeOperation='screen';const x=w*(-.3+1.6*u),band=w*.23;let g=ctx.createLinearGradient(x-band,0,x+band,0);g.addColorStop(0,'transparent');g.addColorStop(.25,color);g.addColorStop(.5,'#fffef2');g.addColorStop(.75,color);g.addColorStop(1,'transparent');ctx.globalAlpha=Math.sin(Math.PI*u)*strength;ctx.fillStyle=g;ctx.fillRect(x-band,0,band*2,h);ctx.restore()}
  }
  if(effectEnabled('fade')){let cut=duration()*(state.template==='collage'&&$('uploadScene').checked?.5:effectEnd()),distance=Math.abs(t-cut),length=.4/speed;let opacity=(1-easeLoader(distance/length))*strength;ctx.save();ctx.globalAlpha=opacity;ctx.fillStyle='black';ctx.fillRect(0,0,w,h);ctx.restore()}
  if(specialEffectActive('hearts',p)){for(let i=0;i<17;i++){let seed=(i*.61803398875)%1,x=seed*w,y=h-(((t*speed*38+i*117)%(h+160)))+80;effectHeart(x+Math.sin(t+i)*14,y,18+(i%5)*10,(.12+(i%3)*.06)*strength,color)}}
  if(specialEffectActive('sparkle',p)){let age=Math.max(0,t-duration()*effectEnd()),u=Math.min(1,age*speed/1.05),yy=h*.65;for(let i=0;i<45;i++){let seed=(i*.75487766)%1,x=w*(u*1.15-.1)+Math.sin(i*9.2)*w*.15,y=yy+Math.cos(i*5.7)*h*.13,twinkle=(.5+.5*Math.sin(age*13+i*3))*strength;ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=twinkle*(u<1?1:.45);ctx.strokeStyle=i%3===0?'white':color;ctx.lineWidth=1.5;let r=2+seed*6;ctx.beginPath();ctx.moveTo(x-r,y);ctx.lineTo(x+r,y);ctx.moveTo(x,y-r);ctx.lineTo(x,y+r);ctx.stroke();ctx.restore()}}
  ctx.restore();
 }
 drawEndcardEffects(t,w,h);
 // Keep the disclosure legible and anchored after full-frame effects.
 ctx.save();setLayoutTransform();watermark(w,h,p>=effectEnd()?'#b7c4ae':p>=.5&&p<.88&&state.template==='collage'?'#a1a1a1':'#626a60');ctx.restore();
}
function prepareEffect(){if(['upload','loader'].includes($('effects').value)){state.template='collage';$('uploadScene').checked=true;buildTemplates();updateTimeline()}if($('effects').value==='all')$('uploadScene').checked=true;}
$('effects').addEventListener('input',()=>{prepareEffect();changed()});

buildTemplates();updateTimeline();refreshClipEditor();render(0);// Project recovery is handled by project-library.js.
