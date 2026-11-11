// NBL website GREEN evaluator. Read-only; no customer accounts, billing or University tests.
// Each PASS is scoped evidence, never blanket proof that no intrusion occurred.
import {readFileSync,mkdirSync,writeFileSync,appendFileSync} from "node:fs";
import {join,resolve} from "node:path";
import {createHash} from "node:crypto";
import {pathToFileURL} from "node:url";

const root=resolve(new URL("..",import.meta.url).pathname);
const configPath=join(root,"config/nbl-website-green-baseline.json");
export const contract=Object.freeze(JSON.parse(readFileSync(configPath,"utf8")));
const VALID=new Set(["PASS","FAIL","UNVERIFIED"]);
const publicOrigin="https://newbeansland.org";
const pending=contract.coverage.filter(x=>x.stage!=="implemented").map(x=>x.id);
function item(id,status,reason,kind){if(!VALID.has(status))throw Error("bad_status");return {id,status,reason,kind};}
function allowedPath(p){
 return typeof p==="string" && p.startsWith("/") && /^\/[A-Za-z0-9._/-]*$/.test(p) &&
 !p.includes("..") && !contract.scope.excludedPaths.some(x=>p===x||p.startsWith(x+"/"));
}
export function checkContract(c=contract){
 const errors=[];
 if(c.schema!==1||c.repository!=="FounderNBL/FounderNBL.github.io"||c.site!==publicOrigin)errors.push("contract_authority_invalid");
 if(c.schedule?.utcCron!=="17 */6 * * *"||c.schedule?.repair!==false||c.schedule?.deploy!==false)errors.push("unsafe_schedule_or_writes");
 if(c.production?.onlyReadRequests!==true||c.source?.officialWorldArt?.length!==2)errors.push("contract_scope_invalid");
 const seen=new Set();
 for(const p of c.production?.publicPages||[]){
   if(!allowedPath(p)||seen.has(p))errors.push("prohibited_or_duplicate_route");
   seen.add(p);
 }
 for(const a of c.source?.officialWorldArt||[]){
   if(!["pulse","messenger"].includes(a.id)||!allowedPath(a.route)||
     !/^[A-Za-z0-9_-]+\.png$/.test(a.sourceImage)||!/^[a-f0-9]{64}$/.test(a.sha256))
     errors.push("art_authority_invalid");
 }
 return errors;
}
const getText=(p)=>readFileSync(join(root,p),"utf8");
const getBytes=(p)=>readFileSync(join(root,p));
export function checkSource(c=contract,{text=getText,bytes=getBytes}={}){
 const findings=[];
 for(const m of c.source.requiredMarkers){
   try{
     const src=text(m.file);
     findings.push(item("source:"+m.id,m.all.every(mark=>src.includes(mark))?"PASS":"FAIL",
       m.all.every(mark=>src.includes(mark))?"approved_source_markers_present":"approved_source_marker_missing","source"));
   }catch{findings.push(item("source:"+m.id,"FAIL","required_source_file_unreadable","source"));}
 }
 let home="",door="";
 try{home=text("index.html");door=home.split('<section class="pulse-world-door"')[1]?.split("</section>")[0]||"";}catch{}
 for(const a of c.source.officialWorldArt){
   try{
     const b=bytes(a.sourceImage);
     const hash=createHash("sha256").update(b).digest("hex");
     const png=b.length>=24&&b.subarray(0,8).toString("hex")==="89504e470d0a1a0a";
     const dimensions=png&&b.readUInt32BE(16)===a.width&&b.readUInt32BE(20)===a.height;
     const anchor=new RegExp('<a\\b[^>]*href="'+a.route.replaceAll("/","\\/")+'"[^>]*>[\\s\\S]*?<img\\s+src="/'+a.sourceImage.replaceAll(".","\\.")+'"');
     const rightCard=anchor.test(door);
     findings.push(item("art:"+a.id,png&&dimensions&&hash===a.sha256&&rightCard?"PASS":"FAIL",
       png&&dimensions&&hash===a.sha256&&rightCard?"exact_approved_art_bytes_and_door":"wrong_art_hash_dimensions_or_route","source-visual"));
   }catch{findings.push(item("art:"+a.id,"FAIL","approved_art_unreadable","source-visual"));}
 }
 try{
   const publicSource=["index.html","account.html","pulse/index.html","messenger/index.html"];
   const secretPattern=/(?:sk_live_|sk-proj-|github_pat_|ghp_)[A-Za-z0-9_-]{14,}/;
   const leaked=publicSource.some(p=>secretPattern.test(text(p)));
   findings.push(item("security:public-credential-markers",leaked?"FAIL":"PASS",
     leaked?"possible_public_credential_pattern_detected":"limited_public_html_scan_clear","source-security"));
 }catch{findings.push(item("security:public-credential-markers","UNVERIFIED","source_security_scan_incomplete","source-security"));}
 return findings;
}
export function classifyHttp(status,type="",finalUrl="",expectedOrigin=publicOrigin){
 if([0,401,403,429].includes(status))return {status:"UNVERIFIED",reason:"runner_network_or_challenge_unverified"};
 if(status<200||status>=400)return {status:"FAIL",reason:"unexpected_http_"+status};
 try{if(new URL(finalUrl).origin!==expectedOrigin)return {status:"FAIL",reason:"unexpected_redirect_origin"};}
 catch{return {status:"UNVERIFIED",reason:"final_origin_unknown"};}
 if(!type.includes("text/html"))return {status:"FAIL",reason:"unexpected_content_type"};
 return {status:"PASS",reason:"public_html_reachable_from_runner"};
}
async function request(url,{binary=false}={}){
 try{
   const res=await fetch(url,{method:"GET",redirect:"follow",signal:AbortSignal.timeout(10000),
     headers:{accept:binary?"image/png":"text/html,application/json;q=0.8",
       "user-agent":"NBL-Green-Baseline/1.0 (read-only; source-controlled)"}
   });
   return res;
 }catch{return null;}
}
async function livePages(c){
 const out=[];
 for(const p of c.production.publicPages){
   const response=await request(publicOrigin+p);
   const verdict=classifyHttp(response?.status??0,response?.headers.get("content-type")||"",response?.url||"",publicOrigin);
   out.push(item("page:"+p,verdict.status,verdict.reason,"public-live-route"));
 }
 return out;
}
async function liveArt(c){
 const out=[];
 for(const a of c.source.officialWorldArt){
   const response=await request(publicOrigin+"/"+a.sourceImage,{binary:true});
   if(!response){out.push(item("live-art:"+a.id,"UNVERIFIED","network_probe_unavailable","live-art"));continue;}
   if([401,403,429].includes(response.status)){
     out.push(item("live-art:"+a.id,"UNVERIFIED","cdn_or_bot_challenge_unverified","live-art"));continue;
   }
   if(response.status!==200||new URL(response.url).origin!==publicOrigin){
     out.push(item("live-art:"+a.id,"FAIL","approved_public_asset_not_served","live-art"));continue;
   }
   try{
     const indicated=Number(response.headers.get("content-length")||0);
     if(indicated>8_000_000){out.push(item("live-art:"+a.id,"UNVERIFIED","asset_oversize_for_safe_probe","live-art"));continue;}
     const bytes=Buffer.from(await response.arrayBuffer());
     const signature=bytes.subarray(0,8).toString("hex")==="89504e470d0a1a0a";
     const dimensions=bytes.length>=24&&bytes.readUInt32BE(16)===a.width&&bytes.readUInt32BE(20)===a.height;
     const hash=createHash("sha256").update(bytes).digest("hex");
     out.push(item("live-art:"+a.id,signature&&dimensions&&hash===a.sha256?"PASS":"FAIL",
        signature&&dimensions&&hash===a.sha256?"cdn_bytes_match_approved_source":"cdn_art_differs_from_approved_art","live-art"));
   }catch{out.push(item("live-art:"+a.id,"UNVERIFIED","asset_content_unreadable","live-art"));}
 }
 return out;
}
async function coreHealth(c){
 const response=await request(c.production.coreHealth);
 if(!response)return item("service:nbl-core","UNVERIFIED","core_network_unverified","live-service");
 if([401,403,429].includes(response.status))return item("service:nbl-core","UNVERIFIED","core_visitor_denied_or_challenged","live-service");
 if(response.status!==200)return item("service:nbl-core","FAIL","core_health_http_"+response.status,"live-service");
 try{
   const data=await response.json(),exp=c.production.expectedCore;
   const ok=data.service===exp.service&&data.components?.gateway?.ok===exp.gateway&&
     data.components?.publicBeans?.ok===exp.publicBeans&&
     data.routes?.publicChat===exp.publicChat&&data.routes?.signedChat===exp.signedChat;
   return item("service:nbl-core",ok?"PASS":"FAIL",ok?"gateway_and_public_beans_health_confirmed":"core_health_contract_mismatch","live-service");
 }catch{return item("service:nbl-core","UNVERIFIED","core_health_body_unreadable","live-service");}
}
export function summarize(findings,{mode="source"}={}){
 const counts={PASS:0,FAIL:0,UNVERIFIED:0};
 for(const f of findings){if(!VALID.has(f.status))throw Error("invalid_finding");counts[f.status]++;}
 const status=counts.FAIL?"FAIL":counts.UNVERIFIED?"UNVERIFIED":"PASS";
 return {mode,status,counts,fullWebsiteGreen:false,
   note:pending.length?"Full website GREEN not certified: authenticated intrusion/LOCKE audits, approved screenshot baselines or performance budgets pending.":"Coverage pending none",
   evidenceType:mode==="live"?"source plus unauthenticated live GET":"repository source only"};
}
async function main(){
 const mode=process.argv[2]||"source";
 if(!["source","live"].includes(mode))throw Error("mode_must_be_source_or_live");
 const schemaErrors=checkContract();
 if(schemaErrors.length)throw Error("GREEN_contract_invalid_"+schemaErrors.join("_"));
 const findings=checkSource();
 if(mode==="live")findings.push(...await livePages(contract),...await liveArt(contract),await coreHealth(contract));
 const summary=summarize(findings,{mode});
 const report={schema:1,at:new Date().toISOString(),repository:contract.repository,
   sha:process.env.GITHUB_SHA||null,summary,findings,pendingCoverage:pending,
   cloudflare:"See existing independent Cloudflare-first handshake evidence",
   noCustomerData:true,repairs:0,productionWrites:0};
 mkdirSync(join(root,".inspector"),{recursive:true});
 writeFileSync(join(root,".inspector/nbl-green-"+mode+".json"),JSON.stringify(report,null,2)+"\n");
 const md=["","## NBL website GREEN contract — "+mode.toUpperCase(),"",
   "**Verdict: "+summary.status+" (scoped evidence; FULL GREEN: NOT CERTIFIED)**",
   "PASS "+summary.counts.PASS+" · FAIL "+summary.counts.FAIL+" · UNVERIFIED "+summary.counts.UNVERIFIED,
   "","| Check | State | Reason |","|---|---|---|",
   ...findings.map(f=>"| "+f.id+" | "+f.status+" | "+f.reason+" |"),
   "","Awaiting independent coverage: "+pending.join(", "),
   "","No customer credentials, University routes, games, payment changes, auto repairs or deployments.",
   ""].join("\n");
 if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,md);
 console.log("NBL_GREEN_CONTRACT",JSON.stringify({mode,verdict:summary.status,counts:summary.counts,fullWebsiteGreen:false,pending}));
 if(summary.status==="FAIL")process.exitCode=1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 main().catch(e=>{console.error("NBL_GREEN_CONTRACT_ERROR",e?.message||"unknown");process.exitCode=1;});
}
