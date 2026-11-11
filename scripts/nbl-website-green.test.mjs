import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {contract,checkContract,checkSource,classifyHttp,summarize} from "./nbl-website-green.mjs";

test("GREEN contract stays tied to approved website and six-hour no-write schedule",()=>{
 assert.deepEqual(checkContract(),[]);
 assert.equal(contract.site,"https://newbeansland.org");
 assert.equal(contract.schedule.utcCron,"17 */6 * * *");
 assert.equal(contract.schedule.deploy,false);
 assert.equal(contract.schedule.repair,false);
 assert.equal(contract.production.onlyReadRequests,true);
});
test("No University, campus, games or payment route can enter scheduled public scope",()=>{
 const forbidden=/university|campus|nblu|games|block.?boss|checkout|billing|stripe|payment/i;
 assert.equal(contract.production.publicPages.some(x=>forbidden.test(x)),false);
 const unsafe=structuredClone(contract);unsafe.production.publicPages.push("/university.html");
 assert.ok(checkContract(unsafe).length>0);
});
test("All six installed source markers match actual website source",()=>{
 const checked=checkSource();
 const missing=checked.filter(x=>x.status!=="PASS");
 assert.deepEqual(missing,[],JSON.stringify(missing));
});
test("The actual approved artwork and homepage references must match their official byte hashes",()=>{
 const checked=checkSource();
 assert.deepEqual(checked.filter(x=>x.id.startsWith("art:")).map(x=>x.status),["PASS","PASS"]);
 const source=readFileSync(new URL("../index.html",import.meta.url),"utf8");
 assert.ok(!source.includes('class="world-card messenger-world-card reveal" href="/messenger/"><div class="media"><img src="/messenger/icon.svg"'));
});
test("Tampered PNG cannot receive source GREEN",()=>{
 const text=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
 const bytes=p=>p==="NBL_Pulse_World_Card.png"?Buffer.from("not the official image"):
   readFileSync(new URL("../"+p,import.meta.url));
 const findings=checkSource(contract,{text,bytes});
 assert.equal(findings.find(x=>x.id==="art:pulse").status,"FAIL");
 assert.equal(findings.find(x=>x.id==="art:messenger").status,"PASS");
});
test("Wrong Pulse artwork reference cannot receive source GREEN even with correct PNG bytes",()=>{
 const text=p=>{
   const content=readFileSync(new URL("../"+p,import.meta.url),"utf8");
   return p==="index.html"?content.replace('src="/NBL_Pulse_World_Card.png"','src="/pulse/pulse-world.svg"'):content;
 };
 const findings=checkSource(contract,{text});
 assert.equal(findings.find(x=>x.id==="art:pulse").status,"FAIL");
});
test("Challenge/rate limit does not prove a customer outage or green",()=>{
 for(const status of [0,401,403,429])
  assert.equal(classifyHttp(status,"text/html","https://newbeansland.org/").status,"UNVERIFIED");
});
test("Confirmed 404/500, wrong origin and wrong content-type are failures",()=>{
 for(const status of [404,500,503])
  assert.equal(classifyHttp(status,"text/html","https://newbeansland.org/").status,"FAIL");
 assert.equal(classifyHttp(200,"text/html","https://evil.example/").status,"FAIL");
 assert.equal(classifyHttp(200,"application/json","https://newbeansland.org/").status,"FAIL");
});
test("A source PASS cannot be advertised as independently proven website security",()=>{
 const report=summarize(checkSource());
 assert.equal(report.status,"PASS");
 assert.equal(report.fullWebsiteGreen,false);
 assert.match(report.evidenceType,/repository source only/);
});
test("Any real failure overrides an unverified or source PASS",()=>{
 const a=summarize([{status:"PASS"},{status:"UNVERIFIED"}]);
 assert.equal(a.status,"UNVERIFIED");
 assert.equal(a.fullWebsiteGreen,false);
 const b=summarize([{status:"PASS"},{status:"FAIL"},{status:"UNVERIFIED"}]);
 assert.equal(b.status,"FAIL");
});
