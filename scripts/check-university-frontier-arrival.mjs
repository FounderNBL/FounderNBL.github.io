#!/usr/bin/env node
// Founder 2026-11-13: independent school is open for information tours only.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const home=read("index.html"),entry=read("university.html");
const legacy=read("university-enrollment.html"),account=read("account.html");
const pricing=read("pricing.html"),vault=read("vault.html");
assert.ok(home.includes('class="world-card official-art reveal" href="https://nblschool.com/"'));
assert.ok(home.includes("Free Tours Open · Classes Closed"));
assert.ok(entry.includes('url=https://nblschool.com/'));
assert.ok(entry.includes('rel="canonical" href="https://nblschool.com/"'));
assert.ok(legacy.includes("url=https://nblschool.com/"));
assert.ok(!entry.includes('data-nbl-university-interest-form'));
assert.ok(!entry.includes('/billing/checkout'));
assert.ok(!legacy.includes('/billing/checkout'));
assert.ok(account.includes('href="https://nblschool.com/">Take the free campus tour'));
assert.ok(pricing.includes("University is under construction"));
assert.ok(vault.includes("No University purchase or subscription can be started"));
for(const forbidden of ["checkout.stripe.com","Sign up &amp; continue to payment","December 1","$449.99"]){
 assert.ok(!entry.includes(forbidden),"Unexpected paid University entrance: "+forbidden);
}
console.log("PASS NBL University school tours are the only public World Card destination; payments and classes held");
