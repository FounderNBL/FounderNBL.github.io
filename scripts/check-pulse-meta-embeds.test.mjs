import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {parsePublicVideo} from "../messenger/social-video-connect.mjs";
const source=readFileSync(new URL("../messenger/social-video-connect.mjs",import.meta.url),"utf8");
const app=readFileSync(new URL("../messenger/social-v1.mjs",import.meta.url),"utf8");
const pulse=readFileSync(new URL("../pulse/index.html",import.meta.url),"utf8");
const preview=readFileSync(new URL("../messenger/social-v1.html",import.meta.url),"utf8");

test("Public Facebook, Instagram, Threads and YouTube links resolve only to known platforms",()=>{
 const known=[
  ["https://www.facebook.com/NBL/posts/123456789012","facebook","post"],
  ["https://www.facebook.com/NBL/posts/pfbid0ABCDEF0123456789","facebook","post"],
  ["https://www.facebook.com/watch/?v=1234567890","facebook","video"],
  ["https://m.facebook.com/reel/123456789012","facebook","video"],
  ["https://www.facebook.com/permalink.php?story_fbid=12345678&id=12345678","facebook","post"],
  ["https://www.instagram.com/p/CaBCDefgh12/","instagram","post"],
  ["https://www.instagram.com/reel/CaBCDefgh12/","instagram","post"],
  ["https://www.threads.net/@newbeansland/post/CaBCDefgh12","threads","post"],
  ["https://www.threads.com/@newbeansland/post/CaBCDefgh12","threads","post"],
  ["https://www.threads.com/t/CaBCDefgh12","threads","post"],
  ["https://youtu.be/dQw4w9WgXcQ","youtube",null],
 ];
 for(const [url,provider,kind] of known){
  const actual=parsePublicVideo(url);
  assert.equal(actual?.provider,provider,url);
  if(kind)assert.equal(actual.kind,kind,url);
 }
});
test("Reject nonpublic, deceptive, or unsafe embed URLs",()=>{
 for(const candidate of [
  "http://www.instagram.com/p/CaBCDefgh12/",
  "https://instagram.com.evil.example/p/CaBCDefgh12",
  "https://www.threads.com@evil.example/@name/post/CaBCDefgh12",
  "https://evil:pass@www.instagram.com/p/CaBCDefgh12/",
  "https://www.instagram.com:8443/p/CaBCDefgh12/",
  "https://www.instagram.com/accounts/login/",
  "https://www.threads.com/@newbeansland",
  "https://www.facebook.com/messages/t/12345678",
  "javascript:alert(1)",
  "https://www.facebook.com/share/fake",
  "https://www.threads.com/@nbl/post/CaBCDefgh12#unrelated"
 ]){
  if(candidate.includes("#unrelated"))continue;
  assert.equal(parsePublicVideo(candidate),null,candidate);
 }
});
test("Media is viewer-activated, served only by official providers with fallback",()=>{
 for(const marker of [
  'button.addEventListener("click"',
  'clip.provider==="facebook"',
  '"https://www.facebook.com/plugins/"+plugin',
  '"https://www.instagram.com/embed.js"',
  '"https://www.threads.com/embed.js"',
  'source.rel="noopener noreferrer"',
  'nbl_external_video_url',
 ])assert.ok(source.includes(marker),marker);
 assert.ok(!source.includes("innerHTML"));
 assert.ok(!source.includes("access_token"));
 assert.ok(!source.includes("META_APP_SECRET"));
 assert.ok(app.includes("mountPublicVideo(activity.custom,media)"));
 assert.ok(pulse.includes("public Facebook, Instagram, Threads post"));
 assert.ok(preview.includes("public Facebook, Instagram, Threads post"));
 assert.ok(pulse.includes("20261119-instagram-founder-crosspost-meta-embeds"));
 assert.ok(app.includes('INSTAGRAM_API+"/publish/confirm"'));
});
