import { test, expect } from "@playwright/test";

// Automated rehearsal of the REAL Pulse page. All auth, Stream media and API
// responses are fixtures. Not a substitute for signed-in provider media proof.
const LIVE = "https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-live";
const VIDEO_SDK = "export class StreamVideoClient { constructor(c){this.user=c.user;} call(){ const id=this.user.id; return { camera:{enable:async()=>{window.__pulseCameraEnabled=true;}}, microphone:{enable:async()=>{window.__pulseMicrophoneEnabled=true;}}, screenShare:{enable:async()=>{window.__pulseScreenRequests=(window.__pulseScreenRequests||0)+1;if(window.__pulseDenyScreen)throw Error('picker cancelled');}}, state:{participantCount:2,participants$:{subscribe(f){f([{sessionId:'local-'+id,isLocalParticipant:true},{sessionId:'remote-host',name:'Synthetic host',isLocalParticipant:false}]);return {unsubscribe(){}};}}},join:async()=>{},leave:async()=>{},bindVideoElement:()=>()=>{},bindAudioElement:()=>()=>{} };} async disconnectUser(){} }";
const response=(body,status=200)=>({
 status,contentType:"application/json",headers:{"access-control-allow-origin":"*","access-control-allow-headers":"authorization, content-type","access-control-allow-methods":"POST, OPTIONS"},
 body:JSON.stringify(body)
});
function syntheticBackend(){
 const s={phase:"idle",enabled:true,host:"host",callId:"11111111-1111-4111-8111-111111111111",title:"Synthetic Pulse rehearsal",facebook_enabled:false,actions:[]};
 return {s,handle:async(route,user)=>{
  const req=route.request();
  if(req.method()==="OPTIONS")return route.fulfill(response({ok:true}));
  const body=req.postDataJSON()||{},action=body.action;
  s.actions.push({user,action,body});
  if(action==="status"){
   const payload={ok:true,status:s.phase,isAdmin:user==="host",isHost:s.phase==="idle"?true:user===s.host,enabled:s.enabled,allowance:{remainingSeconds:1200,rollover:false},facebook:{canStart:user==="host",configured:user==="host",enabled:s.facebook_enabled,status:s.phase==="live"&&s.facebook_enabled?"live":"disabled"}};
   if(s.phase!=="idle")Object.assign(payload,{callId:s.callId,title:s.title,hlsPlaylistUrl:null,startedAt:s.phase==="live"?new Date().toISOString():null});
   return route.fulfill(response(payload));
  }
  if(action==="start"){
   if(!s.enabled)return route.fulfill(response({ok:false,reason:"live_disabled"},503));
   if(s.phase!=="idle")return route.fulfill(response({ok:false,reason:"live_already_active"},409));
   s.phase="backstage";s.host=user;s.title=body.title||s.title;s.facebook_enabled=body.facebook_enabled===true;
   return route.fulfill(response({ok:true,key:"synthetic-public-key",token:"synthetic-token",callId:s.callId,callType:"livestream",facebook:{enabled:s.facebook_enabled,status:s.facebook_enabled?"ready":"disabled"}}));
  }
  if(action==="go-live"){
   if(s.phase!=="backstage"||s.host!==user)return route.fulfill(response({ok:false,reason:"live_not_backstage"},409));
   s.phase="live";
   return route.fulfill(response({ok:true,live:true,startedAt:new Date().toISOString(),facebook:{status:s.facebook_enabled?"live":"disabled"}}));
  }
  if(action==="join-viewer"){
   if(s.phase!=="live")return route.fulfill(response({ok:false,reason:"live_not_found"},404));
   return route.fulfill(response({ok:true,callId:s.callId,callType:"livestream",key:"synthetic-public-key",token:"synthetic-viewer-token"}));
  }
  if(action==="end"){
   if(s.host!==user)return route.fulfill(response({ok:false,reason:"admin_only"},403));
   s.phase="idle";
   return route.fulfill(response({ok:true,ended:true,cleanup:{live:"ok"}}));
  }
  if(action==="admin-switch"){
   if(user!=="host")return route.fulfill(response({ok:false,reason:"admin_only"},403));
   s.enabled=body.enabled===true;
   return route.fulfill(response({ok:true,enabled:s.enabled,shutdown:"no_active_session"}));
  }
  return route.fulfill(response({ok:false,reason:"unknown_action"},400));
 }};
}
async function setup(page,user,api){
 await page.addInitScript(({user})=>{
  window.Clerk={load:async()=>{},get isSignedIn(){return user!=="signed-out";},get user(){return user==="signed-out"?null:{id:user};},get session(){return user==="signed-out"?null:{getToken:async()=>"fixture."+user+".token"};}};
 },{user});
 // Only the Pulse Live module is under test, not the social Feed SDK.
 await page.route("**/messenger/social-v1.mjs**",r=>r.fulfill({status:200,contentType:"text/javascript",body:""}));
 await page.route(/https:\/\/esm\.sh\/@stream-io\/video-client.*/,r=>r.fulfill({status:200,contentType:"text/javascript",headers:{"access-control-allow-origin":"*"},body:VIDEO_SDK}));
 await page.route("https://tvypdakofcrlvnwporhh.supabase.co/**",r=>{
  if(user==="signed-out")return r.fulfill(response({ok:false,reason:"sign_in_required"},401));
  if(r.request().url().split("?")[0]===LIVE)return api.handle(r,user);
  return r.fulfill(response({ok:false,reason:"sign_in_required"},401));
 });
}
async function open(page){
 await page.goto("/pulse/",{waitUntil:"domcontentloaded"});
 // The Feed's own Clerk gate is stubbed; Live still verifies Clerk itself.
 await page.evaluate(()=>{document.querySelector("#socialApp").hidden=false;});
}
test("host -> backstage -> private viewer gate -> LIVE -> viewer -> End",async({page,context})=>{
 const api=syntheticBackend(),host=page,viewer=await context.newPage();
 await setup(host,"host",api);await setup(viewer,"viewer",api);
 await open(host);
 await expect(host.locator("#pulseLiveStart")).toBeVisible();
 await host.locator("#pulseLiveStart").click();
 await expect(host.locator("#pulseLiveStatus")).toContainText("Backstage");
 await open(viewer);
 await expect(viewer.locator("#pulseLiveStatus")).toContainText("getting ready");
 expect(api.s.actions.some(x=>x.user==="viewer"&&x.action==="join-viewer")).toBe(false);
 await expect(host.locator("#pulseLiveScreenOnly")).toBeChecked();
 await expect(host.locator("#pulseLiveBadge")).toBeHidden();
 await expect(host.locator("#pulseLiveElapsed")).toBeHidden();
 await expect(host.locator("#pulseLiveGoLive")).toBeEnabled();
 // One Go Live click triggers screen capture and broadcasts, no extra button.
 await host.locator("#pulseLiveGoLive").click();
 expect(await host.evaluate(()=>window.__pulseScreenRequests)).toBe(1);
 expect(await host.evaluate(()=>Boolean(window.__pulseCameraEnabled||window.__pulseMicrophoneEnabled))).toBe(false);
 expect(api.s.actions.find(x=>x.action==="start")?.body?.facebook_enabled).toBe(true);
 expect(api.s.actions.filter(x=>x.action==="go-live")).toHaveLength(1);
 await expect(host.locator("#pulseLiveStatus")).toContainText("You are LIVE");
 await open(viewer);
 await expect(viewer.locator("#pulseLiveViewers")).toContainText("viewers");
 expect(api.s.actions.some(x=>x.user==="viewer"&&x.action==="join-viewer")).toBe(true);
 host.on("dialog",dialog=>dialog.accept());
 await host.locator("#pulseLiveEnd").click();
 await expect(host.locator("#pulseLiveStatus")).toContainText("Stream ended");
 await open(viewer);
 await expect(viewer.locator("#pulseLiveStatus")).toContainText("Ready to start your Pulse Live broadcast");
 await expect(viewer.locator("#pulseLiveBadge")).toBeHidden();
 expect(api.s.actions.filter(x=>x.action==="end")).toHaveLength(1);
 await viewer.close();
});
test("Founder switch and signed-out visitor restrictions",async({page,context})=>{
 const api=syntheticBackend();api.s.enabled=false;
 await setup(page,"host",api);await open(page);
 await expect(page.locator("#pulseLiveStart")).toBeHidden();
 await expect(page.locator("#pulseLiveAdmin")).toBeVisible();
 await page.locator("#pulseLiveToggle").click();
 await expect(page.locator("#pulseLiveStart")).toBeVisible();
 expect(api.s.enabled).toBe(true);
 const visitor=await context.newPage();
 await setup(visitor,"signed-out",api);await open(visitor);
 await expect(visitor.locator("#pulseLiveStatus")).toContainText("Sign in");
 await expect(visitor.locator("#pulseLiveStart")).toBeHidden();
 expect(api.s.actions.some(x=>x.user==="signed-out")).toBe(false);
 await visitor.close();
});

