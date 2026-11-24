// Founder-only Instagram Direct inbox embedded in Pulse.
// The signed-in Pulse shell supplies authenticated Clerk requests. No tokens,
// DM bodies, private participant IDs or message content go into telemetry.
function el(tag,className,text){
 const out=document.createElement(tag);
 if(className)out.className=className;
 if(text!==undefined)out.textContent=String(text);
 return out;
}
function readableTime(value){
 const when=new Date(String(value||""));
 return Number.isNaN(when.getTime())?"":when.toLocaleString();
}
export function errorText(error){
 const name=String(error?.message||"").slice(0,120);
 const messages={
  instagram_dm_permission_or_token_required:"Meta denied this request. If Standard Access is active, test with an accepted app-role account; do not reconnect a working inbox unless the token has expired.",
  instagram_dm_permission_missing:"Meta authorization completed, but the Login for Business configuration did not grant instagram_manage_messages. Add that permission to the existing Meta login configuration, then reconnect Instagram DMs in Pulse.",
  instagram_dm_page_access_required:"The saved Instagram grant must include access to the linked New Beansland Facebook Page. Check pages_manage_metadata, pages_show_list, and pages_messaging in the existing Meta login configuration, and approve the Page once.",
  instagram_dm_connection_required:"Connect Instagram DMs to @nbl_world, then refresh the inbox. You can test with Meta app roles before App Review.",
  instagram_dm_oauth_expired:"The Instagram DM connection has expired. Press Connect Instagram DMs to authorize it again.",
  instagram_dm_connection_unavailable:"The saved Instagram authorization could not be read. Press Connect Instagram DMs again.",
  instagram_meta_secrets_not_configured:"Meta Instagram authorization is not configured for this app. Check the existing Meta app ID, login configuration and encryption secret.",
  official_instagram_not_accessible:"Pulse cannot verify the official @nbl_world Instagram account. Check the existing Meta business connection.",
  instagram_token_secret_missing:"The official Instagram API token is not configured.",
  instagram_dm_reply_window_closed:"Meta rejected the reply as outside its 24-hour window. This can happen even when Pulse sees a recent inbound. Do not repeat the send without checking the diagnostics.",
  conversation_not_owned:"This conversation does not belong to the connected Instagram account.",
  instagram_dm_meta_unavailable:"Instagram messaging is temporarily unavailable. Try Refresh.",
  instagram_dm_routing_not_owner:"Meta reports that another app owns this conversation. Check Conversation Routing in Meta Business Suite.",
  instagram_dm_routing_owned:"Meta Conversation Routing assigns this thread to another app. Check the conversation owner in Meta Business Suite.",
  instagram_dm_rate_limited:"Instagram asked us to slow down. Try again later.",
  instagram_dm_send_unconfirmed:"Meta did not confirm the reply. Refresh before trying again."
 };
 const code=Number(error?.metaCode)||0,subcode=Number(error?.metaSubcode)||0;
 return (messages[name]||"Instagram: "+name.replace(/_/g," ")||"Instagram inbox unavailable.")+(code?" (Meta code "+code+(subcode?"/"+subcode:"")+")":"")+(typeof error?.metaTrace==="string"&&/^[A-Za-z0-9_-]{6,100}$/.test(error.metaTrace)?" · Trace: "+error.metaTrace:"");
}
let openInstagramThread=null;
export function showPulseInstagramThread(id){
 if(openInstagramThread&&/^[A-Za-z0-9_=-]{6,512}$/.test(String(id)))void openInstagramThread(String(id));
}
export function mountInstagramInbox(invoke){
 const panel=document.querySelector("#pulseInstagramInbox");
 const nav=document.querySelector("#pulseInstagramInboxNav");
 if(!panel||!nav||panel.dataset.mounted==="true")return;
 panel.dataset.mounted="true";
 nav.hidden=false;
 const status=panel.querySelector("#pulseIgStatus");
 const conversations=panel.querySelector("#pulseIgConversations");
 const thread=panel.querySelector("#pulseIgThread");
 const title=panel.querySelector("#pulseIgThreadTitle");
 const form=panel.querySelector("#pulseIgReplyForm");
 const field=panel.querySelector("#pulseIgReplyText");
 const submit=form.querySelector("button[type=submit]");
 const replyStatus=panel.querySelector("#pulseIgReplyStatus");
 const refresh=panel.querySelector("#pulseIgRefresh");
 const connect=panel.querySelector("#pulseIgConnect");
 const close=panel.querySelector("#pulseIgClose");
 const check=panel.querySelector("#pulseIgCheck");
 const checkStatus=panel.querySelector("#pulseIgCheckStatus");
 let selected=null,loading=false,pending=false,lastReadAt=0,readGeneration=0,canReply=false;
 const connected=new URL(location.href).searchParams.get("instagram_connect");
 const say=s=>{status.textContent=s;};
 const call=(path,payload)=>invoke("/inbox/"+path,payload);
 if(connected){
   say(connected==="instagram_authorization_received"?
    "Meta authorization received. Press Refresh inbox to verify messaging access.":
    connected==="instagram_dm_permission_missing"?
    "Meta connected, but instagram_manage_messages is missing from the existing Facebook Login for Business configuration. Add that permission in Meta, then reconnect Instagram DMs.":
    "Instagram connection not completed ("+String(connected).slice(0,60)+"). Check Meta authorization before retrying.");
 }
 check?.addEventListener("click",async()=>{
  if(loading||pending||check.disabled)return;
  check.disabled=true;
  checkStatus.textContent="Checking actual Meta permission, Page and inbox access. No messages sent.";
  try{
   const result=await call("check",{action:"check"});
   if(result.ready===true&&result.pageAccess==="verified"&&result.inboxRead==="verified"){
    checkStatus.textContent="Meta verified @nbl_world inbox access. "+(result.hasAccessibleConversations?"At least one conversation is accessible.":"No conversations in the checked result.")+" No message sent. An eligible incoming message is still needed before replying.";
   }else{
    checkStatus.textContent="Instagram inbox NOT ready: "+errorText({message:result.reason||"instagram_dm_meta_unavailable"})+" No message sent.";
   }
  }catch(error){
   checkStatus.textContent="Instagram check failed: "+errorText(error)+" No message sent.";
  }finally{check.disabled=false;}
 });
 connect.addEventListener("click",async()=>{
   connect.disabled=true;
   say("Opening official Meta authorization for @nbl_world…");
   try{
     const auth=await invoke("/begin",{});
     const url=new URL(auth.authorization_url);
     if(url.protocol!=="https:"||url.hostname!=="www.facebook.com"||!url.pathname.endsWith("/dialog/oauth"))
       throw Error("Invalid Meta authorization URL");
     location.assign(url.href);
   }catch(error){say(errorText(error));connect.disabled=false;}
 });
 function show(){
  panel.hidden=false;
  // Keep focus inside Pulse instead of navigating to another application.
  panel.scrollIntoView({behavior:"smooth",block:"start"});
  void loadList(false);
 }
 openInstagramThread=async id=>{
  panel.hidden=false;
  panel.scrollIntoView({behavior:"smooth",block:"start"});
  await loadList(false);
  await openThread(id);
 };
 nav.addEventListener("click",show);
 close.addEventListener("click",()=>{panel.hidden=true;nav.focus();});
 refresh.addEventListener("click",()=>{void loadList(false);});
 function updateReply(allowed){
  canReply=allowed;
  form.hidden=!selected;
  submit.disabled=pending||!canReply;
  field.disabled=pending||!canReply;
  field.placeholder=canReply?"Reply to this Instagram DM":"Meta's 24-hour reply window is closed";
 }
 function renderMessages(data){
  selected=data.conversation_id;
  const participant=data.participant||{};
  title.textContent="@"+(participant.username||"Instagram user")+" · @nbl_world";
  thread.replaceChildren();
  const messages=Array.isArray(data.messages)?data.messages:[];
  if(!messages.length)thread.append(el("p","social-meta","No messages available in this thread."));
  for(const m of messages){
   const line=el("article","pulse-ig-message"+(m.sender_id===participant.id?"":" pulse-ig-outgoing"));
   const who=el("strong",null,m.sender_id===participant.id?"@"+(participant.username||"Instagram user"):"@nbl_world");
   const stamp=el("small","social-meta",readableTime(m.created_at));
   const text=el("p",null,m.text||"[Attachment or unsupported message type]");
   line.append(who,stamp,text);thread.append(line);
  }
  const flag=v=>v===true?"yes":v===false?"no":"unknown";
  const kind=["text","sticker","share","attachment","unknown","none"].includes(data.last_inbound_kind)?data.last_inbound_kind:"unknown";
  thread.append(el("p","social-meta","Diagnostics · App owns thread: "+flag(data.is_owner)+" · Last inbound: "+kind+" · Recipient identity matches: "+flag(data.recipient_identity_matches)+" · Token identity matches: "+flag(data.token_identity_matches)));
  updateReply(data.reply_window_open===true&&data.is_owner!==false);
  say(data.is_owner===false?"Meta reports another app owns this thread.":data.reply_window_open===true?
   "Conversation loaded from Instagram. Replies go directly to that person.":
   "Messages loaded. A new message from the person is required before Pulse can reply.");
  lastReadAt=Date.now();
 }
 async function openThread(id,quiet=false){
  if(!/^[A-Za-z0-9_=-]{6,512}$/.test(id)||pending)return;
  const generation=++readGeneration;
  if(!quiet){updateReply(false);replyStatus.textContent="";}
  try{
   const result=await call("thread",{action:"thread",conversation_id:id});
   if(panel.hidden||generation!==readGeneration||pending)return;
   renderMessages(result);
  }catch(error){if(!quiet)say(errorText(error));}
 }
 async function loadList(quiet=false){
  if(loading||panel.hidden||pending)return;
  loading=true;
  if(!quiet)say("Loading @nbl_world Instagram messages…");
  try{
   const result=await call("list",{action:"list"});
   if(panel.hidden)return;
   conversations.replaceChildren();
   const entries=Array.isArray(result.conversations)?result.conversations:[];
   if(!entries.length)conversations.append(el("p","social-meta","Meta returned no accessible Instagram conversations. Refresh after checking for incoming messages."));
   for(const item of entries){
    if(!/^[A-Za-z0-9_=-]{6,512}$/.test(String(item.id||"")))continue;
    const name=item.people?.[0]?.username||"Instagram conversation";
    const button=el("button","btn small pulse-ig-conversation","@"+name);
    button.type="button";button.setAttribute("aria-label","Read Instagram messages from @"+name);
    const time=el("small","social-meta",readableTime(item.updated_at));
    button.append(time);
    button.addEventListener("click",()=>void openThread(String(item.id)));
    conversations.append(button);
   }
   if(result.has_more)conversations.append(el("p","social-meta","Showing the 25 most recent conversations."));
   if(selected)await openThread(selected,true);
   if(!selected)say(entries.length?"Instagram inbox connected. Choose a conversation to read and reply.":"Meta returned no accessible conversations.");
  }catch(error){say(errorText(error));}
  finally{loading=false;}
 }
 form.addEventListener("submit",async event=>{
  event.preventDefault();
  if(pending||!selected||!canReply)return;
  const message=field.value.trim();
  if(!message||new TextEncoder().encode(message).length>1000){replyStatus.textContent="Enter a message of up to 1,000 UTF-8 bytes.";return;}
  if(!window.confirm("Send this private reply from @nbl_world on Instagram?"))return;
  pending=true;++readGeneration;updateReply(canReply);
  replyStatus.textContent="Sending reply to Instagram…";
  say("Sending reply to Instagram…");
  try{
   const id=selected;
   const out=await call("reply",{action:"reply",conversation_id:id,message,confirm:"send"});
   if(out.sent!==true)throw Error("instagram_dm_send_unconfirmed");
   field.value="";
   replyStatus.textContent="Instagram confirmed your reply was sent.";
   pending=false;updateReply(canReply);
   await openThread(id,true);
   say("Instagram confirmed your reply was sent.");
  }catch(error){const detail=errorText(error);replyStatus.textContent=detail;say(detail);}
  finally{pending=false;updateReply(canReply);}
 });
 // Poll only while the Founder has this inbox open and the tab is visible.
 // Never persist message content to storage, telemetry or NBL Messenger.
 const poll=window.setInterval(()=>{
  if(!panel.isConnected){window.clearInterval(poll);return;}
  if(!panel.hidden&&document.visibilityState==="visible"&&!loading&&!pending&&Date.now()-lastReadAt>20000)
   void loadList(true);
 },30000);
}
