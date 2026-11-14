import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const home=read("index.html"),music=read("studio/index.html"),studio=read("studios.html"),creator=read("studio/creator.html");
const catalog=read("studio/catalog.js"),pricing=read("pricing.html"),plans=read("nbl-product-plans.js");
const campus=read("university-enrollment.html"),header=read("nbl-world-header.js"),studioClient=read("studio/creator.js");
test("music remains a standalone free NBL playlist, with no Studios film-room or paid music product",()=>{
 assert.match(home,/href="studio\/".*NBL Music Productions/);
 assert.match(music,/<h1>NBL Music Productions<\/h1>/);
 assert.match(music,/id="trackList"/);
 assert.doesNotMatch(music,/class="movie-section"/);
 assert.doesNotMatch(music,/id="movie-studio"/);
 assert.match(music,/No paid music services are offered here/);
 assert.match(music,/location\.hash==="#movie-studio"\) location\.replace\("\/studios\.html"\)/);
 assert.match(catalog,/purchaseUrl:\s*""/);
 assert.doesNotMatch(catalog,/purchaseUrl:\s*"https?:/);
});
test("Studios now has an independent film/video door and protected creator",()=>{
 assert.match(home,/href="studios\.html"/);
 assert.match(studio,/<h1 id="studio-title">NBL Studios<\/h1>/);
 assert.match(studio,/NBL_Studio_Presents_The_City_Trailer\.mp4/);
 assert.match(studio,/Coming Soon · NBL Studios Capability Preview/);
 assert.match(studio,/The City itself is still coming soon/);
 assert.match(studio,/Identity%20isn%27t%20something%20you%20wear\.mp4/);
 assert.doesNotMatch(studio,/id="trackList"|id="audio"|Still Walking|You Hear It Too/);
 assert.match(studio,/href="\/studio\/creator\.html"/);
 assert.match(creator,/id="createForm"/);
 assert.match(creator,/500 Studio Credits/);
 assert.match(creator,/New credit purchases remain disabled/);
 assert.match(studioClient,/NBLAccountBridge/);
 assert.doesNotMatch(studioClient,/RUNWAY_API_KEY|SUPABASE_SERVICE_ROLE_KEY/);
});
test("Active services retain approved prices; closed University rates stay out of public offers",()=>{
 for(const value of ["$4.99 / 7 days","$20/month","$40/month","$100/month","$9.99 one-time","$10 minimum top-up","$8.99 one-time"])assert.ok(plans.includes(value),value);
 assert.match(plans,/studiosCredits:Object.freeze/);
 assert.match(plans,/studiosSupport:Object.freeze/);
 assert.match(creator,/data-nbl-plan-value="studiosCredits.price"/);
 assert.doesNotMatch(creator,/$7.00/);
 for(const id of ["beans.price","getMore.price","nblPlus.price","nblUsage.price","studiosCredits.price","studiosSupport.price"]){
   assert.ok(pricing.includes('data-nbl-plan-value="'+id+'"'),id);
 }
 assert.match(pricing,/University is under construction/);
});
test("University is a separate public tour domain; no .org campus cashier",()=>{
 const arrival=read("university.html");
 const legacy=read("university-enrollment.html");
 assert.match(arrival,/url=https:\/\/nblschool\.com\//);
 assert.match(legacy,/url=https:\/\/nblschool\.com\//);
 assert.doesNotMatch(arrival+legacy,/data-nbl-university-interest-form|billing\/checkout|nblu-pay|Sign up &amp; continue to payment|checkout\\.stripe\\.com/);
});
test("new priced tiers render safely when returning visitors have an older cached catalog",()=>{
 assert.match(header,/NBL_PRODUCT_PLANS\.nblPlus\.name/);
 assert.match(header,/NBL_PRODUCT_PLANS\.fullNbluDiy\?\.name\|\|"Full NBLU Experience/);
});
test("NBL navigation shares pricing, Studios and music without duplicating authenticated domains",()=>{
 assert.match(header,/\["studios","NBL Studios","\/studios\.html",false\]/);
 assert.ok(header.includes('["pricing","Vault & Pricing","/vault.html#pricing",false]'));
 assert.match(header,/\["studio","NBL Music Productions","\/studio\/",false\]/);
 assert.match(home,/href="vault.html#pricing"/);
 assert.doesNotMatch(studio+pricing,/nblworld\.com|sk_live_/);
});

test("official homepage hero keeps the new approved artwork full-frame at every viewport",()=>{
 assert.match(home,/src="assets\/site\/homepage\/nbl-night-campus-2026\.png"/);
 assert.match(home,/@media\(max-width:800px\) and \(orientation:portrait\)/);
 assert.match(home,/html body#home \.hero \.hero-media\{position:relative;inset:auto;width:100%;height:auto;max-width:100%;object-fit:contain/);
 assert.match(home,/aspect-ratio:1672\/941/);
 assert.match(home,/html body#home \.hero \.hero-content\{position:absolute!important;width:1px!important/);
 assert.match(home,/engraved pavement maxims/);
});
test("NBL Studios storefront and Creator are video-only, while video input may use an authorized reference image",()=>{
 const studioClient=read("studio/creator.js");
 assert.match(studioClient,/const mediaKind = "video"/);
 assert.match(studioClient,/data\.models\.filter\(model => model\.media_kind === "video"\)/);
 assert.match(studioClient,/document\.createElement\("video"\)/);
 assert.doesNotMatch(creator,/id="imageTab"|>Still Image<|original images/);
 assert.doesNotMatch(studio, /image-and-video creation|image\/video creator|image and short-video generation/);
 assert.doesNotMatch(pricing,/Image and video generation using NBL Studios Credits/);
 assert.match(creator,/Starting image URL/);
});
