import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const home=read("index.html"),music=read("studio/index.html"),studio=read("studios.html"),creator=read("studio/creator.html");
const catalog=read("studio/catalog.js"),pricing=read("pricing.html"),plans=read("nbl-product-plans.js");
const campus=read("university.html"),header=read("nbl-world-header.js"),studioClient=read("studio/creator.js");
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
test("the canonical storefront prices stay intact and Studios is corrected to $8.99",()=>{
 for(const value of ["$4.99/month","$9.99/month","$14.99/month","$9.99 one-time","$29.99 one-time","$34.99 one-time","$54.99 one-time","$449.99 one-time"])assert.ok(plans.includes(value),value);
 assert.match(plans,/studiosCredits:Object\.freeze\(\{name:"NBL Studios Credits",price:"\$8\.99 one-time",credits:"500 NBL Studios Credits"/);
 assert.match(plans,/studiosSupport:Object\.freeze\(\{name:"Support NBL Studios Fund",price:"\$1\.00 minimum",credits:"0 personal Studio Credits"/);
 assert.match(creator,/data-nbl-plan-value="studiosCredits\.price">\$8\.99 one-time/);
 assert.doesNotMatch(creator,/\$7\.00/);
 for(const id of ["beans.price","beansUniversity.price","foundationStudentContinuation.price","foundationUniversity.price","getMore.price","foundationProgram.price","guidedFoundation.price","fullNblu.price","nbluContinuation.price","studiosCredits.price","studiosSupport.price"])assert.ok(pricing.includes('data-nbl-plan-value="'+id+'"'),id);
});
test("University stays under construction with all existing prices and 100 percent refund for nondelivery",()=>{
 assert.match(campus,/University under construction/);
 assert.match(campus,/full refund of the advance-enrollment payment/);
 assert.match(pricing,/full refund of that advance-enrollment payment/);
 assert.match(pricing,/If an announced start is delayed/);
 assert.match(pricing,/University checkouts are currently disabled/);
 assert.match(campus,/data-nbl-university-checkout="foundation" disabled/);
 assert.match(campus,/data-nbl-university-checkout="full_foundation" disabled/);
 assert.match(pricing,/opening dates will be confirmed/i);
 assert.doesNotMatch(pricing,/pay\.stripe\.com|checkout\.stripe\.com|data-nbl-university-checkout=/);
});
test("NBL navigation shares pricing, Studios and music without duplicating authenticated domains",()=>{
 assert.match(header,/\["studios","NBL Studios","\/studios\.html",false\]/);
 assert.ok(header.includes('["pricing","Vault & Pricing","/vault.html#pricing",false]'));
 assert.match(header,/\["studio","NBL Music Productions","\/studio\/",false\]/);
 assert.match(home,/href="vault.html#pricing"/);
 assert.doesNotMatch(studio+pricing,/nblworld\.com|sk_live_/);
});

test("official homepage hero keeps the full artwork in portrait view without crop",()=>{
 assert.match(home,/src="assets\/site\/homepage\/New_New_homepage\.png"/);
 assert.match(home,/@media\(max-width:800px\) and \(orientation:portrait\)/);
 assert.match(home,/html body#home \.hero \.hero-media\{position:relative;inset:auto;width:100%;height:auto;max-width:100%;object-fit:contain/);
 assert.match(home,/body#home \.hero \.hero-content\{width:100%;min-height:0/);
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
