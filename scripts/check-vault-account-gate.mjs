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
  checks(/function isCurrent\(epoch\)/,"signed-in epoch state required");
  checks(/function clearPrivateDisplay\(\)/,"clear prior user account values");
  checks(/if\(!isCurrent\(epoch\)\)return null/,"reject stale network results");
});

test("customer data only requested for the authenticated identity",()=>{
  checks(/functions\/v1\/nbl-vault/);
  checks(/\?view="\+encodeURIComponent\(view\)/);
  checks(/api\("mine",epoch\)/);
  // Caller never passes an arbitrary user, account, or student id.
  assert.doesNotMatch(html,/[?&]user_id=|[?&]clerk_user_id=|[?&]accountId=/);
  assert.doesNotMatch(html,/localStorage\.|sessionStorage\.|\bPOST\b/);
});

test("Public Vault never requests or renders the internal operating vault",()=>{
  assert.doesNotMatch(html,/api\("founder",epoch\)|renderFounder\(|id="founder" hidden|view="founder"/);
  checks(/api\("mine",epoch\)/);
  assert.doesNotMatch(html,/role\s*[:=]\s*["']founder["']|\?founder=true|isFounder=true/);
});

test("Vault never renders untrusted balances as HTML or initiates payments",()=>{
  checks(/\.textContent=/);
  assert.doesNotMatch(html,/innerHTML|outerHTML|insertAdjacentHTML|document\.write/);
  assert.doesNotMatch(html,/\.post\(|\bfetch\([^\n]*method:\s*["']POST/);
  assert.doesNotMatch(html,/sk_(?:live|test)_[A-Za-z0-9]+|SUPABASE_SERVICE_ROLE_KEY|\btransferFunds\b|\bcreatePayout\b/i);
  checks(/service allowances, not cash or withdrawals/);
});

test("Vault prevents premature claims of live financial integration",()=>{
  assert.doesNotMatch(html,/No reconciled settlements yet; actual cash\/profit is not established|Automated refills and Founder payouts are off/);
  checks(/Vault records cannot be read right now/);
});

console.log("Vault browser source gate only; NOT proof of deployed nbl-vault, DB migration, cross-account isolation or financial reconciliation.");

test("NBL Vault is the inclusive Beans pricing and per-tool allowance center",()=>{
 checks(/id="pricing"/);
 checks(/id="tool-usage"/);
 checks(/function renderToolUsage\(source\)/);
 checks(/source\?\.customer\?\.tools\?\.entries/);
 checks(/renderToolUsage\(data\)/);
 checks(/12\), file understanding \(8\), code\/data \(3\), PDF\/file creation \(3\), image creation \(2\), and Beans voice \(12\)/);
 checks(/\$4\.99\/month/);
 checks(/\$9\.99 one-time/);
 checks(/not an extra fee for each NBL tool/);
 checks(/NBL pays to run Beans/);
 checks(/data-nbl-plan-value="beans.price"/);
 checks(/data-nbl-plan-value="getMore.price"/);
 assert.doesNotMatch(html,/Get More[^<]*\$2/);
});

test("customer NBL Vault uses NBL tool-cost language, never supplier-cost language",()=>{
 const customer=html.split('<section class="panel" id="founder" hidden>')[0];
 assert.match(customer,/1 included NBL use/);
 assert.match(customer,/NBL covers the cost of the service/);
 assert.match(html,/NBL uses spent/);
 assert.doesNotMatch(customer,/OpenAI|API provider invoices|provider charges|supplier invoices/i);
});

test("Vault and public catalog preserve active prices while University is closed",()=>{
 const plans=readFileSync(new URL("../nbl-product-plans.js",import.meta.url),"utf8");
 const pricing=readFileSync(new URL("../pricing.html",import.meta.url),"utf8");
 const account=readFileSync(new URL("../account.html",import.meta.url),"utf8");
 for(const [key,price] of [["beans","$4.99/month"],["getMore","$9.99 one-time"],
   ["nblUsage","$7.00 one-time"],["studiosCredits","$8.99 one-time"]]){
   assert.ok(plans.includes('price:"'+price+'"'),key+" canonical value missing");
   assert.ok(html.includes('data-nbl-plan-value="'+key+'.price"'),"Vault missing "+key);
   assert.ok(pricing.includes('data-nbl-plan-value="'+key+'.price"'),"Catalog missing "+key);
 }
 assert.match(pricing,/University is under construction/);
 assert.match(account,/Sign up free for the opening notification/);
 assert.match(html,/No University purchase or subscription can be started/);
 assert.doesNotMatch(html,/<article class="rate-card"><h3.*Full NBLU Experience/is);
 assert.match(html,/id="university-prices"/);
});
test("NBL service currencies stay separate; no extra fee or leaked operating reserve",()=>{
 const customer=html.split('<section class="panel" id="founder" hidden>')[0];
 assert.match(customer,/not.*deduction from purchased NBL Usage or NBL Studios credits/i);
 assert.match(customer,/NBL Usage credits.*not.*monthly Beans tool-use counter/is);
 assert.match(customer,/NBL Studios quotes the required.*NBL Studios Credits/is);
 assert.match(customer,/NBL replies, monthly tool allowances, NBL Usage credits and NBL Studios Credits each have distinct terms/);
 assert.doesNotMatch(customer,/\$5(?:\.00)? (?:provider|service) reserve|internal operating profit|supplier invoices/i);
 assert.doesNotMatch(customer,/data-nbl-university-checkout=|data-account-billing-plan=|data-nbl-billing-plan=/);
});

test("Public pricing keeps three categories, account keeps Beans and closed University only",()=>{
 const pricing=readFileSync(new URL("../pricing.html",import.meta.url),"utf8");
 const account=readFileSync(new URL("../account.html",import.meta.url),"utf8");
 const arrival=readFileSync(new URL("../university.html",import.meta.url),"utf8");
 const legacy=readFileSync(new URL("../university-enrollment.html",import.meta.url),"utf8");
 const header=readFileSync(new URL("../nbl-world-header.js",import.meta.url),"utf8");
 const styles=readFileSync(new URL("../nbl-world-header.css",import.meta.url),"utf8");
 assert.equal((pricing.match(/<details class="nbl-category" data-nbl-category/g)||[]).length,3);
 assert.equal((account.match(/<details class="account-category">/g)||[]).length,2);
 assert.match(arrival,/data-nbl-university-interest-form/);
 assert.match(legacy,/university.html#early-registration/);
 assert.equal((header.match(/<details class="nbl-drawer-category">/g)||[]).length,3);
 assert.match(styles,/nbl-drawer-category/);
 for(const name of ["beans","topup_500"])assert.ok(account.includes('data-account-billing-plan="'+name+'"'));
 assert.match(pricing,/addEventListener\("hashchange",reveal\)/);
 assert.match(html,/addEventListener\("hashchange",revealVaultCategory\)/);
 assert.match(html,/id="pricing"/);
 assert.match(html,/id="university-prices"/);
 assert.match(arrival,/school is under construction/);
 assert.doesNotMatch(arrival,/nblu-pay|billing\/checkout/);
});
