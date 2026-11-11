import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {contractGuard,readContract,checkWebsiteSource,statusFromResponse,assessment} from "./nbl-website-green-baseline.mjs";
const contract=readContract();
test("Baseline is exclusively the approved website repository",()=>{
  assert.equal(contractGuard(contract),true);
  assert.deepEqual(contract.scope.allowedRepositories,["FounderNBL/FounderNBL.github.io"]);
  assert.ok(!contract.production.publicPages.some(p=>/university|grey|virgo|games|playground|desk|campus/i.test(p)));
});
test("University, Playground and Desk are excluded even by a future edit",()=>{
  const copy=structuredClone(contract);copy.production.publicPages.push("/university.html");
  assert.throws(()=>contractGuard(copy),/forbidden_site_route/);
  const other=structuredClone(contract);other.scope.allowedRepositories.push("FounderNBL/nbl-desk");
  assert.throws(()=>contractGuard(other),/website_only_scope/);
  const testFile=structuredClone(contract);testFile.source.existingRegressionSuites.push("tests/browser/campus-student.spec.mjs");
  assert.throws(()=>contractGuard(testFile),/held_scope/);
});
test("Approved source and images are checked against the actual repo",()=>{
  const results=checkWebsiteSource(contract);
  assert.ok(results.length>=contract.source.requiredMarkers.length+2);
  assert.equal(results.filter(x=>x.status!=="PASS").length,0,JSON.stringify(results.filter(x=>x.status!=="PASS")));
});
test("Old Pulse or Messenger SVG must fail instead of claiming green",()=>{
  const read=(path)=>{
    if(path==="index.html")return Buffer.from(
      readFileSync(new URL("../index.html",import.meta.url),"utf8")
        .replace('src="/NBL_Pulse_World_Card.png"','src="/pulse/pulse-world.svg"')
        .replace('src="/NBL_Messenger_Beans_Worldcard.png"','src="/messenger/icon.svg"')
    );
    return readFileSync(new URL("../"+path,import.meta.url));
  };
  const results=checkWebsiteSource(contract,read);
  assert.equal(results.find(x=>x.id==="pulse-approved-source-art").status,"FAIL");
  assert.equal(results.find(x=>x.id==="messenger-approved-source-art").status,"FAIL");
});
test("Cloudflare bot or denied runner never becomes PASS",()=>{
  for(const status of [0,401,403,408,429])assert.equal(statusFromResponse(status,"text/html"),"UNVERIFIED");
  assert.equal(statusFromResponse(200,"text/html","Just a moment..."),"UNVERIFIED");
  assert.equal(statusFromResponse(404,"text/html"),"FAIL");
  assert.equal(statusFromResponse(200,"text/html","<html>ok</html>"),"PASS");
});
test("Unverified LOCKE, intrusion logs and visual snapshots block global GREEN",()=>{
  const x=assessment([{id:"source",status:"PASS",reason:"okay"}],contract);
  assert.equal(x.status,"UNVERIFIED");
  assert.equal(x.fullGreen,false);
  assert.ok(x.notProven.some(y=>y.area==="LOCKE"));
  assert.equal(x.noDeskChecks,true);assert.equal(x.noPlaygroundChecks,true);assert.equal(x.noUniversityChecks,true);
});
test("Zero schedule/read permission changes occur inside the contract runner",()=>{
  const c=readFileSync(new URL("./nbl-website-green-baseline.mjs",import.meta.url),"utf8");
  assert.ok(!c.includes("method:\"POST\""));
  assert.ok(!c.includes("method:\"DELETE\""));
  assert.ok(!c.includes("method:\"PATCH\""));
  assert.equal(contract.schedule.utcCron,"17 */6 * * *");
});
