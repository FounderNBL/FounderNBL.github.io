#!/usr/bin/env node
// NBL University arrival — source-only checks, not a browser/authorization E2E pass.
// Does not call paid services, expose student data or alter University gates.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const home=read("index.html");
const landing=read("university.html");
const free=read("nblu-dickitry-clause.html");
const campus=read("campus.html");
assert.match(home,/class="world-card official-art reveal" href="university\.html"/,"The approved University World Card must remain intact");
assert.ok(landing.includes('id="nblu-gateway-title"')&&landing.includes("Welcome to")&&landing.includes("the Frontier."),"University arrival and Founder welcome missing");
assert.ok(landing.indexOf('id="nblu-gateway-title"')<landing.indexOf("NBL University lives in New Beansland."),"A tuition/pricing page must not be the first University experience");
assert.ok(landing.includes('href="/NBL_University.png')||landing.includes('src="/NBL_University.png'),"Approved University artwork missing");
assert.ok(landing.includes('href="/nblu-dickitry-clause.html"'),"Public sampler entrance missing");
assert.ok(landing.includes('<details class="nblu-admissions"'),"Existing admissions must remain available but secondary");
for(const required of ['data-nbl-university-interest-form','data-nbl-university-checkout="foundation"','nbl-university-early-interest.js','nbl-university-checkout.js','href="/campus.html"'])assert.ok(landing.includes(required),"Existing University surface accidentally removed: "+required);
assert.ok(landing.includes("function followHash()")&&landing.includes('ids.has(id)'),"Existing admissions deep links must open the protected-price information panel");
assert.ok(landing.includes('disabled title="Checkout verification pending"'),"Checkout must remain held");
assert.equal((free.match(/data-page="\d"/g)||[]).length,3,"Free Founder booklet must have three readable pages");
assert.ok(free.includes('name="frontier-choice"')&&free.includes('id="result"'),"Free exercise requires local feedback");
assert.ok(free.includes("not the official Frontier Check")&&free.includes("unfinished future course"),"Public exercise must not claim to be an official exam or finished course");
for(const needle of ["fetch(", "localStorage", "sessionStorage", "XMLHttpRequest"])assert.ok(!free.includes(needle),"The public sample must not write user responses or use external APIs");
assert.ok(campus.includes("The Frontier Check"),"Protected student Frontier Check must remain a distinct existing assessment");
console.log("NBL University arrival/source checks passed (not a live E2E verification).");
