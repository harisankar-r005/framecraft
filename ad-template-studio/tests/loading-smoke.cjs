const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8'),els=new Map();
const defaults={};for(const m of html.matchAll(/<input\b([^>]+)>/g)){const a=m[1],id=a.match(/id="([^"]+)"/)?.[1];if(id)defaults[id]={value:a.match(/value="([^"]*)"/)?.[1]||'',type:a.match(/type="([^"]+)"/)?.[1]||'text',checked:/\bchecked\b/.test(a)}}
for(const m of html.matchAll(/<select\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g)){const options=[...m[2].matchAll(/<option\b([^>]+)>/g)],chosen=options.find(o=>/\bselected\b/.test(o[1]))||options[0];defaults[m[1]]={value:chosen?.[1].match(/value="([^"]*)"/)?.[1]||'',type:'select'}}
const gradient={addColorStop(){}};let writes=0;
const context=new Proxy({globalAlpha:1,measureText:s=>({width:String(s).length*18}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient,createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData:()=>writes++},{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});
function el(id=''){return {value:'',checked:false,type:'text',...defaults[id],style:{},parentElement:{dataset:{},style:{setProperty(){}}},append(){},prepend(){},replaceChildren(){},setAttribute(){},addEventListener(){},closest(){return this},getContext:()=>context,click(){}}}
const document={getElementById:id=>{if(!html.includes('id="'+id+'"'))throw Error('Missing control: '+id);if(!els.has(id))els.set(id,el(id));return els.get(id)},createElement:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[]};
const sandbox={document,window:{},console,requestAnimationFrame(){},localStorage:{getItem:()=>null},Image:class{},Blob,URL,performance,Date};vm.createContext(sandbox);
const source=['app.js','framed-video.js','endcard-effects.js','effects.js','audio-captions.js'].map(f=>fs.readFileSync(path.join(root,'dist',f),'utf8')).join('\n');
vm.runInContext(source+`
let checks=0;before={width:400,height:600};partner={width:400,height:600};images=[before,partner];
for(const format of Object.keys(sizes))for(const style of ['merge','orbit','ring','bounce','morph','scan','sparkle'])for(const speed of ['0.65','1.5'])for(const size of ['60','160']){
 $('resolution').value=format;$('loaderStyle').value=style;$('loaderSpeed').value=speed;$('loaderSize').value=size;
 for(const phase of [.46,.7,.99]){uploadSequence(phase,sizes[format][0]/1.5,sizes[format][1]/1.5);checks++}
}
for(const effect of ['none','all','loader','sparkle'])for(const format of Object.keys(sizes)){$('effects').value=effect;$('resolution').value=format;render(duration()*.75);if(canvas.width!==sizes[format][0]||canvas.height!==sizes[format][1])throw Error('Output dimensions changed')}
let backup=project();for(const key of ['loaderStyle','loaderSpeed','loaderSize','loaderColor'])if(backup.settings[key]!==$(key).value)throw Error('Backup missing '+key);
let a=fluidPixels(.5,'#80ed13',40,'orbit'),b=fluidPixels(.5,'#80ed13',40,'orbit'),c=fluidPixels(.5,'#80ed13',40,'bounce');if(a.some((v,i)=>v!==b[i]))throw Error('Non-deterministic scrubbing');if(!a.some((v,i)=>v!==c[i]))throw Error('Styles identical');
console.log('Passed '+checks+' loading scene combinations, 12 effects/output integration cases, saved settings and deterministic rendering.');`,sandbox);
if(!writes)throw Error('Fluid renderer not exercised');

const operations=[];context.strokeText=(...args)=>operations.push(['stroke',context.strokeStyle,context.lineWidth,...args]);context.fillText=(...args)=>operations.push(['fill',...args]);
vm.runInContext(`$('textOutline').checked=true;$('textOutlineColor').value='#ff0044';$('textOutlineWidth').value='4';paintText('Hello',50,50);if(project().settings.textOutlineColor!=='#ff0044')throw Error('Outline not saved');`,sandbox);
if(operations[0][0]!=='stroke'||operations[0][1]!=='#ff0044'||operations[0][2]!==8||operations[1][0]!=='fill')throw Error('Text border rendering failed');
operations.length=0;vm.runInContext(`$('textOutline').checked=false;paintText('Hello',50,50);`,sandbox);if(operations.length!==1||operations[0][0]!=='fill')throw Error('Disabled outline still rendered');console.log('Passed: colored border precedes text fill, thickness applies, toggle works and settings persist.');

const textDraws=[];context.fillText=(line,x,y)=>textDraws.push({line,x,y,color:context.fillStyle,font:context.font,align:context.textAlign});
vm.runInContext(`$('effects').value='none';$('motion').value='none';$('customHookTextColor').checked=true;$('hookTextColor').value='#00ff00';$('textAlign').value='left';$('textFont').value='Georgia';$('watermarkText').value='Independent watermark';$('watermarkFont').value='Arial';$('watermarkColor').value='#ffffff';$('watermarkPosition').value='bottom-right';$('disclosure').checked=true;text($('hook').value,360,40,40,'#000000',620);watermark(720,1280);`,sandbox);
let heading=textDraws.find(x=>x.line===defaults.hook.value),mark=textDraws.find(x=>x.line==='Independent watermark');if(!heading||heading.align!=='left'||heading.x!==50||heading.color!=='#00ff00'||!heading.font.includes('Georgia'))throw Error('Text controls not applied');if(!mark||mark.color!=='#ffffff'||mark.align!=='right'||!mark.font.includes('Arial'))throw Error('Watermark inherited main styling');
let cardDraws=[];context.drawImage=(...a)=>cardDraws.push(a);vm.runInContext(`endcard={width:1080,height:1920};$('endcardFit').value='contain';customEndcard(1280,720);`,sandbox);let card=cardDraws.at(-1);if(!card||card[3]!==405||card[4]!==720)throw Error('End card fit crops the image');
vm.runInContext(`for(const key of ['textAlign','textFont','watermarkText','watermarkFont','watermarkColor','endcardFit'])if(project().settings[key]!==$(key).value)throw Error('Unsaved '+key);state.endcard={name:'card.jpg',src:'data:image/jpeg;base64,test'};if(!project().endcard)throw Error('End card absent from backup');`,sandbox);
console.log('Passed: heading alignment/font, independent watermark styling, uncropped end-card sizing, and new backup fields.');

vm.runInContext(String.raw`
const parsed=parseSrt('1\n00:00:01,200 --> 00:00:03,400\nHello world\n\n2\n00:00:04,000 --> 00:00:05,000\nSecond line');if(parsed.length!==2||parsed[0].start!==1.2||parsed[0].end!==3.4)throw Error('SRT import timing');
let scheduled=cueSchedule({start:3,offset:1,length:2,buffer:{duration:10}},0,12);if(scheduled.when!==3||scheduled.offset!==1||scheduled.duration!==2)throw Error('SFX scheduling');
let resumed=cueSchedule({start:3,offset:1,length:2,buffer:{duration:10}},4,12);if(resumed.when!==0||resumed.offset!==2||resumed.duration!==1)throw Error('SFX seek scheduling');
if(cueSchedule({start:3,offset:1,length:2,buffer:{duration:10}},6,12)!==null)throw Error('Expired SFX still plays');
let looped=cueSchedule({start:0,offset:2,length:0,loop:true,buffer:{duration:10}},10,12);if(looped.offset!==4||looped.duration!==2)throw Error('Background loop trim');
state.captions=[{text:'Caption test',start:1,end:3}];$('captionsEnabled').checked=true;render(2);if(project().captions[0].text!=='Caption test')throw Error('Captions missing from backup');
console.log('Passed: SRT import, SFX offsets and duration, seek resume, expired cues, trimmed loops and caption backup.');`,sandbox);

vm.runInContext(`
state.template='framed';state.clips=[{id:'a',name:'one.mp4',duration:10,length:7,offset:1},{id:'b',name:'two.mp4',duration:8,length:7,offset:0},{id:'c',name:'three.mp4',duration:9,length:7,offset:0}];$('frameEndDuration').value='4';if(duration()!==25)throw Error('Framed total duration');if(framedSceneAt(6.9).clip.id!=='a'||framedSceneAt(7).clip.id!=='b'||framedSceneAt(21)!==null)throw Error('Scene boundary');if(framedCuts().join(',')!=='0,7,14,21')throw Error('Effect cuts not aligned');if(!validateFramedAssets().includes('Reattach'))throw Error('Missing clips not detected');
for(const format of Object.keys(sizes)){$('resolution').value=format;for(const stamp of [0,6,7,14,21,24.9])render(stamp)}
if(project().clips.length!==3||project().settings.frameEndDuration!=='4')throw Error('Video metadata not saved');
state.clips[0].length=4;if(duration()!==22||framedSceneAt(4).clip.id!=='b')throw Error('Scene timing edit');console.log('Passed: 25-second framed timeline, scene boundaries, matching effect cuts, missing-file protection, 18 format/scene renders and saved clip metadata.');
`,sandbox);

vm.runInContext(`if(trimValidation(2,5,10)!=='')throw Error('Valid trim rejected');for(const args of [[5,2,10],[-1,2,10],[0,11,10],[0,61,100],[0,.05,10]])if(!trimValidation(...args))throw Error('Invalid trim accepted');state.clips[0].offset=2;state.clips[0].length=3;if(project().clips[0].offset!==2||framedSceneAt(2.9).clip.id!=='a'||framedSceneAt(3).clip.id!=='b')throw Error('Trim not reflected in timeline');console.log('Passed: trim range validation, saved offsets and trimmed scene boundaries.');`,sandbox);

textDraws.length=0;vm.runInContext(`$('appName').value='funswap';$('textAlign').value='right';$('motion').value='punchy';motionAge=0;badge('funswap');badge('');`,sandbox);const title=textDraws.find(x=>x.line==='funswap');if(!title||title.align!=='left'||title.x!==58||title.color!=='#ffffff'||textDraws.length!==1)throw Error('App title inherits heading layout or empty badge draws');console.log('Passed: app-name badge remains aligned and readable, and empty titles render no badge.');

vm.runInContext(`$('uploadLayout').value='one';if(uploadSlotCount()!==1)throw Error('One-photo mode');$('uploadLayout').value='two';if(uploadSlotCount()!==2)throw Error('Two-photo mode');$('uploadLayout').value='auto';partner=null;if(uploadSlotCount()!==1)throw Error('Automatic single photo');partner={width:400,height:600};if(uploadSlotCount()!==2)throw Error('Automatic two photos');for(const mode of ['one','two'])for(const format of Object.keys(sizes))for(const effect of ['merge','scan','sparkle']){$('uploadLayout').value=mode;$('loaderStyle').value=effect;uploadSequence(.7,sizes[format][0]/1.5,sizes[format][1]/1.5)}if(project().settings.uploadLayout!=='two')throw Error('Upload mode not saved');console.log('Passed: automatic photo detection, explicit one/two modes, loading effects in three sizes and saved layout.');`,sandbox);

textDraws.length=0;vm.runInContext(`$('uploadHeadingVisible').checked=true;$('uploadHeading').value='Just upload one photo';$('uploadHeadingFont').value='Arial Black';$('uploadHeadingColor').value='#ff9900';$('uploadHeadingAlign').value='right';$('uploadHeadingSize').value='36';$('uploadHeadingBox').checked=true;$('uploadHeadingBorder').checked=true;$('customHookTextColor').checked=true;$('hookTextColor').value='#00ff00';drawUploadHeading(720,1280);if(project().settings.uploadHeadingFont!=='Arial Black'||project().settings.uploadHeadingAlign!=='right')throw Error('Upload heading styling not saved');`,sandbox);if(!textDraws.length||textDraws.some(x=>x.color!=='#ff9900'||x.align!=='right'||!x.font.includes('Arial Black')))throw Error('Upload heading inherited main text style');textDraws.length=0;vm.runInContext(`$('uploadHeadingVisible').checked=false;drawUploadHeading(720,1280);`,sandbox);if(textDraws.length)throw Error('Hidden upload heading rendered');console.log('Passed: independent upload heading font/color/alignment, background/border rendering, hide toggle and saved styles.');

vm.runInContext(`$('loaderColorMode').value='gradient';$('loaderColor').value='#00ff00';$('loaderColor2').value='#ff00ff';for(const direction of ['horizontal','vertical','diagonal','radial']){$('loaderGradientDirection').value=direction;for(const style of ['merge','orbit','ring','bounce','morph','scan','sparkle']){$('loaderStyle').value=style;uploadSequence(.8,720,1280)}}const solid=fluidPixels(.6,'#00ff00',40,'merge'),gradient=fluidPixels(.6,'#00ff00',40,'merge',{rgb:[255,0,255],direction:'horizontal'});if(!solid.some((v,i)=>i%4!==3&&v!==gradient[i]))throw Error('Gradient colors not applied');if(solid.some((v,i)=>i%4===3&&v!==gradient[i]))throw Error('Gradient changed blob shape');if(loaderBlend(0,.5,'horizontal')!==0||loaderBlend(1,.5,'horizontal')!==1||loaderBlend(.5,.5,'radial')!==0)throw Error('Gradient directions');if(project().settings.loaderColorMode!=='gradient'||project().settings.loaderColor2!=='#ff00ff')throw Error('Gradient not saved');console.log('Passed: all seven loaders with four gradient directions, fluid color interpolation, unchanged alpha shape and saved gradient settings.');`,sandbox);

vm.runInContext(fs.readFileSync(path.join(root,'dist/workflow.js'),'utf8'),sandbox);
vm.runInContext(`state.template='showcase';refreshAnimationPanels();if(!$('uploadAnimationGroup').hidden||!$('frameAnimationGroup').hidden)throw Error('Unrelated animation panels visible');state.template='collage';refreshAnimationPanels();if($('uploadAnimationGroup').hidden||!$('frameAnimationGroup').hidden)throw Error('Upload controls not scoped');state.template='framed';refreshAnimationPanels();if(!$('uploadAnimationGroup').hidden||$('frameAnimationGroup').hidden)throw Error('Frame controls not scoped');$('loaderColorMode').value='solid';$('effects').value='none';refreshAnimationPanels();if(!$('loaderColor2').hidden||!$('effectIntensity').hidden)throw Error('Unused advanced settings visible');console.log('Passed: animation panels match selected template; unused gradient/effect controls are hidden.');`,sandbox);

vm.runInContext(`state.template='showcase';state.endcard=null;$('effects').value='none';for(const format of Object.keys(sizes))for(const entrance of ['none','fade','zoom','slide','wipe'])for(const particle of ['none','sparkle','hearts','confetti','bubbles','stars']){$('resolution').value=format;$('endEntrance').value=entrance;$('endParticles').value=particle;render(duration()*effectEnd()+.2)}for(const mode of ['none','pulse','bounce','spin','fade']){$('endLogoMotion').value=mode;drawAnimatedEndLogo({width:200,height:200},100,100,80,80)}state.template='framed';state.clips=[{id:'a',length:7},{id:'b',length:7}];$('frameEndDuration').value='4';$('endSfxDelay').value='.5';if(endSfxTiming().start!==14.5)throw Error('End SFX anchor');state.clips[0].length=4;if(endSfxTiming().start!==11.5)throw Error('End SFX did not move with scene edit');if(!('endParticles' in project().settings))throw Error('Endcard settings missing');console.log('Passed: independent end-card effects with main effects off, 90 size/entrance/particle cases, logo animations, saved settings and end-anchored SFX timing.');`,sandbox);

vm.runInContext(`$('resolution').value='custom';$('customWidth').value='1080';$('customHeight').value='1350';$('customLayout').value='auto';if(customSizeError())throw Error('Valid custom size rejected');for(const template of templates){state.template=template.id;render(0);if(canvas.width!==1080||canvas.height!==1350)throw Error('Custom dimensions not respected')}if(layoutSize().join(',')!=='720,720')throw Error('Wrong nearest layout');$('customWidth').value='1081';if(!customSizeError())throw Error('Odd size accepted');$('customWidth').value='3840';$('customHeight').value='3840';if(!customSizeError())throw Error('Over-budget canvas accepted');$('customWidth').value='1080';$('customHeight').value='1350';if(project().settings.customHeight!=='1350')throw Error('Custom size not saved');console.log('Passed: exact custom output size across all templates, nearest-layout selection, validation and saved dimensions.');`,sandbox);

// Async regression coverage for project replacement and export recovery.
Object.assign(sandbox,{AbortController,DOMException,setTimeout,clearTimeout,setInterval,clearInterval,cancelAnimationFrame(){}});
vm.runInContext(fs.readFileSync(path.join(root,'dist/export-controller.js'),'utf8'),sandbox);
(async()=>{
 await vm.runInContext(`(async()=>{
  const backup={version:1,template:'collage',images:[],settings:{duration:'8'}};
  const oldVideo={pause(){},removeAttribute(){},load(){}};
  audioFile={name:'old-music.wav'};audioURL='blob:old-music';sfxFiles.set('old',{name:'old.wav'});
  clipMedia.set('old',{video:oldVideo,url:'blob:old-clip'});endVideoMedia={video:oldVideo,url:'blob:old-end'};
  await openProject(backup);
  if(audioFile||audioURL||sfxFiles.size||clipMedia.size||endVideoMedia)throw Error('Old project media survived replacement');
  const disabled={disabled:true},enabled={disabled:false};document.querySelectorAll=()=>[disabled,enabled,$('cancelExport')];
  lock(true);if(!enabled.disabled||$('cancelExport').hidden)throw Error('Export did not lock controls');
  lock(false);if(!disabled.disabled||enabled.disabled||!$('cancelExport').hidden)throw Error('Control state not restored');
  const controller=new AbortController();controller.abort();
  try{await abortable(new Promise(()=>{}),controller.signal);throw Error('Abort ignored')}catch(e){if(e.name!=='AbortError')throw e}
  let oldRender=render;render=()=>{throw Error('deliberate renderer failure')};
  requestAnimationFrame=callback=>setTimeout(()=>callback(performance.now()),0);
  try{await recordTimeline(new AbortController().signal,1,performance.now());throw Error('Render failure ignored')}catch(e){if(e.message!=='deliberate renderer failure')throw e}finally{render=oldRender}
 })()`,sandbox);
 console.log('Passed: project media isolation, control-state preservation, cancelled preparation and renderer failure recovery.');
})().catch(error=>{console.error(error);process.exitCode=1});
