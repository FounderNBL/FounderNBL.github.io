// Pulse Studios / LiveBeats: optional user-selected camera filters and
// RIGHTS-CONFIRMED background music through the existing Stream Video call.
// No new provider or livestream. Graceful fallback if the pinned SDK/browser
// has no registerFilter support. NEVER request camera/microphone here.
import {AUDIO_TYPES,STUDIO_LIMITS,validateLocalFile} from "./studios-core.mjs";
const $=s=>document.querySelector(s);
const VISION_VERSION="0.10.22";
const modelUrl="https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
function status(t){const el=$("#pulseLiveBeatsStatus");if(el)el.textContent=t;}
function watchFace(video,canvas,ctx,detector){
  let last=0,lastFace=null;
  return timestamp=>{
    if(timestamp-last>240&&video.readyState>=2){
      last=timestamp;
      try{lastFace=detector.detectForVideo(video,timestamp)?.faceLandmarks?.[0]||null;}catch{lastFace=null;}
    }
    if(!lastFace)return;
    const point=i=>lastFace[i]&&[lastFace[i].x*canvas.width,lastFace[i].y*canvas.height];
    ctx.fillStyle="rgba(255,107,151,.23)";
    for(const i of [205,425]){const p=point(i);if(!p)continue;ctx.beginPath();ctx.ellipse(p[0],p[1],canvas.width*.04,canvas.height*.035,0,0,Math.PI*2);ctx.fill();}
    const lips=[61,40,37,0,267,270,291,321,314,17,84,91];
    if(lips.every(i=>point(i))){
      ctx.beginPath();lips.forEach((i,j)=>{const p=point(i);j?ctx.lineTo(...p):ctx.moveTo(...p);});
      ctx.closePath();ctx.fillStyle="rgba(213,64,111,.3)";ctx.fill();
    }
  };
}
async function faceLandmarker(){
  const {FaceLandmarker,FilesetResolver}=await import(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VISION_VERSION}/vision_bundle.mjs`);
  const vision=await FilesetResolver.forVisionTasks(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VISION_VERSION}/wasm`);
  return FaceLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:modelUrl,delegate:"CPU"},runningMode:"VIDEO",numFaces:1});
}
export async function setupLiveBeats(call){
  const effect=$("#pulseLiveBeatsEffect")?.value||"none";
  const file=$("#pulseLiveBeatsMusic")?.files?.[0];
  const hasMusic=Boolean(file);
  if(effect==="none"&&!hasMusic)return ()=>{};
  const cleanups=[];
  // Each optional filter must fail open: regular camera/mic still work.
  if(effect!=="none"){
    if(typeof call?.camera?.registerFilter!=="function" || typeof HTMLCanvasElement.prototype.captureStream!=="function")status("This browser/Stream SDK does not support LiveBeats camera effects. Normal Live still works.");
    else{
      let detector=null;
      if(effect==="face")try{status("Loading FaceBeats on-device…");detector=await faceLandmarker();}
      catch{status("Face tracking not available. Using Glow lighting instead.");}
      try{
        const registration=call.camera.registerFilter(input=>{
          const canvas=document.createElement("canvas"),ctx=canvas.getContext("2d");
          const video=document.createElement("video");
          video.muted=true;video.autoplay=true;video.playsInline=true;video.srcObject=input;
          let frame=0,closed=false;canvas.width=640;canvas.height=480;
          const liveFace=effect==="face"&&detector?watchFace(video,canvas,ctx,detector):null;
          const tick=t=>{
            if(closed)return;
            if(video.readyState>=2&&video.videoWidth&&video.videoHeight){
              if(canvas.width!==video.videoWidth||canvas.height!==video.videoHeight){canvas.width=video.videoWidth;canvas.height=video.videoHeight;}
              ctx.filter=effect==="noir"?"grayscale(1) contrast(1.15)":"brightness(1.06) contrast(1.05) saturate(1.08)";
              ctx.drawImage(video,0,0,canvas.width,canvas.height);ctx.filter="none";
              liveFace?.(t);
            }
            frame=requestAnimationFrame(tick);
          };
          const output=canvas.captureStream(24);
          void video.play().catch(()=>{status("Camera filter unavailable. Switch LiveBeats to None and retry.");});
          frame=requestAnimationFrame(tick);
          return {output,stop:()=>{closed=true;cancelAnimationFrame(frame);video.pause();video.srcObject=null;output.getTracks().forEach(t=>t.stop());}};
        });
        cleanups.push(()=>registration.unregister?.());
        registration.registered?.catch(()=>status("Camera effect could not be applied. Normal camera still works."));
      }catch{status("This camera effect is unsupported here. Normal Live still works.");}
      if(detector)cleanups.push(()=>detector.close?.());
    }
  }
  if(hasMusic){
    if(!$("#pulseLiveBeatsRights")?.checked){status("Music not enabled: confirm you own or have permission to stream this track.");}
    else if(typeof call?.microphone?.registerFilter!=="function"){status("This Stream SDK cannot mix background music. Normal microphone still works.");}
    else{
      try{
        validateLocalFile(file,AUDIO_TYPES,STUDIO_LIMITS.audioBytes);
        const ctx=new (window.AudioContext||window.webkitAudioContext)();
        const buffer=await ctx.decodeAudioData(await file.arrayBuffer());
        let activeMusic=null;
        const registration=call.microphone.registerFilter(input=>{
          const destination=ctx.createMediaStreamDestination();
          const mic=ctx.createMediaStreamSource(input);mic.connect(destination);
          const music=ctx.createBufferSource();music.buffer=buffer;music.loop=true;
          const gain=ctx.createGain();gain.gain.value=Math.min(.8,Math.max(0,Number($("#pulseLiveBeatsMusicVolume")?.value||20)/100));
          music.connect(gain).connect(destination);music.start();activeMusic=music;
          void ctx.resume().catch(()=>status("Tap Start Live again if background music is silent."));
          return {output:destination.stream,stop:()=>{
            try{music.stop();}catch{}
            mic.disconnect();gain.disconnect();destination.stream.getTracks().forEach(t=>t.stop());
          }};
        });
        cleanups.push(()=>registration.unregister?.());
        cleanups.push(()=>{try{activeMusic?.stop();}catch{};void ctx.close().catch(()=>{});});
        registration.registered?.catch(()=>status("Music filter could not start. Your microphone still works."));
      }catch{status("Music could not be decoded or mixed. Normal Live still works.");}
    }
  }
  if(cleanups.length&&!$("#pulseLiveBeatsStatus")?.textContent)status("LiveBeats selected for this broadcast. Use End Live to stop everything.");
  return ()=>{for(const cleanup of cleanups.reverse()){try{cleanup();}catch{}}status("LiveBeats stopped.");};
}
