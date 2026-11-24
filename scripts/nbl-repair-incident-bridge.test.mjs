import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateMaintenanceEvent,verifyMaintenanceFailure,
  classifyIndependentRetest,recordIndependentIncident} from "./nbl-repair-incident-bridge.mjs";

const sha="a".repeat(40);
const repo="FounderNBL/Beans";
const name="NBL Maintenance Department — Beans source events";
const event=()=>({action:"completed",workflow_run:{
  name,id:21819,status:"completed",conclusion:"failure",
  head_branch:"main",event:"push",head_sha:sha,
  head_repository:{full_name:repo}
}});
const run=()=>({name,id:21819,status:"completed",conclusion:"failure",
  head_branch:"main",event:"push",head_sha:sha,
  head_repository:{full_name:repo}});
const jobs=()=>({jobs:[{name:"NBL shared / Verify changed component — beans",
  conclusion:"failure",steps:[
    {name:"INSPECT / run real tests specific to the affected repository",conclusion:"failure"}
  ]}]});
const response=value=>({ok:true,status:200,json:async()=>value});
const calls=[];
const fetcher=async(url,options)=>{
  calls.push([url,options.method]);
  assert.match(options.headers.authorization,/Bearer fake-token/);
  if(url.endsWith("/actions/runs/21819"))return response(run());
  if(url.endsWith("/branches/main"))return response({commit:{sha}});
  if(url.endsWith("/actions/runs/21819/jobs?per_page=100"))return response(jobs());
  throw Error("unexpected API request "+url);
};
test("the existing active repo and precise main push are mandatory",()=>{
  assert.equal(validateMaintenanceEvent(event(),"beans",repo).state,"CANDIDATE");
  for(const changed of [
    {name:"untrusted"}, {head_branch:"feature"},{event:"pull_request"},
    {status:"in_progress"},{conclusion:"success"}, {head_repository:{full_name:"someone/fork"}}
  ])assert.equal(validateMaintenanceEvent({...event(),workflow_run:{...event().workflow_run,...changed}},"beans",repo).state,"HOLD");
  assert.equal(validateMaintenanceEvent(event(),"beans","FounderNBL/NBL-Messenger").state,"HOLD");
  assert.equal(validateMaintenanceEvent(event(),"messenger",repo).state,"HOLD");
  assert.equal(validateMaintenanceEvent(event(),"beans",repo).providerSpendUSD,0);
});
test("real repository, run, main HEAD and source failure step must agree",async()=>{
  calls.length=0;
  const report=await verifyMaintenanceFailure(event(),"beans",repo,{fetcher,token:"fake-token"});
  assert.equal(report.state,"VERIFIED_SOURCE_FAILURE");
  assert.equal(report.inspectorRun,"https://github.com/FounderNBL/Beans/actions/runs/21819");
  assert.equal(calls.length,3);
  assert.equal(report.rootCauseConfirmed,false);
  assert.equal(report.aiFixerDispatched,false);
  assert.equal(report.modelCalls,0);
});
test("stale main and non-source failures hold; no model can certify them",async()=>{
  const stale=async(url,opts)=>url.endsWith("/branches/main")?
    response({commit:{sha:"b".repeat(40)}}):fetcher(url,opts);
  assert.equal((await verifyMaintenanceFailure(event(),"beans",repo,{fetcher:stale,token:"fake-token"})).reason,
    "main_advanced_since_failure");
  const noSteps=async(url,opts)=>url.endsWith("/jobs?per_page=100")?
    response({jobs:[{name:"Deployment",conclusion:"failure",steps:[]}]}):fetcher(url,opts);
  assert.equal((await verifyMaintenanceFailure(event(),"beans",repo,{fetcher:noSteps,token:"fake-token"})).reason,
    "source_failure_step_not_verified");
  const injected=async(url,opts)=>url.endsWith("/actions/runs/21819")?
    response({...run(),head_repository:{full_name:"someone/fork"}}):fetcher(url,opts);
  assert.equal((await verifyMaintenanceFailure(event(),"beans",repo,{fetcher:injected,token:"fake-token"})).reason,
    "run_provenance_mismatch");
});
test("second source check independently separates repeatable and flaky failures",async()=>{
  const verify=await verifyMaintenanceFailure(event(),"beans",repo,{fetcher,token:"fake-token"});
  const reproduced=classifyIndependentRetest(verify,"failure");
  assert.equal(reproduced.state,"REPRODUCED");
  assert.equal(reproduced.solutionSelected,false);
  assert.equal(reproduced.autoDeploy,false);
  for(const outcome of ["success","skipped"]){
    assert.equal(classifyIndependentRetest(verify,outcome).state,"HOLD");
  }
  assert.equal(classifyIndependentRetest({state:"HOLD"},"failure").state,"HOLD");
});
test("only reproduced source incident writes one item, never triggers code or spends API credits",async()=>{
  const verified=await verifyMaintenanceFailure(event(),"beans",repo,{fetcher,token:"fake-token"});
  const reproduced=classifyIndependentRetest(verified,"failure");
  let posts=0;
  const mock=async(url,opts)=>{
    assert.match(url,/^https:\/\/api\.github\.com\/repos\/FounderNBL\/Beans\/issues/);
    if(opts.method==="GET"){
      assert.ok(url.endsWith("/issues?state=all&per_page=100&page=1"));
      return response([]);
    }
    if(opts.method==="POST"){
      posts++;
      const payload=JSON.parse(opts.body);
      assert.match(payload.title,/^\[NBL SOURCE INSPECTOR\] beans a{12}$/);
      assert.match(payload.body,/root cause and fix NOT YET PROVEN/);
      assert.doesNotMatch(payload.body,/gh pr merge|production credential/);
      assert.equal(payload.labels,undefined);
      return response({number:42,title:payload.title,html_url:"https://github.com/FounderNBL/Beans/issues/42"});
    }
    throw Error("Unexpected write");
  };
  const created=await recordIndependentIncident(reproduced,{fetcher:mock,token:"fake-token"});
  assert.equal(created.state,"INCIDENT_RECORDED");
  assert.equal(posts,1);
  assert.equal(created.modelCalls,0);
  assert.equal(created.aiFixerDispatched,false);
  const duplicate=async(url,opts)=>opts.method==="GET"?
    response([{number:42,title:"[NBL SOURCE INSPECTOR] beans "+sha.slice(0,12),
      html_url:"https://github.com/FounderNBL/Beans/issues/42"}]):
    Promise.reject(Error("Duplicate must not write"));
  const seen=await recordIndependentIncident(reproduced,{fetcher:duplicate,token:"fake-token"});
  assert.equal(seen.state,"EXISTING_INCIDENT");
  assert.equal((await recordIndependentIncident({state:"HOLD"},{fetcher:mock,token:"fake-token"})).state,"HOLD");
});
test("older incidents remain discoverable after the first 100 GitHub issues",async()=>{
  const verified=await verifyMaintenanceFailure(event(),"beans",repo,{fetcher,token:"fake-token"});
  const reproduced=classifyIndependentRetest(verified,"failure");
  const requests=[];
  const mocked=async(url,options)=>{
    requests.push({url,method:options.method});
    if(options.method!=="GET")throw Error("Duplicate must not create an issue");
    if(url.endsWith("&page=1"))return response(
      Array.from({length:100},(_,i)=>({number:i+1,pull_request:{url:"https://github.com/pull/"+i},
        title:"Another existing PR"})));
    if(url.endsWith("&page=2"))return response([{
      number:999,title:"[NBL SOURCE INSPECTOR] beans "+sha.slice(0,12),
      html_url:"https://github.com/FounderNBL/Beans/issues/999"
    }]);
    throw Error("Unexpected page");
  };
  const found=await recordIndependentIncident(reproduced,{fetcher:mocked,token:"fake-token"});
  assert.equal(found.state,"EXISTING_INCIDENT");
  assert.equal(found.issueUrl,"https://github.com/FounderNBL/Beans/issues/999");
  assert.equal(requests.length,2);
  assert.ok(requests.every(r=>r.method==="GET"));
});
test("an incomplete large issue history fails closed without creating a duplicate",async()=>{
  const verified=await verifyMaintenanceFailure(event(),"beans",repo,{fetcher,token:"fake-token"});
  const reproduced=classifyIndependentRetest(verified,"failure");
  const requests=[];
  const mocked=async(url,options)=>{
    requests.push({url,method:options.method});
    if(options.method!=="GET")throw Error("Do not create an issue without full history");
    return response(Array.from({length:100},(_,i)=>({number:i+1,title:"Other issue"})));
  };
  const held=await recordIndependentIncident(reproduced,{fetcher:mocked,token:"fake-token"});
  assert.equal(held.state,"HOLD");
  assert.equal(held.reason,"issue_history_pagination_limit");
  assert.equal(requests.length,50);
  assert.ok(requests.every(x=>x.method==="GET"));
});
test("workflow never grants write access to a source test and never runs paid Fixer",()=>{
  const workflow=readFileSync(".github/workflows/nbl-maintenance-independent-triage.yml","utf8");
  const first=workflow.slice(workflow.indexOf("  independent-source-retest:"),workflow.indexOf("  record-confirmed-incident:"));
  const second=workflow.slice(workflow.indexOf("  record-confirmed-incident:"));
  assert.match(first,/permissions:\n      contents: read\n      actions: read/);
  assert.doesNotMatch(first,/issues: write|contents: write/);
  assert.match(second,/issues: write/);
  assert.doesNotMatch(second,/openai\/codex-action|gemini|Claude|contents: write/);
  assert.match(first,/continue-on-error: true/);
  assert.match(workflow,/ref: main/);
});
