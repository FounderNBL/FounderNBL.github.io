// NBL Foundation's existing Inspector/Fixer sends safe, reviewable evidence
// through GitHub Issues, not a second agent, an AI conclusion or a private API.
// The public issue is a locator; Foundation must verify the source GitHub run.
// No private customer records, secrets, auto-approval, patching or paid model.
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {policy} from "./nbl-website-fixer.mjs";

const REPO="FounderNBL/FounderNBL.github.io";
const ROOT="https://github.com/"+REPO;
const API="https://api.github.com/repos/"+REPO;
const GITHUB_ID=/^[a-f0-9]{40}$/;
const INC_ID=/^website-green-[a-f0-9]{12}$/;
const RUN_ID=/^[1-9][0-9]{0,15}$/;
const VALID_FILE=new Set(policy.allowedEditPaths);
const SAFE=/^[a-z0-9_:.-]{3,160}$/i;
const URL=/^https:\/\/github\.com\/FounderNBL\/FounderNBL\.github\.io\/(?:actions\/runs\/[0-9]+|pull\/[0-9]+|blob\/[a-f0-9]{40}\/config\/nbl-website-green-baseline\.json)$/;
const fail=(why)=>{throw Error("foundation_repair_handoff_"+why)};
const runUrl=id=>ROOT+"/actions/runs/"+id;
const baselineUrl=sha=>ROOT+"/blob/"+sha+"/config/nbl-website-green-baseline.json";
export const FOUNDATION_FAILURE_PREFIX="[NBL FOUNDATION FAILURE] ";
export const FOUNDATION_OUTCOME_PREFIX="[NBL FOUNDATION OUTCOME] ";
export const FOUNDER_APPROVAL_PREFIX="[NBL FOUNDER APPROVAL REQUIRED] ";

