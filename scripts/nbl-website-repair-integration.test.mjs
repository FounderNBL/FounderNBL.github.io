import test from "node:test";
import assert from "node:assert/strict";
import {run} from "./nbl-website-economy-fixer.mjs";
const site="FounderNBL/FounderNBL.github.io";
const sandbox="/tmp/nbl-verified-fixer-sandbox";
function harness(incident,source,file){
 const files=new Map([[sandbox+"/"+file,source]]),writes=[];
 const read=path=>{
  if(path.endsWith("/.inspector/website-fixer-incident.json"))return JSON.stringify(incident);
  if(files.has(path))return files.get(path);
  throw Error("unexpected_read_"+path);
 };
 const write=(path,value)=>{files.set(path,value);writes.push(path);};
 return {files,writes,read,write};
}
test("Actual NBL Fixer uses applicable local recipe, experiments without internet or models",async()=>{
 const incident={eligible:true,incident:"website-green-aaaaaaaaaaaa",
  targetRepo:site,selected:[{id:"art:pulse",file:"index.html"}]};
 const h=harness(incident,'<img src="/pulse/pulse-world.svg">',"index.html");
 const r=await run({base:sandbox,read:h.read,write:h.write,
  historyReader:async()=>({}),
  ask:async()=>{throw Error("No model allowed on matching local repair");},
  research:async()=>{throw Error("No search needed when local fix exists");}
 });
 assert.equal(r.engine,"verified_local_recipe");
 assert.equal(r.modelCalls,0);assert.equal(r.research.queriesExecuted,0);
 assert.equal(r.comparison.selectedCaseId,"nbl-local-recipe");
 assert.equal(r.testStatus,"AWAITING_INDEPENDENT_RETEST");
 assert.match(h.files.get(sandbox+"/index.html"),/NBL_Pulse_World_Card.png/);
 assert.ok(h.writes.some(p=>p.endsWith("website-fixer-experiment.json")));
});
test("Only when local patches fail does NBL consult external research, still within existing provider gate",async()=>{
 const incident={eligible:true,incident:"website-green-bbbbbbbbbbbb",
  targetRepo:site,selected:[{id:"source:beans-identity",file:"nbl-world-header.js"}]};
 const h=harness(incident,"oldmarker","nbl-world-header.js");
 let researchCount=0,modelCount=0;
 const r=await run({base:sandbox,read:h.read,write:h.write,
  historyReader:async()=>({}),
  research:async()=>{researchCount++;return {
   status:"RESEARCH_ONLY",queriesExecuted:3,sources:[
     {lens:"transfer",title:"Other discipline",url:"https://docs.github.com/en/actions",
      excerpt:"Test before change"}
   ]};},
  ask:async(i,b,options)=>{modelCount++;assert.equal(i,incident);
   assert.equal(options.research.sources[0].lens,"transfer");
   return {proposal:{status:"edit",edits:[{path:"nbl-world-header.js",
    find:"oldmarker",replace:"newmarker"}],reason:"independent local candidate"},
    model:"mock_existing_provider",tokens:{input:0,output:0},estimatedUSD:0};}
 });
 assert.equal(researchCount,1);assert.equal(modelCount,1);
 assert.equal(r.comparison.state,"HOLD");
 assert.equal(r.research.queriesExecuted,3);
 assert.equal(r.modelCalls,1);
 assert.equal(h.files.get(sandbox+"/nbl-world-header.js"),"newmarker");
 assert.equal(r.testStatus,"AWAITING_INDEPENDENT_RETEST");
});