test("cancel screen picker does not go LIVE, and retry uses the same Go Live button",async({page})=>{
 const api=syntheticBackend();
 await setup(page,"host",api);await open(page);
 await page.locator("#pulseLiveStart").click();
 await expect(page.locator("#pulseLiveStatus")).toContainText("Backstage");
 await page.evaluate(()=>{window.__pulseDenyScreen=true;});
 await page.locator("#pulseLiveGoLive").click();
 await expect(page.locator("#pulseLiveStatus")).toContainText("NOT live");
 await expect(page.locator("#pulseLiveBadge")).toBeHidden();
 await expect(page.locator("#pulseLiveElapsed")).toBeHidden();
 expect(api.s.phase).toBe("backstage");
 expect(api.s.actions.filter(x=>x.action==="go-live")).toHaveLength(0);
 await expect(page.locator("#pulseLiveGoLive")).toBeEnabled();
 await page.evaluate(()=>{window.__pulseDenyScreen=false;});
 await page.locator("#pulseLiveGoLive").click();
 await expect(page.locator("#pulseLiveStatus")).toContainText("You are LIVE");
 expect(api.s.phase).toBe("live");
 expect(await page.evaluate(()=>window.__pulseScreenRequests)).toBe(2);
});

test("Founder can explicitly uncheck Facebook before Start; option survives status polls",async({page})=>{
 const api=syntheticBackend();
 await setup(page,"host",api);await open(page);
 await expect(page.locator("#pulseLiveFacebook")).toBeChecked();
 await page.locator("#pulseLiveFacebook").uncheck();
 await page.waitForTimeout(50);
 await expect(page.locator("#pulseLiveFacebook")).not.toBeChecked();
 await page.locator("#pulseLiveStart").click();
 expect(api.s.actions.find(x=>x.action==="start")?.body?.facebook_enabled).toBe(false);
});

test("mobile normal Live camera path is unchanged and needs no screen picker",async({page})=>{
 await page.setViewportSize({width:390,height:740});
 const api=syntheticBackend();
 await setup(page,"host",api);await open(page);
 await expect(page.locator("#pulseLiveScreenOnly")).toBeDisabled();
 await expect(page.locator("#pulseLiveScreenOnly")).not.toBeChecked();
 await page.locator("#pulseLiveStart").click();
 await expect(page.locator("#pulseLiveStatus")).toContainText("Backstage");
 await page.locator("#pulseLiveGoLive").click();
 await expect(page.locator("#pulseLiveStatus")).toContainText("You are LIVE");
 expect(await page.evaluate(()=>window.__pulseCameraEnabled===true&&window.__pulseMicrophoneEnabled===true)).toBe(true);
 expect(await page.evaluate(()=>window.__pulseScreenRequests||0)).toBe(0);
});
