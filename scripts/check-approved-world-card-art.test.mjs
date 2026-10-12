import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const source=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const approved=[
 ["NBL_Books_New.png","4da94563","books.html"],
 ["NBL_Music_Productions.png","d5b9a023","studio/"],
 ["NBL_Studios.png","e220f7dc","studio/#movie-studio"],
 ["NBL_Clothing_Co.png","f38a1e26","clothing.html"]
];
test("exact uploaded assets survive and browser references are cache refreshed",()=>{
 for(const [name,tag,href] of approved){
  assert.ok(existsSync(new URL("../"+name,import.meta.url)),name+" source asset missing");
  assert.ok(source.includes('src="'+name+'?v='+tag+'"'),name+" production reference incorrect");
  assert.ok(source.includes('href="'+href+'"'),href+" was changed");
 }
});
test("approved full-image cards use the whole artwork instead of thumbnail and copy overlay",()=>{
 for(const [name,tag] of approved)assert.match(source,new RegExp('world-card official-art reveal[^>]+><div class="media"><img src="'+name.replaceAll(".","\\.")+'\\?v='+tag));
 assert.match(source,/\.world-card\.official-art \.media\{inset:0;z-index:1\}/);
 assert.match(source,/\.world-card\.official-art \.card-body\{/);
 assert.match(source,/\.world-card\.official-art::after\{display:none\}/);
 assert.match(source,/\.world-card\.official-art:focus-visible\{/);
});
test("City and University cards stay unchanged; Founder Office moves into NBL Games",()=>{
 for(const sourceName of ["NBL-Films%20(1).png","NBL_University.png"]) assert.ok(source.includes(sourceName));
 const games=readFileSync(new URL("../games.html",import.meta.url),"utf8");
 assert.ok(source.includes('src="NBL_Games.png?v=20261012"'));
 assert.ok(source.includes('href="games.html"'));
 assert.ok(games.includes('href="founder-office.html"'));
 assert.ok(games.includes("Block Boss") && games.includes("Coming Soon"));
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
