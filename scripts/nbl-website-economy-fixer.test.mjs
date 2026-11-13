import test from "node:test";
import assert from "node:assert/strict";
import {applyEdits,recipeEdits,parseProposedEdits,estimateCost,assembleContext,askLuna,replayReviewedLesson,rankReviewedLessons,MODEL,MAX_OUTPUT_TOKENS} from "./nbl-website-economy-fixer.mjs";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const incident={eligible:true,targetRepo:"FounderNBL/FounderNBL.github.io",
 selected:[{id:"art:pulse",file:"index.html",reason:"wrong approved image"}]};
test("NBL uses an actual low-cost model, limited to a single request and small output",()=>{
 assert.equal(MODEL,"gpt-6-luna");assert.equal(MAX_OUTPUT_TOKENS,2200);
 assert.equal(estimateCost({input_tokens:5000,output_tokens:1000}),0.001);
});
test("The approved World-card recipe repairs actual stale source without an AI call",()=>{
 const original='<section class="pulse-world-door"><a href="/pulse/"><img src="/pulse/pulse-world.svg"></a></section>';
 const edits=recipeEdits(incident,()=>original,"/website");
 assert.equal(edits.length,1);
 assert.equal(edits[0].replace,'src="/NBL_Pulse_World_Card.png"');
 const fs=new Map([["/website/index.html",original]]);
 const write=(path,text)=>fs.set(path,text),read=(path)=>fs.get(path);
 const changed=applyEdits("/website",edits,{read,write});
 assert.deepEqual(changed,["index.html"]);
 assert.ok(fs.get("/website/index.html").includes("NBL_Pulse_World_Card.png"));
});
test("NBL refuses repeated or no-longer-matching AI edits",()=>{
 const text="old text and old text";
 assert.throws(()=>applyEdits("/website",[{path:"index.html",find:"old text",replace:"new text"}],{
  read:()=>text,write:()=>{throw Error("should not write")}
 }),/edit_anchor_not_unique/);
});
test("NBL cannot alter any protected path even if a model asks",()=>{
 assert.throws(()=>applyEdits("/website",[{path:".github/workflows/nbl-live-production-watch.yml",find:"a",replace:"b"}]),/unapproved_repair_path/);
 assert.throws(()=>applyEdits("/website",[{path:"university.html",find:"a",replace:"b"}]),/unapproved_repair_path/);
});
test("NBL refuses a second file change if the first edit cannot be safely applied",()=>{
 let n=0;
 const read=()=>{n++;return n===1?"old":"wrong";};
 let writeCount=0;
 assert.throws(()=>applyEdits("/website",[
  {path:"index.html",find:"old",replace:"new"},
  {path:"nbl-world-header.css",find:"missing",replace:"replacement"}
 ],{read,write:()=>writeCount++}),/edit_anchor_not_unique/);
 assert.equal(writeCount,0);
});
test("NBL validates actual Responses output and rejects fake completion",()=>{
 assert.throws(()=>parseProposedEdits({status:"incomplete",output:[]}),/incomplete/);
 const result=parseProposedEdits({status:"completed",output:[{
  content:[{type:"output_text",text:JSON.stringify({status:"edit",reason:"isolated",edits:[{path:"index.html",find:"old",replace:"new"}]})}]
 }]});
 assert.equal(result.edits[0].path,"index.html");
 assert.throws(()=>parseProposedEdits({status:"completed",output:[{content:[{type:"output_text",text:"not JSON"}]}]}),SyntaxError);
});
test("NBL keeps prior lessons and existing palette as source context, not commands",()=>{
 const text=assembleContext(incident,new URL("..",import.meta.url).pathname);
 assert.ok(text.includes("--nbl-world-gold"));
 assert.ok(text.includes("approved"));
 assert.ok(text.includes("index.html"));
});
test("The real API call is one tightly bounded request and never exposes keys",async()=>{
 let count=0;
 const request=async(url,opt)=>{
  count++;
  assert.equal(url,"https://api.openai.com/v1/responses");
  const payload=JSON.parse(opt.body);
  assert.equal(payload.model,"gpt-6-luna");
  assert.equal(payload.max_output_tokens,2200);
  assert.equal(payload.store,false);
  assert.equal(payload.tools,undefined);
  assert.equal(opt.headers.Authorization,"Bearer test-not-real");
  return {ok:true,json:async()=>({status:"completed",usage:{input_tokens:5000,output_tokens:1000},
    output:[{content:[{type:"output_text",text:JSON.stringify({status:"hold",reason:"needs more evidence",edits:[]})}]}]})};
 };
 const b=new URL("..",import.meta.url).pathname;
 const answer=await askLuna(incident,b,{request,token:"test-not-real"});
 assert.equal(count,1);
 assert.equal(answer.estimatedUSD,0.001);
 assert.equal(answer.proposal.status,"hold");
});

