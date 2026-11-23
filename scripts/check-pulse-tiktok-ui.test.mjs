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
