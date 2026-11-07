#!/usr/bin/env node
// Founder 2026-11-07: University admissions closed; one free notification entry, no tuition.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const home=read("index.html");
const page=read("university.html");
const interest=read("nbl-university-early-interest.js");
const pricing=read("pricing.html");
const account=read("account.html");
const vault=read("vault.html");
const legacy=read("university-enrollment.html");
assert.match(home,/class="world-card official-art reveal" href="university\\.html"/);
assert.match(page,/school is under construction/);
assert.match(page,/opening soon/);
assert.match(page,/data-nbl-university-interest-form/);
assert.match(page,/data-nbl-university-interest-submit/);
assert.match(page,/name="emailOptIn"/);
assert.match(page,/href="https:\\/\\/nblschool\\.com\\//);
assert.match(page,/src="\\/nbl-university-early-interest\\.js/);
assert.match(page,/src="\\/nbl-world-header\\.js/);
assert.doesNotMatch(page,/nblu-pay|nblu-one-entry|university-storefront\\.js|billing\\/checkout|checkout\\.stripe\\.com|December 1|December 2026|\\$34\\.99/);
assert.match(interest,/nbl-university-early-interest/);
assert.match(interest,/action:"join"/);
assert.match(pricing,/University is under construction/);
assert.match(account,/Sign up free for the opening notification/);
assert.match(vault,/No University purchase or subscription can be started/);
assert.match(legacy,/url=https:\\/\\/newbeansland\\.org\\/university\\.html#enroll/);
console.log("PASS: University under construction; free notification sign-up; public price & checkout surfaces held.");