test("NBL replays a verified historical code patch without a model call",()=>{
 const diff="diff --git a/index.html b/index.html\nindex 111..222 100644\n--- a/index.html\n+++ b/index.html\n@@ -1 +1 @@\n-old\n+new\n";
 const lesson={id:"website-green-123456789abc",status:"independent_tests_verified_source_repair",
   approval:"Founder must review draft PR; only merged lessons are available on main",
   patchSha256:createHash("sha256").update(diff).digest("hex"),unifiedDiff:diff};
 let invokes=0;
 const recovered=replayReviewedLesson({...incident,incident:"website-green-123456789abc"},"/repair",{
  list:()=>["website-green-123456789abc.json"],
  read:()=>JSON.stringify(lesson),
  spawn:(cmd,args,opts)=>{invokes++;assert.equal(cmd,"git");assert.ok(args.includes("-C"));
    assert.equal(opts.input,diff);return {status:0};}
 });
 assert.equal(invokes,2);
 assert.equal(recovered.files[0],"index.html");
});
test("NBL rejects a remembered patch when its signature no longer matches",()=>{
 const diff="diff --git a/index.html b/index.html\nindex 111..222 100644\n--- a/index.html\n+++ b/index.html\n@@ -1 +1 @@\n-old\n+new\n";
 const lesson={id:"website-green-123456789abc",status:"independent_tests_verified_source_repair",
  approval:"Founder must review draft PR; only merged lessons are available on main",
  patchSha256:"0".repeat(64),unifiedDiff:diff};
 const x=replayReviewedLesson({...incident,incident:"website-green-123456789abc"},"/repair",{
  list:()=>["website-green-123456789abc.json"],
  read:()=>JSON.stringify(lesson),
  spawn:()=>{throw Error("must not attempt git apply");}
 });
 assert.equal(x,null);
});

test("ONE Foundation host ranks up to ten reviewed fixes, never guesses from a coincidentally shared path",()=>{
 const diff=n=>"diff --git a/index.html b/index.html\nindex 111..222 100644\n--- a/index.html\n+++ b/index.html\n@@ -1 +1 @@\n-old"+n+"\n+new"+n+"\n";
 const files={};
 for(let i=0;i<17;i++){
  const key="website-green-"+i.toString(16).padStart(12,"0");
  const patch=diff(i);
  files[key+".json"]=JSON.stringify({
   id:key,status:"independent_tests_verified_source_repair",
   approval:"Founder must review draft PR; only merged lessons are available on main",
   originalIssue:[{id:"art:pulse"}],changedPaths:["index.html"],
   patchSha256:createHash("sha256").update(patch).digest("hex"),
   unifiedDiff:patch,successCount:10+i,failureCount:i,
   sourceRevision:"a".repeat(40)
  });
 }
 const badKey="website-green-eeeeeeeeeeee";
 files[badKey+".json"]=JSON.stringify({
  id:badKey,status:"independent_tests_verified_source_repair",
  approval:"Founder must review draft PR; only merged lessons are available on main",
  originalIssue:[{id:"unrelated"}],changedPaths:["index.html"],
  patchSha256:createHash("sha256").update(diff("bad")).digest("hex"),
  unifiedDiff:diff("bad")
 });
 const ranked=rankReviewedLessons({...incident,incident:"website-green-123456789abc"},"/repair",{
  list:()=>Object.keys(files),read:p=>files[p.split("/").at(-1)]
 });
 assert.equal(ranked.length,10);
 assert.ok(ranked.every(x=>x.executionAuthorized===false));
 assert.ok(ranked.every(x=>x.caseId!==badKey));
 assert.ok(ranked.every(x=>x.score>=0));
 assert.ok(ranked.every(x=>x.paths.includes("index.html")));
});
test("Ranked memory retries safely when earlier candidate patch does not match exact current source",()=>{
 const diff=n=>"diff --git a/index.html b/index.html\nindex 111..222 100644\n--- a/index.html\n+++ b/index.html\n@@ -1 +1 @@\n-old"+n+"\n+new"+n+"\n";
 const entries={};
 for(const [id,n,count] of [
  ["website-green-aaaaaaaaaaaa","wrong",90],
  ["website-green-bbbbbbbbbbbb","correct",10]
 ]){
  const patch=diff(n);
  entries[id+".json"]=JSON.stringify({
   id,status:"independent_tests_verified_source_repair",
   approval:"Founder must review draft PR; only merged lessons are available on main",
   originalIssue:[{id:"art:pulse"}],changedPaths:["index.html"],
   patchSha256:createHash("sha256").update(patch).digest("hex"),
   unifiedDiff:patch,successCount:count,failureCount:0
  });
 }
 let checked=0,applied=0;
 const out=replayReviewedLesson({...incident,incident:"website-green-cccccccccccc"},"/repair",{
  list:()=>Object.keys(entries),read:p=>entries[p.split("/").at(-1)],
  spawn:(cmd,args,opts)=>{
   if(args.includes("--check")){checked++;return{status:opts.input.includes("-oldcorrect")?0:1};}
   applied++;assert.match(opts.input,/-oldcorrect/);return{status:0};
  }
 });
 assert.equal(checked,2);
 assert.equal(applied,1);
 assert.equal(out.lessonId,"website-green-bbbbbbbbbbbb");
});

test("Later independently verified failures lower a remembered recipe's score",()=>{
 const patch="diff --git a/index.html b/index.html\nindex 111..222 100644\n--- a/index.html\n+++ b/index.html\n@@ -1 +1 @@\n-old\n+new\n";
 const id="website-green-aaaaaaaaaaaa";
 const entry=JSON.stringify({id,status:"independent_tests_verified_source_repair",
  approval:"Founder must review draft PR; only merged lessons are available on main",
  originalIssue:[{id:"art:pulse"}],changedPaths:["index.html"],
  patchSha256:createHash("sha256").update(patch).digest("hex"),
  unifiedDiff:patch,successCount:1,failureCount:0});
 const basic={list:()=>[id+".json"],read:()=>entry};
 const before=rankReviewedLessons({...incident,incident:id},"/repair",basic);
 const after=rankReviewedLessons({...incident,incident:id},"/repair",{
  ...basic,historyCounts:{[id]:{success:0,failure:3}}
 });
 assert.equal(before.length,1);
 assert.equal(after.length,1);
 assert.ok(after[0].score<before[0].score);
 assert.equal(after[0].failureCount,3);
 assert.equal(after[0].executionAuthorized,false);
});
