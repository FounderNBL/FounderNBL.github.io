// CONTROLLED NON-PRODUCTION TEST ONLY — no real GitHub issues or workflow triggers.
// Runs genuine Node source-failure fixtures and injects a fake GitHub API into
// the actual NBL maintenance bridge. The fake receipt is not production proof.
import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {spawnSync} from "node:child_process";
import {
  validateMaintenanceEvent,
  verifyMaintenanceFailure,
  classifyIndependentRetest,
  recordIndependentIncident
} from "./nbl-repair-incident-bridge.mjs";

const REPO="FounderNBL/Beans";
const WORKFLOW="NBL Maintenance Department — Beans source events";
const SHA="f".repeat(40);
const RUN_ID=8654321;
const ISSUE_TITLE="[NBL SOURCE INSPECTOR] beans "+SHA.slice(0,12);
const ISSUE_URL="https://github.com/FounderNBL/Beans/issues/55";
const API="https://api.github.com";
const prefix="/repos/"+REPO;
const response=x=>({ok:true,status:200,json:async()=>x});
function event(overrides={}){
  return {action:"completed",workflow_run:{
    id:RUN_ID,name:WORKFLOW,status:"completed",conclusion:"failure",
    event:"push",head_branch:"main",head_sha:SHA,
    head_repository:{full_name:REPO},...overrides
  }};
}
function fixtureApi({mainSha=SHA,nonSource=false,allowIssues=true,issues=[]}={}){
  const requests=[],stored=[...issues];
  const fetcher=async(url,options={})=>{
    assert.ok(url.startsWith(API+prefix+"/"),"No external network destination permitted");
    assert.equal(options.headers.authorization,"Bearer fixture-only-token");
    const path=url.slice(API.length),method=options.method||"GET";
    requests.push({method,path});
    if(method==="GET"&&path===prefix+"/actions/runs/"+RUN_ID)
      return response(event().workflow_run);
    if(method==="GET"&&path===prefix+"/branches/main")
      return response({commit:{sha:mainSha}});
    if(method==="GET"&&path===prefix+"/actions/runs/"+RUN_ID+"/jobs?per_page=100")
      return response({jobs:nonSource?[
        {name:"Deployment",conclusion:"failure",steps:[{name:"External outage",conclusion:"failure"}]}
      ]:[{
        name:"NBL shared / Verify changed component — beans",
        conclusion:"failure",
        steps:[{name:"INSPECT / run real tests specific to the affected repository",
          conclusion:"failure"}]
      }]});
    if(method==="GET"&&path===prefix+"/issues?state=all&per_page=100")
      return response(stored);
    if(method==="POST"&&path===prefix+"/issues"&&allowIssues){
      const payload=JSON.parse(options.body);
      assert.deepEqual(Object.keys(payload).sort(),["body","title"]);
      assert.equal(payload.title,ISSUE_TITLE);
      assert.match(payload.body,/root cause and fix NOT YET PROVEN/);
      const created={number:55,title:payload.title,html_url:ISSUE_URL};
      stored.unshift(created);
      return response(created);
    }
    throw Error("Unapproved fixture request: "+method+" "+path);
  };
  return {fetcher,requests,stored};
}
function runDisposableSourceTest(pass){
  // A genuine Node child process runs its own test in a temporary folder,
  // never in the NBL source tree, customer environment or main branch.
  const folder=mkdtempSync(join(tmpdir(),"nbl-maintenance-controlled-"));
  try{
    const file=join(folder,"source-regression.test.mjs");
    writeFileSync(file,
      'import test from "node:test";\n'+
      'import assert from "node:assert/strict";\n'+
      'test("disposable source regression",()=>assert.equal(1,'+(pass?"1":"2")+'));\n');
    const child=spawnSync(process.execPath,["--test",file],{
      cwd:folder,encoding:"utf8",timeout:8000
    });
    assert.equal(child.error,undefined,"Isolated source runner must start");
    assert.ok(child.status===0||child.status===1,
      "Only deterministic source-test pass/failure is accepted");
    return child.status===0?"success":"failure";
  }finally{
    rmSync(folder,{recursive:true,force:true});
  }
}
function assertZeroAuthority(outcome){
  assert.equal(outcome.modelCalls,0);
  assert.equal(outcome.providerSpendUSD,0);
  assert.equal(outcome.aiFixerDispatched,false);
  assert.equal(outcome.patchApplied,false);
  assert.equal(outcome.autoMerge,false);
  assert.equal(outcome.autoDeploy,false);
}
test("controlled: actual disposable source FAIL, independent FAIL, then one simulated incident",async()=>{
  assert.equal(runDisposableSourceTest(false),"failure");
  const fake=fixtureApi();
  const candidate=validateMaintenanceEvent(event(),"beans",REPO);
  assert.equal(candidate.state,"CANDIDATE");
  assertZeroAuthority(candidate);
  const verified=await verifyMaintenanceFailure(event(),"beans",REPO,{
    fetcher:fake.fetcher,token:"fixture-only-token"
  });
  assert.equal(verified.state,"VERIFIED_SOURCE_FAILURE");
  assert.equal(runDisposableSourceTest(false),"failure");
  const reproduced=classifyIndependentRetest(verified,"failure");
  assert.equal(reproduced.state,"REPRODUCED");
  assert.equal(reproduced.rootCauseConfirmed,false);
  assert.equal(reproduced.solutionSelected,false);
  assertZeroAuthority(reproduced);
  const created=await recordIndependentIncident(reproduced,{
    fetcher:fake.fetcher,token:"fixture-only-token"
  });
  assert.equal(created.state,"INCIDENT_RECORDED");
  assert.equal(created.issueUrl,ISSUE_URL);
  assertZeroAuthority(created);
  const duplicate=await recordIndependentIncident(reproduced,{
    fetcher:fake.fetcher,token:"fixture-only-token"
  });
  assert.equal(duplicate.state,"EXISTING_INCIDENT");
  assertZeroAuthority(duplicate);
  assert.equal(fake.requests.filter(x=>x.method==="POST").length,1,
    "One synthetic issue in a small in-memory issue list");
  assert.equal(fake.stored.length,1);
  console.log("CONTROLLED_TEST_RECEIPT",JSON.stringify({
    environment:"isolated_fixture_only",originalSourceTest:"FAIL",
    independentRetest:"FAIL",triage:"REPRODUCED",
    simulatedIssue:"CREATED_ONCE_AND_DEDUPED",realGithubIssuesCreated:0,
    paidModelCalls:0,productionChanges:0
  }));
});
test("controlled: previously failed source PASS on independent retest remains HOLD",async()=>{
  assert.equal(runDisposableSourceTest(false),"failure");
  const fake=fixtureApi({allowIssues:false});
  const verified=await verifyMaintenanceFailure(event(),"beans",REPO,{
    fetcher:fake.fetcher,token:"fixture-only-token"
  });
  assert.equal(verified.state,"VERIFIED_SOURCE_FAILURE");
  assert.equal(runDisposableSourceTest(true),"success");
  const hold=classifyIndependentRetest(verified,"success");
  assert.equal(hold.state,"HOLD");
  assert.equal(hold.reason,"failed_source_check_not_reproduced");
  assertZeroAuthority(hold);
  const rejected=await recordIndependentIncident(hold,{
    fetcher:fake.fetcher,token:"fixture-only-token"
  });
  assert.equal(rejected.state,"HOLD");
  assert.equal(fake.requests.filter(x=>x.method==="POST").length,0);
});
test("controlled: fork, PR, feature branch, stale main and unrelated failure remain HOLD",async()=>{
  const fake=fixtureApi({allowIssues:false});
  for(const changed of [
    {head_repository:{full_name:"stranger/fork"}},
    {event:"pull_request"},{head_branch:"side-branch"},
    {conclusion:"success"}
  ]){
    const hold=await verifyMaintenanceFailure(event(changed),"beans",REPO,{
      fetcher:fake.fetcher,token:"fixture-only-token"
    });
    assert.equal(hold.state,"HOLD");
    assertZeroAuthority(hold);
  }
  const stale=fixtureApi({mainSha:"e".repeat(40),allowIssues:false});
  const old=await verifyMaintenanceFailure(event(),"beans",REPO,{
    fetcher:stale.fetcher,token:"fixture-only-token"
  });
  assert.equal(old.reason,"main_advanced_since_failure");
  const unrelated=fixtureApi({nonSource:true,allowIssues:false});
  const noSource=await verifyMaintenanceFailure(event(),"beans",REPO,{
    fetcher:unrelated.fetcher,token:"fixture-only-token"
  });
  assert.equal(noSource.reason,"source_failure_step_not_verified");
  for(const f of [fake,stale,unrelated])
    assert.equal(f.requests.filter(x=>x.method==="POST").length,0);
});
