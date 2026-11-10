// NBL Messenger private video call preview. No Stream secret or Facebook Page token.
import {StreamVideoClient} from "https://esm.sh/@stream-io/video-client@1.27.0?bundle";
const ENDPOINT="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-video";
// NBL private calls may never fall back to Stream's general/default call type.
const PRIVATE_CALL_TYPE="nbl_private";
const CLERK_KEY="pk_live_Y2xlcmsubmV3YmVhbnNsYW5kLm9yZyQ";
const ACCOUNT="https://accounts.newbeansland.org";
const $=selector=>document.querySelector(selector);
let clerk=null,client=null,call=null,owner=null,sub=null,joined=false;
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
function renderParticipants(participants){
 const area=$("#participants");
 const current=new Set(participants.map(p=>p.sessionId));
 for(const [id,parts] of tracks)if(!current.has(id)){
   for(const unbind of parts.cleanup)try{unbind();}catch{}
   parts.wrapper.remove();tracks.delete(id);
 }
 for(const p of participants){
  if(tracks.has(p.sessionId))continue;
  const wrapper=document.createElement("section");
  wrapper.className="person";
  const video=document.createElement("video");
  video.autoplay=true;video.playsInline=true;video.muted=Boolean(p.isLocalParticipant);
  const label=document.createElement("p");
  label.textContent=(p.name||"NBL participant")+(p.isLocalParticipant?" · You":"");
  wrapper.append(video,label);
  const cleanup=[call.bindVideoElement(video,p.sessionId,"videoTrack")];
  if(!p.isLocalParticipant){
   const audio=document.createElement("audio");audio.autoplay=true;
   wrapper.append(audio);
   cleanup.push(call.bindAudioElement(audio,p.sessionId,"audioTrack"));
  }
  tracks.set(p.sessionId,{wrapper,cleanup});
  area.append(wrapper);
 }
 status(participants.length<2?"Connected. Waiting for the other person to join.":"You are connected.");
}
async function leave(){
 sub?.unsubscribe();sub=null;clearTracks();
 try{await call?.leave();}catch{}
 try{await client?.disconnectUser();}catch{}
 call=null;client=null;joined=false;
 $("#participants").hidden=true;
 $("#join").hidden=false;$("#leave").hidden=true;$("#camera").hidden=true;$("#microphone").hidden=true;
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
  await call.camera.enable();
  await call.microphone.enable();
  await call.join({create:false});
  if(clerk.user?.id!==owner||!clerk.isSignedIn)throw Error("Your NBL account changed.");
  joined=true;
  $("#join").hidden=true;$("#leave").hidden=false;$("#camera").hidden=false;$("#microphone").hidden=false;
  $("#participants").hidden=false;
  call.setViewport($("#participants"));
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
$("#leave").addEventListener("click",async()=>{
 try{await videoRequest("finish");}catch{}
 await leave();
 status("NBL video call ended.");
});
window.addEventListener("pagehide",()=>{if(joined)void leave();});
void boot();
