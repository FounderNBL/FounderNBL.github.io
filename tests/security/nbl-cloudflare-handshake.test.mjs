import {test} from "node:test";
import assert from "node:assert/strict";
import {ZONES,cloudflareHandshake,classifyZoneResponse} from "../../scripts/nbl-cloudflare-handshake.mjs";
const good=(expected)=>({success:true,result:{id:expected.id,name:expected.host,status:"active",paused:false}});
test("Cloudflare must be first; missing read-token is unverified, not PASS or outage",async()=>{
 const r=await cloudflareHandshake({token:"",request:()=>{throw Error("network must not run");}});
 assert.equal(r.overall,"UNVERIFIED");assert.equal(r.zones.length,2);
 assert.ok(r.zones.every(z=>z.reason==="cloudflare_read_token_not_configured"));
});
test("both confirmed active zone IDs hand off as zone-PASS (not visitor proof)",async()=>{
 let index=0;
 const r=await cloudflareHandshake({token:"fixture-not-a-secret",request:async(url,options)=>{
  const zone=ZONES[index++];assert.equal(url,"https://api.cloudflare.com/client/v4/zones/"+zone.id);
  assert.equal(options.method,"GET");
  return {status:200,json:async()=>good(zone)};
 }});
 assert.equal(r.overall,"PASS");assert.equal(index,2);
 assert.match(r.evidenceScope,/not visitor/);
});
test("wrong zone, paused zone, or disabled zone is a true configuration FAIL",()=>{
 const z=ZONES[0];
 assert.equal(classifyZoneResponse({status:200,payload:good(ZONES[1]),expected:z}).state,"FAIL");
 assert.equal(classifyZoneResponse({status:200,payload:{success:true,result:{...good(z).result,paused:true}},expected:z}).state,"FAIL");
 assert.equal(classifyZoneResponse({status:200,payload:{success:true,result:{...good(z).result,status:"pending"}},expected:z}).state,"FAIL");
});
test("403/429/500 from the API cannot imply that customers are blocked",()=>{
 for(const status of [401,403,404,429,500,503]){
  assert.equal(classifyZoneResponse({status,payload:null,expected:ZONES[0]}).state,"UNVERIFIED");
 }
});
test("do not let a single good domain hide an unverified one",async()=>{
 let i=0;const r=await cloudflareHandshake({token:"fixture",request:async()=>{
  const z=ZONES[i++];return i===2?{status:403,json:async()=>null}:{status:200,json:async()=>good(z)};
 }});
 assert.equal(r.overall,"UNVERIFIED");assert.equal(r.zones[0].state,"PASS");
});
