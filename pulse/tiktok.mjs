// No provider tokens are stored in the browser; Clerk authenticates each member action.
const byId=id=>document.getElementById(id);
const api="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-tiktok-connect";
const key="pk_live_Y2xlcmsubmV3YmVhbnNsYW5kLm9yZyQ";
const args=new URL(location.href).searchParams;
const incoming={code:args.get("code"),state:args.get("state"),error:args.get("error")};
if(location.search)history.replaceState(null,"",location.pathname);
let clerk,member,account="",scopes=[],creator=null,previewURL="",duration=0,job=null,busy=false,gen=0,preflightPassed=false,historyRun=0;
const mode=()=>byId("environment").value;
const say=s=>byId("status").textContent=s;
const postSay=s=>byId("postingStatus").textContent=s;
async function call(action,fields={},form=null){
 if(!clerk?.session||clerk.user?.id!==member)throw Error("NBL account changed. Reload.");
 const activeMode=mode();
 const token=await clerk.session.getToken();
 if(!token||clerk.user?.id!==member||activeMode!==mode())throw Error("Sign in to NBL first.");
 const payload=form||{action,mode:mode(),...fields};
 if(form){form.set("action",action);form.set("mode",mode());}
 const r=await fetch(api,{method:"POST",headers:{authorization:"Bearer "+token,...(form?{}:{"content-type":"application/json"})},body:form||JSON.stringify(payload)});
 const b=await r.json();if(!r.ok||!b.ok){const e=Error(String(b.reason||"request_failed").replaceAll("_"," "));e.publish_id=b.publish_id;throw e;}return b;
}
function clear(){
 gen++;historyRun++;account="";scopes=[];creator=null;job=null;duration=0;preflightPassed=false;
 byId("post").hidden=true;byId("disconnect").hidden=true;byId("list").hidden=true;byId("videos").replaceChildren();byId("identity").textContent="";byId("check").hidden=true;byId("recent").hidden=true;byId("recentList").replaceChildren();byId("historyShell").hidden=true;byId("historyStatus").textContent="";
 byId("preflight").disabled=true;byId("prepare").hidden=true;byId("readiness").textContent="Not checked. No video has been sent by this check.";byId("selectedState").textContent="No video selected · nothing sent.";postSay("No new video sent in this session.");
 byId("post").reset();byId("prepare").textContent="Prepare a video (do not send yet)";byId("direct").hidden=true;byId("brand").hidden=true;byId("brandedConsent").hidden=true;byId("privacy").replaceChildren(new Option("Choose privacy",""));
 if(previewURL)URL.revokeObjectURL(previewURL);previewURL="";byId("preview").removeAttribute("src");byId("preview").replaceChildren();byId("preview").load();byId("preview").hidden=true;
}
function update(){
 const direct=byId("kind").value==="direct";byId("direct").hidden=!direct;
 byId("brand").hidden=!byId("commercial").checked;byId("brandedConsent").hidden=!(byId("commercial").checked&&byId("paid_brand").checked);
 byId("brandNotice").textContent=byId("commercial").checked?(byId("paid_brand").checked?"Your video will be labeled Paid partnership. Private visibility is unavailable.":byId("own_brand").checked?"Your video will be labeled Promotional content.":"Select at least one disclosure."):"";
 const paid=byId("commercial").checked&&byId("paid_brand").checked;
 for(const option of byId("privacy").options)if(option.value==="SELF_ONLY")option.disabled=paid;
 if(paid&&byId("privacy").value==="SELF_ONLY")byId("privacy").value="";
 byId("send").textContent=direct?"Publish to TikTok":"Send draft to TikTok";
 const chosenFile=byId("file").files?.[0];
 const validFile=!!chosenFile&&["video/mp4","video/quicktime","video/webm"].includes(chosenFile.type)&&chosenFile.size>0&&chosenFile.size<=20*1024*1024;
 byId("send").disabled=busy||!preflightPassed||!account||!validFile||!byId("consent").checked||!Number.isFinite(duration)||duration<=0||(direct&&(!creator||!byId("privacy").value||duration>creator.max_video_post_duration_sec||(byId("commercial").checked&&!byId("own_brand").checked&&!byId("paid_brand").checked)));
}
async function loadCreator(){
 creator=null;update();const n=gen,m=mode();
 try{
  const b=await call("creator");if(n!==gen||m!==mode())return;
  creator=b.creator;byId("creator").textContent="Posting to "+creator.creator_nickname+" (@"+creator.creator_username+") · maximum "+creator.max_video_post_duration_sec+" seconds";
  byId("privacy").replaceChildren(new Option("Choose privacy",""));
  const names={PUBLIC_TO_EVERYONE:"Everyone",MUTUAL_FOLLOW_FRIENDS:"Friends",FOLLOWER_OF_CREATOR:"Followers",SELF_ONLY:"Only me"};
  for(const v of creator.privacy_level_options||[])if(names[v]&&(mode()!=="sandbox"||v==="SELF_ONLY"))byId("privacy").add(new Option(names[v],v));
  for(const name of ["comment","duet","stitch"]){byId(name).checked=false;byId(name).disabled=!!creator[name+"_disabled"];}
 }catch(e){postSay(e.message);}finally{update();}
}
async function loadRecent(){
 const n=gen,m=mode(),a=account;
 const section=byId("recent"),list=byId("recentList");
 section.hidden=true;byId("historyShell").hidden=true;list.replaceChildren();byId("historyStatus").textContent="";
 if(!a)return;
 try{
  const b=await call("recent");
  if(n!==gen||m!==mode()||a!==account)return;
  for(const entry of b.posts||[]){
   if(typeof entry.publish_id!=="string"||!entry.publish_id)continue;
   const li=document.createElement("li"),button=document.createElement("button");
   button.type="button";
   const submitted=new Date(entry.created_at);
   button.textContent="Check earlier submission · "+(Number.isFinite(submitted.getTime())?submitted.toLocaleString():"Previous TikTok submission");
   button.addEventListener("click",()=>{
    if(n!==gen||m!==mode()||a!==account)return;
    void inspectHistory(entry.publish_id,button.textContent);
   });
   li.append(button);list.append(li);
  }
  section.hidden=!list.children.length;byId("historyShell").hidden=section.hidden;
  // An old post is never auto-selected as the CURRENT upload.
 }catch(e){
  if(n===gen&&m===mode()&&a===account){
   section.hidden=false;byId("historyShell").hidden=false;
   const li=document.createElement("li");li.textContent="Earlier TikTok submissions are temporarily unavailable.";list.append(li);
  }
 }
}
async function inspectHistory(publishId,label){
 const seq=++historyRun,n=gen,m=mode(),a=account;
 const el=byId("historyStatus");el.textContent=label+" · Checking TikTok (not the current upload)…";
 try{
  const b=await call("status",{publish_id:publishId});
  if(seq!==historyRun||n!==gen||m!==mode()||a!==account)return;
  const statuses={PROCESSING_UPLOAD:"Earlier video is still processing.",PROCESSING_DOWNLOAD:"TikTok is still fetching that earlier video.",SEND_TO_USER_INBOX:"TikTok sent an earlier draft to your inbox. It is NOT a published video; try opening its notification in the TikTok mobile app.",PUBLISH_COMPLETE:"TikTok confirms this earlier submission was published.",FAILED:"TikTok reports that earlier submission failed."};
  el.textContent=label+" · "+(statuses[b.status]||"TikTok status: "+String(b.status||"unknown"))+(b.reason?" · "+b.reason:"");
 }catch(e){
  if(seq===historyRun&&n===gen&&m===mode()&&a===account)el.textContent="Could not verify this earlier submission: "+e.message;
 }
}
byId("preflight").addEventListener("click",async()=>{
 if(busy||!account)return;
 const n=gen,m=mode(),a=account;
 busy=true;preflightPassed=false;byId("prepare").hidden=true;byId("post").hidden=true;
 byId("preflight").disabled=true;byId("readiness").textContent="Checking connected TikTok permissions. No video will be uploaded.";
 update();
 try{
  const b=await call("connection");
  if(n!==gen||m!==mode()||a!==account)return;
  if(!b.connected||b.account_ref!==account)throw Error("Your TikTok connection changed. Reconnect first.");
  if(!b.scopes?.includes("video.upload")&&!b.scopes?.includes("video.publish"))throw Error("TikTok did not authorize video sharing.");
  // This read-only creator-info request talks to TikTok, not its upload endpoint.
  // Upload-only grants have no creator-info scope; check their saved grant only.
  if(b.scopes.includes("video.publish")){
   const check=await call("creator");
   if(!check.creator||!Array.isArray(check.creator.privacy_level_options))throw Error("TikTok creator check was incomplete.");
   creator=check.creator;
  }
  if(n!==gen||m!==mode()||a!==account)return;
  preflightPassed=true;byId("prepare").hidden=false;
  byId("readiness").textContent=b.scopes.includes("video.publish")
   ?"TikTok verified your account through a read-only creator check. No video uploaded. Full transfer is NOT tested until you choose a file and send it."
   :"Pulse verified the saved upload permission. TikTok transfer is NOT tested. No video uploaded.";
 }catch(e){
  if(n===gen&&m===mode()&&a===account){
   preflightPassed=false;byId("readiness").textContent="Connection check failed: "+e.message+". No video sent. Reconnect TikTok or try again.";
  }
 }finally{
  busy=false;if(n===gen&&m===mode()&&a===account)byId("preflight").disabled=false;update();
 }
});
byId("prepare").addEventListener("click",()=>{
 if(!preflightPassed||!account||busy)return;
 byId("post").hidden=false;byId("prepare").textContent="Video preparation opened below";
 if(byId("kind").value==="direct"&&scopes.includes("video.publish"))void loadCreator();
 byId("post").scrollIntoView({behavior:"smooth",block:"start"});
});

