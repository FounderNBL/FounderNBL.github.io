import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {quoteUsageTopup, TOP_UP_DOLLARS, CREDITS_PER_DOLLAR} from "../nbl-usage-topup.mjs";

const read = path => fs.readFileSync(new URL(path, import.meta.url), "utf8");

test("NBL Usage refill starts at $10 and is deterministic", () => {
  assert.deepEqual(TOP_UP_DOLLARS, [10,20,50]);
  assert.equal(CREDITS_PER_DOLLAR, 70);
  assert.deepEqual({...quoteUsageTopup(10)}, {dollars:10,cents:1000,credits:700});
  assert.deepEqual({...quoteUsageTopup(20)}, {dollars:20,cents:2000,credits:1400});
  assert.deepEqual({...quoteUsageTopup(50)}, {dollars:50,cents:5000,credits:3500});
  for (const value of [0,7,9,10.01,11,-10,100,NaN,Infinity,"10",null]) {
    assert.throws(() => quoteUsageTopup(value), RangeError);
  }
});
test("Public price and Vault agree and prohibit live checkout", () => {
  const plans=read("../nbl-product-plans.js"), catalog=read("../pricing.html"), vault=read("../vault.html");
  assert.match(plans,/nblUsage:Object\.freeze\(\{name:"NBL Usage — Manual Credit Top-Up",price:"\$10 minimum top-up"/);
  assert.match(catalog,/70-credits-per-dollar conversion is a proposed offer/);
  assert.match(catalog,/Checkout is held/);
  assert.match(vault,/id="nblUsageTopupCheckout" disabled aria-disabled="true"/);
  assert.match(vault,/nothing is charged or credited/);
  assert.match(vault,/<script type="module" src="\/nbl-usage-topup\.mjs"><\/script>/);
  assert.match(vault,/not.*monthly Beans tool-use allowances, Get More replies, or NBL Studios Credits/is);
  assert.doesNotMatch(vault,/data-nbl-billing-plan="nbl_usage"/);
});
test("Refill preview cannot initiate a payment or credit grant", () => {
  const source=read("../nbl-usage-topup.mjs");
  assert.match(source,/checkout\.disabled = true/);
  assert.doesNotMatch(source,/\bfetch\s*\(|stripe\.com|checkout\.sessions|window\.location\s*=/i);
});
