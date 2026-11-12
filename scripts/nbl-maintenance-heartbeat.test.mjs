import test from "node:test";
import assert from "node:assert/strict";
import {TARGETS,classify,inspect,assess} from "./nbl-maintenance-heartbeat.mjs";
test("Only two approved anonymous live GET endpoints",()=>{
 assert.deepEqual(TARGETS.map(x=>x.id),["website-tls","core-readiness"]);
 assert.equal(TARGETS.length,2);
 assert.ok(TARGETS.every(x=>x.url.startsWith("https://")));
 assert.ok(TARGETS.every(x=>!/university|desk|playground|games|payment|stripe|messenger/i.test(x.url)));
});
test("Website is PASS only on actual 200 HTML; a bot challenge is unverified",()=>{
 assert.equal(classify(200,"text/html","<!doctype html><html>healthy</html>"),"PASS");
 assert.equal(classify(200,"text/html","Just a moment"),"UNVERIFIED");
 assert.equal(classify(403,"text/html","Forbidden"),"UNVERIFIED");
 assert.equal(classify(502,"text/html","Bad Gateway"),"FAIL");
});
test("Core is PASS only if actual gateway and public Beans are healthy",()=>{
 const healthy=JSON.stringify({service:"NBL Core",components:{gateway:{ok:true},publicBeans:{ok:true}}});
 assert.equal(classify(200,"application/json",healthy,"json"),"PASS");
 assert.equal(classify(200,"application/json",JSON.stringify({service:"NBL Core",components:{gateway:{ok:false}}}),"json"),"FAIL");
 assert.equal(classify(401,"application/json","{}","json"),"UNVERIFIED");
});
test("A real probe makes exactly two GET requests and never posts customer data",async()=>{
 let calls=0;
 const request=async(url,opt)=>{
  calls++;
  assert.equal(opt.method,"GET");
  assert.equal(opt.body,undefined);
  assert.ok(TARGETS.some(x=>x.url===url));
  const website=url.endsWith("/");
  return {status:200,headers:{get:()=>website?"text/html":"application/json"},
   text:async()=>website?"<!doctype html><html></html>":
    JSON.stringify({service:"NBL Core",components:{gateway:{ok:true},publicBeans:{ok:true}}})};
 };
 const results=await inspect({request});
 assert.equal(calls,2);
 assert.deepEqual(results.map(x=>x.status),["PASS","PASS"]);
 assert.equal(assess(results).fullSystemGreen,false);
});
