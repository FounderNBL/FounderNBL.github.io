import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {policy,policyCheck,chooseRepairIncident,checkPatch,verifiedLesson} from "./nbl-website-fixer.mjs";
const patch=path=>"diff --git a/"+path+" b/"+path+"\nindex aaaaa..bbbbb 100644\n--- a/"+path+"\n+++ b/"+path+"\n@@ -1 +1 @@\n-old\n+new\n";
test("Only approved website files are editable",()=>{
 assert.equal(policyCheck(),true);
 assert.equal(checkPatch(patch("index.html")).ok,true);
 for(const x of [".github/workflows/nbl-live-production-watch.yml","university.html","games.html","docs/nbl-desk.md","scripts/nbl-website-fixer.mjs","nbl-product-plans.js"])
  assert.equal(checkPatch(patch(x)).ok,false,x);
});
test("Unrelated security and billing failures do not authorize AI repairs",()=>{
 const s=chooseRepairIncident([{id:"source:security-source-control",status:"FAIL"}]);
 assert.equal(s.eligible,false);
 assert.equal(chooseRepairIncident([{id:"page:/university.html",status:"FAIL"}]).eligible,false);
});
test("An old Pulse image with approved original PNG is a real repairable source mismatch",()=>{
 const content={
  "index.html":'<section class="pulse-world-door"><a href="/pulse/"><img src="/pulse/pulse-world.svg"></a></section>',
 };
 const read=x=>x in content?Buffer.from(content[x]):readFileSync(new URL("../"+x,import.meta.url));
 const inc=chooseRepairIncident([{id:"art:pulse",status:"FAIL",reason:"wrong_art_hash_dimensions_or_route"}],read);
 assert.equal(inc.eligible,true);
 assert.equal(inc.selected[0].file,"index.html");
});
test("No visual asset fabrication when exact approved PNG is missing",()=>{
 const inc=chooseRepairIncident([{id:"art:pulse",status:"FAIL"}],x=>x.endsWith(".png")?Buffer.from("not real"):Buffer.from(""));
 assert.equal(inc.eligible,false);
});
test("Patches cannot rename or replace binaries",()=>{
 assert.equal(checkPatch(patch("index.html").replace("index aaaaa..bbbbb","deleted file mode 100644")).ok,false);
 assert.equal(checkPatch("GIT binary patch").ok,false);
});
test("Only independently verified source and browser retests become reusable lessons",()=>{
 const incident={eligible:true,incident:"scoped-123",selected:[{id:"art:pulse",reason:"old art"}]};
 const verdict=checkPatch(patch("index.html"));
 assert.throws(()=>verifiedLesson(incident,verdict,{sourceTests:"PASS",independentRetest:"SKIP"}));
 const good=verifiedLesson(incident,verdict,{sourceTests:"PASS",originalFailureReproduced:true,independentRetest:"PASS"});
 assert.equal(good.status,"independent_tests_verified_source_repair");
});
