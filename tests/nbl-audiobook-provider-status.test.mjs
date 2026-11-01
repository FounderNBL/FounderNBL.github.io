import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const js=readFileSync(new URL("../nbl-audiobook-founder-lab.js",import.meta.url),"utf8");
const page=readFileSync(new URL("../audiobook-founder-lab.html",import.meta.url),"utf8");
test("server-reported provider configuration is clear without misleading a customer",()=>{
 assert.match(js,/s\.providersConfigured/);
 assert.match(js,/s\.missing/);
 assert.match(js,/NOT CONNECTED TO SUPABASE/);
 assert.match(js,/options/);
 assert.match(js,/item\.disabled=!p\[item\.value\]/);
 assert.match(page,/white-space:pre-line/);
});
test("local browser audio check is clearly not paid provider synthesis",()=>{
 assert.match(page,/id="audio-lab-local-preview"/);
 assert.match(js,/SpeechSynthesisUtterance/);
 assert.match(js,/NOT paid ElevenLabs\/Google\/Azure narration/);
 assert.match(js,/speechSynthesis\.cancel\(\)/);
});
test("real provider action still requires one-click spend authorization",()=>{
 assert.match(js,/audio-lab-consent/);
 assert.match(js,/confirmPaidUsage:true/);
 assert.match(js,/founder_sample/);
 assert.match(js,/checked=false/);
 assert.doesNotMatch(js,/xi-api-key|AZURE_SPEECH_KEY|ELEVENLABS_API_KEY|GCP_OAUTH_ACCESS_TOKEN/);
});
