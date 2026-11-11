// Evidence-based GREEN contract for newbeansland.org.
// One repo only. Read-only HTTP and local source inspection; no customer data.
import {readFileSync,mkdirSync,writeFileSync,appendFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";
import {dirname,resolve,join} from "node:path";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
export const readContract=()=>JSON.parse(readFileSync(join(root,"config/nbl-website-green-baseline.json"),"utf8"));
const forbidden=/university|nblu|campus|nblschool|grey|virgo|games?|block.?boss|playground|nbl-desk/i;
export function contractGuard(contract){
  if(contract.schema!==1||contract.repository!=="FounderNBL/FounderNBL.github.io"||
    contract.scope?.allowedPublicHost!=="newbeansland.org"||
    contract.scope?.allowedRepositories?.length!==1||
    contract.scope.allowedRepositories[0]!==contract.repository)throw Error("website_only_scope_not_met");
  if(!Array.isArray(contract.production?.publicPages)||contract.production.publicPages.length<5)throw Error("missing_public_routes");
  for(const path of contract.production.publicPages){
    if(typeof path!=="string"||!path.startsWith("/")||path.startsWith("//")||
      path.includes("..")||path.includes("?")||forbidden.test(path))throw Error("forbidden_site_route");
  }
  for(const item of contract.source.requiredMarkers){
    if(!/^[a-z0-9._/-]+$/i.test(item.file)||item.file.includes("..")||
      forbidden.test(item.file)||!Array.isArray(item.all))throw Error("forbidden_source_probe");
  }
  if(contract.source.officialWorldArt.length!==2||contract.source.officialWorldArt.some(x=>
    !["/pulse/","/messenger/"].includes(x.route)||forbidden.test(x.sourceImage)))
    throw Error("unapproved_art_probe");
  if(contract.source.existingRegressionSuites.some(s=>forbidden.test(s)||/check-approved-world-card-art/.test(s)))
    throw Error("held_scope_in_scheduled_tests");
  return true;
}
const finding=(id,status,reason,extra={})=>({id,status,reason,...extra});
const hex=bytes=>createHash("sha256").update(bytes).digest("hex");
export function checkWebsiteSource(contract,read=(path)=>readFileSync(join(root,path))){
  contractGuard(contract);
  const out=[];
  for(const item of contract.source.requiredMarkers){
    try{
      const contents=read(item.file).toString("utf8");
      const missing=item.all.filter(s=>!contents.includes(s));
      out.push(finding(item.id,missing.length?"FAIL":"PASS",missing.length?
        "approved_source_markers_missing":"approved_source_markers_present",{
          evidenceType:"local_repository_source",file:item.file,missingMarkers:missing
        }));
    }catch{
      out.push(finding(item.id,"UNVERIFIED","source_file_not_readable",{file:item.file}));
    }
  }
  let homepage="";
  try{homepage=read("index.html").toString("utf8");}catch{}
  for(const art of contract.source.officialWorldArt){
    const img="/"+art.sourceImage;
    let status="PASS",reason="approved_card_reference_and_original_bytes";
    let actualHash=null;
    const section=homepage.split('<section class="pulse-world-door"')[1]?.split("</section>")[0]||"";
    if(!section.includes('href="'+art.route+'"')||!section.includes('src="'+img+'"')){
      status="FAIL";reason="homepage_world_card_drift";
    }
    try{
      const bytes=read(art.sourceImage);
      actualHash=hex(bytes);
      if(bytes.subarray(0,8).toString("hex")!=="89504e470d0a1a0a" ||
        bytes.readUInt32BE(16)!==art.width||bytes.readUInt32BE(20)!==art.height||
        actualHash!==art.sha256){status="FAIL";reason="official_png_not_approved_original";}
    }catch{status="FAIL";reason="official_png_missing_from_website_repo";}
    out.push(finding(art.id+"-approved-source-art",status,reason,{
      evidenceType:"local_source_bytes",path:art.sourceImage,expectedHash:art.sha256,actualHash}));
  }
  return out;
}
export function statusFromResponse(status,contentType="",sample=""){
  if([0,401,403,408,429].includes(status)||/cf-mitigated|checking your browser|just a moment|attention required! \| cloudflare/i.test(sample.slice(0,3000)))
    return "UNVERIFIED";
  if(status>=500||status===404||status===410)return "FAIL";
  if(status>=200&&status<400&&/text\/html/i.test(contentType))return "PASS";
  return "UNVERIFIED";
}
async function httpGet(url,{request=fetch,asBytes=false}={}){
  const target=new URL(url);
  const controller=AbortSignal.timeout(12000);
  try{
    const res=await request(target.href,{
      method:"GET",signal:controller,redirect:"follow",
      headers:{accept:asBytes?"image/png":"text/html,application/json;q=0.9",
        "user-agent":"NBL-Website-Green-Inspector/1.0"}
    });
    const final=new URL(res.url||target.href);
    if(final.host!==target.host||final.protocol!=="https:")return {status:"UNVERIFIED",reason:"unexpected_redirect_host"};
    const type=res.headers?.get("content-type")||"";
    const data=asBytes?Buffer.from(await res.arrayBuffer()):await res.text();
    return {httpStatus:res.status,type,body:data};
  }catch{return {status:"UNVERIFIED",reason:"inspector_network_or_timeout"};}
}
export async function checkLiveRoutes(contract,{request=fetch}={}){
  contractGuard(contract);const out=[];
  // Fixed allowlist excludes University, games, Desk, Playground, and external sites.
  for(const path of contract.production.publicPages){
    const result=await httpGet("https://"+contract.scope.allowedPublicHost+path,{request});
    if(result.status){
      out.push(finding("route:"+path,result.status,result.reason));continue;
    }
    const status=statusFromResponse(result.httpStatus,result.type,result.body);
    out.push(finding("route:"+path,status,status==="PASS"?
      "visitor_html_reachable":status==="FAIL"?"live_route_error":"runner_response_unverified",
      {httpStatus:result.httpStatus}));
  }
  return out;
}
export async function checkLiveImages(contract,{request=fetch}={}){
  contractGuard(contract);const out=[];
  for(const art of contract.source.officialWorldArt){
    const result=await httpGet("https://newbeansland.org/"+art.sourceImage,{request,asBytes:true});
    if(result.status){out.push(finding(art.id+"-live-art",result.status,result.reason));continue;}
    const bytes=result.body;
    if([401,403,429].includes(result.httpStatus)){
      out.push(finding(art.id+"-live-art","UNVERIFIED","image_runner_challenged",{httpStatus:result.httpStatus}));continue;
    }
    const valid=result.httpStatus===200 && result.type.includes("image/") &&
      bytes.subarray(0,8).toString("hex")==="89504e470d0a1a0a" &&
      bytes.length>=24&&bytes.readUInt32BE(16)===art.width&&bytes.readUInt32BE(20)===art.height;
    const digest=valid?hex(bytes):null;
    out.push(finding(art.id+"-live-art",valid&&digest===art.sha256?"PASS":"FAIL",
      valid&&digest===art.sha256?"deployed_png_matches_approved_hash":"live_image_bytes_do_not_match",
      {httpStatus:result.httpStatus,expectedHash:art.sha256,actualHash:digest}));
  }
  return out;
}
export async function checkCoreHealth(contract,{request=fetch}={}){
  const url=contract.production.coreHealth;
  if(url!=="https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-core/health")
    throw Error("unauthorized_health_target");
  try{
    const r=await request(url,{method:"GET",signal:AbortSignal.timeout(12000),
      headers:{accept:"application/json","user-agent":"NBL-Website-Green-Inspector/1.0"}});
    if([401,403,429].includes(r.status))return finding("core-health","UNVERIFIED","backend_probe_access_unverified",{httpStatus:r.status});
    if(r.status!==200)return finding("core-health",r.status>=500?"FAIL":"UNVERIFIED","core_health_response_not_200",{httpStatus:r.status});
    const x=await r.json();
    const expected=contract.production.expectedCore;
    const pass=x?.service===expected.service&&x?.components?.gateway?.ok===expected.gateway&&
      x?.components?.publicBeans?.ok===expected.publicBeans&&
      x?.routes?.publicChat===expected.publicChat&&x?.routes?.signedChat===expected.signedChat;
    return finding("core-health",pass?"PASS":"FAIL",pass?"core_gateway_contract_verified":"core_health_contract_mismatch");
  }catch{return finding("core-health","UNVERIFIED","backend_probe_unavailable");}
}
export function assessment(findings,contract){
  const counts={PASS:0,FAIL:0,UNVERIFIED:0};
  for(const f of findings){if(!(f.status in counts))throw Error("invalid_finding");counts[f.status]++;}
  const notProven=contract.coverage.filter(x=>!["implemented"].includes(x.stage))
    .map(x=>({area:x.id,status:"UNVERIFIED",reason:"baseline_evidence_not_yet_implemented"}));
  const fullGreen=counts.FAIL===0&&counts.UNVERIFIED===0&&notProven.length===0;
  return {status:counts.FAIL?"FAIL":fullGreen?"PASS":"UNVERIFIED",
    fullGreen,counts,notProven,scope:"newbeansland.org only",
    noDeskChecks:true,noPlaygroundChecks:true,noUniversityChecks:true};
}
export async function run(){
  const contract=readContract();contractGuard(contract);
  const findings=[...checkWebsiteSource(contract),
    ...await checkLiveRoutes(contract),
    ...await checkLiveImages(contract),
    await checkCoreHealth(contract)];
  const summary=assessment(findings,contract);
  const receipt={
    at:new Date().toISOString(),schema:1,baseline:"config/nbl-website-green-baseline.json",
    repo:contract.repository,mode:"read_only_existing_website_workflow",
    summary,findings,repairs:0,deployments:0,accountChanges:0
  };
  mkdirSync(".inspector",{recursive:true});
  writeFileSync(".inspector/website-green-baseline.json",JSON.stringify(receipt,null,2)+"\n");
  const md=["## NBL website GREEN baseline — live .org only","",
    "**OVERALL:** "+summary.status+"; **full GREEN verified:** "+summary.fullGreen,
    "**Evidence:** "+JSON.stringify(summary.counts)+
      " · evidence gaps: "+summary.notProven.length,
    "**Excluded:** Playground, Desk, University/NBLU, Games, protected/private, payments. No repairs or deployment.",
    "", "| Check | Result | Evidence |","|---|---|---|",
    ...findings.map(x=>"| "+x.id+" | "+x.status+" | "+x.reason+" |"),
    "", "Unverified coverage: "+summary.notProven.map(x=>x.area).join(", "),
    "","Cloudflare challenge / missing authenticated evidence never becomes false green.",""].join("\n");
  if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,md);
  console.log("NBL_GREEN_BASELINE",JSON.stringify({status:summary.status,fullGreen:summary.fullGreen,
    counts:summary.counts,evidenceGaps:summary.notProven.length}));
  if(summary.counts.FAIL)process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))
  run().catch(e=>{console.error("NBL_GREEN_BASELINE_ERROR",e.message);process.exitCode=1;});
