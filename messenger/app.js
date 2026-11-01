(()=>{
"use strict";

// Independent human-messaging runtime. Beans remains on its own AI endpoint.
const SOCIAL_API="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-social";
const PUSH_API="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-messenger-push";
const PUSH_OWNER_KEY="nbl-messenger-push-clerk-user-v1";
const CLERK_PUBLISHABLE_KEY="pk_live_Y2xlcmsubmV3YmVhbnNsYW5kLm9yZyQ";
const ACCOUNT_PORTAL="https://accounts.newbeansland.org";
const INVITE_URL="https://newbeansland.org/messenger/";
const $=selector=>document.querySelector(selector);
const state={clerk:null,me:null,threads:[],selectedId:null,selected:null,busy:false,realtimeThread:null,realtimeStop:null,inboxStop:null};
let activeAuthUserId;
let authSyncGeneration=0;
let pushConfig=null;
const status=message=>{const el=$("[data-chat-status]");if(el)el.textContent=message;};
const lastSeenMessages=new Map();
function rememberIncoming(threadId,messages,{announce=false}={}){
  if(!threadId)return;
  const rows=Array.isArray(messages)?messages:[];
  const old=lastSeenMessages.get(threadId);
  const seen=new Set(rows.filter(item=>item?.id).map(item=>String(item.id)));
  const me=String(state.me?.handle||"").toLowerCase();
  const incoming=Boolean(announce&&old&&rows.some(item=>item?.id&&!old.has(String(item.id))
    &&!item.deleted&&String(item.sender?.handle||"").toLowerCase()!==me));
  lastSeenMessages.set(threadId,seen);
  if(incoming&&!state.selected?.muted)window.NBLInfinitySound?.play("people");
}
const node=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=String(text);return el;};

function signInUrl(){
  // Sign-in returns to this standalone NBL Messenger route.
  const dest=new URL(window.location.href);
  dest.hash="";
  if(!["https:","http:"].includes(dest.protocol))return ACCOUNT_PORTAL+"/sign-in";
  return ACCOUNT_PORTAL+"/sign-in?redirect_url="+encodeURIComponent(dest.href);
}
// A link from NBL Social may suggest a public handle, never create or send a DM.
// Resolve the recipient through existing server-controlled Messenger permissions
// only AFTER the member explicitly presses Open.
function socialDMIntent(){
  const raw=new URL(window.location.href).searchParams.get("dm")||"";
  const handle=raw.replace(/^@/,"");
  return /^[A-Za-z0-9_-]{2,64}$/.test(handle)?handle:null;
}
function clerkDomain(){
  const encoded=(CLERK_PUBLISHABLE_KEY.split("_")[2]||"").replace(/-/g,"+").replace(/_/g,"/");
  return atob(encoded.padEnd(Math.ceil(encoded.length/4)*4,"=")).replace(/\$/,"");
}
async function clerk(){
  if(state.clerk)return state.clerk;
  const domain=clerkDomain(),src="https://"+domain+"/npm/@clerk/clerk-js@6/dist/clerk.browser.js";
  if(!window.Clerk){
    await new Promise((resolve,reject)=>{
      const script=document.createElement("script");
      script.src=src;script.async=true;script.crossOrigin="anonymous";
      script.setAttribute("data-clerk-publishable-key",CLERK_PUBLISHABLE_KEY);
      script.onload=resolve;script.onerror=()=>reject(new Error("NBL account service could not load."));
      document.head.appendChild(script);
    });
  }
  if(!window.Clerk)throw new Error("NBL account service is unavailable.");
  await window.Clerk.load();
  state.clerk=window.Clerk;
  return state.clerk;
}
async function authToken(){
  const session=(await clerk()).session;
  if(!session||!state.clerk.isSignedIn)throw new Error("Sign in with your NBL account first.");
  const token=await session.getToken();
  if(!token)throw new Error("NBL session expired. Sign in again.");
  return token;
}
async function social(body){
  // Bind this request to a real Clerk identity. A delayed response from A must
  // never update B's Messenger UI after logout/account-switch.
  const userId=state.clerk?.user?.id||null;
  const generation=authSyncGeneration;
  const assertCurrent=()=>{
    if(!userId||!state.clerk?.isSignedIn||state.clerk?.user?.id!==userId||generation!==authSyncGeneration){
      throw new Error("Your NBL account changed. Retry from the current account.");
    }
  };
  const token=await authToken();
  assertCurrent();
  const response=await fetch(SOCIAL_API,{
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},
    body:JSON.stringify(body),cache:"no-store"
  });
  const payload=await response.json().catch(()=>({}));
  assertCurrent();
  if(!response.ok||payload?.ok!==true){
    const error=new Error(payload?.message||"NBL Messenger is temporarily unavailable. Try again.");
    error.status=response.status;error.reason=payload?.reason;throw error;
  }
  return payload;
}

