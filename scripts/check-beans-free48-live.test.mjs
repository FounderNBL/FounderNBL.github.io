import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=name=>readFileSync(new URL("../"+name,import.meta.url),"utf8");
test("live free Beans copy matches enforced 20 reply / 48h free rules",()=>{
 const header=load("nbl-world-header.js");
 const price=load("pricing.html");
 const terms=load("terms.html");
 const plans=load("nbl-product-plans.js");
 const account=load("account.html");
 assert.match(header,/20 replies for up to 48 hours/);
 assert.match(price,/20 successful replies during the first 48 hours/);
 assert.match(terms,/at most 20 successful replies during the first 48 hours/);
 assert.match(plans,/Up to 20 successful replies during the first 48 hours/);
 assert.match(account,/20 successful replies over 48 hours/);
 assert.match(account,/data-account-billing-plan="nbl_basic"/);
 assert.match(account,/data-account-billing-plan="beans"/);
 assert.doesNotMatch(account,/id="introSaveCard"/,"Unreleased automatic card enrollment is NOT advertised");
});
