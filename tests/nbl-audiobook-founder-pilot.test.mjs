import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const page=readFileSync(new URL("../audiobook-founder-lab.html",import.meta.url),"utf8");
const script=readFileSync(new URL("../nbl-audiobook-founder-lab.js",import.meta.url),"utf8");
test("unlisted Founder voice pilot has three engines, approval and audio output",()=>{
 assert.match(page,/noindex,nofollow/);
 assert.match(page,/ElevenLabs/);
 assert.match(page,/Azure Speech/);
 assert.match(page,/Google Cloud Text-to-Speech/);
 assert.match(page,/id="audio-lab-consent"/);
 assert.match(page,/id="audio-lab-player"/);
 assert.match(page,/id="audio-lab-sign-in"/);
});
test("paid samples require Clerk token and opt-in consent",()=>{
 assert.match(script,/session\.getToken\(\)/);
 assert.match(script,/confirmPaidUsage:true/);
 assert.match(script,/if\(!\$\("audio-lab-consent"\)\.checked\)/);
 assert.match(script,/\$\("audio-lab-consent"\)\.checked=false;/);
 assert.match(script,/founder_sample/);
 assert.match(script,/https:\/\/tvypdakofcrlvnwporhh\.supabase\.co\/functions\/v1\/nbl-audiobook-lab/);
});
test("client only uses protected backend and doesn't carry API keys",()=>{
 assert.doesNotMatch(script,/ELEVENLABS_API_KEY|AZURE_SPEECH_KEY|NBL_GOOGLE_TTS_SERVICE_ACCOUNT_JSON/);
 assert.doesNotMatch(script,/api\.elevenlabs\.io|texttospeech\.googleapis\.com|tts\.speech\.microsoft\.com/);
 assert.doesNotMatch(script,/checkout\.sessions|nbl_studios_reserve|nbl_studios_refund/);
 assert.match(script,/URL\.createObjectURL\(blob\)/);
});
