(()=>{
"use strict";
const $=id=>document.getElementById(id);
const view=$("view"),status=$("status"),clip=$("clipPreview");
let stream=null,recorder=null,mime="",facing="environment",photoUrl="",photoBlob=null,clipUrl="",clipBlob=null,chunks=[],bytes=0,limitTimer=null,pending=false;
const MAX_BYTES=100*1024*1024;
let savedPhotoId="",savedClipId="",savingPhoto=false,savingClip=false;
const saveLocal=(blob,options)=>import("/studio/still-media-library.mjs").then(lib=>lib.saveStillMedia(blob,options));
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
  photoUrl="";photoBlob=null;savedPhotoId="";$("editPhotoPulse").hidden=true;$("savePhotoLocal").disabled=false;$("photoSection").hidden=true;
  $("photoPreview").removeAttribute("src");$("photoDownload").removeAttribute("href");
}
function revokeClip(){
  clip.pause();clip.removeAttribute("src");clip.load();
  if(clipUrl)URL.revokeObjectURL(clipUrl);
  clipUrl="";clipBlob=null;savedClipId="";$("editClipPulse").hidden=true;$("saveClipLocal").disabled=false;$("clipSection").hidden=true;$("clipDownload").removeAttribute("href");
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
    closePhotopea();revokePhoto();photoBlob=blob;photoUrl=URL.createObjectURL(blob);
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
        revokeClip();clipBlob=blob;clipUrl=URL.createObjectURL(blob);
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
const photopeaFrame=$("photopeaFrame");
let editorTransferStarted=false,exportPending=false,exportFormat="",exportTimeout=null;
function resetEditorExport(){
  exportPending=false;exportFormat="";
  if(exportTimeout!==null)clearTimeout(exportTimeout);
  exportTimeout=null;
  $("exportPhotopea").disabled=true;$("exportPhotopeaPsd").disabled=true;
}
function closePhotopea(){
  $("photopeaSection").hidden=true;
  photopeaFrame.removeAttribute("src");
  editorTransferStarted=false;
  resetEditorExport();
}
$("editPhoto").addEventListener("click",()=>{
  if(!photoBlob)return;
  release();
  editorTransferStarted=false;resetEditorExport();
  $("photopeaSection").hidden=false;
  photopeaFrame.src="https://www.photopea.com/";
  say("Photopea is loading. It will receive this photo in your browser; use its File menu to save edits.");
});
$("closePhotopea").addEventListener("click",closePhotopea);
function exportFromPhotopea(format){
  if($("photopeaSection").hidden||!editorTransferStarted||exportPending)return;
  exportPending=true;exportFormat=format;
  $("exportPhotopea").disabled=true;$("exportPhotopeaPsd").disabled=true;
  try{
    photopeaFrame.contentWindow.postMessage('app.activeDocument.saveToOE("'+format+'");',"https://www.photopea.com");
    exportTimeout=setTimeout(()=>{
      if(exportPending){resetEditorExport();$("exportPhotopea").disabled=false;$("exportPhotopeaPsd").disabled=false;say("Editor export timed out. Retry or download directly from Photopea.");}
    },30000);
    say("Saving "+(format==="psd"?"editable PSD":"finished PNG")+" to Still library...");
  }catch(err){resetEditorExport();$("exportPhotopea").disabled=false;$("exportPhotopeaPsd").disabled=false;say("Advanced editor export unavailable: "+err.message);}
}
$("exportPhotopea").addEventListener("click",()=>exportFromPhotopea("png"));
$("exportPhotopeaPsd").addEventListener("click",()=>exportFromPhotopea("psd"));
window.addEventListener("message",async event=>{
  if($("photopeaSection").hidden||event.origin!=="https://www.photopea.com"||event.source!==photopeaFrame.contentWindow)return;
  if(exportPending&&event.data instanceof ArrayBuffer){
    const binary=event.data,format=exportFormat;resetEditorExport();
    const bytes=new Uint8Array(binary,0,Math.min(8,binary.byteLength));
    const isPng=bytes.length===8&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v);
    const isPsd=bytes.length>=4&&String.fromCharCode(...bytes.slice(0,4))==="8BPS";
    try{
      if(format==="png"&&!isPng||format==="psd"&&!isPsd)throw Error("Editor returned an unexpected file format.");
      const type=format==="psd"?"image/vnd.adobe.photoshop":"image/png";
      await saveLocal(new Blob([binary],{type}),{name:"still-"+(format==="psd"?"project":"edited")+"-"+Date.now()+"."+format});
      say(format==="psd"?"Editable PSD project saved to Still library; reopen it later for layers.":"Edited PNG saved in Still library; download a backup when convenient.");
    }catch(err){say("Could not save editor output: "+err.message+". Download from Photopea as a backup.");}
    $("exportPhotopea").disabled=false;$("exportPhotopeaPsd").disabled=false;return;
  }
  if(event.data!=="done"||editorTransferStarted||!photoBlob)return;
  editorTransferStarted=true;
  try{
    const buffer=await photoBlob.arrayBuffer();
    if($("photopeaSection").hidden)return;
    photopeaFrame.contentWindow.postMessage(buffer,"https://www.photopea.com",[buffer]);
    $("exportPhotopea").disabled=false;$("exportPhotopeaPsd").disabled=false;
    say("Picture opened in Photopea. Edit it, then choose Save edited PNG to Still library. Your original remains unchanged.");
  }catch{say("Could not open photo in advanced editor. Download the PNG and open it manually.");}
});
async function savePhoto(){
  if(!photoBlob||savingPhoto||savedPhotoId)return;
  savingPhoto=true;$("savePhotoLocal").disabled=true;
  try{
    const saved=await saveLocal(photoBlob,{name:$("photoDownload").download});
    savedPhotoId=saved.id;
    const a=$("editPhotoPulse");a.href="/pulse/?still_media="+encodeURIComponent(saved.id);a.hidden=false;
    say("Picture saved to this browser's Still library. Edit in Pulse or download a backup.");
  }catch(err){say("Could not save picture locally: "+err.message);}
  finally{savingPhoto=false;$("savePhotoLocal").disabled=!!savedPhotoId;}
}
async function saveClip(){
  if(!clipBlob||savingClip||savedClipId)return;
  savingClip=true;$("saveClipLocal").disabled=true;
  try{
    const saved=await saveLocal(clipBlob,{name:$("clipDownload").download});
    savedClipId=saved.id;
    if(saved.size<=40*1024*1024){
      const a=$("editClipPulse");a.href="/pulse/?still_media="+encodeURIComponent(saved.id);a.hidden=false;
      say("Video saved to Still library. Edit in Pulse to trim and export.");
    }else say("Video saved to Still library. It exceeds Pulse's 40 MB limit; download it or record a smaller clip.");
  }catch(err){say("Could not save video locally: "+err.message);}
  finally{savingClip=false;$("saveClipLocal").disabled=!!savedClipId;}
}
$("savePhotoLocal").addEventListener("click",savePhoto);
$("saveClipLocal").addEventListener("click",saveClip);
$("deletePhoto").addEventListener("click",()=>{closePhotopea();revokePhoto();say("Picture preview discarded. Any Still library copy remains until you delete it there.");});
$("deleteClip").addEventListener("click",()=>{revokeClip();say("Recording preview discarded. Any Still library copy remains until you delete it there.");});
$("rewind").addEventListener("click",()=>{if(Number.isFinite(clip.duration))clip.currentTime=Math.max(0,clip.currentTime-5);});
$("forward").addEventListener("click",()=>{if(Number.isFinite(clip.duration))clip.currentTime=Math.min(clip.duration,clip.currentTime+5);});
$("speed").addEventListener("change",()=>{clip.playbackRate=Number($("speed").value)||1;});
$("close").addEventListener("click",()=>{release();if(window.parent!==window){window.parent.postMessage({type:"nbl-still-camera-close"},location.origin);}else{location.href="/still.html";}});
window.addEventListener("pagehide",()=>{release();closePhotopea();revokePhoto();revokeClip();});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&stream){release();say("Camera off because this view was hidden.");}});
controls();
})();