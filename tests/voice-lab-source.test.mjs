import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("Internal Founder voice tools no longer execute from public pages",()=>{
 const html=read("voice-lab.html"),js=read("voice-lab.js");
 assert.match(html,/noindex,nofollow/);
 assert.match(html,/This page is unavailable/);
 assert.doesNotMatch(html+js,/founder_sample|provider_status|data-voice-owner|ELEVENLABS_API_KEY|xi-api-key|\/voice/);
});
