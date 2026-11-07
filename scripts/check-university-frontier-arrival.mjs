#!/usr/bin/env node
// Founder 2026-11-07: University admissions closed; only free opening notices.
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
for(const [value,needle] of [
  [home,'href="university.html"'],
  [page,"school is under construction"],
  [page,"opening soon"],
  [page,"data-nbl-university-interest-form"],
  [page,"data-nbl-university-interest-submit"],
  [page,'name="emailOptIn"'],
  [page,'href="https://nblschool.com/"'],
  [page,'src="/nbl-university-early-interest.js'],
  [page,'src="/nbl-world-header.js'],
  [interest,'action:"join"'],
  [pricing,"University is under construction"],
  [account,"Sign up free for the opening notification"],
  [vault,"No University purchase or subscription can be started"],
  [legacy,"url=https://newbeansland.org/university.html#early-registration"]
]) assert.ok(value.includes(needle),"Missing University closure contract: "+needle);
for(const forbidden of ["nblu-pay","nblu-one-entry","university-storefront.js","billing/checkout","checkout.stripe.com","December 1","December 2026","$34.99"]){
 assert.ok(!page.includes(forbidden),"Unexpected University cashier or stale date: "+forbidden);
}
console.log("PASS University closed, free-only registration and no tuition cashier");
