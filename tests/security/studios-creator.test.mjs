import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");
const html = read("studio/creator.html");
const js = read("studio/creator.js");
const css = read("studio/creator.css");

test("NBL Studios creator preview remains independent and gated even when linked", () => {
  assert.match(html, /<title>Create · NBL Studios/);
  assert.match(html, /id="createForm"/);
  assert.match(html, /id="buyCredits"/);
  assert.match(html, /checkout verification is complete/);
  assert.ok(html.includes('src="./creator.js"'));
  assert.ok(css.includes(".columns"));
});

test("the creator uses NBL auth and the protected server-only generation door", () => {
  assert.match(js, /NBLAccountBridge/);
  assert.match(js, /getToken/);
  for (const action of ['"models"', '"wallet"', '"generate"', '"status"']) {
    assert.ok(js.includes(action), "Missing studio action " + action);
  }
  assert.match(js, /reference_image_credit_cost/);
  assert.match(js, /requires_start_image/);
  assert.doesNotMatch(js, /RUNWAY_API_KEY|SUPABASE_SERVICE_ROLE_KEY|sk_live_/);
  assert.doesNotMatch(js, /innerHTML|eval\(/);
});

test("secure checkout is account bound and cannot navigate to an arbitrary host", () => {
  assert.match(js, /studios_500/);
  assert.ok(js.includes('["checkout.stripe.com", "buy.stripe.com"].includes(url.hostname)'), "checkout must use an exact Stripe hostname allowlist");
  assert.match(js, /url\.protocol !== "https:"/);
  assert.match(js, /"PRICE_CHECKOUT_HELD"/);
  assert.match(js, /crypto\.randomUUID\(\)/);
});
