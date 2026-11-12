import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {Script} from "node:vm";
const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const worker=read("nbl-beans-hf-worker.js");
const panel=read("nbl-beans-hf-panel.js");
const header=read("nbl-world-header.js");
for(const [name,code] of [["model worker",worker],["website panel",panel]]){
  new Script(code,{filename:name});
}
assert.match(header,/nbl-beans-hf-panel\.js\?v=20261112/,"Sitewide Beans loads panel");
assert.match(panel,/nbl-beans-tools-menu/,"Uses existing Beans tools");
assert.match(panel,/nbl-beans-input/,"Evidence is added to existing Beans draft");
assert.match(panel,/new Worker\("\/nbl-beans-hf-worker\.js/,"Runs on browser worker");
assert.match(panel,/UNVERIFIED LOCAL MODEL RESEARCH/,"No false claim of verified answers");
assert.match(panel,/beansInput\.dispatchEvent/,"Draft input registered without sending");
assert.match(worker,/Xenova\/codegen-350M-mono/,"Selected CodeGen browser ONNX");
assert.match(worker,/Xenova\/pythia-410m/,"Selected Pythia browser ONNX");
assert.doesNotMatch(worker,/Qwen|SmolLM/,"Maybe model not activated");
assert.match(worker,/@huggingface\/transformers@4\.3\.2/,"Pinned browser dependency");
assert.match(worker,/max_new_tokens:48/,"Generation bounded");
assert.match(worker,/do_sample:false/,"Deterministic initial research");
assert.doesNotMatch(worker,/SUPABASE|CLERK|STRIPE|process\.env|Deno\.env|service_role/i,"No server credentials");
assert.doesNotMatch(panel,/supabase\/functions|\/functions\/v1|api\.openai\.com/i,"No backend AI route");
console.log("PASS: website-only CodeGen+Pythia local research source contract (15 assertions)");
