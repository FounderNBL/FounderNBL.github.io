import test from "node:test";
import assert from "node:assert/strict";
import {compareRepairCandidates} from "./nbl-website-repair-experiment.mjs";
const incident={eligible:true,targetRepo:"FounderNBL/FounderNBL.github.io",
 selected:[{id:"art:pulse",file:"index.html"}]};
const diff=(before,after)=>"diff --git a/index.html b/index.html\nindex 111..222 100644\n--- a/index.html\n+++ b/index.html\n@@ -1 +1 @@\n-"+before+"\n+"+after+"\n";
test("NBL tests up to three REAL, non-writing approaches and compares their evidence",()=>{
 let seen=[],reads=0;
 const report=compareRepairCandidates(incident,"/tmp/isolated",{
  reviewed:[{caseId:"website-green-aaaaaaaaaaaa",unifiedDiff:diff("bad","good"),
      paths:["index.html"],executionAuthorized:false,score:90,successCount:5,failureCount:1},
   {caseId:"website-green-bbbbbbbbbbbb",unifiedDiff:diff("wrong","new"),
      paths:["index.html"],executionAuthorized:false,score:80,successCount:3,failureCount:1},
   {caseId:"website-green-cccccccccccc",unifiedDiff:diff("third","new"),
      paths:["index.html"],executionAuthorized:false,score:70,successCount:1,failureCount:0}],
  localEdits:[{path:"index.html",find:"old",replace:"new"}],
  read:()=>{reads++;return "old";},
  spawn:(cmd,args,opt)=>{seen.push(opt.input);return{status:opt.input.includes("-bad")?0:1}}
 });
 assert.equal(report.state,"PREFLIGHT");assert.equal(report.choices.length,3);
 assert.equal(report.selectedCaseId,"website-green-aaaaaaaaaaaa");
 assert.equal(report.realChoices,3);assert.equal(seen.length,2);assert.equal(reads,1);
 assert.equal(report.verifiedRepair,false);assert.equal(report.executionAuthorized,false);
 assert.ok(report.choices.every(x=>x.wallMs!==null&&x.cpuMicros!==null));
 assert.ok(report.choices.every(x=>x.independentRetestPassed===false));
 assert.equal(report.budget.modelCalls,0);
});
test("No made-up third choice; all mismatched options HOLD with zero writes",()=>{
 let writes=0;
 const report=compareRepairCandidates(incident,"/tmp/isolated",{
   localEdits:[{path:"index.html",find:"missing",replace:"new"}],
   read:()=>"old",
   spawn:()=>{writes++;throw Error("must not spawn")}
 });
 assert.equal(report.realChoices,1);assert.equal(report.choices[0].applicable,false);
 assert.equal(report.selectedCaseId,null);assert.equal(report.state,"HOLD");
 assert.equal(writes,0);
});
test("Never simulate or allow a protected path",()=>{
 const report=compareRepairCandidates({...incident,selected:[{id:"protected",file:"games/game.js"}]},"/tmp",{localEdits:[]});
 assert.equal(report.state,"HOLD");
 const report2=compareRepairCandidates(incident,"/tmp",{localEdits:[{path:"index.html",find:"a",replace:"b"},
 {path:"university/grades.json",find:"c",replace:"d"}]});
 assert.equal(report2.realChoices,0);
});
test("A copied or unapproved repair patch never enters the preflight",()=>{
 const r=compareRepairCandidates(incident,"/tmp",{reviewed:[{
   caseId:"fake",executionAuthorized:true,unifiedDiff:diff("old","new"),paths:["index.html"],score:999
 }]});
 assert.equal(r.realChoices,0);assert.equal(r.state,"HOLD");
});