function supportsPhonePush(){
 return Boolean(window.isSecureContext!==false
   &&typeof window.Notification!=="undefined"
   &&"serviceWorker" in navigator
   &&"PushManager" in window);
}
function setPushStatus(message){
 const element=$("[data-chat-notify-status]");
 if(element)element.textContent=message;
}
function base64UrlBytes(text){
 const normalized=String(text||"").replace(/-/g,"+").replace(/_/g,"/");
 const padded=normalized.padEnd(Math.ceil(normalized.length/4)*4,"=");
 const value=atob(padded);
 const bytes=new Uint8Array(value.length);
 for(let i=0;i<value.length;i++)bytes[i]=value.charCodeAt(i);
 return bytes;
}
async function pushApi(body){
 // Use the SAME signed-in Clerk account isolation as normal NBL Messenger.
 const userId=state.clerk?.user?.id||null,generation=authSyncGeneration;
 const token=await authToken();
 const current=()=>Boolean(userId&&generation===authSyncGeneration&&state.clerk?.user?.id===userId&&state.clerk?.isSignedIn);
 if(!current())throw Error("NBL account changed. Retry from your current account.");
 const res=await fetch(PUSH_API,{
  method:"POST",headers:{"content-type":"application/json",authorization:"Bearer "+token},
  cache:"no-store",body:JSON.stringify(body)
 });
 const payload=await res.json().catch(()=>({}));
 if(!current())throw Error("NBL account changed. Retry from your current account.");
 if(!res.ok||payload?.ok!==true)throw Error(payload?.reason||"Phone notification service unavailable.");
 return payload;
}
async function messengerWorker(){
 if(!("serviceWorker" in navigator))throw Error("This browser does not support NBL phone notifications.");
 return await navigator.serviceWorker.register("/messenger/sw.js",{scope:"/messenger/"});
}
function updatePhoneButtons(enabled){
 $("[data-chat-notify-enable]").hidden=enabled;
 $("[data-chat-notify-disable]").hidden=!enabled;
}
async function subscription(){
 if(!supportsPhonePush())return null;
 const reg=await messengerWorker();
 return await reg.pushManager.getSubscription();
}
async function loadPhoneSettings(){
 const card=$("[data-chat-notification-settings]");
 card.hidden=false;
 if(!supportsPhonePush()){
  updatePhoneButtons(false);
  $("[data-chat-notify-enable]").disabled=true;
  setPushStatus("Your browser cannot receive background web push. The existing NBL Infinity in-app sound still works.");
  return;
 }
 $("[data-chat-notify-enable]").disabled=false;
 try{
  const config=await pushApi({action:"push_config"});
  pushConfig=config;
  const panel=$("[data-chat-notification-founder]");
  panel.hidden=config.founderControls!==true;
  if(config.founderControls===true){
   $("[data-chat-notify-title]").value=config.title||"NBL Messenger";
   $("[data-chat-notify-body]").value=config.body||"You have a new message.";
   $("[data-chat-notify-sender]").checked=config.showSender===true;
  }
  const current=await subscription();
  const enabled=Boolean(current&&window.Notification.permission==="granted");
  updatePhoneButtons(enabled);
  setPushStatus(enabled
   ?"Phone alerts enabled on this browser. The phone controls background sound and appearance."
   :"Phone alerts are off on this browser. Enable them to receive messages when Messenger is closed.");
 }catch(error){
  updatePhoneButtons(false);
  $("[data-chat-notification-founder]").hidden=true;
  setPushStatus(error.message||"Phone notification service unavailable.");
 }
}
async function enablePhonePush(){
 if(!supportsPhonePush()){setPushStatus("Background web push is unavailable in this browser.");return;}
 try{
  // Ask on the click itself, not on boot. Browser notification consent is optional.
  const permission=await window.Notification.requestPermission();
  if(permission!=="granted"){setPushStatus("Phone alerts were not enabled. You can allow notifications in your browser settings.");return;}
  const config=pushConfig||await pushApi({action:"push_config"});
  const reg=await messengerWorker();
  const existing=await reg.pushManager.getSubscription();
  // The VAPID application-server key is stable. A stale subscription can be
  // safely replaced and then bound only to this verified Clerk identity.
  if(existing)await existing.unsubscribe();
  const sub=await reg.pushManager.subscribe({
   userVisibleOnly:true,applicationServerKey:base64UrlBytes(config.publicKey)
  });
  try{
   await pushApi({action:"push_subscribe",subscription:sub.toJSON()});
  }catch(error){await sub.unsubscribe().catch(()=>{});throw error;}
  try{localStorage.setItem(PUSH_OWNER_KEY,state.clerk.user.id);}catch{}
  updatePhoneButtons(true);
  setPushStatus("Phone alerts enabled. Tap Preview to see a real phone notification.");
 }catch(error){setPushStatus(error.message||"Could not enable phone alerts.");}
}
async function disablePhonePush(){
 if(!supportsPhonePush())return;
 try{
  const sub=await subscription();
  if(sub){
   try{await pushApi({action:"push_unsubscribe",endpoint:sub.endpoint});}catch{}
   await sub.unsubscribe();
  }
  try{localStorage.removeItem(PUSH_OWNER_KEY);}catch{}
  updatePhoneButtons(false);
  setPushStatus("Phone alerts off on this device. In-app NBL Infinity sound remains available.");
 }catch(error){setPushStatus(error.message||"Could not disable phone alerts.");}
}
async function forgetPushForDifferentAccount(newId){
 let owner="";
 try{owner=localStorage.getItem(PUSH_OWNER_KEY)||"";}catch{}
 if(!owner||owner===newId)return;
 // Prevent another account on this browser receiving the previous owner's
 // phone notifications. Unsubscribe the browser endpoint before showing UI.
 try{
  if("serviceWorker" in navigator){
   const reg=await navigator.serviceWorker.getRegistration("/messenger/");
   const old=await reg?.pushManager?.getSubscription();
   await old?.unsubscribe();
  }
 }catch{}
 try{localStorage.removeItem(PUSH_OWNER_KEY);}catch{}
}
async function previewPhoneNotification(){
 if(typeof window.Notification==="undefined"||!("serviceWorker" in navigator)){
  setPushStatus("Your browser does not support phone notification previews.");return;
 }
 try{
  const permission=await window.Notification.requestPermission();
  if(permission!=="granted"){setPushStatus("Allow notifications to see a phone preview.");return;}
  const reg=await messengerWorker();
  const conf=pushConfig||{title:"NBL Messenger",body:"You have a new message.",showSender:true};
  await reg.showNotification(conf.title||"NBL Messenger",{
   body:conf.body||"You have a new message.",
   icon:"/messenger/icon.svg",badge:"/messenger/icon.svg",
   tag:"nbl-messenger-preview",data:{url:"/messenger/"}
  });
  setPushStatus("Phone preview shown. Your phone controls its system sound; Test ♾️ sound plays the original NBL audio inside Messenger.");
 }catch(error){setPushStatus(error.message||"Phone preview unavailable.");}
}
async function saveFounderPhoneTemplate(event){
 event.preventDefault();
 if(state.me?.role!=="founder")return;
 const title=$("[data-chat-notify-title]").value.trim();
 const body=$("[data-chat-notify-body]").value.trim();
 if(title.length<3||body.length<5){setPushStatus("Please enter a heading and message preview.");return;}
 try{
  pushConfig=await pushApi({
   action:"push_template_set",title,body,showSender:$("[data-chat-notify-sender]").checked===true
  });
  setPushStatus("NBL phone notification template saved for future messages. Preview it on this phone.");
 }catch(error){setPushStatus(error.message||"Notification template could not be saved.");}
}