function identifiers(incident,env){
 if(!incident||incident.eligible!==true||incident.targetRepo!==REPO||
    !INC_ID.test(incident.incident||"")||!GITHUB_ID.test(env.GITHUB_SHA||"")||
    !RUN_ID.test(env.GITHUB_RUN_ID||"")||!Array.isArray(incident.selected)||
    incident.selected.length<1||incident.selected.length>2||
    typeof incident.at!=="string"||!Number.isFinite(Date.parse(incident.at))||
    incident.reference!=="config/nbl-website-green-baseline.json")fail("unverified_incident");
 const selected=incident.selected.map(s=>{
  if(!s||!SAFE.test(s.id||"")||!VALID_FILE.has(s.file))fail("out_of_scope");
  return {id:s.id,file:s.file};
 });
 return {selected,signature:incident.incident,
  failureId:incident.incident,component:"website",
  symptomCodes:selected.map(s=>s.id.replace(/:/g,"_")),
  affectedPaths:[...new Set(selected.map(s=>s.file))],
  sourceRevision:env.GITHUB_SHA,
  approvedExpectationRef:baselineUrl(env.GITHUB_SHA),
  evidenceRef:runUrl(env.GITHUB_RUN_ID)};
}
export function buildFoundationFailure(incident,env){
 const core=identifiers(incident,env);
 return {...core,schema:"nbl.foundation.inspector-failure.v1",
  inspectedAt:incident.at,
  inspector:"NBL Website Health Inspector",
  originalFailureReproduced:true,actionPermission:false};
}
export function buildFoundationAttempt(incident,env,coding=null){
 const core=identifiers(incident,env);
 if(env.NBL_WRITER_OUTCOME!=="success")return null;
 const success=env.NBL_RETEST_VERIFIED==="true"&&env.NBL_RETEST_OUTCOME==="success";
 const tested=success||env.NBL_SOURCE_RETEST_OUTCOME==="failure"||env.NBL_RETEST_OUTCOME==="failure";
 if(!tested)return null;
 const reused=coding?.engine==="reviewed_git_patch"&&INC_ID.test(coding.reviewedCaseId||"")&&
   coding.incident===incident.incident?coding.reviewedCaseId:null;
 return {...core,schema:"nbl.foundation.independent-repair-observation.v1",
  caseId:reused||"first-time-"+env.GITHUB_RUN_ID,attemptRef:runUrl(env.GITHUB_RUN_ID),
  procedureOrigin:reused?"reviewed-case":"first-time-proposal",
  procedureId:reused?"website.source-patch-"+reused:"website.source-fixer-"+env.GITHUB_RUN_ID,
  scopeEvidenceRef:runUrl(env.GITHUB_RUN_ID),
  independentInspectorRef:runUrl(env.GITHUB_RUN_ID),
  observedAt:new Date().toISOString(),independentlyObserved:true,
  verdict:success?"SUCCESS":"FAILED",
  verdictMeaning:success?"passed_source_and_browser_retest":
    "independent_retest_failed_not_proven_fixed",
  autoPromoted:false,approved:false,executionAuthorized:false};
}
export function buildFounderApproval(env){
 const pr=env.NBL_VERIFIED_REPAIR_PR_URL||"";
 if(!/^https:\/\/github\.com\/FounderNBL\/FounderNBL\.github\.io\/pull\/[1-9][0-9]*$/.test(pr)||
  !RUN_ID.test(env.GITHUB_RUN_ID||"")||
  !INC_ID.test(env.NBL_INCIDENT||""))fail("unverified_approval");
 return {title:FOUNDER_APPROVAL_PREFIX+"Verified website repair PR #"+pr.split("/").at(-1),
  body:"## NBL — FOUNDER APPROVAL REQUIRED\n\n"+
    "**Decision:** Review this independently tested *draft* website repair PR: "+pr+"\n\n"+
    "**Inspector evidence:** "+runUrl(env.GITHUB_RUN_ID)+"\n"+
    "**Reproduced incident:** "+env.NBL_INCIDENT+"\n\n"+
    "If you do nothing, this remains pending. A green test alone is not approval; "+
    "no automated merge, website deployment, billing, University or game changes.\n\n"+
    "This issue stays open until reviewed; ordinary CI reports are not approval requests.",
  assignees:["FounderNBL"]};
}
export function renderRecord(record){
 return "NBL Foundation Inspector evidence (metadata only; independently verify GitHub run)\n\n"+
  "```json\n"+JSON.stringify(record,null,2)+"\n```\n";
}
export async function upsertGithubIssue(title,body,options={}){
 const token=options.token||process.env.GH_TOKEN||"";
 const fetcher=options.fetcher||fetch;
 if(!token)fail("github_token_absent");
 const request=async(path,method="GET",data)=>{
  const r=await fetcher(API+path,{
   method,headers:{authorization:"Bearer "+token,accept:"application/vnd.github+json",
    "content-type":"application/json","x-github-api-version":"2022-11-28"},
   ...(data?{body:JSON.stringify(data)}:{}),signal:AbortSignal.timeout(12000)
  });
  if(!r.ok)fail("github_issue_http_"+r.status);
  return r.json();
 };
 const existing=await request("/issues?state=open&per_page=100");
 if(!Array.isArray(existing))fail("github_issue_index_invalid");
 const found=existing.find(x=>!x.pull_request&&x.title===title&&Number.isSafeInteger(x.number));
 if(found)return request("/issues/"+found.number,"PATCH",{body});
 return request("/issues","POST",{title,body,...(options.assignees?{assignees:options.assignees}:{})});
}
async function main(){
 const command=process.argv[2];
 if(!["incident","attempt","approval"].includes(command))fail("unknown_command");
 const env=process.env;
 const i=command==="approval"?null:
  JSON.parse(readFileSync(".inspector/website-fixer-incident.json","utf8"));
 if(command==="approval"){
  const p=buildFounderApproval(env);
  const out=await upsertGithubIssue(p.title,p.body,{assignees:p.assignees});
  console.log("NBL_FOUNDER_APPROVAL_INBOX",out.html_url);
 }else if(command==="incident"){
  const rec=buildFoundationFailure(i,env);
  const out=await upsertGithubIssue(FOUNDATION_FAILURE_PREFIX+rec.failureId,renderRecord(rec));
  console.log("NBL_FOUNDATION_INSPECTOR_RECEIPT",out.html_url);
 }else{
  let coding=null;
  try{coding=JSON.parse(readFileSync(".inspector/website-fixer-coding.json","utf8"));}catch{}
  const rec=buildFoundationAttempt(i,env,coding);
  if(!rec){console.log("NBL_FOUNDATION_REPAIR_ATTEMPT_UNVERIFIED");return;}
  // Include immutable run ID: repeated repairs must never overwrite prior outcomes.
  const out=await upsertGithubIssue(FOUNDATION_OUTCOME_PREFIX+rec.failureId+" "+rec.caseId+" "+env.GITHUB_RUN_ID,renderRecord(rec));
  console.log("NBL_FOUNDATION_RETEST_RECEIPT",out.html_url);
 }
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 main().catch(e=>{console.error(String(e.message||e).slice(0,220));process.exitCode=1;});
}
