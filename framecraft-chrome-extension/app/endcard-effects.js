let endcardBuffer=null,endSfxFile=null;
function endAge(){return Math.max(0,motionClock-duration()*effectEnd())}
function drawAnimatedEndLogo(im,x,y,w,h){
 const mode=$('endLogoMotion').value,age=endAge(),p=easeLoader(age/.7);ctx.save();ctx.translate(x+w/2,y+h/2);
 if(mode==='fade')ctx.globalAlpha*=p;
 if(mode==='spin')ctx.rotate((1-p)*-Math.PI*1.5);
 const scale=mode==='pulse'?1+Math.sin(age*5)*.055:mode==='bounce'?.65+.35*p+Math.sin(p*Math.PI)*.14:mode==='spin'?.7+.3*p:1;
 ctx.scale(scale,scale);photo(im,-w/2,-h/2,w,h);ctx.restore();
}
function drawEndcardEffects(t,w,h){
 const age=t-duration()*effectEnd();if(age<0)return;const span=Math.max(.1,Math.min(2,Number($('endEntranceSeconds').value)||.6,duration()*(1-effectEnd())*.8)),p=easeLoader(age/span),entrance=$('endEntrance').value;
 ctx.save();setLayoutTransform();
 if(entrance!=='none'&&p<1){if(!endcardBuffer)endcardBuffer=document.createElement('canvas');if(endcardBuffer.width!==canvas.width||endcardBuffer.height!==canvas.height){endcardBuffer.width=canvas.width;endcardBuffer.height=canvas.height}const b=endcardBuffer.getContext('2d');b.clearRect(0,0,canvas.width,canvas.height);b.drawImage(canvas,0,0);ctx.fillStyle='#08172b';ctx.fillRect(0,0,w,h);ctx.save();if(entrance==='fade')ctx.globalAlpha=p;if(entrance==='zoom'){ctx.translate(w/2,h/2);ctx.scale(.8+.2*p,.8+.2*p);ctx.translate(-w/2,-h/2);ctx.globalAlpha=p}if(entrance==='slide')ctx.translate(0,(1-p)*h*.25);if(entrance==='wipe'){ctx.beginPath();ctx.rect(0,0,w*p,h);ctx.clip()}ctx.drawImage(endcardBuffer,(canvas.width-w*Math.min(canvas.width/w,canvas.height/h))/2,(canvas.height-h*Math.min(canvas.width/w,canvas.height/h))/2,w*Math.min(canvas.width/w,canvas.height/h),h*Math.min(canvas.width/w,canvas.height/h),0,0,w,h);ctx.restore()}
 const kind=$('endParticles').value,count=Math.round(Math.max(5,Math.min(70,Number($('endParticleCount').value)||30))),size=Math.max(.3,Math.min(1.8,Number($('endParticleSize').value)/100)),speed=Number($('endParticleSpeed').value)||1,color=$('endParticleColor').value,opacity=Math.max(.1,Math.min(1,Number($('endParticleOpacity').value)/100));
 if(kind!=='none')for(let i=0;i<count;i++){
  const seed=(i*.61803398875)%1,phase=(age*speed*(.08+(i%5)*.012)+i*.137)%1,x=seed*w+Math.sin(age*speed+i*3)*w*.025,y=h*(1-phase),r=(4+(i%5)*3)*size,twinkle=.4+.6*(.5+.5*Math.sin(age*6+i));ctx.save();ctx.globalAlpha=opacity*twinkle*easeLoader(age/.25);ctx.fillStyle=color;ctx.strokeStyle=color;ctx.lineWidth=1.5;
  if(kind==='hearts'){effectHeart(x,y,r,opacity*twinkle*easeLoader(age/.25),color)}
  else if(kind==='bubbles'){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke()}
  else if(kind==='confetti'){ctx.translate(x,y);ctx.rotate(age*speed*2+i);ctx.fillStyle=i%3===0?'#ffffff':color;ctx.fillRect(-r/2,-r/2,r,r*.45)}
  else if(kind==='stars'){ctx.translate(x,y);ctx.rotate(age*.3);ctx.beginPath();for(let n=0;n<10;n++){const a=-Math.PI/2+n*Math.PI/5,rr=n%2?r*.42:r;n?ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath();ctx.fill()}
  else{ctx.beginPath();ctx.moveTo(x-r,y);ctx.lineTo(x+r,y);ctx.moveTo(x,y-r);ctx.lineTo(x,y+r);ctx.stroke()}
  ctx.restore();
 }ctx.restore();
}
function endSfxTiming(){return {start:duration()*effectEnd()+fClamp($('endSfxDelay').value,0,10),offset:fClamp($('endSfxOffset').value,0,3600),length:fClamp($('endSfxLength').value,0,3600),volume:fClamp($('endSfxVolume').value,0,100,80)}}
function refreshEndSfx(){$('endSfxName').textContent=state.endSfx?(endSfxFile?'Ready: ':'Reattach: ')+state.endSfx.name:'No end-card sound attached'}
$('endSfxUpload').onchange=e=>{const file=e.target.files[0];if(!file)return;if(file.size>30*1024*1024){message('Use an end-card sound under 30 MB.');return}endSfxFile=file;state.endSfx={name:file.name};refreshEndSfx();changed()};
$('removeEndSfx').onclick=()=>{endSfxFile=null;state.endSfx=null;$('endSfxUpload').value='';refreshEndSfx();changed()};
$('previewEndEffects').onclick=async()=>{
 if(exporting||preparingAudio)return;playing=false;stopAudioMix();stopFramedPlayback();preparingAudio=true;++previewAudioRequest;time=duration()*effectEnd();render(time);
 try{await prepareAudioMix(null,true);previewMixStart=time;playing=true;last=0;$('play').textContent='Ⅱ';beginAudioMix(time)}catch(e){message('End-card preview: '+e.message)}finally{preparingAudio=false}
};
refreshEndSfx();
