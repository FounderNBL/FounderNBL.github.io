// NBL's own repair comparison; three real candidate procedures, never three
// invented fixes. Simulates only source applicability in an isolated checkout.
// Final correctness belongs to independent source+browser retests and Founder.
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {join} from "node:path";
import {performance} from "node:perf_hooks";
import {policy,policyCheck,checkPatch} from "./nbl-website-fixer.mjs";

const MAX=3;
const secret=/(?:sk-proj-|github_pat_|ghp_|sk_live_)[A-Za-z0-9_-]{10,}/;
const allowed=p=>typeof p==="string"&&policy.allowedEditPaths.includes(p)&&!p.includes("..");
const number=n=>Number.isFinite(n)&&n>=0?Math.round(n*1000)/1000:null;
function recipePreflight(edits,base,read){
 if(!Array.isArray(edits)||!edits.length||edits.length>3)return false;
 const staged=new Map();
 for(const e of edits){
  if(!e||!allowed(e.path)||typeof e.find!=="string"||!e.find||
     typeof e.replace!=="string"||!e.replace||e.find===e.replace||
     e.find.length>5000||e.replace.length>5000||secret.test(e.replace))return false;
  let source;
  try{source=staged.get(e.path)??read(join(base,e.path),"utf8");}catch{return false;}
  if(typeof source!=="string"||source.length>120000)return false;
  const at=source.indexOf(e.find);
  if(at<0||source.indexOf(e.find,at+1)!==-1)return false;
  staged.set(e.path,source.slice(0,at)+e.replace+source.slice(at+e.find.length));
 }
 return staged.size<=policy.maxFiles;
}
const cpuTotal=usage=>(usage?.user||0)+(usage?.system||0);
export function compareRepairCandidates(incident,base,{
 reviewed=[],localEdits=null,read=readFileSync,spawn=spawnSync,
 clock=()=>performance.now(),cpu=()=>process.cpuUsage()
}={}){
 policyCheck();
 if(!incident?.eligible||incident.targetRepo!==policy.homeRepository||
   !Array.isArray(incident.selected)||incident.selected.length<1||
   incident.selected.some(s=>!allowed(s?.file)))
  return {schema:"nbl.verified-repair-experiment.v1",state:"HOLD",
    reason:"incident_not_authorized",choices:[],selectedCaseId:null,
    verifiedRepair:false,executionAuthorized:false,modelCalls:0};
 const incidentPaths=new Set(incident.selected.map(x=>x.file));
 const realReviewed=Array.isArray(reviewed)?reviewed.filter(x=>
   x?.executionAuthorized===false&&typeof x.caseId==="string"&&
   typeof x.unifiedDiff==="string"&&Array.isArray(x.paths)&&
   x.paths.length>0&&x.paths.every(p=>incidentPaths.has(p))):[];
 const local=Array.isArray(localEdits)&&localEdits.length>0&&
   localEdits.every(e=>incidentPaths.has(e?.path));
 const selection=[...realReviewed.slice(0,local?MAX-1:MAX).map(x=>({
  kind:"founder_reviewed_patch",id:x.caseId,source:x
 }))];
 if(local)selection.push({kind:"nbl_deterministic_recipe",id:"nbl-local-recipe",source:localEdits});
 const choices=selection.map(option=>{
  const start=clock(),startCpu=cpu();
  let applicable=false,reason="unsafe_or_stale_source";
  try{
   if(option.kind==="founder_reviewed_patch"){
    const safety=checkPatch(option.source.unifiedDiff);
    if(safety.ok&&safety.paths.length===option.source.paths.length&&
      safety.paths.every(p=>incidentPaths.has(p))){
      const checked=spawn("git",["-C",base,"apply","--check","-"],{
        input:option.source.unifiedDiff,encoding:"utf8",timeout:12000});
      applicable=checked.status===0&&!checked.error;
      reason=applicable?"exact_patch_preflight_only":"source_patch_mismatch";
    }
   }else{
    applicable=recipePreflight(option.source,base,read);
    reason=applicable?"unique_anchor_preflight_only":"source_anchor_mismatch";
   }
  }catch{reason="preflight_error";}
  const wallMs=number(clock()-start);
  const cpuMicros=number(cpuTotal(cpu())-cpuTotal(startCpu));
  const history=option.kind==="founder_reviewed_patch"?
    {successCount:option.source.successCount,failureCount:option.source.failureCount,
      rankScore:option.source.score}:null;
  return {id:option.id,kind:option.kind,applicable,reason,
   wallMs,cpuMicros,energyProxy:"process_CPU_microseconds_not_electricity",
   externalProviderCostUSD:0,runnerCostUSD:null,
   history,independentRetestPassed:false,executionAuthorized:false};
 });
 const viable=choices.filter(x=>x.applicable);
 viable.sort((a,b)=>{
  // Only reviewed proof can earn a history score. Never mistake fastest dry-run
  // for a tested repair. Verified historical rank wins; timing breaks ties.
  const score=x=>x.kind==="founder_reviewed_patch"?
    (Number.isFinite(x.history?.rankScore)?x.history.rankScore:0):0;
  return score(b)-score(a)||
    (a.externalProviderCostUSD-b.externalProviderCostUSD)||
    ((a.wallMs??Infinity)-(b.wallMs??Infinity))||
    ((a.cpuMicros??Infinity)-(b.cpuMicros??Infinity))||a.id.localeCompare(b.id);
 });
 const best=viable[0]||null;
 return {schema:"nbl.verified-repair-experiment.v1",
   state:best?"PREFLIGHT":"HOLD",
   reason:best?"source_applicability_not_independent_proof":"no_applicable_verified_candidate",
   choices,requestedChoices:MAX,realChoices:choices.length,
   selectedCaseId:best?.id||null,
   verifiedRepair:false,executionAuthorized:false,modelCalls:0,
   requiresIndependentSourceAndBrowserRetest:true,
   budget:{localPreflightProviderUSD:0,searchCalls:0,modelCalls:0,
     runnerCostUSD:"unknown_do_not_infer_free"}};
}
