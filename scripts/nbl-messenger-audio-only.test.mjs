// Public Messenger audio-only join smoke test. No network or live call.
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const page=readFileSync(new URL("../messenger/call.html",import.meta.url),"utf8");
const script=readFileSync(new URL("../messenger/call.mjs",import.meta.url),"utf8");
test("the existing member-only call has an explicit no-camera join action",()=>{
  assert.match(page,/id="joinAudio" type="button">Join without camera/);
  assert.match(page,/id="join" type="button">Join video call/);
  assert.match(script,/async function join\(\{audioOnly=false\}=\{\}\)/);
  assert.match(script,/join\(\{audioOnly:true\}\)/);
  assert.match(script,/join\(\{audioOnly:false\}\)/);
});
test("audio-only path does not request or publish camera access",()=>{
  const start=script.indexOf("let cameraReady=!audioOnly");
  const end=script.indexOf("mediaWarning=",start);
  assert.ok(start>=0&&end>start);
  const code=script.slice(start,end);
  assert.match(code,/if\(audioOnly\)\{try\{await call\.camera\.disable\(\)/);
  assert.match(code,/else\{try\{await call\.camera\.enable\(\)/);
  assert.match(code,/await call\.microphone\.enable\(\)/);
  assert.match(script,/mediaWarning=\(!microphoneReady\|\|\(!audioOnly&&!cameraReady\)\)/);
});
test("both join actions have lifecycle and permission controls",()=>{
  assert.match(script,/joinAudio"\)\.disabled=true/);
  assert.match(script,/joinAudio"\)\.hidden=true/);
  assert.match(script,/joinAudio"\)\.hidden=false/);
  assert.match(script,/joinAudio"\)\.disabled=false/);
  assert.match(script,/const PRIVATE_CALL_TYPE="nbl_private"/);
  assert.match(script,/if\(access\.user\?\.id!==owner/);
  assert.match(script,/call\.bindAudioElement/);
  assert.doesNotMatch(page,/NBL_VIDEO_API_SECRET|STREAM_API_SECRET/);
});
