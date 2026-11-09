let preciseFramePass=false,batchRunning=false,exportStarting=false;
function throwIfCancelled(signal){if(signal.aborted)throw new DOMException('Export cancelled','AbortError')}
function validateExportProject(){if(customSizeError())throw Error(customSizeError());if(state.template!=='framed'&&!images.length)throw Error('Add at least one result image in step 3.');if(state.endVideo&&!endVideoMedia)throw Error('Reattach your end-card video in step 7.');if(state.template==='framed'){const error=validateFramedAssets();if(error)throw Error(error)}audioTracks()}
async function preciseSupport(){const [width,height]=outputSize();if(!window.Mediabunny||!window.VideoEncoder)return false;return await Mediabunny.canEncodeVideo('avc',{width,height,bitrate:6000000})}
async function seekExportFrame(t,signal){
 stopFramedPlayback();framedRecordingReady=false;
 if(state.template==='framed'){const scene=framedSceneAt(t);if(scene){const record=clipMedia.get(scene.clip.id);await abortable(seekClip(record,Number(scene.clip.offset||0)+scene.local),signal)}else if(state.endVideo&&endVideoMedia)await abortable(seekClip(endVideoMedia,Math.max(0,t-framedEndStart())),signal)}
 else if(state.endVideo&&endVideoMedia&&t>=duration()*effectEnd())await abortable(seekClip(endVideoMedia,t-duration()*effectEnd()),signal);
}
async function encodePreciseVideo(signal,onProgress){
 if(!await preciseSupport())throw Error('Precise H.264 export is unavailable at this size in this browser. Try Chrome or Edge, reduce the dimensions, or select Browser recording.');
 const B=Mediabunny,hasAudio=audioTracks().length>0;
 if(hasAudio&&!await B.canEncodeAudio('aac',{numberOfChannels:2,sampleRate:48000,bitrate:192000}))throw Error('AAC encoding is unavailable in this browser. Choose Browser recording to include audio.');
 const target=new B.BufferTarget(),output=new B.Output({format:new B.Mp4OutputFormat({fastStart:'in-memory'}),target});
 render(0);if(document.fonts)await abortable(document.fonts.ready,signal);render(0);const video=new B.CanvasSource(canvas,{codec:'avc',quality:new B.Quality({bitrate:6000000}),keyFrameInterval:2});output.addVideoTrack(video,{frameRate:30});
 let audio;if(hasAudio){audio=new B.AudioBufferSource({codec:'aac',quality:new B.Quality({bitrate:192000})});output.addAudioTrack(audio)}
 const cancel=()=>{output.cancel().catch(()=>{})};signal.addEventListener('abort',cancel,{once:true});
 try{
  throwIfCancelled(signal);await abortable(output.start(),signal);preciseFramePass=true;
  if(audio){onProgress(0,'Mixing audio');const buffer=await abortable(offlineAudioMix(signal),signal,120000);throwIfCancelled(signal);await abortable(audio.add(buffer),signal,120000);audio.close()}
  const count=Math.ceil(duration()*30);
  for(let i=0;i<count;i++){
   throwIfCancelled(signal);const t=i/30;await seekExportFrame(t,signal);render(t);
   await abortable(video.add(t,1/30,{keyFrame:i%60===0}),signal,30000);
   if(i%3===0||i===count-1)onProgress((i+1)/count,'Encoding frame '+(i+1)+' / '+count);
   if(i%5===0)await new Promise(resolve=>setTimeout(resolve,0));
  }
  video.close();await abortable(output.finalize(),signal,120000);throwIfCancelled(signal);return new Blob([target.buffer],{type:'video/mp4'});
 }catch(error){if(output.state!=='finalized'&&output.state!=='canceled')await output.cancel().catch(()=>{});throw error}
 finally{preciseFramePass=false;signal.removeEventListener('abort',cancel);stopFramedPlayback()}
}
async function encodeRealtimeVideo(signal,onProgress){
 const mime=$('format').value;if(!mime)throw Error('Browser recording is unavailable. Choose Precise MP4.');let stream,recorder,chunks=[],recordError;
 try{
  await abortable(prepareFramedPlayback(),signal);render(0);if(document.fonts)await abortable(document.fonts.ready,signal);render(0);stream=canvas.captureStream(30);await abortable(prepareAudioMix(stream,false,signal),signal);
  recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:6000000});const done=new Promise(resolve=>{recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=resolve;recorder.onerror=e=>{recordError=e.error||Error('Video recording failed');exportController?.abort();resolve()}});
  throwIfCancelled(signal);recorder.start(250);const start=performance.now();beginFramedPlayback();beginAudioMix(0);await recordTimeline(signal,duration(),start);recorder.stop();await abortable(done,signal,10000);if(recordError)throw recordError;const blob=new Blob(chunks,{type:recorder.mimeType||mime});if(!blob.size)throw Error('The browser produced an empty file.');return blob;
 }finally{if(recorder&&recorder.state!=='inactive')try{recorder.stop()}catch{}stopAudioMix();stopFramedPlayback();stream?.getTracks().forEach(t=>t.stop())}
}
// Precise export pre-seeks videos. Prevent the preview synchronizer from seeking again.
const previewSyncMedia=syncMedia;syncMedia=function(record,target,id,t){if(preciseFramePass)return record.video;return previewSyncMedia(record,target,id,t)};
function exportProgress(progress,label){message(label+' · '+Math.round(progress*100)+'% · Cancel export is available.')}
async function encodeSelected(signal,onProgress=exportProgress){validateExportProject();return $('exportMethod').value==='frames'?await encodePreciseVideo(signal,onProgress):await encodeRealtimeVideo(signal,onProgress)}
function blobExtension(blob){return blob.type.startsWith('video/mp4')?'mp4':'webm'}
async function exportSingle(){
 if(exporting||restoringSession||exportStarting||batchRunning)return;exportStarting=true;await studioReady;commitHistory();clearTimeout(autosaveTimer);const pendingSave=saveSessionNow().catch(()=>{});
 const controller=new AbortController();exportController=controller;playing=false;time=0;$('play').textContent='▶';lock(true);
  try{await pendingSave;message('Preparing export…');const blob=await encodeSelected(controller.signal);const saved=await download(blob,safeName($('projectName').value)+'-'+state.template+'-'+$('resolution').value+'-'+Date.now()+'.'+blobExtension(blob));if(!saved?.cancelled)message('Video ready · '+(blob.size/1048576).toFixed(1)+' MB · '+($('exportMethod').value==='frames'?'fixed 30 fps MP4':'browser recording'))}
 catch(error){message(error.name==='AbortError'?'Export cancelled. Your project is unchanged.':'Export failed: '+error.message)}
 finally{stopAudioMix();stopFramedPlayback();exportController=null;exportStarting=false;lock(false);time=0;render(0);updateUndoButtons()}
}
$('export').onclick=exportSingle;
function selectedBatchSizes(){return ['portrait','square','landscape'].filter(s=>$('batch'+s[0].toUpperCase()+s.slice(1)).checked)}
function updateBatchCount(){const sizes=selectedBatchSizes().length,count=Math.round(bounded($('batchVariations').value,1,20,1));$('batchCount').textContent=sizes*count+' videos · '+sizes+' sizes × '+count+' variations';$('batchExport').disabled=!sizes||exporting||batchRunning}
for(const id of ['batchPortrait','batchSquare','batchLandscape','batchVariations'])$(id).addEventListener('input',updateBatchCount);
$('batchExport').onclick=async()=>{
 if(exporting||restoringSession||exportStarting||batchRunning)return;await studioReady;const sizes=selectedBatchSizes();if(!sizes.length){message('Select at least one size.');return}commitHistory();clearTimeout(autosaveTimer);const pendingSave=saveSessionNow().catch(()=>{});
 const original=captureSession(),count=Math.round(bounded($('batchVariations').value,1,20,1)),hooks=$('batchHooks').value.split('\n').map(s=>s.trim()).filter(Boolean),zip=new JSZip(),controller=new AbortController(),total=sizes.length*count;let completed=0,packedBytes=0,outcome='';
 exportController=controller;batchRunning=true;playing=false;lock(true);
 try{
  await pendingSave;
  for(let variation=0;variation<count;variation++){
   if(state.template==='framed'){const clips=original.project.clips;state.clips=clips.slice(variation%clips.length).concat(clips.slice(0,variation%clips.length)).map(c=>hooks.length?{...c,hook:hooks[variation%hooks.length]}:c)}
   else{const assets=original.project.images,offset=variation%Math.max(1,assets.length);state.images=assets.slice(offset).concat(assets.slice(0,offset));await refreshAssets()}
   $('hook').value=hooks.length?hooks[variation%hooks.length]:original.project.settings.hook;
   for(const size of sizes){throwIfCancelled(controller.signal);$('resolution').value=size;updateTimeline();const blob=await encodeSelected(controller.signal,(p,label)=>message('Batch '+(completed+1)+' / '+total+' · '+size+' · '+label+' · '+Math.round(p*100)+'%'));if(packedBytes+blob.size>536870912)throw Error('Batch reached the 512 MB package limit. Export the remaining variations as another batch');packedBytes+=blob.size;zip.file('variation_'+String(variation+1).padStart(2,'0')+'/'+safeName(original.project.settings.projectName)+'-'+size+'.'+blobExtension(blob),blob);completed++}
  }
 }catch(error){outcome=error.name==='AbortError'?'Batch cancelled.':'Batch stopped: '+error.message;message(outcome)}
 finally{
  stopAudioMix();stopFramedPlayback();exportController=null;lock(false);
  try{await restoreSession(original)}catch(error){message('Could not restore the original edit: '+error.message)}updateUndoButtons();updateBatchCount();
   if(completed){try{message('Packaging '+completed+' completed videos…');const blob=await zip.generateAsync({type:'blob',compression:'STORE'});const saved=await download(blob,safeName(original.project.settings.projectName)+'-batch'+(completed<total?'-partial':'')+'.zip');if(!saved?.cancelled)message((outcome?outcome+' ':'Batch ready · ')+completed+' / '+total+' videos packaged. Original edit restored.')}catch(error){message('Batch packaging failed: '+error.message)}}
  if(!completed&&outcome)message(outcome+' Original edit restored.');batchRunning=false;updateBatchCount();
 }
};
function refreshExportMethod(){const precise=$('exportMethod').value==='frames';$('formatLabel').hidden=precise;$('formatHint').hidden=precise;if(!exporting)$('export').disabled=precise?!window.VideoEncoder:!supported.length}
$('exportMethod').addEventListener('input',()=>{refreshExportMethod();changed()});
const studioBaseLock=lock;lock=function(yes){studioBaseLock(yes);if(!yes)refreshExportMethod()};
refreshExportMethod();updateBatchCount();
