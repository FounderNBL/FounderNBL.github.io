#!/usr/bin/env node
// New Beansland storefront is a SINGLE University admissions entry; academic work belongs to nblschool.com.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const home=read("index.html");
const arrival=read("university.html");
const script=read("university-storefront.js");
const legacy=read("university-enrollment.html");
const campus=read("campus.html");
const alias=read("university-campus.html");
const lesson=read("nblu-dickitry-clause.html");
const sharedHeader=read("nbl-world-header.js");
assert.match(home,/class="world-card official-art reveal" href="university\.html"/);
assert.match(arrival,/id="nblu-one-entry"/);
assert.match(arrival,/Sign up &amp; continue to payment/);
assert.match(arrival,/https:\/\/nblschool\.com\//);
assert.match(arrival,/src="\/university-storefront\.js/);
assert.doesNotMatch(arrival,/campus\.html|university-enrollment\.html|Class Chat|Study Hall|coursework|data-nbl-university-interest-form|nbl-world-header\.js/i);
for(const key of ["foundation","foundation_university","full_foundation","full_nblu_diy","full_nblu","beans_university_monthly","foundation_student_continuation","nblu_continuation"]){
  assert.match(arrival,new RegExp('value="'+key+'"'),"Missing distinct verified offer "+key);
  assert.ok(script.includes(key+':{title:'),"Missing distinct metadata for "+key);
}
for(const priceId of [
  "price_1UOeUBB8jr0ZIsSbopkO6zn6",
  "price_1URiSuB8jr0ZIsSbLuuwVa7p",
  "price_1UOjEVB8jr0ZIsSburX83EuO",
  "price_1UXSXxB8jr0ZIsSbIayXWHSL",
  "price_1UOeUIB8jr0ZIsSb1acvYFWb",
  "price_1URiSwB8jr0ZIsSb3uyktHc4",
  "price_1URiSxB8jr0ZIsSbYvs4bnf6",
  "price_1UOeULB8jr0ZIsSb3Z7wX62y"
])assert.ok(script.includes(priceId),"Wrong current New Beansland Stripe offer "+priceId);
assert.match(script,/\/billing\/checkout/);
assert.match(script,/trustedStripe/);
assert.match(script,/if\(!item\.plan\)/);
assert.doesNotMatch(arrival,/\$39\.99/); // no unverified or retired prices displayed.
for(const page of [campus,alias]){
 assert.match(page,/http-equiv="refresh" content="0;url=https:\/\/nblschool\.com\//);
 assert.doesNotMatch(page,/<form|data-campus-gate|data-campus hidden/);
}
assert.match(legacy,/url=https:\/\/newbeansland\.org\/university\.html#enroll/);
assert.match(lesson,/url=https:\/\/nblschool\.com\/homeroom\.html#first-class/);
assert.match(sharedHeader,/href="https:\/\/nblschool\.com\/professor-grey\.html"/);
console.log("PASS: one .org NBL University cashier, distinct verified live product prices, school.com campus routing, and checkout release gates.");
