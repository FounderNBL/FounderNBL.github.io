// No provider tokens are stored in the browser; Clerk authenticates each member action.
const $=id=>document.getElementById(id);
const api="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-tiktok-connect";
const key="pk_live_Y2xlcmsubmVhbnNsYW5kLm9yZyQ";
const args=new URL(location.href).searchParams;
const incoming={code:args.get("code"),state:args.get("state"),error:args.get("error")};
if(location.search)history.replaceState(null,"",location.pathname);
let clerk,member,account="",scopes=[],creator=null,previewURL="",duration=0,job=null,busy=false,gen=0;
const mode=()=>$("environment").value;
const say=s=>$("status").textContent=s;
const postSay=s=>$("postingStatus").textContent=s;
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
 $("post").hidden=true;$("disconnect").hidden=true;$("list").hidden=true;$("videos").replaceChildren();$("identity").textContent="";$("check").hidden=true;postSay("");
 $("post").reset();$("direct").hidden=true;$("brand").hidden=true;$("brandedConsent").hidden=true;$("privacy").replaceChildren(new Option("Choose privacy",""));
 if(previewURL)URL.revokeObjectURL(previewURL);previewURL="";$("preview").removeAttribute("src");$("preview").load();$("preview").hidden=true;
}
function update(){
 const direct=$("kind").value==="direct";$("direct").hidden=!direct;
 $("brand").hidden=!$("commercial").checked;$("brandedConsent").hidden=!($("commercial").checked&&$("paid_brand").checked);
 $("brandNotice").textContent=$("commercial").checked?($("paid_brand").checked?"Your video will be labeled Paid partnership. Private visibility is unavailable.":$("own_brand").checked?"Your video will be labeled Promotional content.":"Select at least one disclosure."):"";
 const paid=$("commercial").checked&&$("paid_brand").checked;
 for(const option of $("privacy").options)if(option.value==="SELF_ONLY")option.disabled=paid;
 if(paid&&$("privacy").value==="SELF_ONLY")$("privacy").value="";
 $("send").textContent=direct?"Publish to TikTok":"Send draft to TikTok";
 $("send").disabled=busy||!account||!$("consent").checked||!duration||(direct&&(!creator||!$("privacy").value||duration>creator.max_video_post_duration_sec||($("commercial").checked&&!$("own_brand").checked&&!$("paid_brand").checked)));
}
async function loadCreator(){
 creator=null;update();const n=gen,m=mode();
 try{
  const b=await call("creator");if(n!==gen||m!==mode())return;
  creator=b.creator;$("creator").textContent="Posting to "+creator.creator_nickname+" (@"+creator.creator_username+") · maximum "+creator.max_video_post_duration_sec+" seconds";
  $("privacy").replaceChildren(new Option("Choose privacy",""));
  const names={PUBLIC_TO_EVERYONE:"Everyone",MUTUAL_FOLLOW_FRIENDS:"Friends",FOLLOWER_OF_CREATOR:"Followers",SELF_ONLY:"Only me"};
  for(const v of creator.privacy_level_options||[])if(names[v]&&(mode()!=="sandbox"||v==="SELF_ONLY"))$("privacy").add(new Option(names[v],v));
  for(const name of ["comment","duet","stitch"]){$(name).checked=false;$(name).disabled=!!creator[name+"_disabled"];}
 }catch(e){postSay(e.message);}finally{update();}
}
async function connection(){
 clear();const n=gen,m=mode();
 try{
  const b=await call("connection");if(n!==gen||m!==mode())return;
  if(!b.connected){say("Connect your TikTok account to begin.");return;}
  account=b.account_ref;scopes=b.scopes;$("identity").textContent="Connected TikTok account: "+b.label;
  $("disconnect").hidden=false;$("list").hidden=!scopes.includes("video.list");
  $("kind").options[0].disabled=!scopes.includes("video.upload");$("kind").options[1].disabled=!scopes.includes("video.publish");
  $("kind").value=scopes.includes("video.upload")?"draft":"direct";
  $("post").hidden=!scopes.includes("video.upload")&&!scopes.includes("video.publish");
  say("TikTok authorization received. Only granted permissions are enabled.");
  if($("kind").value==="direct"&&!$("post").hidden)await loadCreator();
 }catch(e){say(e.message);}finally{update();}
}
async function init(){
 try{
  if(!window.Clerk)await new Promise((resolve,reject)=>{const s=document.createElement("script");s.src="https://clerk.newbeansland.org/npm/@clerk/clerk-js@6/dist/clerk.browser.js";s.setAttribute("data-clerk-publishable-key",key);s.onload=resolve;s.onerror=reject;document.head.append(s);});
  clerk=window.Clerk;await clerk.load();member=clerk.user?.id;if(!member||!clerk.session){say("Sign in through Pulse before connecting TikTok.");return;}
  clerk.addListener?.(s=>{if(s.user?.id!==member){clear();member=null;$("settings").hidden=true;say("NBL account changed. Return to Pulse and reopen this page.");}});
  const c=await call("configuration");$("settings").hidden=false;
  for(const o of $("environment").options)o.disabled=!c[o.value];
  if(!c.sandbox&&!c.production){$("connect").disabled=true;say("TikTok is not enabled for this environment. Sandbox credentials are required before review.");return;}
  $("environment").value=c.sandbox?"sandbox":"production";
  if(incoming.code||incoming.error){
   const pending=JSON.parse(sessionStorage.getItem("nbl-tiktok-oauth")||"null");sessionStorage.removeItem("nbl-tiktok-oauth");
   if(!pending||pending.member!==member||incoming.state!==pending.state||!c[pending.mode]){say("Authorization state expired. Connect again.");return;}
   $("environment").value=pending.mode;
   if(incoming.error){say("TikTok authorization was declined.");return;}
   await call("callback",{code:incoming.code,state:incoming.state});
  }
  await connection();
 }catch(e){say(e.message||"TikTok connection unavailable.");}
}
$("environment").addEventListener("change",()=>{void connection();});
$("connect").addEventListener("click",async()=>{
 $("connect").disabled=true;$("environment").disabled=true;try{
  const b=await call("begin",{display:$("display").checked});
  const u=new URL(b.url);if(u.origin!=="https://www.tiktok.com"||u.pathname!=="/v2/auth/authorize/")throw Error("Invalid TikTok authorization URL");
  sessionStorage.setItem("nbl-tiktok-oauth",JSON.stringify({state:u.searchParams.get("state"),mode:mode(),member}));location.assign(u.href);
 }catch(e){say(e.message);$("connect").disabled=false;$("environment").disabled=false;}
});
$("disconnect").addEventListener("click",async()=>{if(!confirm("Disconnect this TikTok account from Pulse?"))return;$("disconnect").disabled=true;$("environment").disabled=true;$("connect").disabled=true;try{await call("disconnect");await connection();}catch(e){say(e.message);}finally{$("disconnect").disabled=false;$("environment").disabled=false;$("connect").disabled=false;}});
$("list").addEventListener("click",async()=>{const n=gen;try{const b=await call("videos");if(n!==gen)return;const list=$("videos");list.replaceChildren();for(const v of b.videos){const url=new URL(v.share_url);if(url.protocol!=="https:"||!(url.hostname==="www.tiktok.com"||url.hostname==="tiktok.com"))continue;const li=document.createElement("li"),a=document.createElement("a");a.href=url.href;a.target="_blank";a.rel="noopener noreferrer";a.textContent=v.title||"TikTok video";li.append(a);list.append(li);}if(!list.children.length)say("No public videos returned.");}catch(e){say(e.message);}});
$("kind").addEventListener("change",()=>{if($("kind").value==="direct")void loadCreator();else{creator=null;update();}});
$("file").addEventListener("change",()=>{
 duration=0;$("consent").checked=false;if(previewURL)URL.revokeObjectURL(previewURL);previewURL="";
 const f=$("file").files[0];if(!f||f.size>20*1024*1024){$("preview").hidden=true;postSay("Select a supported video up to 20 MB.");update();return;}
 previewURL=URL.createObjectURL(f);$("preview").src=previewURL;$("preview").hidden=false;postSay("");update();
});
$("preview").addEventListener("loadedmetadata",()=>{duration=Number.isFinite($("preview").duration)?$("preview").duration:0;update();if(creator&&duration>creator.max_video_post_duration_sec)postSay("This video exceeds the creator's maximum duration.");});
for(const id of ["privacy","comment","duet","stitch","commercial","own_brand","paid_brand","consent","title"])$(id).addEventListener("change",update);
$("commercial").addEventListener("change",()=>{if(!$("commercial").checked){$("own_brand").checked=false;$("paid_brand").checked=false;}update();});
$("post").addEventListener("submit",async ev=>{
 ev.preventDefault();if($("send").disabled||busy)return;
 const n=gen;busy=true;$("environment").disabled=true;$("connect").disabled=true;$("disconnect").disabled=true;update();postSay("Sending your selected video to TikTok…");
 try{
  const f=new FormData();f.set("file",$("file").files[0]);f.set("account",account);f.set("kind",$("kind").value);f.set("duration",String(duration));f.set("title",$("title").value);f.set("privacy",$("privacy").value);
  for(const id of ["comment","duet","stitch","commercial","own_brand","paid_brand","consent"])f.set(id,$(id).checked?"yes":"no");
  f.set("branded_consent",$("consent").checked&&$("paid_brand").checked?"yes":"no");
  const b=await call("upload",{},f);if(n!==gen)return;job=b.publish_id;$("check").hidden=false;postSay("TikTok confirmed file upload. Processing is not yet complete.");$("consent").checked=false;poll(job,n,0);
 }catch(e){if(n===gen){if(e.publish_id){job=e.publish_id;$("check").hidden=false;}postSay(e.message);}}
 finally{busy=false;$("environment").disabled=false;$("connect").disabled=false;$("disconnect").disabled=false;update();}
});
function poll(id,n,i){if(i>=15||n!==gen||job!==id)return;setTimeout(async()=>{if(n!==gen||job!==id)return;try{const b=await call("status",{publish_id:id});if(n!==gen||job!==id)return;const messages={PROCESSING_UPLOAD:"TikTok is processing the upload.",PROCESSING_DOWNLOAD:"TikTok is fetching the video.",SEND_TO_USER_INBOX:"Draft ready: open your TikTok inbox notification to finish posting.",PUBLISH_COMPLETE:"TikTok confirms the post is published.",FAILED:"TikTok reports the post failed."};postSay((messages[b.status]||b.status)+(b.reason?" · "+b.reason:""));if(!["SEND_TO_USER_INBOX","PUBLISH_COMPLETE","FAILED"].includes(b.status))poll(id,n,i+1);}catch(e){if(n===gen)postSay("Automatic status check unavailable. Use Check posting status.");}},12000);}
$("check").addEventListener("click",async()=>{if(!job)return;const n=gen;$("check").disabled=true;try{const b=await call("status",{publish_id:job});if(n!==gen)return;const messages={PROCESSING_UPLOAD:"TikTok is processing the upload.",PROCESSING_DOWNLOAD:"TikTok is fetching the video.",SEND_TO_USER_INBOX:"Draft ready: open your TikTok inbox notification to finish posting.",PUBLISH_COMPLETE:"TikTok confirms the post is published.",FAILED:"TikTok reports the post failed."};postSay((messages[b.status]||b.status)+(b.reason?" · "+b.reason:""));}catch(e){postSay(e.message);}finally{$("check").disabled=false;}});
void init();
