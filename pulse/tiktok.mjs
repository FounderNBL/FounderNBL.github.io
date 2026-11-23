// No provider tokens are stored in the browser; Clerk authenticates each member action.
const byId=id=>document.getElementById(id);
const api="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-tiktok-connect";
const key="pk_live_Y2xlcmsubmVhbnNsYW5kLm9yZyQ";
const args=new URL(location.href).searchParams;
const incoming={code:args.get("code"),state:args.get("state"),error:args.get("error")};
if(location.search)history.replaceState(null,"",location.pathname);
let clerk,member,account="",scopes=[],creator=null,previewURL="",duration=0,job=null,busy=false,gen=0;
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
 gen++;account="";scopes=[];creator=null;job=null;duration=0;
 byId("post").hidden=true;byId("disconnect").hidden=true;byId("list").hidden=true;byId("videos").replaceChildren();byId("identity").textContent="";byId("check").hidden=true;postSay("");
 byId("post").reset();byId("direct").hidden=true;byId("brand").hidden=true;byId("brandedConsent").hidden=true;byId("privacy").replaceChildren(new Option("Choose privacy",""));
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
 byId("send").disabled=busy||!account||!byId("consent").checked||!duration||(direct&&(!creator||!byId("privacy").value||duration>creator.max_video_post_duration_sec||(byId("commercial").checked&&!byId("own_brand").checked&&!byId("paid_brand").checked)));
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
async function connection(){
 clear();const n=gen,m=mode();
 try{
  const b=await call("connection");if(n!==gen||m!==mode())return;
  if(!b.connected){say("Connect your TikTok account to begin.");return;}
  account=b.account_ref;scopes=b.scopes;byId("identity").textContent="Connected TikTok account: "+b.label;
  byId("disconnect").hidden=false;byId("list").hidden=!scopes.includes("video.list");
  byId("kind").options[0].disabled=!scopes.includes("video.upload");byId("kind").options[1].disabled=!scopes.includes("video.publish");
  byId("kind").value=scopes.includes("video.upload")?"draft":"direct";
  byId("post").hidden=!scopes.includes("video.upload")&&!scopes.includes("video.publish");
  say("TikTok authorization received. Only granted permissions are enabled.");
  if(byId("kind").value==="direct"&&!byId("post").hidden)await loadCreator();
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
  byId("environment").value=c.sandbox?"sandbox":"production";
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
 const types=Object.freeze({"video/mp4":"video/mp4","video/quicktime":"video/quicktime","video/webm":"video/webm"});
 const safeType=Object.hasOwn(types,f?.type)?types[f.type]:null;
 if(!f||!safeType||f.size===0||f.size>20*1024*1024){byId("preview").hidden=true;postSay("Select an MP4, MOV or WebM video up to 20 MB.");update();return;}
 const player=byId("preview");
 player.removeAttribute("src");player.replaceChildren();
 const media=document.createElement("source");media.type=safeType;
 // A new MIME-locked media blob is used only by an HTMLMediaElement, never as markup.
 const safeVideo=new Blob([f],{type:safeType});
 previewURL=URL.createObjectURL(safeVideo);media.src=previewURL;
 player.append(media);player.load();player.hidden=false;postSay("");update();
});
byId("preview").addEventListener("loadedmetadata",()=>{duration=Number.isFinite(byId("preview").duration)?byId("preview").duration:0;update();if(creator&&duration>creator.max_video_post_duration_sec)postSay("This video exceeds the creator's maximum duration.");});
for(const id of ["privacy","comment","duet","stitch","commercial","own_brand","paid_brand","consent","title"])byId(id).addEventListener("change",update);
byId("commercial").addEventListener("change",()=>{if(!byId("commercial").checked){byId("own_brand").checked=false;byId("paid_brand").checked=false;}update();});
byId("post").addEventListener("submit",async ev=>{
 ev.preventDefault();if(byId("send").disabled||busy)return;
 const n=gen;busy=true;byId("environment").disabled=true;byId("connect").disabled=true;byId("disconnect").disabled=true;update();postSay("Sending your selected video to TikTok…");
 try{
  const f=new FormData();f.set("file",byId("file").files[0]);f.set("account",account);f.set("kind",byId("kind").value);f.set("duration",String(duration));f.set("title",byId("title").value);f.set("privacy",byId("privacy").value);
  for(const id of ["comment","duet","stitch","commercial","own_brand","paid_brand","consent"])f.set(id,byId(id).checked?"yes":"no");
  f.set("branded_consent",byId("consent").checked&&byId("paid_brand").checked?"yes":"no");
  const b=await call("upload",{},f);if(n!==gen)return;job=b.publish_id;byId("check").hidden=false;postSay("TikTok confirmed file upload. Processing is not yet complete.");byId("consent").checked=false;poll(job,n,0);
 }catch(e){if(n===gen){if(e.publish_id){job=e.publish_id;byId("check").hidden=false;}postSay(e.message);}}
 finally{busy=false;byId("environment").disabled=false;byId("connect").disabled=false;byId("disconnect").disabled=false;update();}
});
function poll(id,n,i){if(i>=15||n!==gen||job!==id)return;setTimeout(async()=>{if(n!==gen||job!==id)return;try{const b=await call("status",{publish_id:id});if(n!==gen||job!==id)return;const messages={PROCESSING_UPLOAD:"TikTok is processing the upload.",PROCESSING_DOWNLOAD:"TikTok is fetching the video.",SEND_TO_USER_INBOX:"Draft ready: open your TikTok inbox notification to finish posting.",PUBLISH_COMPLETE:"TikTok confirms the post is published.",FAILED:"TikTok reports the post failed."};postSay((messages[b.status]||b.status)+(b.reason?" · "+b.reason:""));if(!["SEND_TO_USER_INBOX","PUBLISH_COMPLETE","FAILED"].includes(b.status))poll(id,n,i+1);}catch(e){if(n===gen)postSay("Automatic status check unavailable. Use Check posting status.");}},12000);}
byId("check").addEventListener("click",async()=>{if(!job)return;const n=gen;byId("check").disabled=true;try{const b=await call("status",{publish_id:job});if(n!==gen)return;const messages={PROCESSING_UPLOAD:"TikTok is processing the upload.",PROCESSING_DOWNLOAD:"TikTok is fetching the video.",SEND_TO_USER_INBOX:"Draft ready: open your TikTok inbox notification to finish posting.",PUBLISH_COMPLETE:"TikTok confirms the post is published.",FAILED:"TikTok reports the post failed."};postSay((messages[b.status]||b.status)+(b.reason?" · "+b.reason:""));}catch(e){postSay(e.message);}finally{byId("check").disabled=false;}});
void init();
