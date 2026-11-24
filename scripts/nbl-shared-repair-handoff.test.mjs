// Zero-model regression proof of the NBL Maintenance Department's current-main
// read-only handoff. Exercise the ACTUAL inline GitHub Actions script, not a
// copied implementation, using isolated temporary folders and fake run IDs.
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,mkdtempSync,rmSync,existsSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {spawnSync} from "node:child_process";

const workflow=readFileSync(".github/workflows/nbl-maintenance-shared-events.yml","utf8");
const open="node --input-type=module <<'NODE'";
const begin=workflow.indexOf(open);
const end=workflow.indexOf("\n          NODE",begin);
assert.ok(begin>=0&&end>begin,"Shared workflow must keep the actual source-receipt script");
const inline=workflow.slice(begin+open.length,end).split("\n")
  .map(line=>line.startsWith("          ")?line.slice(10):line).join("\n");

function run({component="beans",result="failure",event="push",ref="refs/heads/main"}={}){
 const folder=mkdtempSync(join(tmpdir(),"nbl-maint-handoff-"));
 const repository=component==="beans"?"FounderNBL/Beans":
   component==="pulse"?"FounderNBL/Pulse":"FounderNBL/NBL-Messenger";
 try{
   const env={...process.env,NBL_COMPONENT:component,NBL_REPO:repository,
     NBL_CHECK_RESULT:result,NBL_EVENT:event,NBL_REF:ref,
     NBL_SHA:"a".repeat(40),NBL_RUN:"12345",GITHUB_STEP_SUMMARY:""};
   const child=spawnSync(process.execPath,["--input-type=module","-e",inline],{
     env,cwd:folder,encoding:"utf8",timeout:5000
   });
   assert.equal(child.status,0,child.stderr||"Inline workflow receipt execution failed");
   const report=JSON.parse(readFileSync(join(folder,".nbl-maintenance/event-report.json"),"utf8"));
   const path=join(folder,".nbl-maintenance/repair-handoff.json");
   const handoff=existsSync(path)?JSON.parse(readFileSync(path,"utf8")):null;
   return {report,handoff,repository};
 }finally{rmSync(folder,{recursive:true,force:true});}
}
test("actual Beans main failure has a read-only evidence receipt without a fabricated fix",()=>{
 const {report,handoff,repository}=run();
 assert.equal(report.status,"FAIL");
 assert.equal(report.repairAttempted,false);
 assert.equal(handoff.repository,repository);
 assert.equal(handoff.sourceSha,"a".repeat(40));
 assert.equal(handoff.inspectorRun,"https://github.com/FounderNBL/Beans/actions/runs/12345");
 assert.equal(handoff.rootCauseConfirmed,false);
 assert.equal(handoff.solutionSelected,false);
 assert.equal(handoff.retestPassed,false);
 assert.equal(handoff.fixerDispatched,false);
 assert.equal(handoff.modelCalls,0);
 assert.equal(handoff.autoMerge,false);
 assert.equal(handoff.autoDeploy,false);
 assert.equal(handoff.autoSpend,false);
});
test("Pulse main source failures have the same secure handoff contract",()=>{
 const {handoff}=run({component:"pulse"});
 assert.equal(handoff.component,"pulse");
 assert.equal(handoff.repository,"FounderNBL/Pulse");
});
test("PR failures, manual runs and branch failures do not authorize handoff",()=>{
 for(const config of [
   {event:"pull_request"},{event:"workflow_dispatch"},{ref:"refs/heads/feature"}
 ]){
   const {report,handoff}=run(config);
   assert.equal(report.status,"FAIL");
   assert.equal(handoff,null);
 }
});
test("PASS/UNVERIFIED and retired Messenger source checks do not create repair handoffs",()=>{
 for(const config of [
   {result:"success"},{result:"skipped"},{component:"messenger"}
 ]){
   const {handoff}=run(config);
   assert.equal(handoff,null);
 }
});
test("reusable workflow never gains AI secrets, write permissions or paid Fixer dispatch",()=>{
 assert.match(workflow,/permissions:\n  contents: read/);
 assert.doesNotMatch(workflow,/openai\/codex-action|gemini_api_key|Claude_Api_key|contents: write/);
 assert.match(workflow,/messenger:FounderNBL\/NBL-Messenger/,"Preserve legacy caller until separately retired");
});
