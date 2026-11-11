import test from "node:test";
import assert from "node:assert/strict";
import {applyEdits,recipeEdits,parseProposedEdits,estimateCost,assembleContext,askLuna,MODEL,MAX_OUTPUT_TOKENS} from "./nbl-website-economy-fixer.mjs";
import {readFileSync} from "node:fs";
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
