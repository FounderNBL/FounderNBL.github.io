// Host-side implementation of the NBL Founder's Code repair boundary.
// READ ONLY until current source, approved scope and GitHub provenance agree.
// No LOCKE grant, automatic merge, deployment, or new model.
import {policy,policyCheck,chooseRepairIncident} from "./nbl-website-fixer.mjs";
import {checkSource} from "./nbl-website-green.mjs";
const fail=reason=>{throw Error("founder_repair_rail_"+reason)};
export function reviewFounderRepairRail(incident,{
 findings=checkSource(),sourceSha=process.env.GITHUB_SHA||"",
 runId=process.env.GITHUB_RUN_ID||"",repository=process.env.GITHUB_REPOSITORY||""
}={}){
 policyCheck();
 if(repository!==policy.homeRepository||!/^[a-f0-9]{40}$/.test(sourceSha)||
    !/^[1-9][0-9]{0,15}$/.test(runId))fail("unverified_host");
 if(!incident||incident.eligible!==true||incident.targetRepo!==policy.homeRepository||
    incident.kind!=="reproduced_source_contract_failure"||
    incident.reference!=="config/nbl-website-green-baseline.json"||
    incident.review!=="draft_pr_only"||incident.maxAttempts!==1)fail("scope");
 const current=chooseRepairIncident(findings);
 const keys=x=>JSON.stringify(x.map(v=>({id:v.id,file:v.file})));
 if(!current.eligible||current.incident!==incident.incident||
    !Array.isArray(incident.selected)||keys(incident.selected)!==keys(current.selected))
   fail("source_not_reproduced");
 return Object.freeze({schema:"nbl.founders-code.repair-rail.v1",
  status:"READ_ONLY_CHECK_PASSED",incident:incident.incident,sourceRevision:sourceSha,
  githubRunId:runId,sourceWitness:incident.reference,
  affectedPaths:[...new Set(incident.selected.map(x=>x.file))],
  destination:"draft_pr_only",actionPermission:false,lockePermissionGranted:false,
  mayMerge:false,mayDeploy:false,mayApproveMemory:false});
}
