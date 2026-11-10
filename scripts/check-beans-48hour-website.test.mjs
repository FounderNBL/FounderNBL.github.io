import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=x=>readFileSync(new URL("../"+x,import.meta.url),"utf8");
const a=read("account.html"),p=read("pricing.html"),t=read("terms.html"),
  plans=read("nbl-product-plans.js"),header=read("nbl-world-header.js");
test("free Beans is explicitly 20 replies / 48 hours with no card or model switching",()=>{
 assert.match(plans,/20 successful replies within 48 hours/);
 assert.match(plans,/no model selection/);
 assert.match(a,/Free Beans: 20 replies over 48 hours/);
 assert.match(p,/20 successful replies in 48 hours/);
 assert.match(t,/no more than 20 successful replies during the first 48 hours/);
 assert.match(header,/20 replies/);
});
test("future $4.99 billing requires a separate checked consent and cancel link",()=>{
 assert.match(a,/id="introBillingConsent"/);
 assert.match(a,/id="introSaveCard"/);
 assert.match(a,/id="introCancelFuture"/);
 assert.match(a,/if\(!introConsent\.checked\)/);
 assert.match(a,/starter_auto_enroll/);
 assert.match(a,/starter_auto_cancel/);
 assert.match(a,/starter_auto_status/);
 assert.match(a,/consentVersion:"beans-intro-2026-11-10"/);
 assert.match(a,/\$4\.99 is charged at the end of your 48 hours/);
 assert.match(a,/\$20\/month until canceled/);
});
test("direct $20 purchase and other active plans are preserved",()=>{
 assert.match(a,/data-account-billing-plan="nbl_basic"/);
 assert.match(a,/data-account-billing-plan="beans"/);
 assert.match(plans,/NBL Basic.*\$20\/month/);
 assert.match(t,/Email registration alone never authorizes payment/);
});
