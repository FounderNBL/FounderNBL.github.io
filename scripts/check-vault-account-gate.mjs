// Vault website static safety checks. These are NOT two-account or real-backend tests.
import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("../vault.html",import.meta.url),"utf8");
const checks=(re,msg)=>assert.match(html,re,msg);

test("Vault requires an existing signed-in NBL account",()=>{
  checks(/window\.NBLAccountBridge/,"shared NBL Clerk bridge required");
  checks(/getClerk\(\)/,"Clerk account required");
  checks(/getToken\(\)/,"bearer must come from existing signed-in account");
  checks(/Authorization:"Bearer "\+token/,"token required for GET");
  checks(/if\(!state\.clerk\?\.isSignedIn\|\|!state\.clerk\.session\)/,"guest state required");
});

test("customer data only requested for the authenticated identity",()=>{
  checks(/functions\/v1\/nbl-vault/);
  checks(/\?view="\+encodeURIComponent\(view\)/);
  checks(/api\("mine"\)/);
  // Caller never passes an arbitrary user, account, or student id.
  assert.doesNotMatch(html,/[?&]user_id=|[?&]clerk_user_id=|[?&]accountId=/);
  assert.doesNotMatch(html,/localStorage\.|sessionStorage\.|\bPOST\b/);
});

test("Founder data must come only from verified backend, not a client role flag",()=>{
  checks(/api\("founder"\)/);
  checks(/const f=result\.founder/);
  checks(/if\(!f\)\{\$\("founder"\)\.hidden=true;return;\}/);
  checks(/id="founder" hidden/);
  assert.doesNotMatch(html,/role\s*[:=]\s*["']founder["']|\?founder=true|isFounder=true/);
});

test("Vault never renders untrusted balances as HTML or initiates payments",()=>{
  checks(/\.textContent=/);
  assert.doesNotMatch(html,/innerHTML|outerHTML|insertAdjacentHTML|document\.write/);
  assert.doesNotMatch(html,/\.post\(|\bfetch\([^\n]*method:\s*["']POST/);
  assert.doesNotMatch(html,/sk_(?:live|test)_[A-Za-z0-9]+|SUPABASE_SERVICE_ROLE_KEY|\btransferFunds\b|\bcreatePayout\b/i);
  checks(/service allowances, not cash or withdrawals/);
  checks(/Unverified balances remain unknown/);
});

test("Vault prevents premature claims of live financial integration",()=>{
  checks(/No reconciled settlements yet; actual cash\/profit is not established/);
  checks(/Automated provider refills and Founder payouts are off/);
  checks(/Vault records cannot be read right now/);
});

console.log("Vault browser source gate only; NOT proof of deployed nbl-vault, DB migration, cross-account isolation or financial reconciliation.");
