import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const callSource=read("messenger/call.mjs");
const pageSource=read("messenger/call.html");
const appSource=read("messenger/app.js");
const workerSource=read("messenger/sw.js");
const manifest=JSON.parse(read("messenger/manifest.webmanifest"));
const id="00000000-0000-4000-8000-000000000001";

class FakeElement {
 constructor(tag,log){this.tag=tag;this.log=log;this.children=[];this.handlers={};this.hidden=false;
  this.textContent="";this.readyState=0;this.videoWidth=0;this.autoplay=false;}
 append(...children){this.children.push(...children);}
 replaceChildren(...children){this.children=children;}
 addEventListener(name,fn){this.handlers[name]=fn;}
 setAttribute(){}
 remove(){this.removed=true;}
 play(){this.log.push(["play",this.tag]);return Promise.resolve();}
}
function makeCall(){
 const log=[];
 const found=new Map();
 const $=selector=>{
  if(!found.has(selector))found.set(selector,new FakeElement(selector,log));
  return found.get(selector);
 };
 const document={querySelector:$,createElement:tag=>new FakeElement(tag,log)};
 const body=callSource.replace(/^import .*$/m,"").replace(/void boot\(\);\s*$/,"");
 const context=vm.createContext({document,window:{addEventListener(){}},
   location:{href:"https://newbeansland.org/messenger/call.html?call="+id},
   URL,console,setInterval,clearInterval,log,participants:[]});
 vm.runInContext(body,context);
 vm.runInContext('call={bindVideoElement:(el,id,k)=>{log.push(["video",id,k,el.tag]);return ()=>log.push(["unbindVideo",id]);},bindAudioElement:(el,id,k)=>{log.push(["audio",id,k,el.tag]);return ()=>log.push(["unbindAudio",id]);}};',context);
 return {context,log,found};
}
function participant(sessionId,local){
 return {sessionId,isLocalParticipant:local,name:local?"NBL You":"NBL Member",
   videoStream:{getVideoTracks:()=>[{readyState:"live",enabled:true}]}};
}
async function makeWorker(){
 const log=[],events={};
 const self={
  location:{origin:"https://newbeansland.org"},
  addEventListener:(kind,fn)=>{events[kind]=fn;},
  registration:{showNotification:async(title,options)=>{log.push({title,options});}},
  clients:{matchAll:async()=>[],openWindow:async(url)=>{log.push({opened:url});}},
  skipWaiting(){},
 };
 vm.runInNewContext(workerSource,{self,URL,caches:{open:async()=>({addAll:async()=>{},put:async()=>{}}),keys:async()=>[]},Promise});
 return {
  log,
  async push(data){let pending;events.push({data:{json:()=>data},waitUntil:p=>{pending=p;}});await pending;},
  async click(notification,action){let pending;events.notificationclick({notification:{close(){},data:notification.options.data},action,waitUntil:p=>{pending=p;}});await pending;}
 };
}
// First five: ordinary user failures.
test("1. Private call stays bound to member-only Stream type",()=>{
 assert.match(callSource,/const PRIVATE_CALL_TYPE="nbl_private"/);
 assert.match(callSource,/access\.callType!==PRIVATE_CALL_TYPE/);
 assert.doesNotMatch(callSource,/client\.call\("default"/);
});
test("2. Both camera elements subscribe even offscreen",()=>{
 const h=makeCall();
 h.context.participants=[participant("local",true),participant("remote",false)];
 vm.runInContext("renderParticipants(participants)",h.context);
 const videos=h.log.filter(x=>x[0]==="video");
 assert.equal(videos.length,2);
 assert.deepEqual(videos.map(x=>x[1]),["local","remote"]);
 assert.equal(h.found.get("#participants").children.length,2);
 assert.doesNotMatch(callSource,/call\.trackElementVisibility\(/);
 assert.doesNotMatch(callSource,/call\.setViewport\(/);
});
test("3. Remote audio is bound separately from muted mobile autoplay videos",()=>{
 const h=makeCall();h.context.participants=[participant("local",true),participant("remote",false)];
 vm.runInContext("renderParticipants(participants)",h.context);
 assert.deepEqual(h.log.filter(x=>x[0]==="audio").map(x=>x[1]),["remote"]);
 const videos=h.found.get("#participants").children.map(w=>w.children.find(x=>x.tag==="video"));
 assert.ok(videos.every(v=>v.muted===true&&v.playsInline===true));
});
test("4. User tap can recover audio if mobile autoplay blocked",async()=>{
 const h=makeCall();h.context.participants=[participant("local",true),participant("remote",false)];
 vm.runInContext("renderParticipants(participants);joined=true",h.context);
 await vm.runInContext("enableRemoteSound()",h.context);
 assert.ok(h.log.some(x=>x[0]==="play"&&x[1]==="audio"));
 assert.equal(h.found.get("#callStatus").textContent,"Call sound enabled.");
 assert.match(pageSource,/id="callSound"/);
});
test("5. iPhone requires Home Screen; installed iPhone and Android do not",()=>{
 const from=appSource.indexOf("function needsIphoneHomeScreen()");
 const to=appSource.indexOf("function iphoneHomeScreenHelp()",from);
 assert.ok(from>=0&&to>from);
 const code=appSource.slice(from,to)+";needsIphoneHomeScreen()";
 const check=(ua,standalone,display)=>{
  const navigator={userAgent:ua,platform:"",maxTouchPoints:0,standalone};
  const window={matchMedia:()=>({matches:display})};
  return vm.runInNewContext(code,{navigator,window});
 };
 assert.equal(check("Mozilla iPhone",undefined,false),true);
 assert.equal(check("Mozilla iPhone",true,false),false);
 assert.equal(check("Mozilla iPhone",undefined,true),false);
 assert.equal(check("Mozilla Android",undefined,false),false);
 assert.equal(manifest.display,"standalone");
});
// Second five: adversarial and failure recovery.
test("6. Valid call push contains Answer and Decline",async()=>{
 const w=await makeWorker();await w.push({type:"video_call",callId:id});
 assert.equal(w.log.length,1);
 assert.equal(w.log[0].title,"Incoming NBL video call");
 assert.deepEqual(Array.from(w.log[0].options.actions,x=>x.action),["answer","decline"]);
 assert.equal(w.log[0].options.data.url,"/messenger/call.html?call="+id);
});
test("7. Malformed call IDs never show valid call notifications",async()=>{
 const w=await makeWorker();await w.push({type:"video_call",callId:"../../evil"});
 assert.notEqual(w.log[0].title,"Incoming NBL video call");
 assert.equal(w.log[0].options.data.url,"/messenger/");
});
test("8. Notification click ignores a malicious external URL",async()=>{
 const w=await makeWorker();await w.push({type:"video_call",callId:id,url:"https://attacker.invalid/steal"});
 await w.click(w.log[0],"answer");
 assert.equal(w.log.find(x=>x.opened)?.opened,"https://newbeansland.org/messenger/call.html?call="+id);
});
test("9. Decline opens private decline route, not auto-answer",async()=>{
 const w=await makeWorker();await w.push({type:"video_call",callId:id});
 await w.click(w.log[0],"decline");
 assert.equal(w.log.find(x=>x.opened)?.opened,
   "https://newbeansland.org/messenger/call.html?call="+id+"&decline=1");
 assert.match(callSource,/params\.get\("decline"\)==="1"/);
});
test("10. Participant updates do not duplicate tiles; exit unbinds remote media",()=>{
 const h=makeCall();h.context.participants=[participant("local",true),participant("remote",false)];
 vm.runInContext("renderParticipants(participants);renderParticipants(participants)",h.context);
 assert.equal(h.log.filter(x=>x[0]==="video").length,2);
 h.context.participants=[participant("local",true)];
 vm.runInContext("renderParticipants(participants)",h.context);
 assert.equal(h.log.filter(x=>x[0]==="unbindVideo"&&x[1]==="remote").length,1);
 assert.equal(h.log.filter(x=>x[0]==="unbindAudio"&&x[1]==="remote").length,1);
 assert.equal(h.found.get("#participants").children.filter(x=>!x.removed).length,1);
});
