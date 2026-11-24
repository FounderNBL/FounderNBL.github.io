import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {normalizePulseThreads,normalizeInstagramThreads,sortConversations} from "../pulse/unified-inbox.mjs";
const file=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const page=file("pulse/index.html");
const hub=file("pulse/unified-inbox.mjs");
const client=file("messenger/social-v1.mjs");
const member=file("pulse/member-inbox.mjs");
const instagram=file("pulse/instagram-inbox.mjs");

test("All messages sorts real NBL and Instagram conversation summaries without message bodies",()=>{
 const pulse=normalizePulseThreads({threads:[
  {id:"12345678-1234-1234-1234-123456789abc",thread_type:"direct",peer:{handle:"member_one"},updated_at:"2026-11-20T21:00:00Z",messages:[{body:"private secret"}]},
  {id:"12345678-1234-1234-1234-123456789abd",thread_type:"study_hall",peer:{handle:"class"},updated_at:"2026-11-20T21:00:00Z"}
 ]});
 const meta=normalizeInstagramThreads({conversations:[
  {id:"17841405386123456",people:[{id:"1133557799",username:"friend"}],updated_at:"2026-11-20T23:00:00Z"}
 ]});
 const sorted=sortConversations([...pulse,...meta]);
 assert.equal(sorted.length,2);
 assert.equal(sorted[0].provider,"instagram");
 assert.equal(sorted[1].label,"@member_one");
 assert.doesNotMatch(JSON.stringify(sorted),/private secret|1133557799/);
});
test("One Messages navigation entry retains old authenticated inbox transports",()=>{
 for(const id of ["pulseUnifiedInboxNav","pulseUnifiedInbox","pulseInboxList","pulseInboxAll","pulseInboxThreadHost","pulseInboxStatus","pulseInboxRefresh"])
  assert.ok(page.includes('id="'+id+'"'),id);
 for(const provider of ["all","pulse","instagram","facebook","tiktok"])
  assert.ok(page.includes('data-pulse-inbox="'+provider+'"'),provider);
 assert.match(page,/pulse-legacy-message-tab\{display:none!important\}/);
 assert.match(client,/mountUnifiedInbox\(\{/);
 assert.match(client,/mountMemberInbox\(payload=>secured\(SOCIAL_API,payload\),/);
 assert.match(client,/mountInstagramInbox\(\(path,payload\)=>secured\(INSTAGRAM_API\+path,payload\)\)/);
 assert.match(hub,/host\.append\(member, ig\)/);
});
test("Unified inbox only calls authorized existing services; unavailable providers are not simulated",()=>{
 assert.match(hub,/social\(\{action:"list_threads"\}\)/);
 assert.match(hub,/instagram\("\/inbox\/list",\{action:"list"\}\)/);
 assert.match(hub,/if \(founder\) requested\.push\(/);
 assert.match(hub,/pages_messaging/);
 assert.match(hub,/TikTok Business Messaging API/);
 assert.doesNotMatch(hub,/localStorage|sessionStorage|innerHTML|console\.(?:log|warn)|access_token|client_secret|fakeMessage/);
 assert.doesNotMatch(hub,/https:\/\/graph\.facebook\.com|https:\/\/business-api\.tiktok\.com/);
});
test("Opening unified threads delegates to original, confirmed reply handlers",()=>{
 assert.match(member,/export function showPulseMemberThread\(id\)/);
 assert.match(member,/pulse:member-inbox-open/);
 assert.match(member,/await open\(\);await readThread\(id\)/);
 assert.match(instagram,/export function showPulseInstagramThread\(id\)/);
 assert.match(hub,/showPulseMemberThread\(entry\.id\)/);
 assert.match(hub,/showPulseInstagramThread\(entry\.id\)/);
 assert.match(member,/action:"send"/);
 assert.match(instagram,/confirm:"send"/);
 assert.match(instagram,/reply_window_open===true/);
 assert.match(client,/showPulseMemberInbox\(\/\^@\?/);
});
test("New UI stays private and does not add public message storage",()=>{
 assert.match(page,/section class="social-list pulse-unified-inbox" id="pulseUnifiedInbox"[^>]*hidden/);
 assert.match(page,/id="pulseUnifiedInboxNav"[^>]*hidden/);
 assert.match(client,/if\(!initialNBLUserId\)/);
 assert.match(client,/await session\(\)/);
 assert.match(client,/founder:state\.me\?\.role==="founder"/);
 assert.doesNotMatch(hub,/\.innerHTML\s*=|localStorage|sessionStorage|sendBeacon|analytics\.track|window\.open/);
});

test("Meta opaque conversation IDs survive the unified inbox without path injection",()=>{
 const threads=normalizeInstagramThreads({conversations:[
  {id:"t_abc123_-XYZ=",people:[{username:"friend"}]},
  {id:"../bad/path",people:[]}
 ]});
 assert.equal(threads.length,1);
 assert.equal(threads[0].id,"t_abc123_-XYZ=");
});

 test("Pulse Connect opens native inbox first and preserves separate full communication service",()=>{assert.match(hub,/let current = "pulse"/);assert.match(hub,/function open\(name = "pulse"/);assert.match(page,/id="pulseUnifiedInboxHeading">Pulse Connect/);assert.match(page,/href="\/messenger\/">Open the full Pulse Connect app/);assert.match(client,/user:"My Beats"/);assert.match(hub,/instagram-inbox\.mjs\?v=20261121-pulse-connect-v1/);assert.match(client,/instagram-inbox\.mjs\?v=20261121-pulse-connect-v1/);});
