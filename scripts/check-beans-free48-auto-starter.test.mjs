import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";
const account=readFileSync(new URL("../account.html",import.meta.url),"utf8");
const plans=readFileSync(new URL("../nbl-product-plans.js",import.meta.url),"utf8");
test("NBL free signup is card-free, 20 replies, 48 hours, basic AI only",()=>{
  assert.match(account,/Free Beans:<\/strong> 20 successful replies over 48 hours/);
  assert.match(plans,/Cheapest intelligence only\. No card needed/);
  assert.match(account,/data-account-billing-plan="nbl_basic"/);
});
test("Automatic Starter is a separate opt-in with informed billing consent",()=>{
  assert.match(account,/id="beansAutoStarter"[^>]+hidden/);
  assert.match(account,/id="beansAutoStarterConsent"/);
  assert.match(account,/I authorize NBL to save my card and automatically charge \$4\.99/);
  assert.match(account,/No charge today/);
  assert.match(account,/20\/month/);
  assert.match(account,/starter_auto_enroll/);
  assert.match(account,/consent:true,consentVersion:"beans-intro-2026-11-10"/);
  assert.match(account,/starter_auto_status/);
  assert.match(account,/starter_auto_cancel/);
  assert.match(account,/new URL\(response.checkoutUrl\|\|""\)/);
  assert.match(account,/url.hostname!=="checkout.stripe.com"/);
  assert.doesNotMatch(account,/starterRequest\("starter_auto_enroll"\)\s*;/);
});
test("Account page inline scripts still compile",()=>{
  const inline=[...account.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
  assert.ok(inline.length>=1);
  for(const s of inline)new vm.Script(s,{filename:"account.html-inline.js"});
});
