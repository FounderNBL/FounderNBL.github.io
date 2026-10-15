import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const source=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const approved=[
 ["NBL_Books_New.png","4da94563","books.html"],
 ["NBL_Clothing_Co.png","f38a1e26","clothing.html"],
 ["NBL_Games.png","ce83c71b","games.html"],
 ["NBL_Music_Productions.png","d5b9a023","studio/"],
 ["NBL_Studios.png","e220f7dc","studios.html"]
];
test("exact uploaded assets survive and browser references are cache refreshed",()=>{
 for(const [name,tag,href] of approved){
  assert.ok(existsSync(new URL("../"+decodeURIComponent(name),import.meta.url)),name+" source asset missing");
  assert.ok(source.includes('src="'+name+'?v='+tag+'"'),name+" production reference incorrect");
  assert.ok(source.includes('href="'+href+'"'),href+" was changed");
 }
});
test("all six World Cards have equal 4:3 frames and uncropped artwork",()=>{
 const grid=source.slice(source.indexOf('<div class="world-grid">'),source.indexOf('</div></section>',source.indexOf('<div class="world-grid">')));
 const cards=[...grid.matchAll(/<a class="world-card official-art reveal" href="([^"]+)" style="--nbl-world-card-art:url\('([^']+)'\)"><div class="media"><img src="([^"]+)"/g)];
 assert.equal(cards.length,6,"all six approved cards must use the same background-fill/foreground-art system");
 for(const [,href,background,foreground] of cards){
  assert.equal(background,foreground,"soft backdrop must use the SAME Founder-approved image as the visible cover for "+href);
  assert.ok(href,"Each card must remain clickable");
 }
 assert.match(source,/\.world-card\.official-art\{aspect-ratio:4\/3;/,"All six cards must be equal 4:3 frames");
 assert.match(source,/grid-auto-rows:1fr;align-items:stretch/,"Grid must keep equal row heights");
 assert.match(source,/\.world-card\.official-art \.media::before\{/,"Letterbox fill must use a background layer");
 assert.match(source,/background-image:var\(--nbl-world-card-art\)/,"Letterbox fill must reuse original art, never a replacement image");
 assert.match(source,/object-fit:contain;object-position:center;background:transparent/,"The visible card artwork must never be cropped");
 assert.match(source,/\.world-card\.official-art \.card-body\{/,"Original approved art includes its titles; duplicate overlays stay hidden");
 assert.match(source,/\.world-card\.official-art::after\{display:none\}/);
 assert.match(source,/\.world-card\.official-art:focus-visible\{/);
 assert.match(source,/@media\(max-width:520px\)\{\.world-card\.official-art\{width:100%;max-width:520px/,"Mobile cards should use the available width");
});
test("Founder's six homepage destinations preserve the approved order with University last",()=>{
 const grid=source.slice(source.indexOf('<div class="world-grid">'),source.indexOf('</div></section>',source.indexOf('<div class="world-grid">')));
 const names=["NBL Clothing Co.","NBL Books","NBL Games","NBL Music Productions","NBL Studios","New Beansland University"];
 const actual=grid.split('<h3>').slice(1).map(part=>part.split('</h3>')[0]);
 assert.deepEqual(actual,names,"no extra homepage destinations or reordered cards");
 assert.ok(!grid.includes("The City"),"The City belongs inside Stories, not as a homepage card");
 assert.ok(grid.includes('src="NBL_University.png"'),"University existing art must remain");
 assert.match(grid,/class="world-card official-art reveal" href="university\.html"/,"University full artwork must not be cropped");
 assert.ok(source.includes("object-fit:contain;object-position:center;background:transparent"),"Official art must scale without cropping");
 assert.ok(source.includes("@media(max-width:520px){.world-card.official-art{width:100%;max-width:520px"),"Mobile cards need full-width frames");
 assert.ok(grid.includes('href="studios.html"'),"Studios goes to its video-production page, not the music studio");
 assert.ok(grid.includes('href="studio/"'),"Music remains a separate free showcase");
 assert.ok(source.includes('.world-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))'),"desktop grid must be three columns for the 3-by-2 cards");
 assert.ok(grid.includes('href="games.html"'),"existing Games homepage destination must remain");
 assert.ok(!source.includes("nbl-kidz-kayes-cubs"));
});

test("deferred portal and legacy commercial scripts may NOT overwrite official art after HTML load",()=>{
 const portal=readFileSync(new URL("../nbl-portal.js",import.meta.url),"utf8");
 const commercial=readFileSync(new URL("../nbl-commercial.js",import.meta.url),"utf8");
 assert.match(portal,/if\(card\.classList\.contains\('official-art'\)\) return;/);
 assert.match(commercial,/if\(card\.classList\.contains\('official-art'\)\) return;/);
 assert.match(commercial,/!grid\.querySelector\('\.world-card\.official-art\[href="clothing\.html"\]'\)/);
 assert.match(commercial,/if\(doorGrid&&!doorGrid\.querySelector\('\.world-card\.official-art'\)\)/);
 assert.ok(source.includes('/nbl-portal.js?v=20261011-world-cards-safe'),"homepage must fetch corrected script, not stale cached portal");
});

test("company profile replaces Kaye's Cubs spotlight with readable three-page PDF",()=>{
 const viewer=readFileSync(new URL("../company-profile.html",import.meta.url),"utf8");
 const pdf="NBL_Company_Profile_Page2_World_Team_Updated.pdf";
 assert.ok(existsSync(new URL("../"+pdf,import.meta.url)),"company profile PDF missing");
 assert.ok(source.includes('id="nbl-company-profile"'));
 assert.ok(source.includes('href="company-profile.html"'));
 assert.ok(!source.includes('href="kayes-cubs.html"'));
 for(let page=1;page<=3;page++) assert.ok(viewer.includes(pdf+"#page="+page),"missing PDF page "+page);
 assert.ok(viewer.includes('iframe') && viewer.includes(pdf+"#toolbar=1"));
});
