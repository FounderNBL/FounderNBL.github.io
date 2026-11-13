import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {Script} from "node:vm";

// Regression for the actual Founder-reported laptop screen: signed in to
// NBL, Beans still says Sign in, menu visibly hidden/inert, overflowing rows.
// No real user, endpoint mutation, University, billing or Play release.
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const header=read("nbl-world-header.js");
const presentation=read("nbl-beans-experience.js");
const css=read("nbl-beans-experience.css");

test("Clerk is one shared NBL account; Beans does not wait for a loaded script again",()=>{
 assert.match(header,/if\(!window\.Clerk\)\{\s*await loadExternalScript\(/);
 assert.match(header,/const getNblBeansAuthToken=async\(\)=>\{/);
 assert.match(header,/getToken\(attempt\?\{skipCache:true\}:undefined\)/);
 assert.match(header,/const token=await getNblBeansAuthToken\(\);\s*const clerk=nblClerk;/);
 assert.match(header,/void updateChatDrawerAccountAction\(\);\s*clerk\.addListener/);
});

test("Wide desktop drawer is truly open, while 960–1199px laptops use the usable toggle",()=>{
 assert.match(header,/const desktopBeansMenu=window\.matchMedia\("\(min-width:1200px\)"\)/);
 assert.match(header,/chatDrawer\.hidden=false;\s*chatDrawer\.inert=false;/);
 assert.match(header,/chatDrawer\.hidden=true;\s*chatDrawer\.inert=true;/);
 assert.match(header,/if\(event\.key!=="Tab"\|\|desktopBeansMenu\.matches\) return;/);
 assert.doesNotMatch(css,/nbl-chat-drawer\[hidden\]\{display:flex!important\}/);
 assert.match(css,/@media\(min-width:1200px\)/);
 assert.match(css,/@media\(max-width:1199px\)/);
 assert.match(presentation,/matchMedia\("\(max-width:1199px\)"\)/);
 assert.match(css,/\.nbl-beans-panel \.nbl-chat-drawer-scroll\{\s*min-height:0/);
 assert.match(css,/@media\(max-height:760px\)/);
});

test("Fix does not create public Founder wardrobe, unlock Grey or change verified offers",()=>{
 for(const look of ["standard","crossed","jersey","cargoWave","cargoPoint"])assert.ok(presentation.includes('data-nbl-look="'+look+'"'));
 assert.match(presentation,/data-nbl-premium-outfits disabled/);
 assert.doesNotMatch(presentation,/Founders_Only|Beans_Founders_Only/);
 assert.match(header,/data-nbl-drawer-grey hidden/);
 assert.match(header,/NBL_BEANS_WEB_API=\`\$\{NBL_CORE_API\}\/chat\`/);
 new Script(header,{filename:"nbl-world-header.js"});
 new Script(presentation,{filename:"nbl-beans-experience.js"});
});
