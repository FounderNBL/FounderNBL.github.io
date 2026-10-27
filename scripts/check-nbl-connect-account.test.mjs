import fs from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";
const account=fs.readFileSync(new URL("../account.html",import.meta.url),"utf8");
test("NBL account exposes an optional per-user GitHub connection and disconnect",()=>{
 assert.match(account,/id="nblConnectCard"/);
 assert.match(account,/operation:"github_begin"/);
 assert.match(account,/operation:"github_disconnect"/);
 assert.match(account,/operation:"github_repositories"/);
 assert.match(account,/operation:"github_read_file"/);
 assert.match(account,/Connect my GitHub/);
 assert.match(account,/Read-only repository inspection|repository reading only|read-only inspection/);
});
test("Payhip automatic coupon lives behind explicit Founder approval without removing manual fallback",()=>{
 assert.match(account,/operation:"founder_approve",fulfillmentRequestId:item.id,/);
 assert.match(account,/autoCreatePayhipCoupon:true/);
 assert.match(account,/confirmRecipient:true/);
 assert.match(account,/Already created coupon — approve manually/);
 assert.match(account,/redemptionCode:code.value.trim\(\)/);
 assert.match(account,/Create Payhip coupon & approve/);
});
test("No credential or extra public token handling embedded in HTML",()=>{
 for(const marker of ["PAYHIP_API_KEY","NBL_GITHUB_APP_CLIENT_SECRET","NBL_CONNECT_TOKEN_AES_KEY","SUPABASE_SERVICE_ROLE_KEY"])assert.ok(!account.includes(marker),marker+" is not public");
 assert.match(account,/CONNECT_API="https:\/\/tvypdakofcrlvnwporhh\.supabase\.co\/functions\/v1\/nbl-core\/connect"/);
 assert.match(account,/Authorization:"Bearer "\+t/);
});

test("Canva linking is paused but customers can revoke existing authorizations",()=>{
 assert.match(account,/Canva linking and design creation are temporarily paused/);
 assert.match(account,/Canva connection · paused/);
 assert.match(account,/operation:"canva_disconnect"/);
 assert.doesNotMatch(account,/operation:"canva_begin"|operation:"canva_create_design"|operation:"canva_designs"/);
 assert.doesNotMatch(account,/Connect my Canva|Reconnect Canva for design permission/);
 assert.doesNotMatch(account,/CANVA_CLIENT_SECRET/);
});
test("Beans tools use included membership allowances; no public per-image checkout",()=>{
 assert.match(account,/id="stillImagePack"/);
 assert.match(account,/Beans tools · Included with membership/);
 assert.match(account,/href="\\/vault.html#pricing"/);
 assert.doesNotMatch(account,/Beans · Extra Image · \\$2 one time/);
 assert.doesNotMatch(account,/Extra image · \\$2/);
});
test("Beans image, camera and attachments remain; Canva UI is no longer reachable",()=>{
 const header=fs.readFileSync(new URL("../nbl-world-header.js",import.meta.url),"utf8");
 assert.match(header,/data-nbl-tool="still-camera"/);
 assert.match(header,/data-nbl-tool="attach"/);
 assert.match(header,/data-nbl-tool="image"/);
 assert.match(header,/data-nbl-still-camera/);
 assert.match(header,/capture="environment"/);
 assert.match(header,/if\(tool==="still-camera"\)/);
 assert.match(header,/stillCameraInput.click\(\)/);
 assert.doesNotMatch(header,/data-nbl-tool="still-canva"/);
 assert.doesNotMatch(header,/setStillVisualTools\(true\)/);
 assert.match(header,/mode:"beans"/);
 assert.doesNotMatch(header,/\/agent-platform\/|\/agents\/still\/chat|NBL_STILL_GOOGLE_AGENT_KEY/);
});
