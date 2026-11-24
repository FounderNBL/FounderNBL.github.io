import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const homepage=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const detail=readFileSync(new URL("../build-a-block.html",import.meta.url),"utf8");
test("Community section is not a seventh NBL World Card",()=>{
 const gridStart=homepage.indexOf('<div class="world-grid">');
 const gridEnd=homepage.indexOf('</div></section>',gridStart);
 const feature=homepage.indexOf('id="operation-build-a-block"');
 const pulse=homepage.indexOf('id="nbl-pulse-door"');
 assert.ok(gridStart>=0&&gridEnd>gridStart&&feature>gridEnd&&pulse>feature);
 assert.equal((homepage.slice(gridStart,gridEnd).match(/class="world-card official-art reveal"/g)||[]).length,6);
 assert.equal((homepage.match(/id="operation-build-a-block"/g)||[]).length,1);
 assert.match(homepage,/Freddie Pickens and New Beansland bring you/);
 assert.match(homepage,/href="build-a-block\.html"/);
});
test("Public program page is accessible, honest and keeps private financing out",()=>{
 assert.match(detail,/<meta name="robots" content="index,follow">/);
 assert.match(detail,/Freddie Pickens and New Beansland bring you/);
 assert.match(detail,/Start With a Block\. Build a Community\./);
 assert.match(detail,/id="mission"/);
 assert.match(detail,/id="pilot"/);
 assert.match(detail,/No public donations or payments are being collected/);
 for(const html of [homepage,detail]){
  assert.doesNotMatch(html,/\$\s*\d[\d,]*|\b\d{1,3},\d{3}\s*(?:USD|dollars)?\b/i);
  assert.doesNotMatch(html,/OMAH|OMOH|checkout\.stripe\.com|buy\.stripe\.com/i);
 }
});
