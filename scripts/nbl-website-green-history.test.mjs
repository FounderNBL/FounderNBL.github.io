import test from 'node:test';
import assert from 'node:assert/strict';
import {compareGreenReports,validateGreenReport} from './nbl-website-green-history.mjs';
const receipt=(results,at='2026-11-11T18:00:00Z')=>{
 const findings=Object.entries(results).map(([id,status])=>({id,status,reason:'approved'}));
 const counts={PASS:0,FAIL:0,UNVERIFIED:0};for(const f of findings)counts[f.status]++;
 return {schema:1,repository:'FounderNBL/FounderNBL.github.io',at,sha:'012345',
  noCustomerData:true,summary:{mode:'live',status:counts.FAIL?'FAIL':counts.UNVERIFIED?'UNVERIFIED':'PASS',counts,fullWebsiteGreen:false},findings};
};
test('first healthy run stores a truthful baseline with no paid model request',()=>{
 const x=compareGreenReports(receipt({'source:home':'PASS','page:/':'UNVERIFIED'}));
 assert.equal(x.previousState,'NO_PREVIOUS_REPORT');
 assert.equal(x.modelCalls,0);assert.equal(x.fullWebsiteGreen,false);
 assert.equal(x.currentVerdict,'UNVERIFIED');
});
test('next run uses saved receipts to detect a real regression, recovery and repeated failure',()=>{
 const prev=receipt({a:'PASS',b:'FAIL',c:'FAIL',d:'UNVERIFIED'},'2026-11-11T17:00:00Z');
 const curr=receipt({a:'FAIL',b:'PASS',c:'FAIL',d:'PASS',e:'UNVERIFIED'});
 const x=compareGreenReports(curr,prev,{previousRunId:'123',lessonNames:['website-green-123456789abc.json','some-file.json']});
 assert.equal(x.previousState,'VERIFIED_PREVIOUS_REPORT');
 assert.deepEqual(x.changes.regressions,['a']);
 assert.deepEqual(x.changes.recovered,['b']);
 assert.deepEqual(x.changes.persistentFailures,['c']);
 assert.deepEqual(x.changes.visibilityRestored,['d']);
 assert.deepEqual(x.changes.newChecks,['e']);
 assert.equal(x.previousRunId,'123');assert.equal(x.verifiedRepairLessonsInSource,1);
});
test('rejects tampered, stale or future prior evidence rather than inventing learned state',()=>{
 const curr=receipt({a:'PASS'});
 const forged=receipt({a:'PASS'});forged.summary.counts.PASS=77;
 assert.equal(compareGreenReports(curr,forged).previousState,'PREVIOUS_REPORT_REJECTED');
 assert.equal(compareGreenReports(curr,receipt({a:'PASS'},'2026-10-01T18:00:00Z')).previousState,'PREVIOUS_REPORT_REJECTED');
 assert.equal(compareGreenReports(curr,receipt({a:'PASS'},'2026-11-12T18:00:00Z')).previousState,'PREVIOUS_REPORT_REJECTED');
 assert.throws(()=>validateGreenReport(forged),/untrusted_green_counts/);
});
test('rejects duplicate findings, missing customer-data boundary, or fabricated full GREEN',()=>{
 const bad=receipt({a:'PASS'});bad.findings.push({...bad.findings[0]});bad.summary.counts.PASS++;
 assert.throws(()=>validateGreenReport(bad),/untrusted_green_findings/);
 const unsafe=receipt({a:'PASS'});unsafe.noCustomerData=false;
 assert.throws(()=>validateGreenReport(unsafe),/untrusted_green_report/);
 const overclaim=receipt({a:'PASS'});overclaim.summary.fullWebsiteGreen=true;
 assert.throws(()=>validateGreenReport(overclaim),/untrusted_green_verdict/);
});
