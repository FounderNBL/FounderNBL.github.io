import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const music=read("studio/index.html");
const publicCatalog=read("studio/catalog.js");
const publicPlayer=read("studio/player.js");
const privatePlayer=read("studio/private-releases.js");
const runbook=read("studio/ADDING_SONGS.md");

test("two approved public soundtrack tracks remain unchanged and free",()=>{
  for(const title of ["You Hear It Too","Still Walking"])assert.ok(publicCatalog.includes('title: "'+title+'"'));
  assert.equal((publicCatalog.match(/purchaseUrl: ""/g)||[]).length,2);
  assert.match(publicPlayer,/src\.origin===location\.origin/);
  assert.match(publicPlayer,/download\.download=/);
  assert.match(music,/Download free MP3/);
});
test("exclusive catalog loads only from guarded private release API",()=>{
  assert.match(music,/id="exclusiveCatalog"[^>]*hidden/);
  assert.match(music,/private-releases\.js/);
  assert.match(privatePlayer,/action,/);
  assert.match(privatePlayer,/request\("catalog"\)/);
  assert.match(privatePlayer,/request\("listen_start"/);
  assert.match(privatePlayer,/request\("listen_count"/);
  assert.match(privatePlayer,/previewOnly/);
  assert.match(privatePlayer,/credentials:"omit"/);
  assert.doesNotMatch(privatePlayer,/\bdownload\b\s*=|createSignedUrl|getPublicUrl|master_object_key|purchaseUrl|checkout\.stripe\.com|sk_live_/);
});
test("public catalog never exposes private master storage",()=>{
  assert.match(runbook,/exclusive JMELO, Shia/);
  assert.match(runbook,/nbl-music-masters/);
  assert.doesNotMatch(publicCatalog,/nbl-music-masters|storage\/v1\/object/);
  assert.doesNotMatch(privatePlayer,/nbl-music-masters|storage\/v1\/object|nbl_masters/);
  assert.match(privatePlayer,/paidDownloadAvailable/);
});
