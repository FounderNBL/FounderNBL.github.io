import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const account=read("account.html");
const beans=read("nbl-beans-experience.js");
const shopping=read("nbl-beans-shopping.js");
const header=read("nbl-world-header.js");
test("Bag lives beside Beans billing, not instead of it",()=>{
  assert.ok(account.includes('id="membershipCard"'));
  assert.ok(account.includes('id="nblBagCard"'));
  assert.ok(account.includes('data-account-billing-plan="beans"'));
  assert.ok(account.includes('data-account-billing-plan="nbl_basic"'));
  assert.ok(account.indexOf('id="membershipCard"')<account.indexOf('id="nblBagCard"'));
  assert.ok(account.includes('renderBag()'));
  assert.ok(account.includes('getToken()'));
  assert.ok(account.includes('/functions/v1/nbl-bag?view=mine'));
  assert.ok(account.includes('Authorization:"Bearer "+t'));
});
test("No fictional Bag spending or charge without a verified entitlement",()=>{
  assert.ok(account.includes('if(bag.enabled&&Number.isSafeInteger(bag.totalUnits))'));
  assert.ok(account.includes('bag.spendingEnabled'));
  assert.ok(!account.includes('data-account-billing-plan="bag"'));
  assert.ok(!account.includes("Bag checkout completed"));
  assert.ok(beans.includes('input.value="Help me navigate New Beansland'));
  assert.ok(beans.includes('I must confirm any purchase myself'));
  assert.ok(!beans.includes("Bag charged"));
});
test("Beans has real site destinations to help customers shop",()=>{
  for(const page of ["/account.html#nblBagCard","/account.html#membershipCard","/pricing.html","/pulse/","/books.html"]){
    assert.ok(beans.includes(page),"missing "+page);
  }
  assert.ok(beans.includes('data-nbl-beans-prompt="Help me explore New Beansland'));
});

test("network-bound Bag panel is separate from Beans offline personalization",()=>{
  assert.ok(!beans.includes("fetch("));
  assert.ok(shopping.includes("nbl-bag?view=mine"));
  assert.ok(shopping.includes('getToken'));
  assert.ok(shopping.includes("currentUser!==originalUser"));
  assert.ok(shopping.includes('if(!bagDetails.open)'));
  assert.ok(header.includes('nbl-beans-shopping.js?v=20261118-live-bag-guide'));
});
