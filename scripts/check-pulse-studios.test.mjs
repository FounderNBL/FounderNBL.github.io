import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {aspectFor,outputSize,coverGeometry,makeWav,validateLocalFile,IMAGE_TYPES,STUDIO_LIMITS} from "../pulse/studios-core.mjs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const html=read("pulse/index.html"),photo=read("pulse/pulse-studios.mjs"),media=read("pulse/studios-media.mjs"),live=read("pulse/studios-live.mjs"),liveHost=read("pulse/live.mjs"),css=read("pulse/pulse-studios.css");
test("PhotoBeats framing exports real square, portrait and landscape pixel dimensions",()=>{
  assert.deepEqual(outputSize(aspectFor("square",4032,3024),512),{width:512,height:512});
  assert.deepEqual(outputSize(aspectFor("portrait",4032,3024),1080),{width:864,height:1080});
  assert.deepEqual(outputSize(aspectFor("landscape",4032,3024),1080),{width:1080,height:608});
  assert.deepEqual(outputSize(aspectFor("original",4000,3000),1080),{width:1080,height:810});
});
test("PhotoBeats safe crop geometry: rotates and constrains pan",()=>{
  const g=coverGeometry(1200,800,500,500,{rotation:0,zoom:1,panX:1000,panY:-1000});
  assert.ok(g.scale>0);assert.ok(Number.isFinite(g.shiftX));
  assert.ok(Math.abs(g.shiftX)<=((1200*g.scale-500)/2)+1);
  assert.throws(()=>coverGeometry(0,1,500,500),/Invalid image dimensions/);
  const rotated=coverGeometry(1200,800,500,500,{rotation:90,zoom:2});
  assert.ok(rotated.scale>g.scale);
});
test("Profile/photo safety limits remain below existing signed-in upload limits",()=>{
  assert.equal(STUDIO_LIMITS.profileBytes,5*1024*1024);
  assert.equal(STUDIO_LIMITS.postImageBytes,8*1024*1024);
  assert.equal(STUDIO_LIMITS.postVideoBytes,40*1024*1024);
  assert.equal(STUDIO_LIMITS.maxVideoSeconds,60);
  assert.throws(()=>validateLocalFile({type:"image/svg+xml",size:100},IMAGE_TYPES,STUDIO_LIMITS.imageBytes),/supported local file/);
  assert.throws(()=>validateLocalFile({type:"image/png",size:24*1024*1024+1},IMAGE_TYPES,STUDIO_LIMITS.imageBytes),/supported local file/);
  assert.doesNotThrow(()=>validateLocalFile({type:"image/png",size:100},IMAGE_TYPES,STUDIO_LIMITS.imageBytes));
});
test("MusicBeats PCM WAV export contains a valid header, sample count and two channels",async()=>{
  const buffer={numberOfChannels:2,length:3,sampleRate:44100,getChannelData:i=>i?[0,.5,-.5]:[0,1,-1]};
  const blob=makeWav(buffer),bytes=new DataView(await blob.arrayBuffer());
  assert.equal(blob.type,"audio/wav");assert.equal(blob.size,44+3*4);
  assert.equal(bytes.getUint32(4,true),blob.size-8);
  assert.equal(bytes.getUint16(22,true),2);
  assert.equal(bytes.getUint32(24,true),44100);
  assert.equal(bytes.getInt16(48,true),32767);
});
test("Studio user interface is in the REAL Pulse profile, composer and live; unique IDs",()=>{
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size,"Duplicate DOM IDs");
  for(const id of ["psOpenProfile","psOpenPost","psOpenMenu","pulseStudiosDialog","psPhotoCanvas","psPhotoFile","psFaceDetect","psDownloadPhoto","psUsePost","psUseProfile","psVideoPlayer","psVideoStage","psMusicPlayer","psMusicExport","pulseLiveBeatsControls","pulseLiveBeatsRights"]){
    assert.ok(ids.includes(id),"missing "+id);
  }
  assert.match(html,/pulse-studios\.mjs\?v=20261123-free-beats-v1/);
  assert.match(html,/studios-media\.mjs\?v=20261123-free-beats-v1/);
  assert.match(html,/pulse-studios\.css\?v=20261123-free-beats-v2/);
  assert.match(css,/\.ps-dialog/);
  assert.ok(html.indexOf('id="pulseLiveBeatsControls"')<html.indexOf('id="pulseLiveStart"'),"Set live effects BEFORE starting Stream");
});
test("Studio never publishes, calls AI, uploads files or accesses provider secrets",()=>{
  for(const src of [photo,media,live]){
    assert.doesNotMatch(src,/\bfetch\s*\(|\.uploadImage\s*\(|\.uploadFile\s*\(|requestSubmit\s*\(|addActivity\s*\(|openai\.com\/v1|generativelanguage\.googleapis\.com|service_role/i);
  }
  assert.match(photo,/fileToInput\(\$\("#profileAvatarFile"\),file\)/);
  assert.match(photo,/fileToInput\(input,file\)/);
  assert.match(media,/new OfflineAudioContext/);
  assert.match(media,/new MediaRecorder\(output/);
  assert.match(live,/pulseLiveBeatsRights/);
});
test("FaceBeats is opt-in and free Google MediaPipe tracking works locally",()=>{
  assert.match(photo,/async function faceBeats\(/);
  assert.match(photo,/FaceLandmarker\.createFromOptions/);
  assert.match(live,/FaceLandmarker\.createFromOptions/);
  assert.match(live,/typeof call\?\.camera\?\.registerFilter/);
  assert.match(live,/typeof call\?\.microphone\?\.registerFilter/);
  assert.match(liveHost,/await setupLiveBeats\(state\.call\)/);
  assert.match(liveHost,/state\.liveBeatsCleanup\?\.\(\)/);
  assert.match(liveHost,/await joinWithoutCapture\(state\.call\)/);
  assert.match(liveHost,/await state\.call\.camera\.enable\(\)/);
  assert.doesNotMatch(live,/getUserMedia\s*\(/,"Camera permissions are owned by original Stream call");
});
