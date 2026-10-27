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

test("Founder data must come only from verified backend, not a client role flag",()=>{
  checks(/api\("founder",epoch\)/);
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
  checks(/Automated refills and Founder payouts are off/);
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

test("Vault, public catalog and Beans drawer preserve every approved Founder price",()=>{
 const planSource=readFileSync(new URL("../nbl-product-plans.js",import.meta.url),"utf8");
 const publicCatalog=readFileSync(new URL("../pricing.html",import.meta.url),"utf8");
 const header=readFileSync(new URL("../nbl-world-header.js",import.meta.url),"utf8");
 const approved=[
  ["beans","$4.99/month"],["nblPlus","$29.99/month"],["beansUniversity","$14.99/month"],
  ["foundationStudentContinuation","$9.99/month"],["getMore","$9.99 one-time"],
  ["nblUsage","$7.00 one-time"],["studiosCredits","$8.99 one-time"],
  ["foundationProgram","$29.99 one-time"],["foundationUniversity","$34.99 one-time"],
  ["guidedFoundation","$54.99 one-time"],["fullNbluDiy","$184.99 one-time"],
  ["fullNblu","$449.99 one-time"],["nbluContinuation","$14.99/month"]
 ];
 for(const [key,price] of approved){
   const row=planSource.split(key+":Object.freeze({")[1]?.split("\n")[0]||"";
   assert.ok(row.includes('price:"'+price+'"'),key+" changed its approved rate");
   assert.ok(html.includes('data-nbl-plan-value="'+key+'.price"'),"Vault missing canonical "+key);
   assert.ok(publicCatalog.includes('data-nbl-plan-value="'+key+'.price"'),"Catalog missing canonical "+key);
 }
 assert.match(header,/NBL_PRODUCT_PLANS\\.nblUsage\\?\\.price/);
 assert.match(header,/NBL_PRODUCT_PLANS\\.studiosCredits\\?\\.price/);
 assert.match(html,/id="university-prices"/);
 assert.match(html,/full refund of that advance-enrollment payment/);
 assert.match(html,/December 2026/);
 assert.match(html,/\$184\\.99.*no physical books/is);
 assert.match(html,/\$449\\.99.*physical stage-release books/is);
});

test("NBL service currencies stay separate; no extra fee or leaked operating reserve",()=>{
 const customer=html.split('<section class="panel" id="founder" hidden>')[0];
 assert.match(customer,/not.*deduction from purchased NBL Usage or NBL Studios credits/i);
 assert.match(customer,/NBL Usage credits.*not.*monthly Beans tool-use counter/is);
 assert.match(customer,/NBL Studios quotes the required.*NBL Studios Credits/is);
 assert.match(customer,/NBL replies, monthly tool allowances, NBL Usage credits and NBL Studios Credits each have distinct terms/);
 assert.doesNotMatch(customer,/\$5(?:\\.00)? (?:provider|service) reserve|internal operating profit|supplier invoices/i);
 assert.doesNotMatch(customer,/data-nbl-university-checkout=|data-account-billing-plan=|data-nbl-billing-plan=/);
});
