import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
const read=(p)=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const ui=read("pulse/tiktok.mjs"),page=read("pulse/tiktok-callback.html"),home=read("pulse/index.html");
test("TikTok browser module parses",()=>{const r=spawnSync(process.execPath,["--check",new URL("../pulse/tiktok.mjs",import.meta.url).pathname]);assert.equal(r.status,0,r.stderr.toString());});
test("Existing TikTok backend and member-bound OAuth stay connected",()=>{
 assert.match(ui,/supabase\.co\/functions\/v1\/nbl-tiktok-connect/);
 assert.match(ui,/clerk\?\.session/);
 assert.match(ui,/clerk\.user\?\.id!==member/);
 assert.match(ui,/incoming\.state!==pending\.state/);
 assert.match(ui,/sessionStorage\.removeItem\("nbl-tiktok-oauth"\)/);
 assert.match(ui,/history\.replaceState/);
 assert.doesNotMatch(ui,/(?:CLIENT_SECRET|SERVICE_ROLE_KEY|access_cipher|refresh_cipher)/);
 assert.match(page,/name="referrer" content="no-referrer"/);
});
test("Video goes directly to TikTok only with explicit consent and creator privacy",()=>{
 assert.match(home,/href="\/pulse\/tiktok-callback\.html"[^>]*>Share to TikTok/);
 assert.match(ui,/f\.set\("file",byId\("file"\)\.files\[0\]\)/);
 assert.match(ui,/f\.set\("kind",byId\("kind"\)\.value\)/);
 assert.match(ui,/for\(const id of \["comment","duet","stitch","commercial","own_brand","paid_brand","consent"\]\)/);
 assert.match(ui,/await call\("upload",\{\},f\)/);
 assert.match(ui,/call\("status",\{publish_id:/);
 assert.match(ui,/new Blob\(\[f\],\{type:safeType\}\)/);
 assert.match(page,/id="preview" controls playsinline/);
 assert.match(page,/id="privacy"/);
 assert.match(page,/id="consent" required/);
 assert.match(page,/value="draft"/);
 assert.match(page,/value="direct"/);
 assert.doesNotMatch(ui,/\bcreateBeat\(|\bpublishBeat\(|\bnbl-social\b/);
});
test("TikTok privacy and deletion disclosures remain accessible",()=>{
 assert.match(read("privacy.html"),/Connected TikTok features/);
 assert.match(read("account-deletion.html"),/TikTok-connected data/);
 assert.match(page,/account-deletion\.html/);
});

test("TikTok integration uses the canonical NBL Clerk domain",()=>{
 const original=read("pulse/tiktok-connect.mjs");
 const currentKey=ui.match(/\bpk_live_[A-Za-z0-9_-]+/)?.[0];
 const originalKey=original.match(/\bpk_live_[A-Za-z0-9_-]+/)?.[0];
 assert.ok(originalKey,"Existing NBL Clerk key must be present.");
 assert.equal(currentKey,originalKey,"TikTok must reuse the existing live NBL Clerk key.");
 const suffix=currentKey.split("_")[2];
 assert.equal(Buffer.from(suffix,"base64url").toString("utf8"),"clerk.newbeansland.org$");
});

test("Every NBL member can recover their own TikTok submissions, without invented publication claims",()=>{
 assert.match(ui,/await call\("recent"\)/);
 assert.match(ui,/async function loadRecent\(/);
 assert.match(ui,/byId\("recentList"\)/);
 assert.match(ui,/inspectHistory\(entry\.publish_id,button\.textContent\)/);
 assert.doesNotMatch(ui,/job=entry\.publish_id|job=b\.posts\[0\]/);
 assert.match(ui,/c\.production\?"production":"sandbox"/);
 assert.match(page,/id="recent" hidden/);
 assert.match(page,/id="recentList"/);
 assert.match(page,/tiktok\.mjs\?v=20261124-readiness-v2/);
 assert.match(ui,/SEND_TO_USER_INBOX:"TikTok delivered the video to your inbox; it is NOT publicly posted/);
 assert.doesNotMatch(ui,/founderOnly|isFounderOnly|FOUNDER_ONLY/);
});

test("TikTok readiness can be verified before any file is selected or uploaded",()=>{
 assert.match(page,/id="preflight" type="button" disabled/);
 assert.match(page,/id="prepare" type="button" hidden/);
 assert.match(page,/id="readiness" role="status"/);
 assert.match(page,/id="post" hidden/);
 assert.match(ui,/byId\("preflight"\)\.addEventListener\("click"/);
 assert.match(ui,/const check=await call\("creator"\)/);
 assert.match(ui,/preflightPassed=true/);
 assert.match(ui,/byId\("prepare"\)\.addEventListener\("click"/);
 assert.match(ui,/byId\("post"\)\.hidden=false/);
 const start=ui.indexOf('byId("preflight").addEventListener("click"');
 const end=ui.indexOf('byId("prepare").addEventListener("click"',start);
 assert.ok(end>start);
 const preflight=ui.slice(start,end);
 assert.doesNotMatch(preflight,/call\("upload"|new FormData|f\.set\("file"/);
 assert.match(preflight,/No video uploaded/);
});
test("an older inbox notification cannot become the current job automatically",()=>{
 assert.match(page,/id="historyShell" class="history" hidden/);
 assert.match(page,/id="historyStatus"/);
 assert.match(page,/id="postingStatus"/);
 assert.match(ui,/async function inspectHistory\(/);
 assert.match(ui,/el\.textContent=label/);
 assert.doesNotMatch(ui,/job=entry\.publish_id|job=b\.posts\[0\]\.publish_id/);
 assert.match(ui,/An old post is never auto-selected as the CURRENT upload/);
 assert.match(ui,/TikTok sent an earlier draft to your inbox\. It is NOT a published video/);
});
test("an actual new send requires authorization, chosen file, valid duration and explicit consent",()=>{
 assert.match(ui,/!preflightPassed\|\|!account\|\|!validFile\|\|!byId\("consent"\)\.checked/);
 assert.match(ui,/if\(!preflightPassed\|\|byId\("send"\)\.disabled\|\|busy\|\|!byId\("consent"\)\.checked/);
 assert.match(ui,/byId\("selectedState"\)\.textContent=/);
 assert.match(ui,/const b=await call\("upload",\{\},f\)/);
 assert.match(page,/No video selected · nothing sent/);
 assert.match(page,/Sandbox testing is private/);
 assert.match(page,/Try the TikTok <strong>mobile app<\/strong>/);
 assert.doesNotMatch(ui,/postSay\("TikTok confirms the post is published\."\)/);
});
