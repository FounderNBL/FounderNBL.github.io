(()=>{
"use strict";
const $=id=>document.getElementById(id);
const view=$("view"),status=$("status"),clip=$("clipPreview");
let stream=null,recorder=null,mime="",facing="environment",photoUrl="",clipUrl="",chunks=[],bytes=0,limitTimer=null,pending=false;
const MAX_BYTES=100*1024*1024;
const say=message=>{status.textContent=message;};
const recording=()=>recorder&&recorder.state!=="inactive";
function controls(){
  const active=!!stream;
  $("startCamera").disabled=pending||active;
  $("stopCamera").disabled=!active||pending;
  $("switchCamera").disabled=!active||pending||recording();
  $("microphone").disabled=active||pending;
  $("takePhoto").disabled=!active||pending;
  $("startRecord").disabled=!active||pending||recording()||!("MediaRecorder" in window);
  $("pauseRecord").disabled=!recording()||typeof recorder.pause!=="function";
  $("pauseRecord").textContent=recorder&&recorder.state==="paused"?"Resume":"Pause";
  $("stopRecord").disabled=!recording();
}
function revokePhoto(){
  if(photoUrl)URL.revokeObjectURL(photoUrl);
  photoUrl="";$("photoSection").hidden=true;
  $("photoPreview").removeAttribute("src");$("photoDownload").removeAttribute("href");
}
function revokeClip(){
  clip.pause();clip.removeAttribute("src");clip.load();
  if(clipUrl)URL.revokeObjectURL(clipUrl);
  clipUrl="";$("clipSection").hidden=true;$("clipDownload").removeAttribute("href");
}
function stopRecording(){
  if(limitTimer!==null){clearTimeout(limitTimer);limitTimer=null;}
  if(recording())recorder.stop();
  controls();
}
function release(){
  stopRecording();
  if(stream){for(const track of stream.getTracks())track.stop();stream=null;}
  view.srcObject=null;
  controls();
}
async function startCamera(){
  if(pending||stream)return;
  if(!navigator.mediaDevices?.getUserMedia||!window.isSecureContext){say("Camera capture requires a supported browser on HTTPS. You can still upload existing files to the editors below.");return;}
  pending=true;controls();
  try{
    const current=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:facing}},audio:$("microphone").checked});
    stream=current;view.srcObject=current;
    await view.play().catch(()=>{});
    say("Camera on. Only you can choose when to take a picture or record.");
  }catch(err){say("Camera unavailable or permission denied: "+(err&&err.name?err.name:"Check browser permissions"));}
  finally{pending=false;controls();}
}
$("startCamera").addEventListener("click",startCamera);
$("stopCamera").addEventListener("click",()=>{release();say("Camera off. Existing downloads and previews remain until you delete or close.");});
$("switchCamera").addEventListener("click",async()=>{
  if(!stream||recording())return;
  release();facing=facing==="environment"?"user":"environment";
  await startCamera();
});
$("takePhoto").addEventListener("click",()=>{
  if(!stream||!view.videoWidth){say("The camera view is not ready yet.");return;}
  const ratio=Number($("photoScale").value)||1;
  const canvas=document.createElement("canvas");
  canvas.width=Math.max(1,Math.round(view.videoWidth*ratio));
  canvas.height=Math.max(1,Math.round(view.videoHeight*ratio));
  const ctx=canvas.getContext("2d");
  if(!ctx){say("Picture processing isn't supported in this browser.");return;}
  ctx.drawImage(view,0,0,canvas.width,canvas.height);
  canvas.toBlob(blob=>{
    if(!blob){say("Couldn't save the picture.");return;}
    revokePhoto();photoUrl=URL.createObjectURL(blob);
    $("photoPreview").src=photoUrl;
    $("photoDownload").href=photoUrl;
    $("photoDownload").download="still-picture-"+Date.now()+".png";
    $("photoSection").hidden=false;
    say("Picture captured on this device. Save or delete it.");
  },"image/png");
});
function supportedMime(){
  if(!window.MediaRecorder)return "";
  const types=["video/webm;codecs=vp8,opus","video/webm","video/mp4"];
  return types.find(type=>MediaRecorder.isTypeSupported(type))||"";
}
$("startRecord").addEventListener("click",()=>{
  if(!stream||recording()||!window.MediaRecorder)return;
  mime=supportedMime();
  try{
    recorder=mime?new MediaRecorder(stream,{mimeType:mime}):new MediaRecorder(stream);
    chunks=[];bytes=0;
    const thisRecorder=recorder;
    thisRecorder.addEventListener("dataavailable",event=>{
      if(event.data?.size){chunks.push(event.data);bytes+=event.data.size;}
      if(bytes>=MAX_BYTES&&thisRecorder.state!=="inactive"){say("100 MB recording limit reached; stopping safely.");stopRecording();}
    });
    thisRecorder.addEventListener("error",()=>{say("The browser could not complete this recording.");});
    thisRecorder.addEventListener("stop",()=>{
      if(limitTimer!==null){clearTimeout(limitTimer);limitTimer=null;}
      if(chunks.length&&bytes<=MAX_BYTES){
        const type=thisRecorder.mimeType||mime||"video/webm";
        const blob=new Blob(chunks,{type});
        const ext=type.includes("mp4")?"mp4":"webm";
        revokeClip();clipUrl=URL.createObjectURL(blob);
        clip.src=clipUrl;$("clipDownload").href=clipUrl;
        $("clipDownload").download="still-recording-"+Date.now()+"."+ext;
        $("clipSection").hidden=false;
        say("Recording saved in this browser session. Download it to keep it.");
      }else if(bytes>MAX_BYTES){say("Clip exceeded the local memory limit. Try a shorter recording.");}
      else{say("No usable video was recorded.");}
      chunks=[];bytes=0;controls();
    });
    thisRecorder.start(1000);
    limitTimer=setTimeout(()=>{say("Five-minute clip limit reached. Finishing this recording.");stopRecording();},5*60*1000);
    say("Recording in progress on your device.");
    controls();
  }catch(err){say("Your browser can't record this camera format: "+(err?.message||"unsupported format"));controls();}
});
$("pauseRecord").addEventListener("click",()=>{
  if(!recording())return;
  try{if(recorder.state==="recording")recorder.pause();else if(recorder.state==="paused")recorder.resume();controls();}catch{say("Pause is not available for this recording.");}
});
$("stopRecord").addEventListener("click",stopRecording);
$("deletePhoto").addEventListener("click",()=>{revokePhoto();say("Picture deleted from this session.");});
$("deleteClip").addEventListener("click",()=>{revokeClip();say("Recording deleted from this session.");});
$("rewind").addEventListener("click",()=>{if(Number.isFinite(clip.duration))clip.currentTime=Math.max(0,clip.currentTime-5);});
$("forward").addEventListener("click",()=>{if(Number.isFinite(clip.duration))clip.currentTime=Math.min(clip.duration,clip.currentTime+5);});
$("speed").addEventListener("change",()=>{clip.playbackRate=Number($("speed").value)||1;});
$("close").addEventListener("click",()=>{release();if(window.parent!==window){window.parent.postMessage({type:"nbl-still-camera-close"},location.origin);}else{location.href="/still.html";}});
window.addEventListener("pagehide",()=>{release();revokePhoto();revokeClip();});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&stream){release();say("Camera off because this view was hidden.");}});
controls();
})();