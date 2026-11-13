#!/usr/bin/env node
// Founder 2026-11-13: University World Card routes to independent free campus tour; enrollment/payments closed.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const home=read("index.html"),redirect=read("university.html"),updates=read("university-updates.html");
const interest=read("nbl-university-early-interest.js"),legacy=read("university-enrollment.html");
const pricing=read("pricing.html"),account=read("account.html"),vault=read("vault.html");
assert.match(home,/class="world-card official-art reveal" href="https:\/\/nblschool\.com\/"/);
assert.ok(home.includes("Free Tours Open · Classes Closed"));
assert.ok(redirect.includes('url=https://nblschool.com/'));
assert.ok(redirect.includes('rel="canonical" href="https://nblschool.com/"'));
assert.ok(updates.includes("data-nbl-university-interest-form"));
assert.ok(updates.includes("data-nbl-university-interest-submit"));
assert.ok(updates.includes('name="emailOptIn"'));
assert.ok(updates.includes('src="/nbl-university-early-interest.js'));
assert.ok(interest.includes('action:"join"'));
assert.ok(interest.includes("university-updates.html#early-registration"));
assert.ok(legacy.includes("university-updates.html#early-registration"));
assert.ok(pricing.includes("University is under construction"));
assert.ok(account.includes("Sign up free for the opening notification"));
assert.ok(vault.includes("No University purchase or subscription can be started"));
for(const disallowed of ["nblu-pay","nblu-one-entry","university-storefront.js","billing/checkout","checkout.stripe.com","$34.99"]){
 assert.ok(!updates.includes(disallowed),"Unexpected University cashier in free notification form: "+disallowed);
}
console.log("PASS school World Card → official tour; separate free-only updates; paid enrollment held");
