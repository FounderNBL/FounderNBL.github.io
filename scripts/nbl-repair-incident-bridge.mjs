// ONE NBL Maintenance Department: independently verify a completed main-branch
// source failure before opening a private-repo incident. This is the existing
// Inspector -> Foundation/Fixer evidence handoff, NOT a coding agent.
// Customer data, paid models, deployments, merges and self-approval are absent.
import {readFileSync,mkdirSync,writeFileSync,appendFileSync} from "node:fs";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";

const EXPECTED=Object.freeze({
  beans:{repo:"FounderNBL/Beans",workflow:"NBL Maintenance Department — Beans source events"},
  pulse:{repo:"FounderNBL/Pulse",workflow:"NBL Maintenance Department — Pulse source events"}
});
const SHA=/^[a-f0-9]{40}$/;
const id=x=>Number.isSafeInteger(x)&&x>0;
const apiRoot="https://api.github.com";
const bool=x=>x===true;
const result=(state,reason,details={})=>Object.freeze({schema:"nbl.maintenance.independent-triage.v1",
  state,reason,...details,modelCalls:0,providerSpendUSD:0,
  aiFixerDispatched:false,patchApplied:false,autoMerge:false,autoDeploy:false});

export function validateMaintenanceEvent(event,component,repository){
  const known=EXPECTED[component];
  const run=event?.workflow_run;
  if(!known||repository!==known.repo)return result("HOLD","repository_not_active");
  if(event?.action!=="completed"||run?.name!==known.workflow||
    run?.status!=="completed"||run?.conclusion!=="failure"||
    run?.event!=="push"||run?.head_branch!=="main"||
    run?.head_repository?.full_name!==repository||!id(run?.id)||
    !SHA.test(run?.head_sha||""))
    return result("HOLD","not_failed_main_push");
  return result("CANDIDATE","event_requires_independent_github_proof",{
    repository,component,sourceSha:run.head_sha,inspectorRunId:run.id,
    inspectorRun:"https://github.com/"+repository+"/actions/runs/"+run.id
  });
}
async function githubRead(fetcher,token,path){
  const response=await fetcher(apiRoot+path,{
    method:"GET",headers:{authorization:"Bearer "+token,
      accept:"application/vnd.github+json","x-github-api-version":"2022-11-28"},
    signal:AbortSignal.timeout(12000)
  });
  if(!response?.ok)throw Error("github_read_unverified_"+response?.status);
  return response.json();
}
export async function verifyMaintenanceFailure(event,component,repository,{fetcher=fetch,token}={}){
  const candidate=validateMaintenanceEvent(event,component,repository);
  if(candidate.state!=="CANDIDATE")return candidate;
  if(!token)return result("HOLD","github_read_permission_missing");
  try{
    const prefix="/repos/"+repository;
    const [run,branch,jobs]=await Promise.all([
      githubRead(fetcher,token,prefix+"/actions/runs/"+candidate.inspectorRunId),
      githubRead(fetcher,token,prefix+"/branches/main"),
      githubRead(fetcher,token,prefix+"/actions/runs/"+candidate.inspectorRunId+"/jobs?per_page=100")
    ]);
    if(run.id!==candidate.inspectorRunId||run.name!==EXPECTED[component].workflow||
      run.event!=="push"||run.status!=="completed"||run.conclusion!=="failure"||
      run.head_branch!=="main"||run.head_repository?.full_name!==repository||
      run.head_sha!==candidate.sourceSha)
      return result("HOLD","run_provenance_mismatch");
    if(branch?.commit?.sha!==candidate.sourceSha)
      return result("HOLD","main_advanced_since_failure");
    // Only the shared maintenance source-check step, not deployment/key/network
    // failures, may request an independent reproducibility check.
    const checked=Array.isArray(jobs?.jobs)?jobs.jobs.some(job=>
      job?.conclusion==="failure"&&
      typeof job.name==="string"&&
      job.name.includes("Verify changed component")&&job.name.includes(component)&&
      Array.isArray(job.steps)&&job.steps.some(step=>
        step?.name==="INSPECT / run real tests specific to the affected repository"&&
        step.conclusion==="failure")):false;
    if(!checked)return result("HOLD","source_failure_step_not_verified");
    return result("VERIFIED_SOURCE_FAILURE","completed_main_source_failure_verified",{
      repository,component,sourceSha:candidate.sourceSha,
      inspectorRunId:candidate.inspectorRunId,
      inspectorRun:candidate.inspectorRun,independentRetestPassed:false,
      rootCauseConfirmed:false
    });
  }catch{
    return result("HOLD","github_verification_unavailable");
  }
}
export function classifyIndependentRetest(verification,stepOutcome){
  if(verification?.state!=="VERIFIED_SOURCE_FAILURE")
    return result("HOLD","inspector_provenance_unverified");
  if(stepOutcome!=="failure")
    return result("HOLD",stepOutcome==="success"?
      "failed_source_check_not_reproduced":"independent_retest_unavailable",{
      repository:verification.repository,component:verification.component});
  return result("REPRODUCED","same_source_check_failed_independently",{
    repository:verification.repository,component:verification.component,
    sourceSha:verification.sourceSha,inspectorRun:verification.inspectorRun,
    rootCauseConfirmed:false,solutionSelected:false,
    independentSourceFailureReproduced:true,
    safeNextStep:"existing_Foundation_evidence_review_then_scoped_Fixer_if_authorized"
  });
}
function issueTitle(reproduction){
  return "[NBL SOURCE INSPECTOR] "+reproduction.component+" "+reproduction.sourceSha.slice(0,12);
}
export async function recordIndependentIncident(reproduction,{fetcher=fetch,token}={}){
  if(reproduction?.state!=="REPRODUCED"||
    !Object.values(EXPECTED).some(x=>x.repo===reproduction.repository)||
    !SHA.test(reproduction.sourceSha||"")||!token)
    return result("HOLD","not_authorized_for_issue");
  const title=issueTitle(reproduction);
  const base="/repos/"+reproduction.repository;
  const body=[
    "Independently reproduced source-check failure in the **existing NBL Maintenance Department**.",
    "",
    "**Trusted main commit:** \`"+reproduction.sourceSha+"\`",
    "**Original Inspector run:** "+reproduction.inspectorRun,
    "**Second source check:** same approved offline check failed in the separate read-only triage job",
    "",
    "**Status:** REPRODUCED SOURCE FAILURE; root cause and fix NOT YET PROVEN.",
    "Next: existing Foundation/Inspector reviews actual code evidence and any reviewed repairs; the existing Fixer may only prepare a scoped draft PR after its separate approval, budget and patch guards.",
    "",
    "No model API call, self-approved fix, live deployment, production edit, release signing, or merge was made. An incident is not a Fixer dispatch."
  ].join("\n");
  try{
    const request=async(method,path,payload)=>{
      const response=await fetcher(apiRoot+path,{
        method,headers:{authorization:"Bearer "+token,
          accept:"application/vnd.github+json","x-github-api-version":"2022-11-28",
          ...(payload?{"content-type":"application/json"}:{})},
        ...(payload?{body:JSON.stringify(payload)}:{}),
        signal:AbortSignal.timeout(12000)
      });
      if(!response?.ok)throw Error("github_issue_request_failed");
      return response.json();
    };
    // Full, fail-closed issue-history pagination: Github's issues listing
    // includes PRs and returns only 100 records per page. Never create a
    // duplicate merely because an older incident fell outside page one.
    // Limit total reads to prevent runaway Actions usage; on cap/error HOLD.
    let existing=null,historyComplete=false;
    for(let page=1;page<=50;page++){
      const items=await request("GET",base+"/issues?state=all&per_page=100&page="+page);
      if(!Array.isArray(items))return result("HOLD","issue_history_unavailable");
      existing=items.find(x=>!x.pull_request&&x.title===title)||null;
      if(existing)break;
      if(items.length<100){historyComplete=true;break;}
    }
    if(existing)return result("EXISTING_INCIDENT","same_commit_already_recorded",{
      repository:reproduction.repository,issueUrl:existing.html_url||null});
    if(!historyComplete)return result("HOLD","issue_history_pagination_limit");
    const created=await request("POST",base+"/issues",{title,body});
    if(!id(created?.number)||created.title!==title)
      return result("HOLD","issue_creation_unverified");
    return result("INCIDENT_RECORDED","reproduced_source_failure_recorded",{
      repository:reproduction.repository,issueUrl:created.html_url||null,
      issueNumber:created.number});
  }catch{
    return result("HOLD","issue_recording_unverified");
  }
}
function writeOutput(k,v){
  if(process.env.GITHUB_OUTPUT)appendFileSync(process.env.GITHUB_OUTPUT,k+"="+v+"\n");
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const mode=process.argv[2]||"";
  const event=JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH||"", "utf8"));
  const component=process.env.NBL_COMPONENT||"";
  const repository=process.env.GITHUB_REPOSITORY||"";
  const token=process.env.GH_TOKEN||"";
  let report;
  if(mode==="verify"){
    report=await verifyMaintenanceFailure(event,component,repository,{token});
    writeOutput("eligible",String(report.state==="VERIFIED_SOURCE_FAILURE"));
  }else if(mode==="summarize"){
    // The trusted verify step has already run; no model reads this status.
    const attempted=process.env.NBL_INSPECTOR_VERIFIED==="true";
    const gate=attempted?validateMaintenanceEvent(event,component,repository):null;
    const verification=gate?.state==="CANDIDATE"?{
      state:"VERIFIED_SOURCE_FAILURE",repository,component,
      sourceSha:gate.sourceSha,inspectorRun:gate.inspectorRun}:null;
    report=classifyIndependentRetest(verification,process.env.NBL_RETEST_OUTCOME);
    writeOutput("confirmed",String(report.state==="REPRODUCED"));
  }else if(mode==="issue"){
    // Re-query the real GitHub run and current main in this privileged job;
    // neither an issue body nor a preceding job's model output is authority.
    const verified=await verifyMaintenanceFailure(event,component,repository,{token});
    const confirmed=process.env.NBL_RETEST_CONFIRMED==="true";
    const reproduced=confirmed?classifyIndependentRetest(verified,"failure"):null;
    report=reproduced?.state==="REPRODUCED"?
      await recordIndependentIncident(reproduced,{token}):
      result("HOLD","independent_retest_not_confirmed");
  }else{throw Error("unknown_read_only_triage_mode");}
  mkdirSync(".nbl-maintenance",{recursive:true});
  writeFileSync(".nbl-maintenance/independent-triage.json",JSON.stringify(report,null,2)+"\n");
  console.log("NBL_MAINTENANCE_TRIAGE",JSON.stringify(report));
}
