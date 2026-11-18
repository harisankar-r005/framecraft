/* Integration smoke: real desktop shell, template bridge and upstream MP4 renderer. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createRequire}=require('node:module');
const {pathToFileURL}=require('node:url');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),desktop=path.join(root,'apps/desktop');
const coreRequire=createRequire(path.join(root,'packages/openfilm/package.json'));
const appRequire=createRequire(path.join(desktop,'package.json'));
const {_electron}=coreRequire('playwright-core');
fs.mkdirSync(path.join(root,'.dev'),{recursive:true});
const temp=fs.mkdtempSync(path.join(root,'.dev','framecraft-smoke-'));
const project=path.join(temp,'projects','Launch ad');fs.mkdirSync(project,{recursive:true});
const ffmpegDir=path.join(root,'.dev/runtime/ffmpeg');
const environment={...process.env,PATH:ffmpegDir+path.delimiter+process.env.PATH,ELECTRON_RUN_AS_NODE:'',OPENFILM_DESKTOP_FLAVOR:'bench',OPENFILM_BENCH_DIR:temp,OPENFILM_HOME:path.join(temp,'home'),OPENFILM_LIBRARY:path.join(temp,'projects'),OPENFILM_SHARED_HOME:path.join(temp,'home'),OPENFILM_NO_UPDATE_CHECK:'1'};
delete environment.ELECTRON_RUN_AS_NODE;
fs.writeFileSync(path.join(project,'film.html'),'<!doctype html><html><head><meta name="viewport" content="width=320, height=568"></head><body><section><iframe id="title" src="title.html#t=0,2"></iframe></section><section><audio id="tone" src="tone.wav#t=0,2" volume="0.1"></audio></section></body></html>');
fs.writeFileSync(path.join(project,'title.html'),'<!doctype html><html><head><style>body{margin:0;background:#152224;color:#d6ff62;font:700 28px Arial;display:grid;place-content:center;height:100vh}h1{font-size:28px}</style></head><body><h1>Framecraft</h1><script>window.film={duration:2,frame(t){document.querySelector("h1").style.transform=`translateY(${Math.sin(t)*15}px)`}}</script></body></html>');
execFileSync(path.join(ffmpegDir,'ffmpeg.exe'),['-hide_banner','-loglevel','error','-f','lavfi','-i','sine=frequency=440:duration=2','-y',path.join(project,'tone.wav')],{windowsHide:true});
let application;
(async()=>{
 try{
  application=await _electron.launch({executablePath:appRequire('electron'),args:[desktop],cwd:desktop,env:environment,timeout:60000});
  const page=await application.firstWindow({timeout:60000});const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.locator('[data-titlebar]').waitFor({timeout:60000});
  assert.equal(await application.evaluate(({app})=>app.getName()),'Framecraft Advanced Test');
  await page.getByAltText('Framecraft',{exact:true}).first().waitFor();
  await page.screenshot({path:path.join(temp,'advanced-desktop.png')});
  const state=JSON.parse(fs.readFileSync(path.join(temp,'home','run.json'),'utf8'));
  const response=await fetch(state.origin+'/api/projects',{method:'POST',headers:{'content-type':'application/json','x-studio-key':state.key},body:JSON.stringify({path:project})});assert.equal(response.status,200);const opened=await response.json();
  // Open a real project in Studio and inspect the native timeline.
  await page.goto(state.origin+'/projects/'+opened.project.id+'?key='+state.key);
  await page.locator('[data-project-tab], [data-page-ready="error"]').first().waitFor({timeout:60000});
  assert.equal(await page.locator('[data-page-ready="error"]').count(),0);
  await page.screenshot({path:path.join(temp,'advanced-project.png')});
  const templateOpened=application.waitForEvent('window',{timeout:20000});
  await application.evaluate(({Menu})=>{const menu=Menu.getApplicationMenu();const item=menu.items.flatMap(i=>i.submenu?.items||[]).find(i=>i.label==='Framecraft template editor');if(!item)throw Error('Template menu missing');item.click()});
  const template=await templateOpened;await template.locator('#templates button').first().waitFor();assert.equal(await template.locator('#templates button').count(),6);
  assert.equal(await template.evaluate(()=>window.framecraftDesktop.advancedAvailable()),true);
  await template.getByRole('button',{name:'Advanced editor ↗'}).waitFor();
  await template.screenshot({path:path.join(temp,'template-editor.png')});
  await template.evaluate(()=>window.framecraftDesktop.openAdvanced());
  assert.deepEqual(errors,[]);
  console.log('Passed: native Framecraft shell, branded project, six legacy templates, desktop bridge and switch back.');
  await application.close();application=null;
  // Exercise the actual upstream browser/FFmpeg pipeline, including audio.
  Object.assign(process.env,environment);
  const {render}=await import(pathToFileURL(path.join(root,'packages/openfilm/src/render.mjs')));
  const result=await render([project],{out:path.join(temp,'framecraft-smoke.mp4'),fps:30,workers:1,hardware:false,onProgress(){}});
  const facts=JSON.parse(execFileSync(path.join(ffmpegDir,'ffprobe.exe'),['-v','error','-count_frames','-show_streams','-of','json',result.out],{encoding:'utf8',windowsHide:true}));
  const video=facts.streams.find(s=>s.codec_type==='video'),audio=facts.streams.find(s=>s.codec_type==='audio');
  assert.equal(video.codec_name,'h264');assert.equal(video.width,320);assert.equal(video.height,568);assert.equal(Number(video.nb_read_frames),60);assert.equal(audio.codec_name,'aac');
  console.log('Passed: real two-second MP4, 60 H.264 frames at 320×568 and AAC audio.');console.log('Smoke artifacts: '+temp);
 }finally{if(application)await application.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
