import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const source=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const approved=[
 ["NBL_Books_New.png","4da94563","books.html"],
 ["NBL_Music_Productions.png","d5b9a023","studio/"],
 ["NBL-Studios%20(1).png","ef98576f","studio/#movie-studio"],
 ["NBL-Clothing%20(1).png","48ce5891","clothing.html"]
];
test("exact uploaded assets survive and browser references are cache refreshed",()=>{
 for(const [name,tag,href] of approved){
  assert.ok(existsSync(new URL("../"+decodeURIComponent(name),import.meta.url)),name+" source asset missing");
  assert.ok(source.includes('src="'+name+'?v='+tag+'"'),name+" production reference incorrect");
  assert.ok(source.includes('href="'+href+'"'),href+" was changed");
 }
});
test("approved full-image cards use the whole artwork instead of thumbnail and copy overlay",()=>{
 for(const [name,tag] of approved)assert.match(source,new RegExp('world-card official-art reveal[^>]+><div class="media"><img src="'+name.replace(/[.*+?^${}()|[\]\\]/g,"\\name.replaceAll(".","\\.")")+'\\?v='+tag));
 assert.match(source,/\.world-card\.official-art \.media\{inset:0;z-index:1\}/);
 assert.match(source,/\.world-card\.official-art \.card-body\{/);
 assert.match(source,/\.world-card\.official-art::after\{display:none\}/);
 assert.match(source,/\.world-card\.official-art:focus-visible\{/);
});
test("older untouched Founder/City/University scenes still exist",()=>{
 for(const sourceName of ["founder-office-room.png","assets/brand/NBL-Films.png","NBL_University.png"]) assert.ok(source.includes(sourceName));
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
