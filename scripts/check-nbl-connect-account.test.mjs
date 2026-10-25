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

test("NBL Image Maker Canva account linking is user-owned, optional and provider-verified",()=>{
 assert.match(account,/operation:"canva_begin"/);
 assert.match(account,/operation:"canva_disconnect"/);
 assert.match(account,/operation:"canva_designs"/);
 assert.match(account,/target.hostname!=="www.canva.com"/);
 assert.match(account,/No additional NBL connection fee/);
 assert.doesNotMatch(account,/CANVA_CLIENT_SECRET/);
});

test("Still Canva design creation is held until the server confirms its separate write release",()=>{
 assert.match(account,/operation:"canva_create_design"/);
 assert.match(account,/canvaDesignWriteAvailable/);
 assert.match(account,/stillCreate.disabled=!data.canvaDesignWriteAvailable/);
 assert.match(account,/Create with Still in Canva/);
 assert.match(account,/Reconnect Canva for design permission/);
 assert.match(account,/No NBL charge/);
});
test("Still one-time $2 extra image offer is visible but payment remains gated",()=>{
 assert.match(account,/id="stillImagePack"/);
 assert.match(account,/Extra Image · \$2 one time/);
 assert.match(account,/Checkout pending<\/button>/);
 assert.doesNotMatch(account,/stillImagePack.*data-account-billing-plan="still"/);
});
test("Still camera and Canva are website-only tools; camera access is user initiated",()=>{
 const header=fs.readFileSync(new URL("../nbl-world-header.js",import.meta.url),"utf8");
 assert.match(header,/data-nbl-tool="still-camera"/);
 assert.match(header,/data-nbl-tool="still-canva"/);
 assert.match(header,/data-nbl-still-camera/);
 assert.match(header,/capture="environment"/);
 assert.match(header,/if\(tool==="still-camera"\)/);
 assert.match(header,/stillCameraInput.click\(\)/);
});
