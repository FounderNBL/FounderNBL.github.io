// Guardrails for Founder-only NBL Pulse -> Instagram manual photo sharing.
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const js=readFileSync(new URL("../messenger/social-v1.mjs",import.meta.url),"utf8");
const page=readFileSync(new URL("../pulse/index.html",import.meta.url),"utf8");

test("Only the Founder can send their own public photo to official Instagram",()=>{
 for(const check of [
  'state.me?.role==="founder"',
  'authorId===state.user?.id',
  'activity.visibility==="public"',
  'activity.attachments.length===1',
  'activity.attachments[0]?.type==="image"',
  'Boolean(trustedMediaLink(activity.attachments[0]?.image_url))',
  'const instagram=element("button",null,"Send to Instagram")',
 ])assert.ok(js.includes(check),check);
});
test("Instagram publishing always requires a distinct Founder confirmation",()=>{
 for(const check of [
  'INSTAGRAM_API+"/publish/prepare"',
  'INSTAGRAM_API+"/publish/confirm"',
  'confirm:"prepare"',
  'confirm:"confirm"',
  'window.confirm("Publish this Pulse photo',
  'containerId=result.container_id',
  'result.published!==true',
 ])assert.ok(js.includes(check),check);
 assert.ok(!js.includes("automaticallyPublishToInstagram("));
});
test("Pulse uploads use the same trusted Stream photo and never expose Meta access token",()=>{
 assert.ok(js.includes('nbl_media_mime:file.type'));
 assert.ok(js.includes('image_url:photo.image_url'));
 assert.ok(!js.includes("NBL_PULSE_INSTAGRAM_ACCESS_TOKEN"));
 assert.ok(page.includes("20261119-instagram-founder-crosspost"));
});
