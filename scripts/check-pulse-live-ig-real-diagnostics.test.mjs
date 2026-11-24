// NBL real-provider diagnostic source contract.
// This test does NOT simulate a successful Meta message or Stream broadcast.
// Real Stream health is separately queried by the existing Pulse PR workflow;
// the Founder-only Meta check must use a genuine authenticated session.
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const page=read("pulse/index.html");
const ig=read("pulse/instagram-inbox.mjs");
const igBackend=read("server/supabase/functions/nbl-instagram-connect/index.ts");
const live=read("pulse/live.mjs");
test("actual Meta inbox check is Founder-only, read-only and returns bounded readiness",()=>{
 const start=igBackend.indexOf("async function checkInstagramInboxAccess(req:Request)");
 const end=igBackend.indexOf("// Founder-only Instagram Direct inbox.",start);
 assert.ok(start>=0&&end>start,"Check function must precede the normal inbox handler");
 const check=igBackend.slice(start,end);
 for(const expected of [
  "ORIGINS.has(origin)","founderUser(req)","founderInboxToken(actor)",
  "inspectMessagingGrant(grant.token)","officialInstagramInboxAccount(grant.token)",
  'fields:"id",limit:"1"',"graphInboxRead(inboxId+","pageAccess:"
 ])assert.ok(check.includes(expected),expected);
 for(const forbidden of ["metaPost(", '"/messages"','client_secret']){
  assert.equal(check.includes(forbidden),false,"Readiness must not call "+forbidden);
 }
 assert.match(igBackend,/pathname\.endsWith\(\"\/inbox\/check\"\)\)return checkInstagramInboxAccess\(req\)/);
 assert.match(igBackend,/!ORIGINS\.has\(origin\)\)return response\(req,\{ok:false,reason:\"origin_not_allowed\"\},403/);
 assert.match(page,/id="pulseIgCheck"[^>]*>Check real Instagram access/);
 assert.match(ig,/call\("check",\{action:"check"\}\)/);
 assert.match(ig,/No message sent/);
});
test("Stream check calls the real deployed read-only health route, not broadcast actions",()=>{
 const a=live.indexOf("async function onLiveReadiness()");
 const b=live.indexOf("async function onToggleLive()",a);
 assert.ok(a>=0&&b>a);
 const health=live.slice(a,b);
 assert.match(health,/fetch\(ENDPOINT\+"\?action=health"/);
 assert.match(health,/method:"GET",cache:"no-store"/);
 assert.match(health,/h\.callTypeReady!==true/);
 assert.match(health,/h\.livestreamEnabled!==true/);
 assert.match(health,/h\.permissionsRepairable===true/);
 assert.doesNotMatch(health,/liveApi\("start"|liveApi\("go-live"|admin-switch|startRTMPBroadcasts/);
 assert.match(page,/id="pulseLiveCheck"/);
 assert.match(page,/id="pulseLiveCheckStatus"/);
 assert.match(live,/addEventListener\("click", \(\) => \{ void onLiveReadiness\(\); \}\)/);
});
test("No fake receipts or automatic replies are substituted for provider evidence",()=>{
 assert.doesNotMatch(ig,/fakeMessage|autoReply|demoMessage|simulatedMetaReply|localStorage|sessionStorage/);
 assert.match(igBackend,/Actual Meta inbox read completed\. No message or reply was sent/);
 assert.match(live,/This does not test a camera or actual broadcast/);
 assert.match(page,/not checked|Not checked/);
});
