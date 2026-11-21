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
function errorText(error){
 const name=String(error?.message||"").slice(0,120);
 const messages={
  instagram_dm_permission_or_token_required:"Instagram messaging permission is not approved for this connected account/app yet. The Pulse inbox is wired, but Meta rejected access.",
  official_instagram_not_accessible:"Pulse cannot verify the official @nbl_world Instagram account. Check the existing Meta business connection.",
  instagram_token_secret_missing:"The official Instagram API token is not configured.",
  instagram_dm_reply_window_closed:"Meta's normal 24-hour reply window has closed. Ask the person to message @nbl_world again.",
  conversation_not_owned:"This conversation does not belong to the connected Instagram account.",
  instagram_dm_meta_unavailable:"Instagram messaging is temporarily unavailable. Try Refresh.",
  instagram_dm_rate_limited:"Instagram asked us to slow down. Try again later.",
  instagram_dm_send_unconfirmed:"Meta did not confirm the reply. Refresh before trying again."
 };
 return messages[name]||"Instagram: "+name.replace(/_/g," ")||"Instagram inbox unavailable.";
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
 const refresh=panel.querySelector("#pulseIgRefresh");
 const close=panel.querySelector("#pulseIgClose");
 let selected=null,loading=false,pending=false,lastReadAt=0;
 const say=s=>{status.textContent=s;};
 const call=(path,payload)=>invoke("/inbox/"+path,payload);
 function show(){
  panel.hidden=false;
  // Keep focus inside Pulse instead of navigating to another application.
  panel.scrollIntoView({behavior:"smooth",block:"start"});
  void loadList(false);
 }
 nav.addEventListener("click",show);
 close.addEventListener("click",()=>{panel.hidden=true;nav.focus();});
 refresh.addEventListener("click",()=>{void loadList(false);});
 function updateReply(canReply){
  form.hidden=!selected;
  submit.disabled=!canReply;
  field.disabled=!canReply;
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
  updateReply(data.reply_window_open===true);
  say(data.reply_window_open===true?
   "Conversation loaded from Instagram. Replies go directly to that person.":
   "Messages loaded. A new message from the person is required before Pulse can reply.");
  lastReadAt=Date.now();
 }
 async function openThread(id,quiet=false){
  if(!/^\d{6,50}$/.test(id))return;
  try{
   const result=await call("thread",{action:"thread",conversation_id:id});
   if(panel.hidden)return;
   renderMessages(result);
  }catch(error){if(!quiet)say(errorText(error));}
 }
 async function loadList(quiet=false){
  if(loading||panel.hidden)return;
  loading=true;
  if(!quiet)say("Loading @nbl_world Instagram messages…");
  try{
   const result=await call("list",{action:"list"});
   if(panel.hidden)return;
   conversations.replaceChildren();
   const entries=Array.isArray(result.conversations)?result.conversations:[];
   if(!entries.length)conversations.append(el("p","social-meta","No Instagram conversations returned. A person must message @nbl_world first."));
   for(const item of entries){
    if(!/^\d{6,50}$/.test(String(item.id||"")))continue;
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
   if(!selected)say("Instagram inbox connected. Choose a conversation to read and reply.");
  }catch(error){say(errorText(error));}
  finally{loading=false;}
 }
 form.addEventListener("submit",async event=>{
  event.preventDefault();
  if(pending||!selected)return;
  const message=field.value.trim();
  if(!message||message.length>1000){say("Enter 1–1,000 characters.");return;}
  if(!window.confirm("Send this private reply from @nbl_world on Instagram?"))return;
  pending=true;submit.disabled=true;
  say("Sending reply to Instagram…");
  try{
   const id=selected;
   const out=await call("reply",{action:"reply",conversation_id:id,message,confirm:"send"});
   if(out.sent!==true)throw Error("instagram_dm_send_unconfirmed");
   field.value="";
   await openThread(id);
   say("Instagram confirmed your reply was sent.");
  }catch(error){say(errorText(error));}
  finally{pending=false;submit.disabled=field.disabled===false;}
 });
 // Poll only while the Founder has this inbox open and the tab is visible.
 // Never persist message content to storage, telemetry or NBL Messenger.
 const poll=window.setInterval(()=>{
  if(!panel.isConnected){window.clearInterval(poll);return;}
  if(!panel.hidden&&document.visibilityState==="visible"&&!loading&&!pending&&Date.now()-lastReadAt>20000)
   void loadList(true);
 },30000);
}