function displayThread(row){
  if(row.thread_type==="direct")return row.peer?.handle?"@"+row.peer.handle:"Direct message";
  return row.title||"NBL conversation";
}
function resetComposer(){
  const ready=Boolean(state.selectedId);
  const composer=$("[data-chat-compose]");
  if(composer)composer.disabled=!ready;
  const button=$("[data-chat-send-form] button[type=submit]");
  if(button)button.disabled=!ready||state.busy;
  $("[data-chat-mute]").hidden=!ready;
  $("[data-chat-block]").hidden=!ready||state.selected?.thread_type!=="direct"||!state.selected?.peer?.handle;
  $("[data-chat-unblock]").hidden=!ready||state.selected?.thread_type!=="direct"||!state.selected?.peer?.handle;
}
function renderIdentity(me){
  state.me=me||{};
  const label=$("[data-chat-myhandle]");
  label.textContent=me?.handle?"@"+me.handle:"Your NBL account";
  const founder=me?.role==="founder";
  const marker=$("[data-chat-founder-marker]");
  if(marker)marker.hidden=!founder;
  const setup=$("[data-chat-handle-setup]");
  if(setup)setup.hidden=Boolean(me?.handle);
  const entry=$(".campus-link a");
  if(entry&&me?.university!==true){
    entry.textContent="See University";
  }
}
function renderInviteState(){
  const empty=state.threads.length===0;
  const founder=state.me?.role==="founder";
  const invite=$("[data-chat-invite]");
  if(invite)invite.hidden=!empty;
  if(empty){
    const title=$("[data-chat-invite-title]");
    if(title)title.textContent=founder?"Welcome, Founder. The neighborhood starts here.":"You're early. Bring a friend!";
    const description=$("[data-chat-invite-description]");
    if(description)description.textContent=founder
      ?"Your official NBL Messenger inbox is ready. Invite a real member to join the neighborhood and start talking."
      :"Your inbox is ready. Invite a real NBL member, then find each other by your NBL usernames.";
  }
  if(!state.selectedId){
    const title=$("[data-chat-thread-title]");
    if(title)title.textContent=empty?"Welcome to your NBL neighborhood":"Choose a conversation";
    const messages=$("[data-chat-messages]");
    if(messages)messages.replaceChildren(node("p","hint",empty
      ?"Your messages will appear here after you start chatting with another NBL member."
      :"Select one of your conversations to read or send messages."));
  }
}
function renderThreads(){
  const area=$("[data-chat-threads]");
  area.replaceChildren();
  renderInviteState();
  if(!state.threads.length){area.append(node("p","hint","No conversations yet. Invite someone to join you."));return;}
  for(const row of state.threads){
    const item=node("button","thread"+(row.id===state.selectedId?" selected":""),displayThread(row));
    item.type="button";
    const info=node("small",null,(row.thread_type==="direct"?"Direct message":String(row.thread_type||"Chat").replaceAll("_"," "))+(row.muted?" · Muted":""));
    item.append(info);
    item.addEventListener("click",()=>{void openThread(row.id).catch(error=>status(error.message));});
    area.append(item);
  }
}
async function loadThreads(){
  const response=await social({action:"list_threads"});
  state.threads=response.threads||[];
  renderThreads();
}
function renderMessages(messages){
  const area=$("[data-chat-messages]");
  area.replaceChildren();
  if(!messages.length){area.append(node("p","hint","Nothing here yet. Say hello!"));return;}
  const me=String(state.me?.handle||"").toLowerCase();
  for(const message of messages){
    const from=message.sender?.handle||((message.officialRole==="grey")?"greyhart":"NBL member");
    const mine=from.toLowerCase()===me;
    const bubble=node("div","message"+(mine?" mine":""));
    const verified=message.sender?.verified||Boolean(message.officialRole);
    bubble.append(node("div","byline","@"+from+(verified?" · Verified":"")+(message.createdAt?" · "+new Date(message.createdAt).toLocaleString():"")));
    bubble.append(node("p",null,message.body||""));
    if(!mine&&!message.deleted&&message.id){
      const actions=node("div","msg-actions");
      const button=node("button",null,"Report message");
      button.type="button";
      button.addEventListener("click",()=>{void reportMessage(message.id);});
      actions.append(button);bubble.append(actions);
    }
    area.append(bubble);
  }
  area.scrollTop=area.scrollHeight;
}
function watchOpenThread(id){
  if(state.realtimeThread===id)return;
  state.realtimeStop?.();state.realtimeStop=null;
  state.realtimeThread=id;
  if(!window.NBLSocialRealtime)return;
  state.realtimeStop=window.NBLSocialRealtime.watchThread(id,authToken,async()=>{
    if(state.selectedId!==id)return;
    const payload=await social({action:"list_messages",threadId:id});
    if(state.selectedId===id){
      rememberIncoming(id,payload.messages||[],{announce:true});
      renderMessages(payload.messages||[]);
    }
  });
}
function watchInbox(){
  if(state.inboxStop||!window.NBLSocialRealtime||!state.clerk?.user?.id)return;
  state.inboxStop=window.NBLSocialRealtime.watchInbox(state.clerk.user.id,authToken,async()=>{
    if(document.hidden)return;
    await loadThreads();
  });
}
async function openThread(id){
  if(!id)return;
  const row=state.threads.find(t=>t.id===id);
  state.selectedId=id;state.selected=row||null;
  watchOpenThread(id);
  $("[data-chat-thread-title]").textContent=displayThread(row||{});
  $("[data-chat-thread-kind]").textContent=row?.thread_type==="direct"?"Direct message":String(row?.thread_type||"Message").replaceAll("_"," ");
  $("[data-chat-messages]").replaceChildren(node("p","hint","Loading messages…"));
  $("[data-chat-mute]").textContent=row?.muted?"Unmute":"Mute";
  $("[data-chat-block]").textContent="Block member";
  resetComposer();renderThreads();
  const payload=await social({action:"list_messages",threadId:id});
  if(state.selectedId!==id)return;
  rememberIncoming(id,payload.messages||[]);
  renderMessages(payload.messages||[]);
  status("Conversation ready. NBL human messages do not use AI credits.");
}
async function refresh(){
  try{
    status("Refreshing NBL Messenger…");
    const [identity,threads]=await Promise.all([social({action:"me"}),social({action:"list_threads"})]);
    renderIdentity(identity.me||{});
    state.threads=threads.threads||[];
    if(state.selectedId&&!state.threads.some(t=>t.id===state.selectedId)){
      state.selectedId=null;state.selected=null;
      state.realtimeStop?.();state.realtimeStop=null;state.realtimeThread=null;
      resetComposer();
      $("[data-chat-thread-title]").textContent="Choose a conversation";
      $("[data-chat-messages]").replaceChildren(node("p","hint","Choose a conversation."));
    }
    renderThreads();
    await loadPhoneSettings();
    if(state.selectedId)await openThread(state.selectedId);
    else status("NBL Messenger is ready. Open a DM or select a conversation.");
  }catch(error){status(error.message||"NBL Messenger could not refresh.");}
}
async function openDM(handle){
  if(!handle||state.busy)return;
  state.busy=true;
  status("Opening private conversation…");
  try{
    const payload=await social({action:"direct",handle});
    $("[data-chat-dm-handle]").value="";
    await loadThreads();
    await openThread(payload.threadId);
  }catch(error){status(error.message||"That member could not be reached.");}
  finally{state.busy=false;resetComposer();}
}
async function copyInvite(){
  try{
    if(!navigator.clipboard?.writeText)throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(INVITE_URL);
    status("NBL Messenger invite link copied. Share it with someone you know.");
  }catch{
    status("You can copy the invitation address shown in the welcome card.");
  }
}
async function shareInvite(){
  // The visitor controls sharing. NBL never reads contacts or messages anyone automatically.
  if(typeof navigator.share==="function"){
    try{
      await navigator.share({
        title:"NBL Messenger",
        text:"Come join me on New Beansland! Sign in or create your NBL account and let's chat.",
        url:INVITE_URL
      });
      status("Invite shared from your device.");
      return;
    }catch(error){
      if(error?.name==="AbortError")return;
    }
  }
  await copyInvite();
}
async function searchMembers(event){
  event.preventDefault();
  const q=$("[data-chat-find-input]").value.trim();
  const area=$("[data-chat-search-results]");
  area.replaceChildren();
  if(q.replace(/^@/,"").length<2){status("Enter at least two characters of an NBL handle.");return;}
  try{
    const payload=await social({action:"find_users",q:q.replace(/^@/,"")});
    const users=payload.users||[];
    if(!users.length){area.append(node("p","hint","No matching NBL handles found."));return;}
    for(const user of users){
      const line=node("div","search-result"),label=node("strong",null,"@"+user.handle+(user.verified?" · Verified":""));
      const button=node("button","btn small","Message");button.type="button";
      button.addEventListener("click",()=>{void openDM(user.handle);});
      line.append(label,button);area.append(line);
    }
    status("Choose a member to open a private conversation.");
  }catch(error){status(error.message||"Search unavailable.");}
}
async function sendMessage(event){
  event.preventDefault();
  const textarea=$("[data-chat-compose]"),message=textarea.value.trim();
  if(!state.selectedId||!message||state.busy)return;
  const id=state.selectedId;
  state.busy=true;resetComposer();
  try{
    await social({action:"send",threadId:id,message});
    textarea.value="";
    await openThread(id);
  }catch(error){status(error.message||"Message not sent.");}
  finally{state.busy=false;resetComposer();}
}
async function toggleMute(){
  if(!state.selectedId||state.busy)return;
  const row=state.selected;
  try{
    await social({action:"mute",threadId:state.selectedId,muted:!Boolean(row?.muted)});
    await refresh();
  }catch(error){status(error.message||"Unable to update mute.");}
}
async function blockPeer(){
  const peer=state.selected?.peer?.handle;
  if(!peer||!confirm("Block @"+peer+"? This prevents new direct messages between you."))return;
  try{
    await social({action:"block",handle:peer});
    status("@"+peer+" blocked. You can unblock this member from the conversation controls.");
    await refresh();
  }catch(error){status(error.message||"Unable to block this member.");}
}
async function unblockPeer(){
  const peer=state.selected?.peer?.handle;
  if(!peer)return;
  try{
    await social({action:"unblock",handle:peer});
    status("@"+peer+" unblocked.");
    await refresh();
  }catch(error){status(error.message||"Unable to unblock this member.");}
}
async function reportMessage(messageId){
  const reason=prompt("Why are you reporting this message? Do not include passwords or private information.");
  if(!reason||!reason.trim())return;
  try{
    await social({action:"report",messageId,reason:reason.trim().slice(0,500)});
    status("Report recorded for review.");
  }catch(error){status(error.message||"Report could not be submitted.");}
}
async function syncClerkSession(){
  const userId=state.clerk?.isSignedIn&&state.clerk?.session?state.clerk.user?.id||null:null;
  if(userId===activeAuthUserId)return;
  activeAuthUserId=userId;
  const generation=++authSyncGeneration;
  // Existing DMs are private. Clear them synchronously before any new requests.
  state.realtimeStop?.();state.inboxStop?.();
  state.realtimeStop=null;state.inboxStop=null;state.realtimeThread=null;
  state.selectedId=null;state.selected=null;state.threads=[];state.me=null;state.busy=false;
  lastSeenMessages.clear();
  $("[data-chat-userbar]").hidden=true;
  $("[data-chat-app]").hidden=true;
  $("[data-chat-notification-settings]").hidden=true;
  $("[data-chat-notification-founder]").hidden=true;
  pushConfig=null;
  $("[data-chat-myhandle]").textContent="@NBL member";
  $("[data-chat-founder-marker]").hidden=true;
  $("[data-chat-handle-setup]").hidden=true;
  $("[data-chat-invite]").hidden=true;
  $("[data-chat-messages]").replaceChildren(node("p","hint","Choose a conversation."));
  $("[data-chat-threads]").replaceChildren();
  $("[data-chat-search-results]").replaceChildren();
  $("[data-chat-thread-title]").textContent="Choose a conversation";
  $("[data-chat-thread-kind]").textContent="Messages";
  $("[data-chat-compose]").value="";
  $("[data-chat-find-input]").value="";
  $("[data-chat-dm-handle]").value="";
  resetComposer();
  await forgetPushForDifferentAccount(userId);
  if(generation!==authSyncGeneration)return;
  if(!userId){
    $("[data-chat-guest]").hidden=false;
    $("[data-chat-auth-status]").textContent="Sign in to send and read human-to-human messages. University enrollment is not required for direct messages.";
    status("NBL Messenger conversations are private until you sign in.");
    return;
  }
  $("[data-chat-guest]").hidden=true;
  $("[data-chat-userbar]").hidden=false;
  $("[data-chat-app]").hidden=false;
  watchInbox();
  await refresh();
  if(generation!==authSyncGeneration||state.clerk?.user?.id!==userId)return;
  const socialHandle=socialDMIntent();
  if(socialHandle){
    $("[data-chat-dm-handle]").value="@"+socialHandle;
    status("NBL Social opened the message form for @"+socialHandle+". Press Open to start a conversation.");
  }
}
async function boot(){
  $("[data-chat-signin]").href=signInUrl();
  $("[data-nbl-infinity-preview]")?.addEventListener("click",()=>{window.NBLInfinitySound?.play("people");});
  $("[data-chat-notify-enable]").addEventListener("click",()=>{void enablePhonePush();});
  $("[data-chat-notify-disable]").addEventListener("click",()=>{void disablePhonePush();});
  $("[data-chat-notify-preview]").addEventListener("click",()=>{void previewPhoneNotification();});
  $("[data-chat-notification-founder]").addEventListener("submit",saveFounderPhoneTemplate);
  $("[data-chat-share-invite]").addEventListener("click",()=>{void shareInvite();});
  $("[data-chat-copy-invite]").addEventListener("click",()=>{void copyInvite();});
  $("[data-chat-find-form]").addEventListener("submit",searchMembers);
  $("[data-chat-dm-form]").addEventListener("submit",event=>{event.preventDefault();void openDM($("[data-chat-dm-handle]").value.trim());});
  $("[data-chat-send-form]").addEventListener("submit",sendMessage);
  $("[data-chat-refresh]").addEventListener("click",()=>{void refresh();});
  $("[data-chat-mute]").addEventListener("click",()=>{void toggleMute();});
  $("[data-chat-block]").addEventListener("click",()=>{void blockPeer();});
  $("[data-chat-unblock]").addEventListener("click",()=>{void unblockPeer();});
  $("[data-chat-signout]").addEventListener("click",async()=>{
    try{state.realtimeStop?.();state.inboxStop?.();await disablePhonePush();await(await clerk()).signOut();window.location.reload();}
    catch{window.location.href=ACCOUNT_PORTAL;}
  });
  try{
    const connection=await clerk();
    // Clerk may restore the session after initial load, or change users in place.
    // An early guest snapshot is not proof the user must authenticate again.
    connection.addListener?.(()=>{void syncClerkSession();});
    await syncClerkSession();
  }catch(error){
    $("[data-chat-auth-status]").textContent="NBL account connection is unavailable. Try signing in again.";
    status(error.message||"NBL account service unavailable.");
  }
}
void boot();
})();
