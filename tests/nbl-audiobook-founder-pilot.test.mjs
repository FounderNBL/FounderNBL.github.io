import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
test("Founder audiobook workbench was retired from public website and archived in private Desk",()=>{
 const html=readFileSync(new URL("../audiobook-founder-lab.html",import.meta.url),"utf8");
 const js=readFileSync(new URL("../nbl-audiobook-founder-lab.js",import.meta.url),"utf8");
 assert.match(html,/noindex,nofollow/);
 assert.match(html,/This page is unavailable/);
 assert.doesNotMatch(html+js,/founder_sample|confirmPaidUsage|audio-lab|ELEVENLABS_API_KEY|AZURE_SPEECH_KEY/);
});
