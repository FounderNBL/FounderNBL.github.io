// Pulse member DMs use the existing NBL Social private-message backend.
// Messages remain private; no Stream Feed posts, Meta tokens or Beans credits.
const node=(tag,cls,text)=>{
 const el=document.createElement(tag);
 if(cls)el.className=cls;
 if(text!==undefined)el.textContent=String(text);
 return el;
};
let openInbox=null,openMemberThread=null;
export function showPulseMemberInbox(handle=""){
 if(openInbox){
  document.dispatchEvent(new CustomEvent("pulse:member-inbox-open"));
  void openInbox(handle);
 }
}
export function showPulseMemberThread(id){
 if(openMemberThread&&/^[0-9a-f-]{36}$/i.test(String(id)))void openMemberThread(String(id));
}
export function mountMemberInbox(invoke){
 const panel=document.querySelector("#pulseMemberInbox");
 const nav=document.querySelector("#pulseMemberInboxNav");
 if(!panel||!nav||panel.dataset.mounted==="true")return;
 panel.dataset.mounted="true";nav.hidden=false;
 const list=panel.querySelector("#pulseMemberThreads");
 const transcript=panel.querySelector("#pulseMemberMessages");
 const heading=panel.querySelector("#pulseMemberThreadTitle");
 const status=panel.querySelector("#pulseMemberMsgStatus");
 const newHandle=panel.querySelector("#pulseMemberHandle");
 const compose=panel.querySelector("#pulseMemberReplyForm");
 const input=panel.querySelector("#pulseMemberReplyText");
 const send=compose.querySelector("button[type=submit]");
 const reload=panel.querySelector("#pulseMemberRefresh");
 const tools=panel.querySelector("#pulseMemberTools");
 const nickname=panel.querySelector("#pulseMemberNickname"),mute=panel.querySelector("#pulseMemberMute");
 const block=panel.querySelector("#pulseMemberBlock"),unblock=panel.querySelector("#pulseMemberUnblock");
 let current=null,threads=[],loading=false,sending=false,editing=false;
 const say=text=>{status.textContent=String(text);};
 const service=body=>invoke(body);
 // Reuse NBL Messenger's existing private-contact actions with Clerk authentication.
 const selectedRow=()=>threads.find(t=>String(t.id)===current);
 function syncTools(){
  const row=selectedRow();tools.hidden=!row;
  mute.textContent=row?.muted?"Unmute":"Mute";
  block.disabled=unblock.disabled=!row?.peer?.handle;
 }
 async function changeSelected(makePayload,success){
  const row=selectedRow();if(!row||editing||sending)return;
  const id=current,payload=makePayload(row);if(!payload)return;
  editing=true;
  try{await service(payload);await loadThreads();if(current===id&&!panel.hidden)say(success);}
  catch(e){if(current===id&&!panel.hidden)say(String(e.message||"Unable to update.").slice(0,150));}
  finally{editing=false;}
 }
 nickname.addEventListener("click",()=>void changeSelected(row=>{
  const name=window.prompt("Private contact nickname (blank uses public username)",row.contactNickname||"");
  if(name===null)return null;
  if(name.length>48){say("Nickname must be 48 characters or fewer.");return null;}
  return {action:"contact_nickname",threadId:row.id,nickname:name};
 },"Private contact nickname updated."));
 mute.addEventListener("click",()=>void changeSelected(row=>({action:"mute",threadId:row.id,muted:!Boolean(row.muted)}),"Conversation setting updated."));
 block.addEventListener("click",()=>void changeSelected(row=>{
  const handle=row.peer?.handle;
  return handle&&window.confirm("Block @"+handle+"? This prevents new direct messages.")?{action:"block",handle}:null;
 },"Member blocked."));
 unblock.addEventListener("click",()=>void changeSelected(row=>row.peer?.handle?{action:"unblock",handle:row.peer.handle}:null,"Member unblocked."));
 async function reportMessage(messageId,id){
  if(current!==id||panel.hidden)return;
  const reason=window.prompt("Why are you reporting this message? Do not include passwords or private information.");
  if(!reason?.trim())return;
  try{await service({action:"report",messageId,reason:reason.trim().slice(0,500)});if(current===id&&!panel.hidden)say("Report recorded for review.");}
  catch(e){if(current===id&&!panel.hidden)say(String(e.message||"Report could not be submitted.").slice(0,150));}
 }
 async function readThread(id){
  if(!/^[0-9a-f-]{36}$/i.test(id))return;
  const active=current=id;
  tools.hidden=true;compose.hidden=true;
  const data=await service({action:"list_messages",threadId:id,limit:100});
  if(current!==active||panel.hidden)return;
  transcript.replaceChildren();
  if(!Array.isArray(data.messages)||!data.messages.length)transcript.append(node("p","social-meta","No messages yet."));
  for(const m of data.messages||[]){
   const label=m.sender?.handle?"@"+m.sender.handle:"NBL member";
   const box=node("article","pulse-ig-message");
   const time=m.createdAt&&Number.isFinite(Date.parse(m.createdAt))?new Date(m.createdAt).toLocaleString():"";
   box.append(node("strong",null,label),node("small","social-meta",time),node("p",null,m.deleted?"[Message removed]":String(m.body||"")));
   const row=selectedRow();
   if(!m.deleted&&m.id&&m.sender?.handle&&row?.peer?.handle===m.sender.handle){
    const report=node("button","btn small pulse-member-report","Report");report.type="button";
    report.addEventListener("click",()=>void reportMessage(String(m.id),active));box.append(report);
   }
   transcript.append(box);
  }
  compose.hidden=false;heading.textContent="NBL private conversation";syncTools();
  transcript.scrollTop=transcript.scrollHeight;
  say("Private NBL conversation open. Messages stay in Pulse.");
 }
 async function loadThreads(){
  if(loading||panel.hidden)return;
  loading=true;
  try{
   const result=await service({action:"list_threads"});
   threads=(Array.isArray(result.threads)?result.threads:[]).filter(t=>t.thread_type==="direct");
   list.replaceChildren();
   if(!threads.length)list.append(node("p","social-meta","No conversations yet. Enter an NBL username to start one."));
   for(const t of threads){
    const label=t.contactNickname||t.peer?.handle||"NBL member";
    const button=node("button","btn small pulse-ig-conversation","@"+label);
    button.type="button";
    button.addEventListener("click",()=>{void readThread(String(t.id)).catch(e=>say(e.message||"Unable to read NBL messages."));});
    list.append(button);
   }
   if(current&&threads.some(t=>t.id===current))await readThread(current);
   else {current=null;compose.hidden=true;tools.hidden=true;transcript.replaceChildren();heading.textContent="Choose a conversation";say("Choose a conversation or enter a member NBL username.");}
  }catch(e){say("NBL messages: "+String(e.message||"Unavailable").slice(0,120));}
  finally{loading=false;}
 }
 async function open(handle=""){
  panel.hidden=false;
  panel.scrollIntoView({behavior:"smooth",block:"start"});
  if(handle){
   if(!/^@?[A-Za-z0-9_-]{2,64}$/.test(handle)){say("Enter a valid NBL username.");return;}
   try{
    const result=await service({action:"direct",handle:handle.replace(/^@/,"")});
    await loadThreads();
    await readThread(String(result.threadId));
   }catch(e){say("Cannot open this member: "+String(e.message||"Unavailable").slice(0,120));}
  }else await loadThreads();
 }
 openInbox=open;
 openMemberThread=async id=>{await open();await readThread(id);};
 nav.addEventListener("click",()=>void open());
 panel.querySelector("#pulseMemberClose").addEventListener("click",()=>{panel.hidden=true;nav.focus();});
 reload.addEventListener("click",()=>void loadThreads());
 panel.querySelector("#pulseMemberNewForm").addEventListener("submit",e=>{
  e.preventDefault();void open(newHandle.value.trim());
 });
 compose.addEventListener("submit",async e=>{
  e.preventDefault();
  const message=input.value.trim();
  if(sending||!current||!message)return;
  sending=true;send.disabled=true;
  try{
   await service({action:"send",threadId:current,message:message.slice(0,8000)});
   input.value="";await readThread(current);await loadThreads();
   say("NBL message sent.");
  }catch(error){say("Message not sent: "+String(error.message||"Unavailable").slice(0,120));}
  finally{sending=false;send.disabled=false;}
 });
 const timer=window.setInterval(()=>{
  if(!panel.isConnected){clearInterval(timer);return;}
  if(!panel.hidden&&document.visibilityState==="visible"&&!sending&&!loading&&!editing)void loadThreads();
 },25000);
}
