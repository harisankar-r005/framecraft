// Shared timing and image geometry for preview and both export paths.
fields.push('voiceStart','voiceOffset','voiceLength','voiceVolume','musicFadeIn','musicFadeOut','voiceFadeIn','voiceFadeOut','musicDuck','duckLevel','exportMethod');
function sceneDefinitions(){
 if(state.template==='collage')return $('uploadScene').checked?[
  ['Collage',0,.5],['Photo upload',.5,.671],['Loading animation',.671,.88],['Result reveal',.88,.94],['End card',.94,1]
 ]:[['Collage',0,.56],['Before & result',.56,.82],['End card',.82,1]];
 if(state.template==='before')return [['Original',0,.22],['Transformation',.22,.44],['Result',.44,.82],['End card',.82,1]];
 if(state.template==='steps')return [['Upload',0,.275],['Choose',.275,.55],['Reveal',.55,.82],['End card',.82,1]];
 if(state.template==='styles')return [['Original',0,.14],['Photo upload',.14,.30],['Loading animation',.30,.46],['Style results',.46,.82],['End card',.82,1]];
 return [['Opening hook',0,.2],['Result showcase',.2,.82],['End card',.82,1]];
}
function timingKey(){return state.template+(state.template==='collage'&&$('uploadScene').checked?'-upload':'')}
function hasSceneTiming(){return state.template!=='framed'&&Array.isArray(state.sceneTiming?.[timingKey()])&&state.sceneTiming[timingKey()].length===sceneDefinitions().length}
function sceneLengths(){const defaults=sceneDefinitions().map(s=>(s[2]-s[1])*Number($('duration').value));return hasSceneTiming()?state.sceneTiming[timingKey()].map((n,i)=>bounded(n,.1,120,defaults[i])):defaults}
function timedDuration(){return Math.round(sceneLengths().reduce((a,b)=>a+b,0)*1000)/1000}
function sceneAtTime(t){const defs=sceneDefinitions(),lengths=sceneLengths();let start=0;for(let i=0;i<defs.length;i++){const end=start+lengths[i];if(t<end||i===defs.length-1)return {index:i,start,end,length:lengths[i],definition:defs[i],progress:bounded((t-start)/lengths[i],0,1)};start=end}}
function sceneProgress(t){if(state.template==='framed')return bounded(t/duration(),0,1);const s=sceneAtTime(t);return s.definition[1]+(s.definition[2]-s.definition[1])*s.progress}
function actualTimeAtProgress(p){if(state.template==='framed')return p*duration();const defs=sceneDefinitions(),lengths=sceneLengths();let start=0;for(let i=0;i<defs.length;i++){if(p<=defs[i][2]||i===defs.length-1)return start+lengths[i]*bounded((p-defs[i][1])/(defs[i][2]-defs[i][1]),0,1);start+=lengths[i]}}
function editedSceneAge(t){return Math.max(0,t-sceneAtTime(t).start)}
const templateEffectEnd=effectEnd,templateEffectCuts=effectCuts;
effectEnd=function(){if(state.template==='framed')return templateEffectEnd();return actualTimeAtProgress(state.template==='collage'&&$('uploadScene').checked?.94:.82)/duration()};
effectCuts=function(){if(state.template==='framed')return templateEffectCuts();const cuts=templateEffectCuts().map(t=>actualTimeAtProgress(t/duration()));return [...new Set([...cuts,...sceneDefinitions().map(s=>actualTimeAtProgress(s[1]))])].sort((a,b)=>a-b)};
function refreshTimingEditor(){
 $('sceneTimingPanel').hidden=state.template==='framed';const box=$('sceneTimingRows');box.replaceChildren();if(state.template==='framed')return;
 const lengths=sceneLengths();sceneDefinitions().forEach((scene,i)=>{const label=document.createElement('label');label.textContent=scene[0]+' (seconds)';const input=document.createElement('input');input.type='number';input.min='.1';input.max='120';input.step='.1';input.value=Number(lengths[i].toFixed(3));input.oninput=()=>{const next=sceneLengths();next[i]=Math.round(bounded(input.value,.1,120,lengths[i])*1000)/1000;state.sceneTiming=state.sceneTiming||{};state.sceneTiming[timingKey()]=next;time=Math.min(time,duration());updateTimeline(true);$('sceneTimingTotal').textContent='Total: '+duration().toFixed(2)+' seconds · custom timing';changed()};label.append(input);box.append(label)});
 $('sceneTimingTotal').textContent='Total: '+duration().toFixed(2)+' seconds'+(hasSceneTiming()?' · custom timing':' · template timing');
}
$('resetSceneTiming').onclick=()=>{if(state.sceneTiming)delete state.sceneTiming[timingKey()];time=0;updateTimeline();changed()};
$('duration').addEventListener('change',()=>{if(state.sceneTiming)delete state.sceneTiming[timingKey()];time=0;updateTimeline();changed()});
$('uploadScene').addEventListener('change',()=>{time=0;updateTimeline();changed()});
const originalUpdateTimeline=updateTimeline;
let lastSceneHighlight=-1;
function timelineItems(){
 if(state.template==='framed'){const clips=state.clips||[];return [...(clips.length?clips.map((c,i)=>({label:'Scene '+(i+1),length:clipLength(c)})):[1,2,3].map(i=>({label:'Scene '+i,length:7}))),{label:'End card',length:fClamp($('frameEndDuration').value,1,10,4)}]}
 const lengths=sceneLengths();return sceneDefinitions().map((s,i)=>({label:s[0],length:lengths[i]}));
}
function refreshSceneTimeline(){
 const items=timelineItems();let start=0;const rail=[];
 $('timeline').replaceChildren(...items.map((item,i)=>{
  const b=document.createElement('button');b.type='button';b.className='scene-button';b.dataset.start=start;b.dataset.end=start+item.length;
  const number=document.createElement('span');number.className='scene-number';number.textContent=String(i+1).padStart(2,'0');
  const name=document.createElement('strong');name.className='scene-name';name.textContent=item.label;
  const length=document.createElement('span');length.className='scene-length';length.textContent=item.length.toFixed(1)+' sec';
  b.append(number,name,length);b.setAttribute('aria-label','Preview '+item.label+', '+item.length.toFixed(1)+' seconds');
  const position=start;b.onclick=()=>{if(exporting)return;playing=false;$('play').textContent='▶';stopAudioMix();stopFramedPlayback();time=position;render(time)};
  const segment=document.createElement('span');segment.style.flex=String(item.length);rail.push(segment);start+=item.length;return b;
 }));
 $('sceneDurationRail').replaceChildren(...rail);$('sceneSummary').textContent=items.length+' scenes · '+duration().toFixed(1)+' sec';lastSceneHighlight=-1;highlightTimeline(time);
}
function highlightTimeline(t){
 const buttons=Array.from($('timeline').querySelectorAll('button'));const selected=buttons.findIndex((b,i)=>t<Number(b.dataset.end)||i===buttons.length-1);if(selected===lastSceneHighlight)return;lastSceneHighlight=selected;
 buttons.forEach((b,i)=>b.setAttribute('aria-current',i===selected?'true':'false'));
 $('sceneDurationRail').querySelectorAll('span').forEach((s,i)=>{s.dataset.active=i===selected?'true':'false'});
}
updateTimeline=function(skipTimingEditor=false){originalUpdateTimeline();if(!skipTimingEditor)refreshTimingEditor();refreshSceneTimeline()};
const originalAnimationPanels=refreshAnimationPanels;
refreshAnimationPanels=function(){originalAnimationPanels();const framed=state.template==='framed',upload=state.template==='collage'&&$('uploadScene').checked;
 $('imageAssetsGroup').hidden=framed;$('framedAssetsGroup').hidden=!framed;
 $('originalsGroup').hidden=framed||!(['before','styles','steps'].includes(state.template)||upload);
 $('partnerPhotoLabel').hidden=!upload;$('framedEndDurationLabel').hidden=!framed;if(typeof refreshCropControls==='function')refreshCropControls();
};
function cropForImage(im){for(const c of state.clips||[])for(const side of ['left','right'])if(clipPortraits.get(c.id+'-'+side)===im)return c[side]?.crop;let index=images.indexOf(im);return index>=0?state.images[index]?.crop:im===before?state.before?.crop:im===partner?state.partner?.crop:im===endcard?state.endcard?.crop:null}
function imageGeometry(iw,ih,w,h,fit,crop={},motionZoom=1){
 const scale=(fit==='contain'?Math.min(w/iw,h/ih):Math.max(w/iw,h/ih))*bounded(crop.zoom,1,3,1)*motionZoom,dw=iw*scale,dh=ih*scale;
 const position=(space,value)=>space<0?space*bounded(value,0,100,50)/100:space/2;
 return {x:position(w-dw,crop.x),y:position(h-dh,crop.y),w:dw,h:dh};
}
function drawCroppedImage(context,im,x,y,w,h,zoom=1,fit=$('fit').value,crop=cropForImage(im)||{}){const g=imageGeometry(im.width,im.height,w,h,fit,crop,zoom);context.drawImage(im,x+g.x,y+g.y,g.w,g.h)}
function cropEntries(){const out=state.template==='framed'?[]:state.images.map((asset,index)=>({key:'image-'+index,label:'Result '+(index+1)+' · '+asset.name,asset,image:images[index]}));for(const [key,label,asset,image] of [['before','Original',state.before,before],['partner','Partner',state.partner,partner],['endcard','End-card image',state.endcard,endcard]])if(asset)out.push({key,label,asset,image});return out}
function refreshCropControls(){const items=cropEntries(),selected=$('cropAsset').value;$('cropAsset').replaceChildren(...items.map(item=>Object.assign(document.createElement('option'),{value:item.key,textContent:item.label})));if(items.some(item=>item.key===selected))$('cropAsset').value=selected;$('cropEditor').hidden=!items.length;if(items.length)showCropValues()}
function showCropValues(){const item=cropEntries().find(entry=>entry.key===$('cropAsset').value);if(!item)return;const crop=item.asset.crop||{};$('cropZoom').value=Math.round((crop.zoom||1)*100);$('cropX').value=crop.x??50;$('cropY').value=crop.y??50;drawCropPreview(item)}
function drawCropPreview(item){if(!item?.image)return;const preview=$('cropPreview'),context=preview.getContext('2d'),[width,height]=outputSize();preview.width=240;preview.height=Math.max(120,Math.round(240*height/width));context.fillStyle=canvasBackground;context.fillRect(0,0,preview.width,preview.height);drawCroppedImage(context,item.image,0,0,preview.width,preview.height,1,item.key==='endcard'?$('endcardFit').value:$('fit').value,item.asset.crop||{})}
$('cropAsset').onchange=showCropValues;for(const id of ['cropZoom','cropX','cropY'])$(id).oninput=()=>{const item=cropEntries().find(entry=>entry.key===$('cropAsset').value);if(!item)return;item.asset.crop={zoom:bounded($('cropZoom').value/100,1,3,1),x:bounded($('cropX').value,0,100,50),y:bounded($('cropY').value,0,100,50)};drawCropPreview(item);changed()};$('resetCrop').onclick=()=>{const item=cropEntries().find(entry=>entry.key===$('cropAsset').value);if(item){delete item.asset.crop;showCropValues();changed()}};
const originalRefreshAssets=refreshAssets;refreshAssets=async function(){await originalRefreshAssets();refreshCropControls()};
const uncroppedEndcard=customEndcard;customEndcard=function(w,h){if(!endcard||state.endVideo)return uncroppedEndcard(w,h);ctx.fillStyle=canvasBackground;ctx.fillRect(0,0,w,h);ctx.save();ctx.beginPath();ctx.rect(0,0,w,h);ctx.clip();drawCroppedImage(ctx,endcard,0,0,w,h,1,$('endcardFit').value);ctx.restore();return true};
function safeRect(width,height,preset){const margins=preset==='vertical'?{l:.07,r:.18,t:.12,b:.24}:preset==='square'?{l:.08,r:.08,t:.08,b:.18}:{l:.06,r:.06,t:.08,b:.15};return {x:width*margins.l,y:height*margins.t,w:width*(1-margins.l-margins.r),h:height*(1-margins.t-margins.b)}}
function drawSafeGuides(){if(exporting||$('safeGuides').value==='none')return;const width=canvas.width,height=canvas.height,area=safeRect(width,height,$('safeGuides').value);ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#00000055';ctx.fillRect(0,0,width,area.y);ctx.fillRect(0,area.y+area.h,width,height-area.y-area.h);ctx.fillRect(0,area.y,area.x,area.h);ctx.fillRect(area.x+area.w,area.y,width-area.x-area.w,area.h);ctx.strokeStyle='#d6ff62';ctx.lineWidth=Math.max(2,width/500);ctx.setLineDash([width/80,width/100]);ctx.strokeRect(area.x,area.y,area.w,area.h);ctx.restore()}
const studioRender=render;render=function(t){studioRender(t);drawSafeGuides();highlightTimeline(t)};$('safeGuides').onchange=()=>render(time);
refreshAnimationPanels();updateTimeline();refreshCropControls();render(0);
