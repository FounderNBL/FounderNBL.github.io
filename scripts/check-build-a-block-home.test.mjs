import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const cardStart=html.indexOf('<div class="world-grid">');
const cardEnd=html.indexOf('</div></section>',cardStart);
const community=html.indexOf('<section class="build-block-feature" id="operation-build-a-block"');
const pulse=html.indexOf('<section class="pulse-world-door"',cardEnd);

test("NBL Communities stays a large homepage section, never a World Card",()=>{
  assert.ok(cardStart>=0&&cardEnd>cardStart&&community>cardEnd&&pulse>community);
  const cards=html.slice(cardStart,cardEnd);
  assert.equal((cards.match(/class="world-card official-art reveal"/g)||[]).length,6);
  assert.ok(!cards.includes("Build-A-Block"));
  assert.equal((html.match(/id="operation-build-a-block"/g)||[]).length,1);
  assert.match(html,/class="build-block-frame"/);
});

test("Freddie's approved introduction, scope and cautious pilot status remain clear",()=>{
  const start=html.slice(community,pulse);
  assert.match(start,/Freddie Pickens and New Beansland bring you/);
  assert.match(start,/Operation <span>Build-A-Block<\/span>/);
  assert.match(start,/Start With a Block\. Build a Community\./);
  assert.match(start,/Program originator and community lead/);
  assert.match(start,/Planning our first block\./);
  assert.match(start,/No event date is announced yet\./);
  assert.match(start,/mailto:founder@newbeansland\.org\?subject=Operation%20Build-A-Block%20Community%20Interest/);
  assert.doesNotMatch(start,/OMAH|OMOH|501\(c\)\(3\)|tax-deductible|Donate Now|Donate today/i);
  assert.doesNotMatch(start,/class="world-card"/);
});

test("Public Build-A-Block pages do not expose private funding numbers",()=>{
 const detail=readFileSync(new URL("../build-a-block.html",import.meta.url),"utf8");
 assert.match(html,/href="build-a-block\.html">Mission &amp; first project/);
 assert.match(detail,/Freddie Pickens and New Beansland bring you/);
 assert.match(detail,/id="mission"/);
 assert.match(detail,/id="pilot"/);
 assert.doesNotMatch(detail,/\$\s*[\d,]+|15,?000|proposed budget|seed funding|funding breakdown/i);
 assert.doesNotMatch(html,/\$\s*[\d,]+|15,?000/i);
 assert.doesNotMatch(detail,/OMAH|OMOH|checkout\.stripe\.com|buy\.stripe\.com/i);
});
