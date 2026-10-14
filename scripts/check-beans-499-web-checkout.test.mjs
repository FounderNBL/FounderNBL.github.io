import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const header=readFileSync("nbl-world-header.js","utf8");
const account=readFileSync("account.html","utf8");

test("existing $4.99 Beans account button invokes authenticated NBL billing",()=>{
  assert.match(account,/data-account-billing-plan="beans"/);
  assert.match(account,/Beans · \$4\.99\/month/);
  assert.match(account,/window.NBLBillingBridge\?\.checkout\?\.\(plan\)/);
  assert.match(header,/getNblBeansAuthToken\(\)/);
  assert.match(header,/const route=portal\?"\/billing\/portal":"\/billing\/checkout"/);
  assert.match(header,/NBL_CHAT_GATEWAY_API\}\x24\{route\}/);
});
test("Stripe hosted Checkout session return URL is accepted without allowing arbitrary domains",()=>{
  assert.match(header,/\["buy\.stripe\.com","checkout\.stripe\.com","billing\.stripe\.com"\]\.includes\(url\.hostname\)/);
  assert.match(header,/url\.protocol!=="https:"/);
  assert.match(header,/trustedNblBillingDestination\(destination\)/);
  assert.doesNotMatch(header,/\["buy\.stripe\.com","billing\.stripe\.com"\]\.includes\(url\.hostname\)/);
});
