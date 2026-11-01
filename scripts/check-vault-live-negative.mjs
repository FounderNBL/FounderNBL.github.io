// Live Vault negative-path smoke. NO customer tokens, NO service key, NO mutations.
// This does not replace authenticated two-account isolation testing.
import test from "node:test";
import assert from "node:assert/strict";

const ENDPOINT="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-vault";
async function request(path="",method="GET",headers={}){
 const response=await fetch(ENDPOINT+path,{
  method,headers,cache:"no-store",redirect:"error",signal:AbortSignal.timeout(18000)
 });
 const raw=await response.text();
 let json={};try{json=JSON.parse(raw)}catch{}
 assert.equal(response.headers.get("cache-control"),"no-store","Do not cache private account responses");
 assert.doesNotMatch(raw,/"(founder|customer|accounts)"\s*:\s*(?:\{|\[)/,"No customer details in unsigned responses");
 return {status:response.status,json,headers:response.headers};
}
test("guest cannot read their own or Founder Vault",async()=>{
 for(const path of ["?view=mine","?view=founder"]){
  const res=await request(path);
  assert.equal(res.status,401);
  assert.equal(res.json.code,"SIGN_IN_REQUIRED");
 }
});
test("forged JWT is denied",async()=>{
 const r=await request("?view=founder","GET",{
  authorization:"Bearer fake.invalid.jwt",
  origin:"https://newbeansland.org"
 });
 assert.equal(r.status,401);
 assert.equal(r.json.code,"SIGN_IN_REQUIRED");
});
test("cross-origin attempts fail closed",async()=>{
 const r=await request("?view=mine","GET",{origin:"https://not-nbl.invalid"});
 assert.equal(r.status,403);
 assert.equal(r.json.code,"ORIGIN_NOT_ALLOWED");
});
test("mutation methods are rejected without side effects",async()=>{
 const r=await request("","POST",{origin:"https://newbeansland.org"});
 assert.equal(r.status,405);
 assert.equal(r.json.code,"READ_ONLY");
});
test("NBL origin preflight grants only expected methods",async()=>{
 const r=await request("","OPTIONS",{
  origin:"https://newbeansland.org",
  "access-control-request-method":"GET",
  "access-control-request-headers":"authorization"
 });
 assert.equal(r.status,204);
 assert.equal(r.headers.get("access-control-allow-origin"),"https://newbeansland.org");
 assert.match(r.headers.get("access-control-allow-methods")??"",/\bGET\b/);
 assert.doesNotMatch(r.headers.get("access-control-allow-methods")??"",/\bPOST\b/);
});
console.log("Negative live Vault tests passed. Signed-in Founder and two-account privacy remain unverified.");
