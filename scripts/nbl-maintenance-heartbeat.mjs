// NBL Maintenance Department's cheap periodic availability/security heartbeat.
// Exactly two anonymous GETs, with no model calls, user data, database queries,
// project inspection, customer auth, paid provider or source repair.
import {mkdirSync,writeFileSync,appendFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
export const TARGETS=Object.freeze([
  {id:"website-tls",url:"https://newbeansland.org/",kind:"html"},
  {id:"core-readiness",url:"https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-core/health",kind:"json"}
]);
export function classify(status,type,payload="",kind="html"){
  if([0,401,403,408,429].includes(status)||/just a moment|checking your browser|cloudflare/i.test(String(payload).slice(0,180)))
    return "UNVERIFIED";
  if(status>=500||status===404||status===410)return "FAIL";
  if(status!==200)return "UNVERIFIED";
  if(kind==="html")return /text\/html/i.test(type)&&/<(?:!doctype|html)\b/i.test(String(payload).slice(0,3000))?"PASS":"UNVERIFIED";
  if(kind==="json"){
    if(!/json/i.test(type))return "UNVERIFIED";
    try{
      const data=JSON.parse(payload);
      return data?.service==="NBL Core"&&data?.components?.gateway?.ok===true&&
        data?.components?.publicBeans?.ok===true?"PASS":"FAIL";
    }catch{return "UNVERIFIED";}
  }
  return "UNVERIFIED";
}
export async function inspect({request=fetch}={}){
  const results=[];
  for(const target of TARGETS){
    let status="UNVERIFIED",httpStatus=0,reason="runner_unavailable";
    try{
      const response=await request(target.url,{method:"GET",redirect:"manual",
        signal:AbortSignal.timeout(10000),
        headers:{accept:target.kind==="html"?"text/html":"application/json",
          "user-agent":"NBL-Maintenance-Heartbeat/1.0"}});
      httpStatus=response.status;
      const type=response.headers.get("content-type")||"";
      // Keep only a tiny in-memory response excerpt, never a private body in report.
      const body=(await response.text()).slice(0,4000);
      status=classify(httpStatus,type,body,target.kind);
      reason=status==="PASS"?"anonymous_live_readiness_confirmed":
        status==="FAIL"?"service_unhealthy_or_contract_mismatch":"challenge_or_unverified_runner";
    }catch{}
    results.push({id:target.id,status,reason,httpStatus});
  }
  return results;
}
export function assess(results){
  const counts={PASS:0,FAIL:0,UNVERIFIED:0};
  for(const row of results)counts[row.status]++;
  return {status:counts.FAIL?"FAIL":counts.UNVERIFIED?"UNVERIFIED":"PASS",
    counts,fullSystemGreen:false,
    why:"Heartbeat covers anonymous TLS/public readiness only, not intrusion logs, LOCKE role proof, browser visuals or user requests"};
}
export async function run(){
  const results=await inspect(),summary=assess(results);
  const report={schema:1,department:"NBL Maintenance Department",
    scope:"website-only anonymous heartbeat; no other repository inspected",
    mode:"scheduled_two_request_heartbeat",checkedAt:new Date().toISOString(),
    status:summary.status,summary,checks:results,repairs:0,modelCalls:0};
  mkdirSync(".nbl-maintenance",{recursive:true});
  writeFileSync(".nbl-maintenance/heartbeat.json",JSON.stringify(report,null,2)+"\n");
  if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    "\n## NBL lightweight scheduled heartbeat — "+summary.status+"\n\n"+
    results.map(x=>"- "+x.id+": "+x.status+" (HTTP "+x.httpStatus+")").join("\n")+
    "\n\nNo deep browser, source sweep, AI coding, sensitive data, or user action simulated.\n");
  console.log("NBL_MAINTENANCE_HEARTBEAT",JSON.stringify({status:summary.status,checks:results}));
  if(summary.status==="FAIL")process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))
  run().catch(e=>{console.error("NBL_HEARTBEAT_FAILED",String(e?.message||e));process.exitCode=1;});
