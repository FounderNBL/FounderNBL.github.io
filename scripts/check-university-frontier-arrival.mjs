#!/usr/bin/env node
// Static route/security checks for University public arrival, separate admissions and protected Grey campus.
// Source assertions do not demonstrate real browser, checkout or model behavior.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const home=read("index.html"),arrival=read("university.html");
const tuition=read("university-enrollment.html"),campus=read("campus.html");
const alias=read("university-campus.html"),free=read("nblu-dickitry-clause.html");
const early=read("nbl-university-early-interest.js");
assert.match(home,/class="world-card official-art reveal" href="university\.html"/);
assert.ok(arrival.includes('id="nblu-gateway-title"')&&arrival.includes("Welcome to"));
assert.ok(arrival.includes('href="https://nblschool.com/homeroom.html#first-class"'));
assert.ok(arrival.includes('href="#enroll"')&&arrival.includes('id="enroll"'));
assert.ok(!arrival.includes('<details class="university-category">'));
assert.ok(!arrival.includes('data-nbl-university-checkout='));
assert.ok(!arrival.includes('data-nbl-university-interest-form'));
assert.ok(arrival.includes('function forwardLegacyLink()'));
assert.match(tuition,/rel="canonical" href="https:\/\/newbeansland\.org\/university-enrollment\.html"/);
for(const value of ['id="early-registration"','id="enroll"','data-nbl-university-interest-form','data-nbl-university-checkout="foundation" disabled','data-nbl-university-checkout="full_foundation" disabled','src="/nbl-university-checkout.js"'])assert.ok(tuition.includes(value),value);
assert.ok(early.includes("newbeansland.org/university-enrollment.html#early-registration"));
const universityPages=[["Frontier arrival",arrival],["Enrollment & Tuition",tuition]];
for(const [name,html] of universityPages){
 assert.ok(html.includes('class="nblu-scope"'),name+" must be a University-scoped page");
 assert.ok(html.includes(".nblu-scope .nbl-world-chat-launch")&&html.includes(".nblu-scope .nbl-world-beans-toggle"),name+" must not expose the active Beans conversation overlay");
 assert.ok(html.includes("Switch to Beans"),name+" must offer a deliberate exit back to the lower-cost NBL assistant");
}
assert.ok(tuition.includes("Professor Grey</strong> is the separate University AI assistant and instructor"),"Tuition must distinguish free Beans information from protected Grey instruction");
assert.ok(tuition.includes("deeper learning requires verified University access"),"Paid Grey services must not be represented as freely available");
assert.ok(arrival.includes('href="/campus.html#grey"'),"Academic doorway must route to protected Grey campus");
assert.ok(!tuition.includes('data-nbl-university-checkout="foundation">'),"University enrollment checkout cannot be enabled");

for(const page of [campus,alias]){
 assert.ok(page.includes('data-campus-gate')&&page.includes('data-campus hidden')&&page.includes('id="grey"'));
 assert.ok(page.includes('href="/university-enrollment.html#enroll"')&&page.includes('href="/"'));
 assert.ok(page.includes("The Frontier Check"));
 assert.ok(!page.includes('class="enrollment-grid"'));
}
assert.ok(arrival.includes("No Counterfeit Weight"));
assert.ok(free.includes('https://nblschool.com/homeroom.html#first-class'));
assert.ok(!/dickitry/i.test(free),'Old internal title should not be visible at the retired public route');
for(const needle of ["fetch(", "localStorage", "sessionStorage","XMLHttpRequest"])assert.ok(!free.includes(needle));
console.log("NBL University arrival/enrollment/academic gate source invariants PASS (not browser E2E).");
