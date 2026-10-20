import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const header=read("nbl-world-header.js");
const music=read("studio/index.html");
const catalog=read("studio/catalog.js");
const player=read("studio/player.js");

test("Grey and People remain reachable only through existing hidden Beans side menu",()=>{
  assert.doesNotMatch(header,/<nav aria-label="NBL conversations" style=/);
  const drawer=header.slice(header.indexOf('<aside class="nbl-chat-drawer"'),header.indexOf('</aside>')+8);
  assert.match(drawer,/href="\/campus\.html#grey"/);
  assert.match(drawer,/href="\/chat\.html"/);
  assert.match(drawer,/href="\/privacy\.html"/);
  assert.match(header,/data-nbl-chat-drawer-toggle/);
  assert.match(header,/data-nbl-beans-disclaimer/);
  assert.match(header,/beansDisclaimerTimer=window\.setTimeout/);
  assert.match(header,/beansDisclaimer\.hidden=true/);
  assert.match(header,/},2000\)/);
  assert.match(header,/brieflyShowBeansStatus\("Saved conversation restored/);
});

test("existing NBL music stays completely free and download is locally hosted",()=>{
  assert.match(music,/id="downloadButton"/);
  assert.match(music,/download hidden/);
  assert.match(music,/id="detailsButton"/);
  assert.match(music,/id="trackFacts"/);
  assert.match(player,/download\.hidden=!canDownload/);
  assert.match(player,/src\.origin===location\.origin/);
  assert.match(player,/download\.download=/);
  assert.match(player,/showDetails\(track\)/);
  assert.match(catalog,/title: "Still Walking"/);
  assert.match(catalog,/title: "You Hear It Too"/);
  assert.equal((catalog.match(/purchaseUrl: ""/g)||[]).length,2);
  assert.equal((catalog.match(/previewSeconds: 0/g)||[]).length,2);
  assert.doesNotMatch(player+music,/MUREKA_API_KEY|checkout\.stripe\.com|sk_live_/);
});

test("track credits expose real creator, artist, NBL label, ownership and not invented dates",()=>{
  for(const field of ["songwriter","producer","label","rightsHolder","publisher","releaseDate","album"])assert.ok(catalog.includes(field+":"),field);
  assert.match(catalog,/songwriter: "Jamel Hawkins"/);
  assert.match(catalog,/artist: "JMELO"/);
  assert.match(catalog,/rightsHolder: "NBL Music Productions"/);
  assert.match(catalog,/releaseDate: "Not listed"/);
  assert.match(player,/trackFacts\.append\(dt,dd\)/);
  assert.doesNotMatch(music,/upload-to-supabase|create-music-with-Mureka/);
});
