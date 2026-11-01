import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const source=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const approved=[
 ["NBL_Books.png","e7397f38","books.html"],
 ["NBL_Clothing_Co.png","f06b568f","clothing.html"],
 ["NBL_Games.png","1ff58013","games.html"],
 ["NBL_Music_Productions%20(1).png","32e2b3ba","studio/"],
 ["NBL_Studios.png","c342a8ee","studios.html"],
 ["NBL_University.png","5fa210ae","university.html"]
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
 assert.ok(grid.includes('src="NBL_University.png?v=5fa210ae"'),"University existing art must remain");
 assert.match(grid,/class="world-card official-art reveal" href="university\.html"/,"University full artwork must not be cropped");
 assert.ok(source.includes("object-fit:contain;object-position:center;background:transparent"),"Official art must scale without cropping");
 assert.ok(source.includes("@media(max-width:520px){.world-card.official-art{width:100%;max-width:520px"),"Mobile cards need full-width frames");
 assert.ok(grid.includes('href="studios.html"'),"Studios goes to its video-production page, not the music studio");
 assert.ok(grid.includes('href="studio/"'),"Music remains a separate free showcase");
 assert.ok(source.includes('.world-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))'),"desktop grid must be three columns for the 3-by-2 cards");
 assert.ok(grid.includes('href="games.html"'),"existing Games homepage destination must remain");
 assert.match(grid,/href="games\.html"[\s\S]*?<span class="status">Coming Soon<\/span>[\s\S]*?All NBL Games experiences, including Founder’s Office and Block Boss, are coming soon\./,"Games card must state that every listed game is coming soon");
 assert.doesNotMatch(grid,/Founder’s Office is open/,"homepage must not claim any NBL game is open");
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

test("company profile replaces Kaye's Cubs spotlight with one directly displayed page",()=>{
 const viewer=readFileSync(new URL("../company-profile.html",import.meta.url),"utf8");
 const art="NBL_Corporate_Profile_2026.png";
 assert.ok(existsSync(new URL("../"+art,import.meta.url)),"one-page image asset missing");
 assert.ok(source.includes('id="nbl-company-profile"'));
 assert.ok(source.includes('href="company-profile.html"'));
 assert.ok(!source.includes('href="kayes-cubs.html"'));
 assert.ok(viewer.includes('src="/'+art+'"'),"company profile must display the existing one-page artwork");
 assert.ok(viewer.includes('class="profile-art"'),"expected one-page full-width image");
 assert.ok(viewer.includes('.profile-art::after'),"obsolete Learn More artwork must be masked");
 assert.ok(!viewer.includes("<iframe"),"do not embed a PDF viewer");
 assert.ok(!viewer.includes("<button"),"no profile buttons");
 assert.ok(!viewer.includes('download>'),"no PDF download button");
 assert.ok(!viewer.includes("NBL_Company_Profile_Page2_World_Team_Updated.pdf"),"old three-page PDF must not be linked");
 assert.ok(source.includes("View the one-page NBL Company Profile"),"homepage link should describe one page");
});
