// Pulse Live: local camera readiness only. Does not start a billable provider session.
// Server-controlled broadcasting remains disabled until authenticated ingest, metering and cost gates exist.
const MAX_SECONDS=300;
function initPulseLivePreview(){
  const host=document.querySelector(".pulse-live");
  if(!host)return;
  host.hidden=false;host.removeAttribute("aria-hidden");
  host.innerHTML=`<strong>● Pulse Live</strong>
    <p>Check your camera and microphone before broadcasting. Live publishing is not yet available.</p>
    <button type="button" id="pulseCameraPreview" style="cursor:pointer">Preview camera</button>
    <button type="button" id="pulseCameraStop" hidden style="cursor:pointer">Stop preview</button>
    <video id="pulseCameraVideo" autoplay muted playsinline hidden style="width:100%;max-width:360px;border-radius:10px;margin-top:10px"></video>
    <p id="pulseCameraStatus" role="status" aria-live="polite">No broadcast started. 5-minute session limit planned.</p>`;
  const start=host.querySelector("#pulseCameraPreview"),stop=host.querySelector("#pulseCameraStop");
  const video=host.querySelector("#pulseCameraVideo"),status=host.querySelector("#pulseCameraStatus");
  let stream=null;
  function close(){
    if(stream){for(const track of stream.getTracks())track.stop();stream=null;}
    video.srcObject=null;video.hidden=true;stop.hidden=true;start.hidden=false;
  }
  start.addEventListener("click",async()=>{
    if(!navigator.mediaDevices?.getUserMedia){status.textContent="Camera preview requires a secure browser and device permissions.";return;}
    start.disabled=true;
    try{
      const capture=await navigator.mediaDevices.getUserMedia({audio:true,video:true});
      if(!document.contains(host)){capture.getTracks().forEach(t=>t.stop());return;}
      stream=capture;video.srcObject=capture;video.hidden=false;stop.hidden=false;start.hidden=true;
      status.textContent="Local preview only. Nothing is being sent to Google or Stream.";
    }catch(e){status.textContent=e?.name==="NotAllowedError"?"Camera or microphone permission was denied.":"Camera preview unavailable on this device.";}
    finally{start.disabled=false;}
  });
  stop.addEventListener("click",()=>{close();status.textContent="Preview stopped. No broadcast was started.";});
  window.addEventListener("pagehide",close,{once:true});
  document.addEventListener("visibilitychange",()=>{if(document.hidden&&stream){close();status.textContent="Preview stopped when the page was hidden."; }});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initPulseLivePreview,{once:true});
else initPulseLivePreview();
export {MAX_SECONDS};
