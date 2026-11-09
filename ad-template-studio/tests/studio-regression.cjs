const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8'),elements=new Map(),defaults={};
for(const m of html.matchAll(/<input\b([^>]+)>/g)){const a=m[1],id=a.match(/id="([^"]+)"/)?.[1];if(id)defaults[id]={value:a.match(/value="([^"]*)"/)?.[1]||'',type:a.match(/type="([^"]+)"/)?.[1]||'text',checked:/\bchecked\b/.test(a)}}
for(const m of html.matchAll(/<select\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g)){const options=[...m[2].matchAll(/<option\b([^>]+)>/g)],o=options.find(o=>/\bselected\b/.test(o[1]))||options[0];defaults[m[1]]={value:o?.[1].match(/value="([^"]*)"/)?.[1]||'',type:'select'}}
const gradient={addColorStop(){}};const context=new Proxy({measureText:s=>({width:String(s).length*15}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient,createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)})},{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});
// Optional controls may be absent in older/editor-specific layouts.
const optionalMissing=new Set(['captionImport']);
function element(id=''){return {value:'',checked:false,disabled:false,type:'text',...defaults[id],style:{setProperty(){}},dataset:{},classList:{add(){},remove(){}},parentElement:{dataset:{},style:{setProperty(){}}},append(){},prepend(){},replaceChildren(){},setAttribute(){},addEventListener(){},querySelectorAll:()=>[],closest(){return this},getContext:()=>context,click(){}}}
const document={hidden:false,getElementById:id=>{if(optionalMissing.has(id))return null;assert(html.includes('id="'+id+'"'),'Missing control '+id);if(!elements.has(id))elements.set(id,element(id));return elements.get(id)},createElement:()=>element(),querySelector:()=>element(),querySelectorAll:()=>[],addEventListener(){},body:element()};
const sandbox={document,window:{},console,assert,requestAnimationFrame(){},cancelAnimationFrame(){},localStorage:{getItem:()=>null},Image:class{},Blob,URL,performance,Date,AbortController,DOMException,setTimeout,clearTimeout,setInterval,clearInterval,crypto:require('crypto').webcrypto};vm.createContext(sandbox);
for(const file of ['app.js','framed-video.js','effects.js','audio-captions.js','export-controller.js','workflow.js','studio-editing.js','audio-finishing.js','precise-export.js'])vm.runInContext(fs.readFileSync(path.join(root,'dist',file),'utf8'),sandbox,{filename:file});
assert(!elements.has('captionImport'),'Optional caption import unexpectedly required during initialization');
vm.runInContext(fs.readFileSync(path.join(root,'dist','overlay-gradient.js'),'utf8'),sandbox,{filename:'overlay-gradient.js'});
vm.runInContext(`
 state.overlayGradient={enabled:true,direction:'bottom-up',top:{color:'#112233',opacity:81,position:14},bottom:{color:'#445566',opacity:9,position:92}};
 syncOverlayGradientControls();
 if($('overlayGradientDirection').value!=='bottom-up'||$('overlayTopColor').value!=='#112233'||$('overlayTopHex').value!=='#112233'.toUpperCase()||$('overlayTopOpacity').value!==81||$('overlayBottomPosition').value!==92)throw Error('Restored overlay gradient did not synchronize its controls');
 if(!$('overlayGradientPreview').style.background.includes('rgba(17,34,51,0.81)'))throw Error('Restored overlay gradient did not refresh its preview');
`,sandbox);
const library=fs.readFileSync(path.join(root,'dist/project-library.js'),'utf8').split("document.body.classList.add('studio-loading');")[0];vm.runInContext(library,sandbox,{filename:'project-library.js'});
vm.runInContext(`
let timingCases=0;
for(const template of ['collage','before','styles','steps','showcase'])for(const upload of [false,true]){
 state.template=template;$('uploadScene').checked=upload;state.sceneTiming={};$('duration').value='12';
 assert(Math.abs(duration()-12)<1e-8,'Default duration drift');
 const values=sceneDefinitions().map((s,i)=>(i+1)*.7);state.sceneTiming[timingKey()]=values;
 assert(Math.abs(duration()-values.reduce((a,b)=>a+b,0))<.001,'Custom total not used');
 for(let i=0;i<=100;i++){const t=duration()*i/100;assert(Math.abs(actualTimeAtProgress(sceneProgress(t))-t)<.00001,'Timing map is not invertible');timingCases++}
 const cuts=effectCuts();assert(cuts.every((c,i)=>c>=0&&c<=duration()+.001&&(!i||c>=cuts[i-1])),'Effect cuts escaped timeline');assert(Math.abs(effectEnd()*duration()-actualTimeAtProgress(.82+(template==='collage'&&upload?.12:0)))<.001,'End card timing mismatch');
}
let geometry=imageGeometry(1200,800,400,800,'cover',{zoom:1,x:0,y:50});assert(geometry.x===0&&geometry.w===1200,'Left crop incorrect');
geometry=imageGeometry(1200,800,400,800,'cover',{zoom:1,x:100,y:50});assert(geometry.x===-800,'Right crop incorrect');
geometry=imageGeometry(1200,800,400,800,'contain',{zoom:1});assert(Math.abs(geometry.w-400)<.001&&geometry.y>0,'Contain no longer fits');
$('musicFadeIn').value='0';$('musicFadeOut').value='0';$('musicDuck').checked=true;$('duckLevel').value='25';
const music={kind:'music',start:0,offset:0,length:0,volume:80,loop:true,buffer:{duration:4}},voice={start:.5,end:1.5};
assert(Math.abs(audioGainAt(music,.1,4,voice)-.8)<1e-8,'Music volume incorrect');assert(Math.abs(audioGainAt(music,1,4,voice)-.2)<1e-8,'Music ducking incorrect');assert(Math.abs(audioGainAt(music,2,4,voice)-.8)<1e-8,'Music failed to recover');
$('musicFadeIn').value='1';assert(Math.abs(audioGainAt(music,.1,4,null)-.08)<1e-8,'Fade-in incorrect');
$('musicFadeOut').value='1';assert(Math.abs(audioGainAt(music,3.5,4,null)-.4)<1e-8,'Fade-out incorrect');
const points=gainPoints(music,4,voice);assert(points.every((p,i)=>!i||p>points[i-1]),'Audio envelope points unsorted');
state.projectId='test-project';state.template='collage';const snapshot=captureSession();assert(snapshot.project.projectId==='test-project'&&snapshot.project.sceneTiming,'Session metadata missing');state.images.push({name:'new',src:'data:image/jpeg;base64,x'});assert(!snapshot.project.images.length,'Undo snapshot mutated');
assert(brandFields.includes('appName')&&brandFields.includes('textFont')&&brandFields.includes('watermarkColor'),'Brand settings incomplete');
console.log('Passed '+timingCases+' timeline mapping cases; crop/contain geometry; safe-area bounds; voice ducking, fades and recovery; immutable undo metadata; brand fields.');
`,sandbox);
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert(new Set(ids).size===ids.length,'Duplicate HTML IDs');
for(const match of html.matchAll(/<script src="([^"]+)"/g))assert(fs.existsSync(path.join(root,'dist',match[1].split('?')[0])),'Missing offline script '+match[1]);
console.log('Passed: unique controls and all offline scripts present.');
