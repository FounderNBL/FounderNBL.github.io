// Controlled browser-behavior exercise for the actual TikTok page controller.
// No real Clerk, TikTok, Supabase network call, file upload or publish API.
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const source=readFileSync(new URL("../pulse/tiktok.mjs",import.meta.url),"utf8");
function element(id){
 const e={id,hidden:false,disabled:false,checked:false,value:"",textContent:"",
   children:[],files:[],options:[],listeners:{},style:{},
   addEventListener(kind,handler){this.listeners[kind]=handler;},
   append(...children){this.children.push(...children);},
   replaceChildren(...children){this.children=[...children];if(id==="privacy")this.options=children;},
   removeAttribute(){},load(){},reset(){this.checked=false;},
   scrollIntoView(){},setAttribute(){},after(){}};
 if(id==="environment"){e.value="sandbox";e.options=[{value:"sandbox"},{value:"production"}];}
 if(id==="kind"){e.value="draft";e.options=[{value:"draft"},{value:"direct"}];}
 return e;
}
async function setup({creatorFail=false}={}){
 const ids=new Map(),calls=[];
 const $=id=>{if(!ids.has(id))ids.set(id,element(id));return ids.get(id);};
 for(const name of ["environment","kind","post","file","send","consent","settings",
   "preflight","prepare","recent","recentList","historyShell","historyStatus",
   "readiness","selectedState","postingStatus","status","check"])$(name);
 const document={getElementById:$,createElement:tag=>element(tag),
   head:{append(){throw Error("Clerk script should already exist");}}};
 const session={getToken:async()=> "fixture-jwt"};
 const clerk={user:{id:"member-fixture"},isSignedIn:true,session,
   load:async()=>{},addListener:()=>{}};
 const fetch=async(_url,options)=>{
   const body=JSON.parse(options.body);
   const action=body.action;
   calls.push(action);
   if(action==="upload"||action==="begin"||action==="callback")
     throw Error("Controlled preflight must never send or authorize an upload");
   const ok=value=>({ok:true,json:async()=>({ok:true,...value})});
   if(action==="configuration")return ok({sandbox:true,production:false});
   if(action==="connection")return ok({connected:true,label:"Test account",account_ref:"test-ref",
     scopes:["video.upload","video.publish"]});
   if(action==="recent")return ok({posts:[{publish_id:"historical-id",
     created_at:"2026-11-23T23:40:09Z"}]});
   if(action==="creator")return creatorFail?{ok:false,json:async()=>({ok:false,reason:"access_token_invalid"})}
      :ok({creator:{creator_nickname:"Test",creator_username:"test",
        privacy_level_options:["SELF_ONLY"],max_video_post_duration_sec:60}});
   if(action==="status")return ok({status:"SEND_TO_USER_INBOX"});
   throw Error("Unexpected action "+action);
 };
 const location={href:"https://newbeansland.org/pulse/tiktok-callback.html",
   pathname:"/pulse/tiktok-callback.html",search:""};
 const context={document,window:{Clerk:clerk},fetch,location,
   URL,Blob,FormData,Date,Option:class{constructor(name,value){this.name=name;this.value=value;}},
   history:{replaceState(){}},sessionStorage:{getItem(){return null;},removeItem(){}},
   confirm(){return false;},setTimeout(){throw Error("No timers or real polling in preflight");},
   console:{log(){},warn(){}},
 };
 vm.runInNewContext(source,context,{filename:"pulse/tiktok.mjs",timeout:4000});
 // A full event-loop tick is needed because the controller initializes
 // through multiple awaited browser and API promises.
 for(let i=0;i<35;i++){
  await new Promise(resolve=>setImmediate(resolve));
  if(calls.includes("recent")&&$("preflight").disabled===false)break;
 }
 assert.equal($("preflight").disabled,false,
   "Connection should finish: "+$("status").textContent+"; calls="+calls.join(","));
 return {ids,$,calls};
}
test("the existing controller checks connection, expands preparation, and NEVER uploads without a file",async()=>{
 const {ids,$,calls}=await setup();
 assert.equal($("post").hidden,true,"The form must start locked");
 assert.equal($("preflight").disabled,false,"Signed-in account can check readiness");
 assert.equal($("check").hidden,true,"No old publish ID can be the current upload");
 assert.equal($("historyShell").hidden,false,"Earlier submission is visible as history only");
 assert.equal($("recentList").children.length,1);
 await $("preflight").listeners.click();
 assert.match($("readiness").textContent,/TikTok verified your account/);
 assert.equal($("prepare").hidden,false);
 assert.equal($("post").hidden,true);
 $("prepare").listeners.click();
 assert.equal($("post").hidden,false);
 assert.equal($("send").disabled,true,"No selected file means no send");
 let prevented=false;
 await $("post").listeners.submit({preventDefault(){prevented=true;}});
 assert.equal(prevented,true);
 assert.deepEqual(calls.filter(x=>x==="upload"),[]);
 assert.deepEqual(calls.filter(x=>x==="creator"),["creator"]);
 assert.equal($("check").hidden,true);
 assert.match($("postingStatus").textContent,/No new video sent/);
 // Earlier TikTok status must not turn into current upload status.
 $("recentList").children[0].children[0].listeners.click();
 for(let i=0;i<10;i++)await Promise.resolve();
 assert.match($("historyStatus").textContent,/earlier draft/);
 assert.match($("postingStatus").textContent,/No new video sent/);
 assert.equal($("check").hidden,true);
});
test("failed read-only TikTok verification blocks the video form without a send",async()=>{
 const {$,calls}=await setup({creatorFail:true});
 await $("preflight").listeners.click();
 assert.match($("readiness").textContent,/Connection check failed/);
 assert.equal($("prepare").hidden,true);
 assert.equal($("post").hidden,true);
 assert.equal($("send").disabled,true);
 assert.equal(calls.includes("upload"),false);
});