async function connection(){
 clear();const n=gen,m=mode();
 try{
  const b=await call("connection");if(n!==gen||m!==mode())return;
  if(!b.connected){say("Connect your TikTok account to begin.");return;}
  account=b.account_ref;scopes=b.scopes;byId("identity").textContent="Connected TikTok account: "+b.label;
  byId("disconnect").hidden=false;byId("list").hidden=!scopes.includes("video.list");
  byId("kind").options[0].disabled=!scopes.includes("video.upload");byId("kind").options[1].disabled=!scopes.includes("video.publish");
  byId("kind").value=scopes.includes("video.upload")?"draft":"direct";
  byId("post").hidden=true;preflightPassed=false;
  byId("preflight").disabled=!scopes.includes("video.upload")&&!scopes.includes("video.publish");
  byId("readiness").textContent="Connected, but not tested. Run Test connection before preparing a video. No video has been sent.";
  say(m==="sandbox"?"TikTok sandbox connected: test uploads cannot be public. Public posting requires approved production access.":"TikTok production connected. Public visibility depends on TikTok approval and the available privacy choices.");
  await loadRecent();
  // No automatic TikTok creator calls or uploads: the next check requires a tap.
 }catch(e){say(e.message);}finally{update();}
}
async function init(){
 try{
  if(!window.Clerk)await new Promise((resolve,reject)=>{const s=document.createElement("script");s.src="https://clerk.newbeansland.org/npm/@clerk/clerk-js@6/dist/clerk.browser.js";s.setAttribute("data-clerk-publishable-key",key);s.onload=resolve;s.onerror=reject;document.head.append(s);});
  clerk=window.Clerk;await clerk.load();member=clerk.user?.id;if(!member||!clerk.session){say("Sign in through Pulse before connecting TikTok.");return;}
  clerk.addListener?.(s=>{if(s.user?.id!==member){clear();member=null;byId("settings").hidden=true;say("NBL account changed. Return to Pulse and reopen this page.");}});
  const c=await call("configuration");byId("settings").hidden=false;
  for(const o of byId("environment").options)o.disabled=!c[o.value];
  if(!c.sandbox&&!c.production){byId("connect").disabled=true;say("TikTok is not enabled for this environment. Sandbox credentials are required before review.");return;}
  byId("environment").value=c.production?"production":"sandbox";
  if(incoming.code||incoming.error){
   const pending=JSON.parse(sessionStorage.getItem("nbl-tiktok-oauth")||"null");sessionStorage.removeItem("nbl-tiktok-oauth");
   if(!pending||pending.member!==member||incoming.state!==pending.state||!c[pending.mode]){say("Authorization state expired. Connect again.");return;}
   byId("environment").value=pending.mode;
   if(incoming.error){say("TikTok authorization was declined.");return;}
   await call("callback",{code:incoming.code,state:incoming.state});
  }
  await connection();
 }catch(e){say(e.message||"TikTok connection unavailable.");}
}
byId("environment").addEventListener("change",()=>{void connection();});
byId("connect").addEventListener("click",async()=>{
 byId("connect").disabled=true;byId("environment").disabled=true;try{
  const b=await call("begin",{display:byId("display").checked});
  const u=new URL(b.url);if(u.origin!=="https://www.tiktok.com"||u.pathname!=="/v2/auth/authorize/")throw Error("Invalid TikTok authorization URL");
  sessionStorage.setItem("nbl-tiktok-oauth",JSON.stringify({state:u.searchParams.get("state"),mode:mode(),member}));location.assign(u.href);
 }catch(e){say(e.message);byId("connect").disabled=false;byId("environment").disabled=false;}
});
byId("disconnect").addEventListener("click",async()=>{if(!confirm("Disconnect this TikTok account from Pulse?"))return;byId("disconnect").disabled=true;byId("environment").disabled=true;byId("connect").disabled=true;try{await call("disconnect");await connection();}catch(e){say(e.message);}finally{byId("disconnect").disabled=false;byId("environment").disabled=false;byId("connect").disabled=false;}});
byId("list").addEventListener("click",async()=>{const n=gen;try{const b=await call("videos");if(n!==gen)return;const list=byId("videos");list.replaceChildren();for(const v of b.videos){const url=new URL(v.share_url);if(url.protocol!=="https:"||!(url.hostname==="www.tiktok.com"||url.hostname==="tiktok.com"))continue;const li=document.createElement("li"),a=document.createElement("a");a.href=url.href;a.target="_blank";a.rel="noopener noreferrer";a.textContent=v.title||"TikTok video";li.append(a);list.append(li);}if(!list.children.length)say("No public videos returned.");}catch(e){say(e.message);}});
byId("kind").addEventListener("change",()=>{if(byId("kind").value==="direct")void loadCreator();else{creator=null;update();}});
byId("file").addEventListener("change",()=>{
 duration=0;byId("consent").checked=false;if(previewURL)URL.revokeObjectURL(previewURL);previewURL="";
 const f=byId("file").files[0];
 byId("selectedState").textContent=f?f.name+" · checking file, nothing sent":"No video selected · nothing sent.";
 const types=Object.freeze({"video/mp4":"video/mp4","video/quicktime":"video/quicktime","video/webm":"video/webm"});
 const safeType=Object.hasOwn(types,f?.type)?types[f.type]:null;
 if(!f||!safeType||f.size===0||f.size>20*1024*1024){byId("preview").hidden=true;byId("selectedState").textContent="Unsupported or oversized file · nothing sent.";postSay("Select an MP4, MOV or WebM video up to 20 MB.");update();return;}
 const player=byId("preview");
 player.removeAttribute("src");player.replaceChildren();
 const media=document.createElement("source");media.type=safeType;
 // A new MIME-locked media blob is used only by an HTMLMediaElement, never as markup.
 const safeVideo=new Blob([f],{type:safeType});
 previewURL=URL.createObjectURL(safeVideo);media.src=previewURL;
 player.append(media);player.load();player.hidden=false;postSay("");update();
});
byId("preview").addEventListener("loadedmetadata",()=>{
 duration=Number.isFinite(byId("preview").duration)?byId("preview").duration:0;
 byId("selectedState").textContent=duration>0?"Video preview ready · "+Math.round(duration)+"s. Nothing uploaded yet.":"Could not read this video's duration · nothing sent.";
 update();if(creator&&duration>creator.max_video_post_duration_sec)postSay("This video exceeds the creator's maximum duration.");
});
for(const id of ["privacy","comment","duet","stitch","commercial","own_brand","paid_brand","consent","title"])byId(id).addEventListener("change",update);
byId("commercial").addEventListener("change",()=>{if(!byId("commercial").checked){byId("own_brand").checked=false;byId("paid_brand").checked=false;}update();});
byId("post").addEventListener("submit",async ev=>{
 ev.preventDefault();if(!preflightPassed||byId("send").disabled||busy||!byId("consent").checked||!byId("file").files?.[0])return;
 const n=gen;busy=true;byId("environment").disabled=true;byId("connect").disabled=true;byId("disconnect").disabled=true;update();postSay("Sending your selected video to TikTok…");
 try{
  const f=new FormData();f.set("file",byId("file").files[0]);f.set("account",account);f.set("kind",byId("kind").value);f.set("duration",String(duration));f.set("title",byId("title").value);f.set("privacy",byId("privacy").value);
  for(const id of ["comment","duet","stitch","commercial","own_brand","paid_brand","consent"])f.set(id,byId(id).checked?"yes":"no");
  f.set("branded_consent",byId("consent").checked&&byId("paid_brand").checked?"yes":"no");
  const b=await call("upload",{},f);if(n!==gen)return;job=b.publish_id;byId("check").hidden=false;postSay("TikTok confirmed file upload. Processing is not yet complete.");void loadRecent();byId("consent").checked=false;poll(job,n,0);
 }catch(e){if(n===gen){if(e.publish_id){job=e.publish_id;byId("check").hidden=false;void loadRecent();}postSay(e.message);}}
 finally{busy=false;byId("environment").disabled=false;byId("connect").disabled=false;byId("disconnect").disabled=false;update();}
});
function poll(id,n,i){if(i>=15||n!==gen||job!==id)return;setTimeout(async()=>{if(n!==gen||job!==id)return;try{const b=await call("status",{publish_id:id});if(n!==gen||job!==id)return;const messages={PROCESSING_UPLOAD:"TikTok is processing the upload.",PROCESSING_DOWNLOAD:"TikTok is fetching the video.",SEND_TO_USER_INBOX:"TikTok delivered the video to your inbox; it is NOT publicly posted. Finish it in TikTok. If the notification does not open, publishing remains incomplete.",PUBLISH_COMPLETE:"TikTok confirms the post is published.",FAILED:"TikTok reports the post failed."};postSay((messages[b.status]||b.status)+(b.reason?" · "+b.reason:""));if(!["SEND_TO_USER_INBOX","PUBLISH_COMPLETE","FAILED"].includes(b.status))poll(id,n,i+1);}catch(e){if(n===gen)postSay("Automatic status check unavailable. Use Check posting status.");}},12000);}
byId("check").addEventListener("click",async()=>{if(!job)return;const n=gen,requestedJob=job;byId("check").disabled=true;try{const b=await call("status",{publish_id:requestedJob});if(n!==gen||job!==requestedJob)return;const messages={PROCESSING_UPLOAD:"TikTok is processing the upload.",PROCESSING_DOWNLOAD:"TikTok is fetching the video.",SEND_TO_USER_INBOX:"TikTok delivered the video to your inbox; it is NOT publicly posted. Finish it in TikTok. If the notification does not open, publishing remains incomplete.",PUBLISH_COMPLETE:"TikTok confirms the post is published.",FAILED:"TikTok reports the post failed."};postSay((messages[b.status]||b.status)+(b.reason?" · "+b.reason:""));}catch(e){postSay(e.message);}finally{byId("check").disabled=false;}});
void init();
