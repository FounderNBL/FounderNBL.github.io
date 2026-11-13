import assert from "node:assert/strict";
import test from "node:test";
import {buildFoundationFailure,buildFoundationAttempt,buildFounderApproval,
 renderRecord,upsertGithubIssue,FOUNDATION_FAILURE_PREFIX,FOUNDER_APPROVAL_PREFIX}
 from "./nbl-foundation-repair-events.mjs";

const env={GITHUB_SHA:"a".repeat(40),GITHUB_RUN_ID:"45123"};
const incident={
 eligible:true,targetRepo:"FounderNBL/FounderNBL.github.io",
 incident:"website-green-123456abcdef",reference:"config/nbl-website-green-baseline.json",
 at:new Date().toISOString(),
 selected:[{id:"art:pulse",file:"index.html",reason:"verified wrong baseline image"}]
};
test("Real source-only incident produces bounded public GitHub receipt with approved baseline, no secrets",()=>{
 const r=buildFoundationFailure(incident,env);
 assert.equal(r.failureId,"website-green-123456abcdef");
 assert.deepEqual(r.affectedPaths,["index.html"]);
 assert.deepEqual(r.symptomCodes,["art_pulse"]);
 assert.equal(r.originalFailureReproduced,true);
 assert.equal(r.actionPermission,false);
 assert.match(r.approvedExpectationRef,/blob\/a{40}\/config\/nbl-website-green-baseline.json/);
 const text=renderRecord(r);
 assert.match(text,/nbl.foundation.inspector-failure.v1/);
 assert.doesNotMatch(text,/verified wrong baseline image|secret|Authorization:/i);
});
test("No incident, bot challenge, private path or invalid SHA can masquerade as verified failure",()=>{
 for(const broken of [
  {...incident,eligible:false},
  {...incident,selected:[]},
  {...incident,targetRepo:"other/repo"},
  {...incident,selected:[{id:"private",file:"university/index.html"}]},
  {...incident,reference:"private-baseline"},
  {...incident,incident:"not-a-real-id"}
 ])assert.throws(()=>buildFoundationFailure(broken,env),/foundation_repair_handoff_/);
 assert.throws(()=>buildFoundationFailure(incident,{...env,GITHUB_SHA:"main"}),/foundation_repair_handoff_/);
});
test("Only independently executed retest records outcomes; skipped/unknown is no learning",()=>{
 const good=buildFoundationAttempt(incident,{...env,NBL_WRITER_OUTCOME:"success",
  NBL_SOURCE_RETEST_OUTCOME:"success",NBL_RETEST_OUTCOME:"success",NBL_RETEST_VERIFIED:"true"});
 assert.equal(good.verdict,"SUCCESS");
 assert.equal(good.independentlyObserved,true);
 assert.equal(good.approved,false);
 assert.equal(good.autoPromoted,false);
 const failed=buildFoundationAttempt(incident,{...env,NBL_WRITER_OUTCOME:"success",
  NBL_SOURCE_RETEST_OUTCOME:"failure",NBL_RETEST_OUTCOME:"skipped",NBL_RETEST_VERIFIED:"false"});
 assert.equal(failed.verdict,"FAILED");
 const hold=buildFoundationAttempt(incident,{...env,NBL_WRITER_OUTCOME:"failure",
  NBL_RETEST_VERIFIED:"false"});
 assert.equal(hold,null);
});
test("Distinct persistent Founder approval request references actual verified PR, never merges",()=>{
 const r=buildFounderApproval({
  ...env,NBL_INCIDENT:incident.incident,
  NBL_VERIFIED_REPAIR_PR_URL:"https://github.com/FounderNBL/FounderNBL.github.io/pull/572"});
 assert.match(r.title,/NBL FOUNDER APPROVAL REQUIRED/);
 assert.equal(r.assignees[0],"FounderNBL");
 assert.match(r.body,/If you do nothing, this remains pending/);
 assert.match(r.body,/no automated merge/);
 assert.throws(()=>buildFounderApproval({...env,NBL_INCIDENT:incident.incident,
  NBL_VERIFIED_REPAIR_PR_URL:"https://evil.com/pull/11"}),/unverified_approval/);
});
test("GH built-in token is sufficient: issue create and dedupe update, zero model/extra key",async()=>{
 let calls=[],state=0;
 const fetcher=async(url,options)=>{
  calls.push({url,method:options.method,body:options.body?JSON.parse(options.body):null});
  if(options.method==="GET")return {ok:true,json:async()=>state===0?[]:[
    {number:123,title:FOUNDATION_FAILURE_PREFIX+incident.incident}]};
  if(options.method==="POST"){state=1;return{ok:true,json:async()=>({html_url:"https://github.com/.../issues/123"})};}
  if(options.method==="PATCH")return{ok:true,json:async()=>({html_url:"https://github.com/.../issues/123"})};
  throw Error("invalid mock");
 };
 const title=FOUNDATION_FAILURE_PREFIX+incident.incident;
 await upsertGithubIssue(title,renderRecord(buildFoundationFailure(incident,env)),{
  token:"github-built-in-test",fetcher});
 await upsertGithubIssue(title,"Updated independent receipt",{
  token:"github-built-in-test",fetcher});
 assert.deepEqual(calls.map(x=>x.method),["GET","POST","GET","PATCH"]);
 assert.equal(calls[1].body.title,title);
 assert.equal(calls[1].body.assignees,undefined);
});
test("No GH token cannot write even a trusted receipt",async()=>{
 await assert.rejects(upsertGithubIssue(FOUNDER_APPROVAL_PREFIX+"test","body",{
  token:"",fetcher:async()=>{throw Error("should not fetch");}}),/foundation_repair_handoff_github_token_absent/);
});
