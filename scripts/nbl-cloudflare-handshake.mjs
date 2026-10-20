// Cloudflare-first NBL Inspector handshake. Read-only, no WAF changes.
// Zone API health is NOT proof of a human browser session or WAF allowance.
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

export const ZONES = Object.freeze([
  Object.freeze({host:"newbeansland.org",id:"3f9747314e81a8e990175ce87362b68c"}),
  Object.freeze({host:"nblworld.com",id:"66cc8be3f3ac488482c234d16f97ac55"})
]);

export function classifyZoneResponse({status,payload,expected}){
  if(status===401||status===403||status===429||status>=500)
    return {state:"UNVERIFIED",reason:"cloudflare_api_access_or_rate_limited"};
  if(status===404)return {state:"UNVERIFIED",reason:"zone_not_readable_with_this_token"};
  if(status!==200||!payload||payload.success!==true||!payload.result)
    return {state:"UNVERIFIED",reason:"cloudflare_api_response_unverified"};
  const zone=payload.result;
  if(zone.id!==expected.id||zone.name!==expected.host)
    return {state:"FAIL",reason:"cloudflare_zone_identity_mismatch"};
  if(zone.status!=="active"||zone.paused===true)
    return {state:"FAIL",reason:"cloudflare_zone_not_active"};
  return {state:"PASS",reason:"cloudflare_zone_active"};
}

export async function cloudflareHandshake({token="",request=fetch}={}){
  const results=[];
  for(const expected of ZONES){
    if(!token.trim()){
      results.push({host:expected.host,state:"UNVERIFIED",reason:"cloudflare_read_token_not_configured"});
      continue;
    }
    try{
      const response=await request("https://api.cloudflare.com/client/v4/zones/"+expected.id,{
        method:"GET",
        headers:{authorization:"Bearer "+token,accept:"application/json"},
        signal:AbortSignal.timeout(10000)
      });
      // Never return token, response headers, or raw body to the Inspector.
      const payload=await response.json().catch(()=>null);
      results.push({host:expected.host,...classifyZoneResponse({status:response.status,payload,expected})});
    }catch{
      results.push({host:expected.host,state:"UNVERIFIED",reason:"cloudflare_api_network_unverified"});
    }
  }
  const overall=results.some(x=>x.state==="FAIL")?"FAIL":
    results.every(x=>x.state==="PASS")?"PASS":"UNVERIFIED";
  return {schema:1,step:"cloudflare_first",at:new Date().toISOString(),overall,
    evidenceScope:"Cloudflare zone configuration only; not visitor, challenge, or origin proof",
    zones:results};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const result=await cloudflareHandshake({token:process.env.CLOUDFLARE_NBL_INSPECTOR_TOKEN||""});
  mkdirSync(".inspector",{recursive:true});
  writeFileSync(".inspector/cloudflare-handshake.json",JSON.stringify(result,null,2)+"\n");
  for(const entry of result.zones){
    console.log("[CLOUDFLARE "+entry.state+"] "+entry.host+": "+entry.reason);
    if(entry.state==="UNVERIFIED")console.log("::warning::Cloudflare "+entry.host+" is unverified from GitHub; do NOT report a customer outage.");
    if(entry.state==="FAIL")console.log("::error::Cloudflare "+entry.host+" failed zone configuration verification.");
  }
  if(process.env.GITHUB_STEP_SUMMARY){
    const md=["## Cloudflare → GitHub handoff","",
      "**"+result.overall+"** (Cloudflare zone configuration only; not visitor reachability)",
      ...result.zones.map(x=>"- "+x.host+": "+x.state+" — "+x.reason),
      "","No WAF rule, visitor token, or payment was modified.",""];
    appendFileSync(process.env.GITHUB_STEP_SUMMARY,md.join("\n"));
  }
  if(result.overall==="FAIL")process.exitCode=1;
}
