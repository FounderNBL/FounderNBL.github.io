(()=>{
"use strict";

// Independent human-messaging runtime. Beans remains on its own AI endpoint.
const SOCIAL_API="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-social";
const ACCOUNT_API="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-account";
const PUSH_API="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-messenger-push";
const VIDEO_API="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-video";
const VIDEO_INVITE_RE=/^NBL video call invitation: https:\/\/newbeansland\.org\/messenger\/call\.html\?call=([0-9a-f-]{36})$/i;
const IS_CALL_ID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PUSH_OWNER_KEY="nbl-messenger-push-clerk-user-v1";
const CLERK_PUBLISHABLE_KEY="pk_live_Y2xlcmsubmV3YmVhbnNsYW5kLm9yZyQ";
const ACCOUNT_PORTAL="https://accounts.newbeansland.org";
const INVITE_URL="https://newbeansland.org/messenger/index.html";
const $=selector=>document.querySelector(selector);
const state={clerk:null,me:null,threads:[],selectedId:null,selected:null,busy:false,realtimeThread:null,realtimeStop:null,inboxStop:null};
let activeAuthUserId;
let authSyncGeneration=0;
let pushConfig=null;
const status=message=>{const el=$("[data-chat-status]");if(el)el.textContent=message;};
// Call feedback belongs beside the actual conversation, not in the page footer.
const callFeedback=(message,failed=false)=>{
  const el=$("[data-chat-video-feedback]");if(!el)return;
  const value=String(message||"");
  el.textContent=value;el.hidden=!value;el.dataset.error=failed?"true":"false";
};
const lastSeenMessages=new Map();
const incomingCallsSeen=new Set();
let incomingCall=null, incomingScanBusy=false;
function incomingCallUrl(id){return "https://newbeansland.org/messenger/call.html?call="+encodeURIComponent(id);}
function hideIncomingCall(){
  incomingCall=null;
  const panel=$("[data-chat-incoming-call]");
  if(panel)panel.hidden=true;
}
async function videoCallAction(action,callId){
  const userId=state.clerk?.user?.id,generation=authSyncGeneration;
  if(!userId||!IS_CALL_ID.test(callId))throw Error("Invalid NBL call.");
  const token=await authToken();
  if(userId!==state.clerk?.user?.id||generation!==authSyncGeneration)throw Error("NBL account changed.");
  const response=await fetch(VIDEO_API,{
    method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},
    body:JSON.stringify({action,callId}),cache:"no-store"
  });
  const payload=await response.json().catch(()=>({}));
  if(userId!==state.clerk?.user?.id||generation!==authSyncGeneration)throw Error("NBL account changed.");
  if(!response.ok||payload.ok!==true)throw Error(payload.message||"This call is no longer available.");
  return payload;
}
async function showIncomingCall(callId,from){
  if(!IS_CALL_ID.test(callId)||incomingCallsSeen.has(callId)||incomingCall)return;
  incomingCallsSeen.add(callId);
  const userId=state.clerk?.user?.id,generation=authSyncGeneration;
  try{
    const access=await videoCallAction("join",callId);
    if(!userId||userId!==state.clerk?.user?.id||generation!==authSyncGeneration||incomingCall)return;
    if(access.callType!=="nbl_private"||access.callId!==callId||access.user?.id!==userId)return;
    incomingCall={callId,from};
    const panel=$("[data-chat-incoming-call]");
    $("[data-chat-incoming-from]").textContent=from?"Video call from @"+from:"An NBL member is calling";
    $("[data-chat-incoming-answer]").href=incomingCallUrl(callId);
    $("[data-chat-incoming-status]").textContent="Answer or decline this private NBL video call.";
    panel.hidden=false;
    // Browser autoplay rules can suppress in-page sounds; phone alerts use device settings.
    window.NBLInfinitySound?.play("people");
  }catch{
    // An expired, blocked, or forged invitation must never trigger the call screen.
  }
}
function checkIncomingMessages(threadId,messages){
  const row=state.threads.find(item=>item.id===threadId);
  if(row?.muted||!row||incomingCall||!state.clerk?.user?.id)return;
  const me=String(state.me?.handle||"").toLowerCase();
  for(const message of [...messages].reverse()){
    if(message?.deleted||!message?.body)continue;
    const matched=VIDEO_INVITE_RE.exec(String(message.body));
    if(!matched||!IS_CALL_ID.test(matched[1]))continue;
    if(String(message.sender?.handle||"").toLowerCase()===me)continue;
    if(incomingCallsSeen.has(matched[1]))continue;
    void showIncomingCall(matched[1],String(message.sender?.handle||"NBL member").slice(0,64));
    break;
  }
}
async function scanIncomingCalls(){
  if(incomingScanBusy||incomingCall||document.hidden||!state.clerk?.user?.id)return;
  incomingScanBusy=true;
  const userId=state.clerk.user.id,generation=authSyncGeneration;
  try{
    for(const row of state.threads.filter(x=>x.thread_type==="direct"&&!x.muted).slice(0,5)){
      if(generation!==authSyncGeneration||state.clerk?.user?.id!==userId||incomingCall)break;
      try{
        const data=await social({action:"list_messages",threadId:row.id,limit:15});
        checkIncomingMessages(row.id,data.messages||[]);
      }catch{ /* Messaging remains usable if an invitation scan fails. */ }
    }
  }finally{incomingScanBusy=false;}
}

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
// Pulse shares this Messenger account. A URL may suggest a member, never auto-send a DM.
function pulseMessageIntent(){
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

async function accountRequest(action,options={}){
  const userId=state.clerk?.user?.id;
  const generation=authSyncGeneration;
  const token=await authToken();
  if(!userId||generation!==authSyncGeneration||state.clerk?.user?.id!==userId)
    throw Error("Your NBL account changed. Try again.");
  const response=await fetch(ACCOUNT_API+"?action="+encodeURIComponent(action),{
    ...options,
    headers:{"Authorization":"Bearer "+token,"Content-Type":"application/json","Accept":"application/json",...(options.headers||{})},
    cache:"no-store"
  });
  const payload=await response.json().catch(()=>({}));
  if(generation!==authSyncGeneration||state.clerk?.user?.id!==userId)
    throw Error("Your NBL account changed. Try again.");
  if(!response.ok)throw Error(payload?.message||"Your account settings are unavailable.");
  return payload;
}
async function openAccountPanel(){
  const panel=$("[data-chat-account-settings]");
  const button=$("[data-chat-account-toggle]");
  if(!state.clerk?.isSignedIn||!state.clerk?.user?.id)return;
  const shouldOpen=panel.hidden;
  panel.hidden=!shouldOpen;
  button.setAttribute("aria-expanded",String(shouldOpen));
  if(!shouldOpen)return;
  const email=state.clerk.user.primaryEmailAddress?.emailAddress||"Signed in to your NBL account";
  $("[data-chat-account-email]").textContent=email;
  $("[data-chat-profile-status]").textContent="Loading your NBL username…";
  try{
    const data=await accountRequest("summary");
    if(panel.hidden)return;
    $("[data-chat-profile-username]").value=data.profile?.username||"";
    $("[data-chat-profile-status]").textContent=state.me?.role==="founder"
      ?"Your official Messenger handle stays @NBLFounderOfficial."
      :"Edit your NBL username here.";
  }catch(error){
    $("[data-chat-profile-status]").textContent=error.message||"Could not load your username.";
  }
}
async function saveAccountUsername(event){
  event.preventDefault();
  const button=$("[data-chat-profile-form] button[type=submit]");
  button.disabled=true;
  $("[data-chat-profile-status]").textContent="Saving username…";
  try{
    const value=$("[data-chat-profile-username]").value.trim();
    const data=await accountRequest("profile",{method:"POST",body:JSON.stringify({username:value})});
    $("[data-chat-profile-username]").value=data.profile?.username||value;
    await refresh();
    $("[data-chat-profile-status]").textContent=state.me?.role==="founder"
      ?"Username saved. Your verified Messenger handle stays @NBLFounderOfficial."
      :"Username saved. Your Messenger handle has been updated.";
  }catch(error){
    $("[data-chat-profile-status]").textContent=error.message||"Could not save username.";
  }finally{button.disabled=false;}
}
function manageLoginConnections(){
  // The ClerkJS profile overlay is not reliable inside the standalone
  // Messenger page. Open the already-working hosted Clerk account profile.
  if(!state.clerk?.isSignedIn||!state.clerk?.user)return;
  const returnUrl=new URL("/messenger/",location.origin).href;
  location.assign(ACCOUNT_PORTAL+"/user?redirect_url="+encodeURIComponent(returnUrl));
}
async function downloadRecentMessages(){
  const button=$("[data-chat-download-messages]");
  const display=$("[data-chat-export-status]");
  button.disabled=true;
  display.textContent="Collecting your recent direct messages…";
  const userId=state.clerk?.user?.id;
  const generation=authSyncGeneration;
  try{
    const threadResult=await social({action:"list_threads"});
    const threads=(threadResult.threads||[]).filter(row=>row.thread_type==="direct");
    const snapshot=[];
    for(const t of threads){
      if(generation!==authSyncGeneration||state.clerk?.user?.id!==userId)
        throw Error("Your NBL account changed. Try again.");
      const data=await social({action:"list_messages",threadId:t.id,limit:100});
      snapshot.push({thread:t,messages:data.messages||[]});
    }
    if(generation!==authSyncGeneration||state.clerk?.user?.id!==userId)
      throw Error("Your NBL account changed. Try again.");
    const result={
      format:"nbl-messenger-recent-snapshot-v1",
      note:"Recent direct messages only: up to 200 threads and the latest 100 messages per thread. Not a complete archive.",
      exportedAt:new Date().toISOString(),
      handle:state.me?.handle||null,
      conversations:snapshot
    };
    const blob=new Blob([JSON.stringify(result,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const link=document.createElement("a");
    link.href=url;link.download="nbl-messenger-recent-messages.json";
    document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    display.textContent="Recent message snapshot downloaded.";
  }catch(error){display.textContent=error.message||"Unable to download messages.";}
  finally{button.disabled=false;}
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
  const current=await subscription();
  const enabled=Boolean(current&&window.Notification.permission==="granted");
  updatePhoneButtons(enabled);
  setPushStatus(enabled
   ?"Phone alerts enabled on this browser. The phone controls background sound and appearance."
   :"Phone alerts are off on this browser. Enable them to receive messages when Messenger is closed.");
 }catch(error){
  updatePhoneButtons(false);
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
  const callButton=$("[data-chat-video-call]");
  if(callButton){callButton.hidden=!ready||state.selected?.thread_type!=="direct"||state.me?.role!=="founder";callButton.disabled=!ready||state.busy;}
  $("[data-chat-mute]").hidden=!ready;
  $("[data-chat-block]").hidden=!ready||state.selected?.thread_type!=="direct"||!state.selected?.peer?.handle;
  $("[data-chat-unblock]").hidden=!ready||state.selected?.thread_type!=="direct"||!state.selected?.peer?.handle;
}
function safeAvatar(raw){
  if(typeof raw!=="string")return null;
  try{
    const url=new URL(raw);
    return url.protocol==="https:"&&url.hostname.endsWith(".stream-io-cdn.com")&&!url.username&&!url.password?url.href:null;
  }catch{return null;}
}
function renderIdentity(me){
  state.me=me||{};
  const label=$("[data-chat-myhandle]");
  label.textContent=me?.handle?"@"+me.handle:"Your NBL account";
  const avatar=$("[data-chat-my-avatar]");if(avatar)avatar.src=safeAvatar(me?.avatarUrl)||"/messenger/icon.svg";
  const founder=me?.role==="founder";
  const marker=$("[data-chat-founder-marker]");
  if(marker)marker.hidden=!founder;
  const setup=$("[data-chat-handle-setup]");
  if(setup)setup.hidden=Boolean(me?.handle);
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
    const photo=safeAvatar(row.peer?.avatarUrl);
    if(photo){const image=node("img","chat-avatar");image.src=photo;image.alt="Conversation profile picture";image.loading="lazy";item.prepend(image);}
    const info=node("small",null,(row.thread_type==="direct"?"Direct message":String(row.thread_type||"Chat").replaceAll("_"," "))+(row.muted?" · Muted":""));
    item.append(info);
    item.addEventListener("click",()=>{void openThread(row.id).catch(error=>status(error.message));});
    area.append(item);
  }
}
async function loadFeaturedFounder(){
  // Show only the *real*, backend-verified Founder account, never a fabricated member.
  const card=$("[data-chat-featured-founder]");
  if(!card)return;
  card.hidden=true;
  if(!state.clerk?.isSignedIn||!state.clerk?.user?.id||state.me?.role==="founder")return;
  const userId=state.clerk.user.id,generation=authSyncGeneration;
  try{
    const result=await social({action:"find_users",q:"NBLFounderOfficial"});
    if(generation!==authSyncGeneration||state.clerk?.user?.id!==userId)return;
    const found=(result.users||[]).some(user=>String(user.handle||"").toLowerCase()==="nblfounderofficial"&&user.verified===true);
    card.hidden=!found;
  }catch{
    // A failed lookup must never display a made-up Founder identity.
    card.hidden=true;
  }
}
async function loadThreads(){
  const response=await social({action:"list_threads"});
  state.threads=(response.threads||[]).filter(row=>row.thread_type==="direct");
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
    const photo=safeAvatar(message.sender?.avatarUrl);
    if(photo){const image=node("img","chat-avatar");image.src=photo;image.alt="@"+from+" profile picture";image.loading="lazy";bubble.append(image);}
    bubble.append(node("div","byline","@"+from+(verified?" · Verified":"")+(message.createdAt?" · "+new Date(message.createdAt).toLocaleString():"")));
    bubble.append(node("p",null,message.body||""));
    const invite=VIDEO_INVITE_RE.exec(String(message.body||""));
    if(invite&&!message.deleted&&IS_CALL_ID.test(invite[1])){
      const link=node("a","btn small","Join NBL video call");
      link.href="https://newbeansland.org/messenger/call.html?call="+encodeURIComponent(invite[1]);
      link.rel="noreferrer";
      bubble.append(link);
    }
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
      checkIncomingMessages(id,payload.messages||[]);
    }
  });
}
function watchInbox(){
  if(state.inboxStop||!window.NBLSocialRealtime||!state.clerk?.user?.id)return;
  state.inboxStop=window.NBLSocialRealtime.watchInbox(state.clerk.user.id,authToken,async()=>{
    if(document.hidden)return;
    await loadThreads();
    await scanIncomingCalls();
  });
}
async function openThread(id){
  if(!id)return;
  const row=state.threads.find(t=>t.id===id);
  if(state.selectedId!==id)callFeedback("");
  state.selectedId=id;state.selected=row||null;
  $("[data-chat-app]").classList.add("chat-open");
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
  checkIncomingMessages(id,payload.messages||[]);
  status("Conversation ready. NBL human messages do not use AI credits.");
}
async function refresh(){
  try{
    status("Refreshing NBL Messenger…");
    const [identity,threads]=await Promise.all([social({action:"me"}),social({action:"list_threads"})]);
    renderIdentity(identity.me||{});
    state.threads=(threads.threads||[]).filter(row=>row.thread_type==="direct");
    if(state.selectedId&&!state.threads.some(t=>t.id===state.selectedId)){
      state.selectedId=null;state.selected=null;
      callFeedback("");
      $("[data-chat-app]").classList.remove("chat-open");
      state.realtimeStop?.();state.realtimeStop=null;state.realtimeThread=null;
      resetComposer();
      $("[data-chat-thread-title]").textContent="Choose a conversation";
      $("[data-chat-messages]").replaceChildren(node("p","hint","Choose a conversation."));
    }
    renderThreads();
    void loadFeaturedFounder();
    await loadPhoneSettings();
    if(state.selectedId)await openThread(state.selectedId);
    else status("NBL Messenger is ready. Open a DM or select a conversation.");
    void scanIncomingCalls();
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
async function invitePhoneContact(){
  // Contacts Picker API is opt-in, browser-supported only, and returns only the
  // contact explicitly chosen by the person. Never send contact data to NBL.
  const message=$("[data-chat-phone-contact-status]");
  if(!navigator.contacts?.select){
    message.textContent="Your browser cannot open phone contacts directly. Opening your phone’s share options instead…";
    await shareInvite();
    return;
  }
  try{
    const contacts=await navigator.contacts.select(["name","tel"],{multiple:false});
    if(!contacts?.length)return;
    const contact=contacts[0];
    const name=String(contact.name?.[0]||"your friend").slice(0,80);
    const phone=String(contact.tel?.[0]||"").trim();
    const body="Join me on NBL Messenger: "+INVITE_URL;
    // The recipient is selected explicitly; no automatic SMS is sent.
    if(phone && /^[+0-9() .-]{5,32}$/.test(phone)){
      const sms="sms:"+encodeURIComponent(phone)+"?body="+encodeURIComponent(body);
      message.textContent="Opening your text app for "+name+". Review before sending.";
      window.location.href=sms;
    }else if(navigator.share){
      await navigator.share({title:"NBL Messenger",text:body,url:INVITE_URL});
      message.textContent="Invitation shared.";
    }else{
      await copyInvite();
      message.textContent="Contact has no usable phone number. Invitation link copied if clipboard is available.";
    }
  }catch(error){
    if(error?.name!=="AbortError")message.textContent="Couldn't open phone contacts. Use Invite a friend instead.";
  }
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
async function startVideoCall(){
  if(!state.selectedId||state.selected?.thread_type!=="direct"||state.busy)return;
  const threadId=state.selectedId;
  const userId=state.clerk?.user?.id,generation=authSyncGeneration;
  const button=$("[data-chat-video-call]");button.disabled=true;
  callFeedback("Preparing your private video call…");
  status("Preparing your private video call…");
  try{
    const token=await authToken();
    if(state.clerk?.user?.id!==userId||generation!==authSyncGeneration)
      throw Error("NBL account changed. Try again.");
    const response=await fetch(VIDEO_API,{
      method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},
      body:JSON.stringify({action:"start",threadId}),cache:"no-store"
    });
    const result=await response.json().catch(()=>({}));
    if(state.clerk?.user?.id!==userId||generation!==authSyncGeneration||state.selectedId!==threadId)
      throw Error("Conversation or account changed. No invitation sent.");
    if(!response.ok||result.ok!==true)throw Error(result.message||"NBL video calls are not enabled yet.");
    const url=new URL(result.joinUrl||"https://invalid.example/");
    if(url.origin!=="https://newbeansland.org"||url.pathname!=="/messenger/call.html"
      ||!IS_CALL_ID.test(url.searchParams.get("call")||""))
      throw Error("Invalid NBL call invitation.");
    // In-app invitation is delivered inside the same protected direct conversation.
    await social({action:"send",threadId,message:"NBL video call invitation: "+url.href});
    callFeedback("Video invitation sent in this conversation. Open the invitation below to join.");
    status("Video invitation sent in your NBL conversation.");
    await openThread(threadId);
  }catch(error){
    const message=error?.message||"NBL video call could not start.";
    callFeedback(message,true);status(message);
  }
  finally{resetComposer();}
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
  $("[data-chat-app]").classList.remove("chat-open");
  lastSeenMessages.clear();incomingCallsSeen.clear();hideIncomingCall();
  $("[data-chat-userbar]").hidden=true;
  $("[data-chat-account-settings]").hidden=true;
  $("[data-chat-account-toggle]").setAttribute("aria-expanded","false");
  $("[data-chat-account-email]").textContent="";
  $("[data-chat-profile-username]").value="";
  $("[data-chat-profile-status]").textContent="";
  $("[data-chat-export-status]").textContent="";
  $("[data-chat-app]").hidden=true;
  $("[data-chat-notification-settings]").hidden=true;
  pushConfig=null;
  $("[data-chat-myhandle]").textContent="@NBL member";
  $("[data-chat-founder-marker]").hidden=true;
  $("[data-chat-handle-setup]").hidden=true;
  $("[data-chat-invite]").hidden=true;
  $("[data-chat-messages]").replaceChildren(node("p","hint","Choose a conversation."));
  callFeedback("");
  $("[data-chat-threads]").replaceChildren();
  $("[data-chat-search-results]").replaceChildren();
  $("[data-chat-featured-founder]").hidden=true;
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
    $("[data-chat-auth-status]").textContent="Sign in to send and read direct messages.";
    status("NBL Messenger conversations are private until you sign in.");
    return;
  }
  $("[data-chat-guest]").hidden=true;
  $("[data-chat-userbar]").hidden=false;
  $("[data-chat-app]").hidden=false;
  watchInbox();
  await refresh();
  if(generation!==authSyncGeneration||state.clerk?.user?.id!==userId)return;
  const notificationCall=new URL(location.href).searchParams.get("call")||"";
  if(IS_CALL_ID.test(notificationCall))void showIncomingCall(notificationCall,"");

  const suggested=pulseMessageIntent();
  if(suggested){
    $("[data-chat-dm-handle]").value="@"+suggested;
    status("Pulse opened a message to @"+suggested+". Press Open to start the private conversation.");
  }
}
async function boot(){
  $("[data-chat-signin]").href=signInUrl();
  $("[data-chat-account-toggle]").addEventListener("click",()=>{void openAccountPanel();});
  $("[data-chat-account-close]").addEventListener("click",()=>{
    $("[data-chat-account-settings]").hidden=true;
    $("[data-chat-account-toggle]").setAttribute("aria-expanded","false");
  });
  $("[data-chat-profile-form]").addEventListener("submit",event=>{void saveAccountUsername(event);});
  $("[data-chat-open-clerk]").addEventListener("click",manageLoginConnections);
  $("[data-chat-download-messages]").addEventListener("click",()=>{void downloadRecentMessages();});
  $("[data-nbl-infinity-preview]")?.addEventListener("click",()=>{window.NBLInfinitySound?.play("people");});
  $("[data-chat-notify-enable]").addEventListener("click",()=>{void enablePhonePush();});
  $("[data-chat-notify-disable]").addEventListener("click",()=>{void disablePhonePush();});
  $("[data-chat-notify-preview]").addEventListener("click",()=>{void previewPhoneNotification();});
  $("[data-chat-share-invite]").addEventListener("click",()=>{void shareInvite();});
  $("[data-chat-copy-invite]").addEventListener("click",()=>{void copyInvite();});
  const phoneButton=$("[data-chat-phone-contact]");
  if(phoneButton){
    phoneButton.hidden=false;
    phoneButton.addEventListener("click",()=>{void invitePhoneContact();});
  }
  $("[data-chat-back]").addEventListener("click",()=>{
    $("[data-chat-app]").classList.remove("chat-open");
    $("[data-chat-app]").querySelector(".sidebar")?.scrollIntoView({block:"start"});
  });
  $("[data-chat-featured-message]").addEventListener("click",()=>{void openDM("NBLFounderOfficial");});
  $("[data-chat-find-form]").addEventListener("submit",searchMembers);
  $("[data-chat-dm-form]").addEventListener("submit",event=>{event.preventDefault();void openDM($("[data-chat-dm-handle]").value.trim());});
  $("[data-chat-send-form]").addEventListener("submit",sendMessage);
  $("[data-chat-video-call]").addEventListener("click",()=>{void startVideoCall();});
  $("[data-chat-incoming-answer]").addEventListener("click",()=>{hideIncomingCall();});
  $("[data-chat-incoming-decline]").addEventListener("click",async()=>{
    if(!incomingCall)return;
    const {callId}=incomingCall,button=$("[data-chat-incoming-decline]");
    button.disabled=true;
    $("[data-chat-incoming-status]").textContent="Declining the call…";
    try{
      await videoCallAction("finish",callId);
      hideIncomingCall();callFeedback("Incoming video call declined.");
    }catch(error){
      $("[data-chat-incoming-status]").textContent=error.message||"Could not decline this call. Try again.";
    }finally{button.disabled=false;}
  });
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
