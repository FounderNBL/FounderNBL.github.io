import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const guide=readFileSync(new URL("../pulse/guide.html",import.meta.url),"utf8");
const pulse=readFileSync(new URL("../pulse/index.html",import.meta.url),"utf8");
test("Pulse information and legal guide is public and discoverable",()=>{
 for(const href of [
 'https://newbeansland.org/pulse/guide.html',
 '/privacy.html','/terms.html','/account-deletion.html',
 '/pricing.html','/messenger/','/account.html'
 ]) assert.ok(guide.includes(href),href);
 assert.ok(pulse.includes('href="/pulse/guide.html"'));
 assert.match(guide,/<title>NBL Pulse Guide/);
 assert.ok(guide.includes('Privacy Policy'));
});
test("Pulse guide is accurate about the release boundary and real pricing",()=>{
 for(const phrase of [
 "One free broadcast per resident per calendar month",
 "up to 5 minutes","up to 100 viewers","30 starts per month",
 "Prepaid Beanies/Racks purchases and spending are",
 "not active",
 "Planned integration, not yet an active Beans tool.",
 "Not yet available:",
 "Facebook Login for an NBL account does not grant posting privileges."
 ])assert.ok(guide.includes(phrase),phrase);
 assert.ok(guide.includes('Facebook Live or Instagram Live'));
 assert.ok(guide.includes('13 and older'));
 assert.ok(!guide.includes('sk_live_'));
 assert.ok(!guide.includes('FB_PAGE_ACCESS_TOKEN'));
 assert.ok(!guide.includes('STREAM_API_SECRET'));
});
