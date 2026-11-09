// Keep export cleanup independent of animation callbacks and recorder events.
let exportController=null, exportControlState=new Map();
lock=function(yes){
 exporting=yes;
 if(yes){exportControlState.clear();document.querySelectorAll('button,input,select,textarea').forEach(e=>{exportControlState.set(e,e.disabled);e.disabled=true})}
 else{exportControlState.forEach((disabled,e)=>{e.disabled=disabled});exportControlState.clear()}
 zone.style.pointerEvents=yes?'none':'';
 $('cancelExport').hidden=!yes;$('cancelExport').disabled=false;
 if(!yes&&!supported.length)$('export').disabled=true;
};
function abortable(task,signal,timeout=20000){
 return new Promise((resolve,reject)=>{
  let timer;const finish=(fn,value)=>{clearTimeout(timer);signal.removeEventListener('abort',abort);fn(value)};
  const abort=()=>finish(reject,new DOMException('Export cancelled','AbortError'));
  if(signal.aborted){abort();return}signal.addEventListener('abort',abort,{once:true});
  timer=setTimeout(()=>finish(reject,Error('Export timed out. Try a shorter video or a smaller output size.')),timeout);
  Promise.resolve(task).then(v=>finish(resolve,v),e=>finish(reject,e));
 });
}
function recordTimeline(signal,total,start){
 return new Promise((resolve,reject)=>{
  let raf,timer,lastProgress=-1;
  const finish=(error)=>{cancelAnimationFrame(raf);clearInterval(timer);signal.removeEventListener('abort',abort);error?reject(error):resolve()};
  const abort=()=>finish(new DOMException('Export cancelled','AbortError'));
  signal.addEventListener('abort',abort,{once:true});
  timer=setInterval(()=>{if(document.hidden)finish(Error('Export paused because the tab became hidden. Keep the editor visible and try again.'));else if(performance.now()-start>(total+20)*1000)finish(Error('Export stopped responding. Please try again.'))},1000);
  function tick(now){try{if(signal.aborted){abort();return}const t=Math.min((now-start)/1000,total);render(t);const progress=Math.round(t/total*100);if(progress!==lastProgress){message('Rendering '+progress+'% · Keep this tab visible.');lastProgress=progress}if(t<total)raf=requestAnimationFrame(tick);else finish()}catch(error){finish(error)}}
  raf=requestAnimationFrame(tick);
 });
}
$('cancelExport').onclick=()=>exportController?.abort();
$('export').onclick=async()=>{
 if(exporting)return;
 if(customSizeError()){message(customSizeError());return}
 if(state.template!=='framed'&&!images.length){message('Add at least one result image before exporting.');return}
 if(!supported.length)return;
 if(state.endVideo&&!endVideoMedia){message('Reattach your end-card video in step 7.');return}
 if(state.template==='framed'){const error=validateFramedAssets();if(error){message(error);return}}
 const controller=new AbortController(),signal=controller.signal,total=duration(),mime=$('format').value;
 exportController=controller;let stream,recorder,chunks=[],recorderFailure;
 playing=false;time=0;$('play').textContent='▶';lock(true);message('Preparing video and audio…');
 try{
  await abortable(prepareFramedPlayback(),signal);
  render(0);stream=canvas.captureStream(30);
  await abortable(prepareAudioMix(stream,false,signal),signal);
  if(signal.aborted)throw new DOMException('Export cancelled','AbortError');
  recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:6000000});
  const done=new Promise(resolve=>{recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=resolve;recorder.onerror=e=>{recorderFailure=e.error||Error('Video recording failed');controller.abort();resolve()}});
  recorder.start(250);const start=performance.now();beginFramedPlayback();beginAudioMix(0);
  await recordTimeline(signal,total,start);
  recorder.stop();await abortable(done,signal,10000);
  if(recorderFailure)throw recorderFailure;
  const blob=new Blob(chunks,{type:recorder.mimeType||mime});if(!blob.size)throw Error('The browser produced an empty video. Try another format.');
   const ext=mime.startsWith('video/mp4')?'mp4':'webm';await download(blob,safeName($('projectName').value)+'-'+state.template+'-'+$('resolution').value+'-'+Date.now()+'.'+ext);
  message('Video ready · '+(blob.size/1048576).toFixed(1)+' MB · '+ext.toUpperCase()+'. Download link remains below.');
 }catch(error){message(recorderFailure?'Export failed: '+recorderFailure.message:error.name==='AbortError'?'Export cancelled. Your project is unchanged.':'Export failed: '+error.message)}
 finally{
  if(recorder&&recorder.state!=='inactive')try{recorder.stop()}catch{}
  stopAudioMix();stopFramedPlayback();stream?.getTracks().forEach(track=>track.stop());
  exportController=null;lock(false);time=0;try{render(0)}catch{}
 }
};
