let voiceFile=null;
function audioTracks(){
 const tracks=[];
 if(state.music&&!audioFile)throw Error('Reattach background music in step 8, or remove it.');
 if(audioFile)tracks.push({kind:'music',file:audioFile,start:0,offset:bounded($('musicOffset').value,0,3600),length:0,volume:bounded($('musicVolume').value,0,100,70),loop:$('musicLoop').checked});
 if(state.voice){if(!voiceFile)throw Error('Reattach voiceover in step 8, or remove it.');tracks.push({kind:'voice',file:voiceFile,start:bounded($('voiceStart').value,0,600),offset:bounded($('voiceOffset').value,0,3600),length:bounded($('voiceLength').value,0,3600),volume:bounded($('voiceVolume').value,0,100,100)})}
 for(const cue of state.sfx||[]){const file=sfxFiles.get(cue.id);if(!file)throw Error('Reattach SFX: '+cue.name);tracks.push({kind:'sfx',...cue,file})}return tracks;
}
async function decodeTracks(context,tracks,signal){const out=[];for(const track of tracks){if(signal?.aborted)throw new DOMException('Export cancelled','AbortError');const buffer=await context.decodeAudioData(await track.file.arrayBuffer());if(Number(track.offset)>=buffer.duration)throw Error('Trim start exceeds audio length: '+track.file.name);out.push({...track,buffer})}return out}
function trackEnd(track,total){return track.loop?total:Math.min(total,Number(track.start)+Math.min(track.buffer.duration-Number(track.offset),Number(track.length)>0?Number(track.length):Infinity))}
function voiceWindow(tracks,total){const v=tracks.find(t=>t.kind==='voice');return v?{start:Number(v.start),end:trackEnd(v,total)}:null}
function audioGainAt(track,t,total,voice){
 const start=Number(track.start),end=trackEnd(track,total),volume=bounded(track.volume,0,100,80)/100;if(t<start||t>end)return 0;
 const prefix=track.kind==='voice'?'voice':track.kind==='music'?'music':null;
 let value=volume;if(prefix){const fadeIn=Math.min((end-start)/2,bounded($(prefix+'FadeIn').value,0,10)),fadeOut=Math.min((end-start)/2,bounded($(prefix+'FadeOut').value,0,10));if(fadeIn)value*=bounded((t-start)/fadeIn,0,1);if(fadeOut)value*=bounded((end-t)/fadeOut,0,1)}
 if(track.kind==='music'&&voice&&$('musicDuck').checked){const level=bounded($('duckLevel').value,0,100,25)/100;const entering=bounded((t-(voice.start-.12))/.17,0,1),leaving=bounded((t-voice.end)/.2,0,1);value*=1-(1-level)*Math.min(entering,1-leaving)}return value;
}
function gainPoints(track,total,voice){const end=trackEnd(track,total),start=Number(track.start),prefix=track.kind==='voice'?'voice':track.kind==='music'?'music':null;let times=[start,end];if(prefix)times.push(start+Math.min((end-start)/2,bounded($(prefix+'FadeIn').value,0,10)),end-Math.min((end-start)/2,bounded($(prefix+'FadeOut').value,0,10)));if(track.kind==='music'&&voice&&$('musicDuck').checked)times.push(voice.start-.12,voice.start+.05,voice.end,voice.end+.2);return [...new Set(times.filter(t=>t>=start&&t<=end))].sort((a,b)=>a-b)}
function scheduleAudioGraph(context,destination,tracks,from=0,total=duration()){
 const master=context.createDynamicsCompressor();master.threshold.value=-3;master.knee.value=3;master.ratio.value=8;master.connect(destination);const nodes=[],voice=voiceWindow(tracks,total),now=context.currentTime;
 for(const cue of tracks){const schedule=cueSchedule(cue,from,total);if(!schedule)continue;const node=context.createBufferSource(),gain=context.createGain();node.buffer=cue.buffer;node.loop=!!cue.loop;if(node.loop){node.loopStart=Number(cue.offset);node.loopEnd=cue.buffer.duration}const first=Math.max(from,Number(cue.start));gain.gain.setValueAtTime(audioGainAt(cue,first,total,voice),now+schedule.when);for(const t of gainPoints(cue,total,voice))if(t>first)gain.gain.linearRampToValueAtTime(audioGainAt(cue,t,total,voice),now+t-from);node.connect(gain);gain.connect(master);node.start(now+schedule.when,schedule.offset,schedule.duration);nodes.push(node)}return nodes;
}
prepareAudioMix=async function(stream,preview=false,signal=null){
 stopAudioMix();const generation=audioMixGeneration,tracks=audioTracks();if(!tracks.length)return;
 const context=new AudioContext();try{await context.resume();if(signal?.aborted||generation!==audioMixGeneration)throw new DOMException('Audio preparation cancelled','AbortError');const destination=context.createMediaStreamDestination(),mix={context,destination,tracks:[],nodes:[],preview};activeMix=mix;mix.tracks=await decodeTracks(context,tracks,signal);if(activeMix!==mix)throw new DOMException('Audio preparation cancelled','AbortError');if(stream)destination.stream.getAudioTracks().forEach(t=>stream.addTrack(t));}catch(error){if(activeMix?.context===context)stopAudioMix();else if(context.state!=='closed')await context.close();throw error}
};
beginAudioMix=function(from=0){const mix=activeMix;if(!mix)return;mix.nodes=scheduleAudioGraph(mix.context,mix.destination,mix.tracks,from);if(mix.preview){const monitor=mix.context.createMediaStreamSource(mix.destination.stream);monitor.connect(mix.context.destination);mix.monitor=monitor}};
async function offlineAudioMix(signal){const tracks=audioTracks();if(!tracks.length)return null;const context=new OfflineAudioContext(2,Math.ceil(duration()*48000),48000),decoded=await decodeTracks(context,tracks,signal);if(signal.aborted)throw new DOMException('Export cancelled','AbortError');scheduleAudioGraph(context,context.destination,decoded);return await context.startRendering()}
const baseAudioUpload=$('audioUpload').onchange;$('audioUpload').onchange=e=>{baseAudioUpload(e);state.music=audioFile?{name:audioFile.name}:null;changed()};
const baseClearAudio=clearAudio;clearAudio=function(){baseClearAudio();state.music=null};$('clearAudio').onclick=()=>{clearAudio();changed()};
$('voiceUpload').onchange=e=>{const file=e.target.files[0];if(!file)return;if(file.size>100*1024*1024){message('Use voiceover files under 100 MB.');return}voiceFile=file;state.voice={name:file.name};refreshVoice();changed()};
function refreshVoice(){$('voiceName').textContent=state.voice?(voiceFile?'Ready: ':'Reattach: ')+state.voice.name:'No voiceover attached'}
$('clearVoice').onclick=()=>{voiceFile=null;state.voice=null;$('voiceUpload').value='';refreshVoice();changed()};
const baseResetMedia=resetProjectMedia;resetProjectMedia=function(){baseResetMedia();voiceFile=null;$('voiceUpload').value='';refreshVoice()};
for(const id of ['voiceStart','voiceOffset','voiceLength','voiceVolume','musicFadeIn','musicFadeOut','voiceFadeIn','voiceFadeOut','musicDuck','duckLevel'])$(id).addEventListener('input',()=>changed());
// Timing buttons derive their cue from the current scene durations.
const baseSfxEditor=refreshSfxEditor;refreshSfxEditor=function(){baseSfxEditor();$('sfxRows').querySelectorAll('.cue-card').forEach((row,i)=>{const cue=state.sfx[i];row.querySelectorAll('.cue-presets button').forEach(button=>{const phases={Upload:.5,Loading:.671,Reveal:.88};if(!(button.textContent in phases))return;button.disabled=state.template!=='collage'||!$('uploadScene').checked;button.onclick=()=>{cue.start=Math.round(actualTimeAtProgress(phases[button.textContent])*100)/100;refreshSfxEditor();changed()}})})};
refreshVoice();refreshSfxEditor();
