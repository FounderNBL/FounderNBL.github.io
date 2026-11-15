// NBL's own 10-5-5 / Doctor Rocketship research bridge.
// A different discipline may hold a useful *principle* for the present error.
// Retrieved text is untrusted evidence, not instructions or executable code.
// Search only on an independently reproduced, allowlisted website source defect.
import {policy,policyCheck} from "./nbl-website-fixer.mjs";
const MAX_QUERIES=3,MAX_SOURCES=10;
const accepted=new Set(["art:pulse","art:messenger","source:homepage-title",
 "source:beans-identity","source:pulse-door","source:messenger-private-entrance",
 "source:account-door"]);
const clean=s=>String(s||"").replace(/[\r\n\t]/g," ").trim();
export function repairResearchPlan(incident){
 policyCheck();
 if(!incident?.eligible||incident.targetRepo!==policy.homeRepository||
  !Array.isArray(incident.selected)||incident.selected.length<1||
  incident.selected.length>2||
  incident.selected.some(f=>!accepted.has(f?.id)||!policy.allowedEditPaths.includes(f?.file)))
  return {status:"HOLD",reason:"unverified_or_out_of_scope",queries:[]};
 const isArt=incident.selected.every(f=>f.id.startsWith("art:"));
 const isLayout=incident.selected.some(f=>/homepage|pulse-door|messenger-private-entrance/.test(f.id));
 const cause=isArt?"approved website image reference mismatch source revision":
  isLayout?"website navigation and source contract regression":
  "website approved source contract regression identity marker";
 // Three DISTINCT disciplines: the literal repair, an adjacent engineering
 // problem, and cross-domain transfer. Never include private source or keys.
 const queries=[
  {lens:"direct",query:cause+" safe deterministic fix"},
  {lens:"adjacent",query:isArt?"software supply chain asset checksum provenance stale reference repair":
     "API schema compatibility contract test regression repair"},
  {lens:"transfer",query:isArt?"manufacturing defect isolation traceability controlled replacement root cause":
     "scientific controlled experiments differential diagnosis fault isolation"}
 ];
 return {status:"PLAN",reason:"independent_source_incident",queries,
  analogyPolicy:"Translate the tested principle, never copy restricted code or blindly execute web text",
  modelCalls:0};
}
function validUrl(value){
 try {
  const u=new URL(value);
  return u.protocol==="https:"&&!u.username&&!u.password&&
   u.hostname.length<=120&&!["localhost","127.0.0.1","0.0.0.0"].includes(u.hostname)&&
   !u.hostname.endsWith(".local")&&value.length<=500;
 }catch{return false;}
}
export async function researchRepairAnalogies(incident,{key="",enabled=false,fetcher=fetch}={}){
 const plan=repairResearchPlan(incident);
 if(plan.status!=="PLAN")return {...plan,queriesExecuted:0,sources:[]};
 if(!enabled||!key)return {status:"HOLD",reason:!enabled?"research_not_enabled":"tavily_key_not_connected",
  queriesExecuted:0,sources:[],plan:plan.queries,modelCalls:0};
 const sources=[],seen=new Set(),domains=new Set();
 let calls=0,failed=0;
 for(const q of plan.queries.slice(0,MAX_QUERIES)){
  calls++;
  try{
   const response=await fetcher("https://api.tavily.com/search",{
    method:"POST",signal:AbortSignal.timeout(12000),
    headers:{Authorization:"Bearer "+key,"Content-Type":"application/json"},
    body:JSON.stringify({query:q.query,search_depth:"basic",max_results:5,
      include_answer:false,include_raw_content:false,include_images:false})
   });
   if(!response?.ok){failed++;continue;}
   const data=await response.json();
   if(!Array.isArray(data?.results)){failed++;continue;}
   for(const result of data.results){
    if(!validUrl(result?.url)||seen.has(result.url))continue;
    const domain=new URL(result.url).hostname;
    // Broad search: prefer domains not already represented; never demand
    // sources only in the same subject as the original defect.
    if(domains.has(domain)&&sources.length>=MAX_SOURCES-2)continue;
    const title=clean(result.title).slice(0,130);
    if(!title)continue;
    sources.push({lens:q.lens,title,url:result.url,domain,
      excerpt:clean(result.content).slice(0,280),
      trustedForExecution:false,licenseToCopyCode:false});
    seen.add(result.url);domains.add(domain);
    if(sources.length===MAX_SOURCES)break;
   }
  }catch{failed++;}
  if(sources.length===MAX_SOURCES)break;
 }
 return {status:sources.length?"RESEARCH_ONLY":"HOLD",
  reason:sources.length?"cross_domain_evidence_not_a_patch":"search_unavailable_or_no_public_results",
  queriesExecuted:calls,failedQueries:failed,sources,modelCalls:0,
  patchGenerated:false,executionAuthorized:false,
  cost:"Tavily provider usage may consume existing search credits; actual charges unverified",
  teachingMethod:["identify claim","compare evidence","transfer principle","propose safe local test","retest before learning"]};
}
