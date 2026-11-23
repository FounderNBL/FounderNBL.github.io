// Pulse Studios — MusicBeats & VideoBeats. User-owned local media only.
// Never uploads, publishes, or starts a paid call.
import {AUDIO_TYPES,VIDEO_TYPES,STUDIO_LIMITS,validateLocalFile,makeWav,fileToInput} from "./studios-core.mjs";
const $=s=>document.querySelector(s);
const btn=id=>$(id);
const state={audio:null,beat:null,video:null,videoUrl:null,audioUrl:null,beatUrl:null,audioBuffer:null,beatBuffer:null,busy:false};
function notice(id,message){const el=$(id);if(el)el.textContent=message;}
function num(id,fall=0){return Number($(id)?.value??fall)||fall;}
function download(file){const url=URL.createObjectURL(file),a=document.createElement("a");a.href=url;a.download=file.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function revoke(key){if(state[key])URL.revokeObjectURL(state[key]);state[key]=null;}
function handle(file,types,limit){validateLocalFile(file,types,limit);return URL.createObjectURL(file);}
async function decode(file){const context=new (window.AudioContext||window.webkitAudioContext)();try{return await context.decodeAudioData(await file.arrayBuffer());}finally{await context.close();}}
async function selectAudio(file,beat=false){
  validateLocalFile(file,AUDIO_TYPES,STUDIO_LIMITS.audioBytes);
  const buffer=await decode(file);
  if(beat){revoke("beatUrl");state.beat=file;state.beatBuffer=buffer;state.beatUrl=URL.createObjectURL(file);notice("#psMusicStatus","Second track loaded. You can mix it with the first track.");}
  else{revoke("audioUrl");state.audio=file;state.audioBuffer=buffer;state.audioUrl=URL.createObjectURL(file);const player=$("#psMusicPlayer");player.src=state.audioUrl;player.load();$("#psMusicEnd").value=Math.min(300,Math.floor(buffer.duration*10)/10);notice("#psMusicStatus","Audio loaded. Choose start/end, volumes, then export WAV.");}
}
async function exportAudio(){
  if(!state.audioBuffer)throw Error("Choose your first audio track.");
  const a=state.audioBuffer,begin=Math.max(0,num("#psMusicStart")),end=Math.min(a.duration,num("#psMusicEnd",a.duration)),duration=end-begin;
  if(duration<=0||duration>STUDIO_LIMITS.maxAudioSeconds)throw Error("Select a valid trim (maximum five minutes per export).");
  const sampleRate=44100,ctx=new OfflineAudioContext(2,Math.ceil(duration*sampleRate),sampleRate);
  const source=ctx.createBufferSource();source.buffer=a;
  const volume=ctx.createGain();volume.gain.value=Math.max(0,Math.min(2,num("#psMusicVolume",100)/100));
  source.connect(volume).connect(ctx.destination);source.start(0,begin,duration);
  if(state.beatBuffer){
    const b=ctx.createBufferSource();b.buffer=state.beatBuffer;b.loop=true;
    const mix=ctx.createGain();mix.gain.value=Math.max(0,Math.min(1,num("#psBeatVolume",30)/100));
    b.connect(mix).connect(ctx.destination);b.start(0);
  }
  const result=await ctx.startRendering(),blob=makeWav(result);
  download(new File([blob],"pulse-musicbeat.wav",{type:"audio/wav"}));
}
function connectAudio(){
  $("#psMusicFile")?.addEventListener("change",async e=>{try{if(e.target.files[0])await selectAudio(e.target.files[0]);}catch(err){notice("#psMusicStatus",err.message);}});
  $("#psMusicBeatFile")?.addEventListener("change",async e=>{try{if(e.target.files[0])await selectAudio(e.target.files[0],true);}catch(err){notice("#psMusicStatus",err.message);}});
  $("#psMusicExport")?.addEventListener("click",async()=>{const button=$("#psMusicExport");button.disabled=true;try{notice("#psMusicStatus","Mixing WAV locally…");await exportAudio();notice("#psMusicStatus","Audio downloaded. Nothing was uploaded.");}catch(err){notice("#psMusicStatus",err.message);}finally{button.disabled=false;}});
}
async function selectVideo(file){
  validateLocalFile(file,VIDEO_TYPES,STUDIO_LIMITS.videoBytes);
  revoke("videoUrl");state.video=file;state.videoUrl=URL.createObjectURL(file);
  const player=$("#psVideoPlayer");player.pause();player.src=state.videoUrl;player.load();
  await new Promise((resolve,reject)=>{player.onloadedmetadata=resolve;player.onerror=()=>reject(Error("This video format cannot be decoded in your browser."));});
  const duration=player.duration;
  $("#psVideoStart").value="0";$("#psVideoEnd").value=Math.min(duration,STUDIO_LIMITS.maxVideoSeconds).toFixed(1);
  notice("#psVideoStatus","Video ready. Trim up to 60 seconds, add a caption or music, then export locally.");
}
function sizeForVideo(video,ratio){
  if(ratio==="square")return [720,720];
  if(ratio==="portrait")return [540,960];
  if(ratio==="landscape")return [960,540];
  const w=video.videoWidth,h=video.videoHeight;
  const s=Math.min(1,960/Math.max(w,h));return [Math.round(w*s),Math.round(h*s)];
}
function drawVideoFrame(ctx,video,w,h,caption){
  const scale=Math.max(w/video.videoWidth,h/video.videoHeight);
  const sw=video.videoWidth*scale,sh=video.videoHeight*scale;
  ctx.fillStyle="#000";ctx.fillRect(0,0,w,h);
  ctx.drawImage(video,(w-sw)/2,(h-sh)/2,sw,sh);
  if(caption?.trim()){
    ctx.font=`bold ${Math.max(18,Math.round(w/22))}px sans-serif`;ctx.textAlign="center";ctx.textBaseline="bottom";
    ctx.lineWidth=5;ctx.strokeStyle="rgba(0,0,0,.85)";ctx.strokeText(caption.slice(0,90),w/2,h-20,w*.9);
    ctx.fillStyle="#fff";ctx.fillText(caption.slice(0,90),w/2,h-20,w*.9);
  }
}
async function seek(video,time){
  if(Math.abs(video.currentTime-time)<0.05)return;
  await new Promise((resolve,reject)=>{
    const done=()=>{video.removeEventListener("seeked",done);video.removeEventListener("error",fail);resolve();};
    const fail=()=>{video.removeEventListener("seeked",done);video.removeEventListener("error",fail);reject(Error("Video seek failed."));};
    video.addEventListener("seeked",done,{once:true});video.addEventListener("error",fail,{once:true});video.currentTime=time;
  });
}
async function exportVideo(){
  if(!state.video)throw Error("Choose a video first.");
  const video=$("#psVideoPlayer"),start=Math.max(0,num("#psVideoStart")),end=Math.min(video.duration,num("#psVideoEnd",video.duration)),span=end-start;
  if(span<=0||span>STUDIO_LIMITS.maxVideoSeconds)throw Error("Choose a trim between 0 and 60 seconds.");
  if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream)throw Error("Your browser cannot export video. Try Chrome or Edge.");
  const mime=["video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm"].find(x=>MediaRecorder.isTypeSupported(x));
  if(!mime)throw Error("WebM video export is not available in this browser.");
  const [w,h]=sizeForVideo(video,$("#psVideoAspect")?.value||"original");
  const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;const ctx=canvas.getContext("2d");
  if(!ctx)throw Error("Video canvas is unavailable.");
  let animation=0,audioContext=null,musicSource=null,recorder=null,stopped=false;
  const draw=()=>{if(stopped)return;drawVideoFrame(ctx,video,w,h,$("#psVideoCaption")?.value);animation=requestAnimationFrame(draw);};
  const output=canvas.captureStream(24),chunks=[];
  try{
    await seek(video,start);draw();
    audioContext=new (window.AudioContext||window.webkitAudioContext)();
    const dest=audioContext.createMediaStreamDestination();
    // Recorded audio: local video soundtrack (not the speaker output).
    const source=audioContext.createMediaElementSource(video);
    source.connect(dest);source.connect(audioContext.destination);
    const musicFile=$("#psVideoMusicFile")?.files?.[0];
    if(musicFile){
      validateLocalFile(musicFile,AUDIO_TYPES,STUDIO_LIMITS.audioBytes);
      const buffer=await audioContext.decodeAudioData(await musicFile.arrayBuffer());
      musicSource=audioContext.createBufferSource();musicSource.buffer=buffer;musicSource.loop=true;
      const gain=audioContext.createGain();gain.gain.value=Math.min(1,Math.max(0,num("#psVideoMusicVolume",25)/100));
      musicSource.connect(gain).connect(dest);
    }
    for(const track of dest.stream.getAudioTracks())output.addTrack(track);
    recorder=new MediaRecorder(output,{mimeType:mime,videoBitsPerSecond:2200000});
    recorder.addEventListener("dataavailable",e=>{if(e.data?.size)chunks.push(e.data);});
    const finished=new Promise((resolve,reject)=>{recorder.onstop=resolve;recorder.onerror=()=>reject(Error("Video encoding failed."));});
    recorder.start(1000);musicSource?.start();
    await audioContext.resume();
    await video.play();
    notice("#psVideoStatus","Exporting video locally…");
    while(video.currentTime<end && !video.ended && recorder.state==="recording"){
      await new Promise(resolve=>setTimeout(resolve,180));
      if(chunks.reduce((n,b)=>n+b.size,0)>STUDIO_LIMITS.postVideoBytes){throw Error("Video exceeded Pulse's 40 MB upload limit. Trim a shorter segment.");}
    }
    if(recorder.state==="recording")recorder.stop();await finished;
    const blob=new Blob(chunks,{type:"video/webm"});
    if(!blob.size||blob.size>STUDIO_LIMITS.postVideoBytes)throw Error("Export exceeded Pulse's 40 MB limit.");
    return new File([blob],"pulse-videobeat.webm",{type:"video/webm"});
  }finally{
    stopped=true;cancelAnimationFrame(animation);video.pause();
    if(recorder?.state==="recording")recorder.stop();
    try{musicSource?.stop();}catch{}
    output.getTracks().forEach(track=>track.stop());
    if(audioContext){try{await audioContext.close();}catch{}}
    // An HTMLMediaElement can have one MediaElementAudioSourceNode for life.
    // Recreate the player element for a subsequent export.
    const replacement=video.cloneNode(false);replacement.removeAttribute("src");
    video.replaceWith(replacement);replacement.src=state.videoUrl;replacement.load();
  }
}
function connectVideo(){
  $("#psVideoFile")?.addEventListener("change",async e=>{try{if(e.target.files[0])await selectVideo(e.target.files[0]);}catch(err){notice("#psVideoStatus",err.message);}});
  $("#psVideoExport")?.addEventListener("click",async()=>{const button=$("#psVideoExport");button.disabled=true;try{const file=await exportVideo();download(file);notice("#psVideoStatus","Video downloaded as WebM. No upload or post occurred.");}catch(err){notice("#psVideoStatus",err.message);}finally{button.disabled=false;}});
  $("#psVideoStage")?.addEventListener("click",async()=>{const button=$("#psVideoStage");button.disabled=true;try{
    const input=$("#postMedia");if(input.files?.length&&!confirm("Replace the currently selected draft media with the edited video?"))return;
    const file=await exportVideo();fileToInput(input,file);
    const extra=$("#pulseComposerExtra");if(extra)extra.hidden=false;
    notice("#psVideoStatus","Edited video attached to your Pulse Beat draft. Press Publish Beat when ready.");
  }catch(err){notice("#psVideoStatus",err.message);}finally{button.disabled=false;}});
}
connectAudio();connectVideo();
