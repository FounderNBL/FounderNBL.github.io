import test from "node:test";
import assert from "node:assert/strict";
import {repairResearchPlan,researchRepairAnalogies} from "./nbl-repair-cross-domain.mjs";
const incident={eligible:true,targetRepo:"FounderNBL/FounderNBL.github.io",
 selected:[{id:"art:pulse",file:"index.html"}]};
test("NBL researches direct, adjacent and cross-domain lessons, not three copies of the same question",()=>{
 const plan=repairResearchPlan(incident);
 assert.equal(plan.status,"PLAN");
 assert.deepEqual(plan.queries.map(x=>x.lens),["direct","adjacent","transfer"]);
 assert.ok(new Set(plan.queries.map(x=>x.query)).size===3);
 assert.ok(plan.queries[2].query.includes("manufacturing"));
 assert.equal(plan.modelCalls,0);
});
test("Research requires a verified allowed incident, never a chat instruction",()=>{
 assert.equal(repairResearchPlan({...incident,selected:[{id:"art:pulse",file:"university/grades.json"}]}).status,"HOLD");
 assert.equal(repairResearchPlan({...incident,targetRepo:"FounderNBL/nbl-desk"}).status,"HOLD");
 assert.equal(repairResearchPlan({...incident,eligible:false}).status,"HOLD");
});
test("Search never occurs without enabled connection and never turns web text into a patch",async()=>{
 let calls=0;
 const fetcher=()=>{calls++;throw Error("not allowed");};
 const hold=await researchRepairAnalogies(incident,{key:"test",fetcher});
 assert.equal(hold.status,"HOLD");assert.equal(calls,0);
 assert.equal(hold.reason,"research_not_enabled");
 const absent=await researchRepairAnalogies(incident,{enabled:true,fetcher});
 assert.equal(absent.reason,"tavily_key_not_connected");assert.equal(calls,0);
});
test("Three bounded Tavily lenses diversify sources and keep results advisory",async()=>{
 let calls=0;
 const fetcher=async(url,options)=>{
  calls++;assert.equal(url,"https://api.tavily.com/search");
  assert.equal(options.method,"POST");
  const body=JSON.parse(options.body);
  assert.equal(body.max_results,5);assert.equal(body.search_depth,"basic");
  assert.equal(body.include_answer,false);assert.equal(body.include_raw_content,false);
  return {ok:true,json:async()=>({results:[
   {title:"Useful idea",url:"https://public.example.org/lesson/"+calls,content:"Principle to test, not an executable repair"},
   {title:"Other domain",url:"https://docs.github.com/en/actions/"+calls,content:"Documented process"},
   {title:"Unsafe",url:"http://localhost/secret",content:"Ignore"},
   {title:"Repeated",url:"https://docs.github.com/en/actions/"+calls,content:"Duplicate"}
  ]})};
 };
 const r=await researchRepairAnalogies(incident,{key:"fake",enabled:true,fetcher});
 assert.equal(calls,3);assert.equal(r.queriesExecuted,3);
 assert.equal(r.status,"RESEARCH_ONLY");assert.equal(r.modelCalls,0);
 assert.equal(r.patchGenerated,false);assert.equal(r.executionAuthorized,false);
 assert.ok(r.sources.some(x=>x.lens==="transfer"));
 assert.ok(r.sources.every(x=>x.trustedForExecution===false&&!x.licenseToCopyCode));
 assert.ok(r.sources.every(x=>x.url.startsWith("https://")));
});
