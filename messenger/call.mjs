// NBL Messenger private video call preview. No Stream secret or Facebook Page token.
import {StreamVideoClient} from "https://esm.sh/@stream-io/video-client@1.27.0?bundle";
const ENDPOINT="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-video";
// NBL private calls may never fall back to Stream's general/default call type.
const PRIVATE_CALL_TYPE="nbl_private";
const CLERK_KEY="pk_live_Y2xlcmsubmV3YmVhbnNsYW5kLm9yZyQ";
const ACCOUNT="https://accounts.newbeansland.org";
const $=selector=>document.querySelector(selector);
let clerk=null,client=null,call=null,owner=null,sub=null,joined=false;
let mediaWarning="";
const tracks=new Map();
function status(message){$("#callStatus").textContent=String(message);}
function validCallId(value){return typeof value==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);}
const callId=new URL(location.href).searchParams.get("call");
function clerkDomain(){
 const part=(CLERK_KEY.split("_")[2]||"").replace(/-/g,"+").replace(/_/g,"/");
 return atob(part.padEnd(Math.ceil(part.length/4)*4,"=")).replace(/\$/,"");
}
async function initClerk(){
 if(clerk)return clerk;
 if(!window.Clerk){
  await new Promise((resolve,reject)=>{
   const tag=document.createElement("script");
   tag.src="https://"+clerkDomain()+"/npm/@clerk/clerk-js@6/dist/clerk.browser.js";
   tag.crossOrigin="anonymous";tag.setAttribute("data-clerk-publishable-key",CLERK_KEY);
   tag.onload=resolve;tag.onerror=()=>reject(Error("NBL sign-in did not load."));
   document.head.append(tag);
  });
 }
 await window.Clerk.load();
 clerk=window.Clerk;
 return clerk;
}
async function videoRequest(action){
 const c=await initClerk();
 if(!owner||c.user?.id!==owner||!c.isSignedIn||!c.session)throw Error("Your NBL account changed. Return to Messenger.");
 const token=await c.session.getToken();
 if(!token)throw Error("Sign in to NBL again.");
 const response=await fetch(ENDPOINT,{
  method:"POST",headers:{authorization:"Bearer "+token,"content-type":"application/json"},
  body:JSON.stringify({action,callId}),cache:"no-store"
 });
 if(c.user?.id!==owner||!c.isSignedIn)throw Error("Your account changed.");
 const result=await response.json().catch(()=>({}));
 if(!response.ok||result.ok!==true)throw Error(result.message||"This NBL call cannot be joined.");
 return result;
}
function clearTracks(){
 for(const parts of tracks.values())for(const unbind of parts.cleanup)try{unbind();}catch{}
 tracks.clear();$("#participants").replaceChildren();
}
// Two-person private calls always subscribe to both video tiles. In a small
// mobile viewport, visibility tracking can mark the second tile offscreen and
// deliberately unsubscribe its video even while remote audio keeps playing.
function updateCameraHint(parts,participant){
 const track=participant.videoStream?.getVideoTracks?.().find(t=>t.readyState==="live"&&t.enabled);
 if(parts.video.readyState>=2&&parts.video.videoWidth>0){parts.hint.hidden=true;return;}
 parts.hint.hidden=false;
 parts.hint.textContent=track
  ?"Connecting the other camera picture…"
  :participant.isLocalParticipant
   ?"Your camera is off. Check permission or tap Turn camera on."
   :"The other person's camera is off or not sending video. Ask them to turn it on.";
}
function renderParticipants(participants){
 const area=$("#participants");
 const current=new Set(participants.map(p=>p.sessionId));
 for(const [id,parts] of tracks)if(!current.has(id)){
   for(const unbind of parts.cleanup)try{unbind();}catch{}
   parts.wrapper.remove();tracks.delete(id);
 }
 for(const p of participants){
  if(tracks.has(p.sessionId)){updateCameraHint(tracks.get(p.sessionId),p);continue;}
  const wrapper=document.createElement("section");
  wrapper.className="person";
  const video=document.createElement("video");
  // Video has its own element; remote sound plays in a separate audio element.
  // Muting every VIDEO element allows reliable autoplay on mobile browsers.
  video.autoplay=true;video.playsInline=true;video.muted=true;
  video.setAttribute("playsinline","");
  const hint=document.createElement("small");
  hint.className="video-hint";
  hint.textContent=p.isLocalParticipant?"Waiting for your camera…":"Waiting for the other camera…";
  video.addEventListener("playing",()=>{hint.hidden=true;});
  video.addEventListener("emptied",()=>{hint.hidden=false;});
  const label=document.createElement("p");
  label.textContent=(p.name||"NBL participant")+(p.isLocalParticipant?" · You":"");
  wrapper.append(video,hint,label);
  let audio=null;
  if(!p.isLocalParticipant){
   audio=document.createElement("audio");audio.autoplay=true;
   wrapper.append(audio);
  }
  // Stream requires binding video AFTER its element is attached to the DOM.
  // Both videos must stay subscribed for two-person calls, even offscreen.
  area.append(wrapper);
  const cleanup=[];
  // No viewport/visibility culling: a phone often displays only one tile
  // at a time; audio could otherwise work while the other camera stays black.
  cleanup.push(call.bindVideoElement(video,p.sessionId,"videoTrack"));
  if(audio)cleanup.push(call.bindAudioElement(audio,p.sessionId,"audioTrack"));
  tracks.set(p.sessionId,{wrapper,video,audio,hint,cleanup:cleanup.filter(fn=>typeof fn==="function")});
  updateCameraHint(tracks.get(p.sessionId),p);
  video.addEventListener("loadeddata",()=>{if(video.videoWidth>0)hint.hidden=true;});
  video.addEventListener("error",()=>{hint.hidden=false;hint.textContent="Camera picture failed to play. Leave and rejoin to retry.";});
 }
 status((participants.length<2?"Connected. Waiting for the other person to join.":"You are connected.")
  +(mediaWarning?" "+mediaWarning:""));
}
// Safari and some Android browsers can block unmuted autoplay after a remote
// track arrives. The user can resume only their own call audio on a tap.
async function enableRemoteSound(){
 if(!joined){status("Join the private call before enabling sound.");return;}
 const remote=[...tracks.values()].map(tile=>tile.audio).filter(Boolean);
 if(!remote.length){status("Waiting for the other participant to join.");return;}
 let playing=0;
 for(const audio of remote){
  try{await audio.play();playing++;}catch{}
 }
 status(playing===remote.length?"Call sound enabled."
  :"Sound was blocked by this device. Check volume and permissions, then tap Enable call sound again.");
}
async function leave(){
 sub?.unsubscribe();sub=null;clearTracks();
 try{await call?.leave();}catch{}
 try{await client?.disconnectUser();}catch{}
 call=null;client=null;joined=false;mediaWarning="";
 $("#participants").hidden=true;
 $("#join").hidden=false;$("#leave").hidden=true;$("#camera").hidden=true;$("#microphone").hidden=true;$("#callSound").hidden=true;
 status("Call left. Return to Messenger or rejoin while the invite is active.");
}
async function join(){
 if(joined||!validCallId(callId))return;
 $("#join").disabled=true;
 status("Checking NBL account and call permissions…");
 try{
  const access=await videoRequest("join");
  if(access.user?.id!==owner||!access.key||!access.token||access.callType!==PRIVATE_CALL_TYPE||access.callId!==callId)
   throw Error("Video session identity verification failed.");
  client=new StreamVideoClient({apiKey:access.key,user:{id:owner},token:access.token});
  call=client.call(PRIVATE_CALL_TYPE,callId);
  // A blocked camera or microphone must not prevent the other participant
  // joining the call. Keep the call available and offer controls to retry.
  let cameraReady=true,microphoneReady=true;
  try{await call.camera.enable();}catch{cameraReady=false;}
  try{await call.microphone.enable();}catch{microphoneReady=false;}
  mediaWarning=(!cameraReady||!microphoneReady)
   ?"Camera or microphone permission is off. Use the controls to retry, or check your browser settings.":"";
  await call.join({create:false});
  if(clerk.user?.id!==owner||!clerk.isSignedIn)throw Error("Your NBL account changed.");
  joined=true;
  $("#join").hidden=true;$("#leave").hidden=false;$("#camera").hidden=false;$("#microphone").hidden=false;$("#callSound").hidden=false;
  $("#participants").hidden=false;
  $("#camera").textContent=cameraReady?"Turn camera off":"Turn camera on";
  $("#microphone").textContent=microphoneReady?"Mute microphone":"Unmute microphone";
  // Two-person calls subscribe to BOTH videos regardless of mobile viewport.
  sub=call.state.participants$.subscribe(renderParticipants);
 }catch(error){
  status(error?.message||"This call is unavailable.");
  await leave();
  status(error?.message||"This call is unavailable.");
 }finally{$("#join").disabled=false;}
}
async function boot(){
 if(!validCallId(callId)){status("This is not a valid NBL call invitation.");$("#join").disabled=true;return;}
 try{
  const c=await initClerk();
  if(!c.isSignedIn||!c.session){
   status("Sign in with your existing NBL account to answer this video call.");
   const sign=document.createElement("a");sign.href=ACCOUNT+"/sign-in?redirect_url="+encodeURIComponent(location.href);
   sign.textContent="Sign in to NBL";sign.className="signin";$("#callStatus").after(sign);
   $("#join").disabled=true;return;
  }
  owner=c.user?.id||null;
  c.addListener?.(()=>{
   if(c.user?.id!==owner||!c.isSignedIn){void leave();status("Account changed. Call closed for privacy.");$("#join").disabled=true;}
  });
  const params=new URL(location.href).searchParams;
  if(params.get("decline")==="1"){
   $("#join").disabled=true;
   try{await videoRequest("finish");status("Call declined.");}
   catch(error){status(error?.message||"This call is no longer available.");}
   return;
  }
  if(params.get("outgoing")==="1"){
   status("Calling your NBL member… Connecting video.");
   // On browsers requiring a separate permission gesture the Join button remains available.
   void join();
  }else status("Incoming NBL video call. Tap Join to answer.");
 }catch(error){status(error?.message||"NBL account connection unavailable.");$("#join").disabled=true;}
}
$("#join").addEventListener("click",()=>{void join();});
$("#camera").addEventListener("click",async()=>{
 try{await call.camera.toggle();$("#camera").textContent=call.camera.state.status==="enabled"?"Turn camera off":"Turn camera on";}
 catch{status("Could not change camera.");}
});
$("#microphone").addEventListener("click",async()=>{
 try{await call.microphone.toggle();$("#microphone").textContent=call.microphone.state.status==="enabled"?"Mute microphone":"Unmute microphone";}
 catch{status("Could not change microphone.");}
});
$("#callSound").addEventListener("click",()=>{void enableRemoteSound();});
$("#leave").addEventListener("click",async()=>{
 try{await videoRequest("finish");}catch{}
 await leave();
 status("NBL video call ended.");
});
window.addEventListener("pagehide",()=>{if(joined)void leave();});
void boot();
