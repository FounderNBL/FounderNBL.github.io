// NBL Books: Founder-only authorized paid TTS audition. Backend never trusts UI.
(()=>{
"use strict";
const API="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-audiobook-lab";
const PUBLISHABLE="pk_live_Y2xlcmsubmV3YmVhbnNsYW5kLm9yZyQ";
const ACCOUNT="https://accounts.newbeansland.org";
const $=id=>document.getElementById(id);
let clerk=null,busy=false,playingUrl=null;
try{
 const u=new URL(location.href);u.hash="";
 $("audio-lab-sign-in").href=ACCOUNT+"/sign-in?redirect_url="+encodeURIComponent(u.href);
}catch{ /* Ordinary sign-in URL remains. */ }
function say(id,text){$(id).textContent=text;}
function originFromKey(){
 const p=(PUBLISHABLE.split("_")[2]||"").replace(/-/g,"+").replace(/_/g,"/");
 return atob(p.padEnd(Math.ceil(p.length/4)*4,"=")).replace(/\$$/,"");
}
async function sessionToken(){
 if(!clerk){
  if(!window.Clerk){
   await new Promise((resolve,reject)=>{
    const script=document.createElement("script");
    script.src="https://"+originFromKey()+"/npm/@clerk/clerk-js@6/dist/clerk.browser.js";
    script.dataset.clerkPublishableKey=PUBLISHABLE;script.crossOrigin="anonymous";
    script.onload=resolve;script.onerror=()=>reject(Error("NBL sign-in did not load."));document.head.append(script);
   });
  }
  if(!window.Clerk)throw Error("Clerk sign-in isn't currently available.");
  await window.Clerk.load();clerk=window.Clerk;
 }
 if(!clerk.session||!clerk.isSignedIn){
  const h=new URL(location.href);h.hash="";
  throw Error("Sign in first: "+ACCOUNT+"/sign-in?redirect_url="+encodeURIComponent(h.href));
 }
 const token=await clerk.session.getToken();
 if(!token)throw Error("Your session expired. Sign in again.");
 return token;
}
async function call(payload,wantAudio=false){
 const token=await sessionToken();
 const response=await fetch(API,{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer "+token},
  body:JSON.stringify(payload),cache:"no-store",credentials:"omit"});
 if(wantAudio&&response.ok&&response.headers.get("content-type")?.startsWith("audio/")){
  const blob=await response.blob();
  if(blob.size<10||blob.size>2000000)throw Error("Invalid audio response.");
  return blob;
 }
 const b=await response.json().catch(()=>({}));
 if(!response.ok||!b.ok)throw Error(String(b.reason||"provider_unavailable").replace(/_/g," "));
 return b;
}
function setBusy(value){
 busy=value;$("audio-lab-check").disabled=value;
 $("audio-lab-generate").disabled=value;
}
$("audio-lab-check").addEventListener("click",async()=>{
 if(busy)return;setBusy(true);
 say("audio-lab-connections","Checking verified Founder-only backend provider configuration…");
 try{
  const s=await call({action:"status"});
  const p=s.providersConfigured||{};
  say("audio-lab-connections","ElevenLabs "+(p.elevenlabs?"configured":"not configured")+
    " · Azure Speech "+(p.azure_speech?"configured":"not configured")+
    " · Google Cloud Speech "+(p.google_cloud_tts?"configured":"not configured")+
    ". Provider credit balance not yet verified. No paid call made.");
 }catch(e){say("audio-lab-connections","Check unavailable: "+e.message);}
 finally{setBusy(false);}
});
$("audio-lab-generate").addEventListener("click",async()=>{
 if(busy)return;
 if(!$("audio-lab-consent").checked){say("audio-lab-status","Check the one-sample paid-use consent box first.");return;}
 const text=$("audio-lab-text").value.trim();
 if(text.length<10||text.length>220){say("audio-lab-status","Use between 10 and 220 characters for this paid audition.");return;}
 const provider=$("audio-lab-provider").value;
 // Consent reset before request; accidental second click cannot repeat spend.
 $("audio-lab-consent").checked=false;
 setBusy(true);say("audio-lab-status","Requesting one "+provider+" paid audiobook sample…");
 try{
  const blob=await call({action:"founder_sample",provider,text,confirmPaidUsage:true},true);
  if(playingUrl)URL.revokeObjectURL(playingUrl);
  playingUrl=URL.createObjectURL(blob);
  const player=$("audio-lab-player");player.src=playingUrl;
  say("audio-lab-status",provider+" returned "+(blob.size/1024).toFixed(1)+" KB audio. Listen and judge how it sounds; provider usage may be billed.");
 }catch(e){say("audio-lab-status","Sample wasn't delivered: "+e.message);}
 finally{setBusy(false);}
});
window.addEventListener("pagehide",()=>{if(playingUrl)URL.revokeObjectURL(playingUrl);});
})();
