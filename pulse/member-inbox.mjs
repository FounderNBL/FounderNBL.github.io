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
 let current=null,threads=[],loading=false,sending=false;
 const say=text=>{status.textContent=String(text);};
 const service=body=>invoke(body);
 async function readThread(id){
  if(!/^[0-9a-f-]{36}$/i.test(id))return;
  const active=current=id;
  const data=await service({action:"list_messages",threadId:id,limit:100});
  if(current!==active||panel.hidden)return;
  transcript.replaceChildren();
  if(!Array.isArray(data.messages)||!data.messages.length)transcript.append(node("p","social-meta","No messages yet."));
  for(const m of data.messages||[]){
   const label=m.sender?.handle?"@"+m.sender.handle:"NBL member";
   const box=node("article","pulse-ig-message");
   const time=m.createdAt&&Number.isFinite(Date.parse(m.createdAt))?new Date(m.createdAt).toLocaleString():"";
   box.append(node("strong",null,label),node("small","social-meta",time),node("p",null,m.deleted?"[Message removed]":String(m.body||"")));
   transcript.append(box);
  }
  compose.hidden=false;heading.textContent="Pulse Connect · Private conversation";
  transcript.scrollTop=transcript.scrollHeight;
  say("Pulse Connect conversation open. Messages stay within NBL.");
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
   else if(!current)say("Choose a conversation or enter a member's NBL username.");
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
   say("Pulse Connect message sent.");
  }catch(error){say("Message not sent: "+String(error.message||"Unavailable").slice(0,120));}
  finally{sending=false;send.disabled=false;}
 });
 const timer=window.setInterval(()=>{
  if(!panel.isConnected){clearInterval(timer);return;}
  if(!panel.hidden&&document.visibilityState==="visible"&&!sending&&!loading)void loadThreads();
 },25000);
}
