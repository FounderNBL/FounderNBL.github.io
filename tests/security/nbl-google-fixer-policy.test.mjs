import {test} from "node:test";
import assert from "node:assert/strict";
import {ALLOWED_REPO,ALLOWED_FILES,validateIssue,validatePaths,validatePatchBudget,FIXER_PATCH_LIMITS} from "../../scripts/nbl-google-fixer-policy.mjs";
const verified={state:"open", title:"Reader footer alignment", body:"Screenshots on mobile and reproduction steps",labels:[{name:"inspector-confirmed"},{name:"fixer-approved"}],assignees:[]};
test("Google Fixer uses public website only",()=>{
  assert.equal(ALLOWED_REPO,"FounderNBL/FounderNBL.github.io");
  assert.ok(ALLOWED_FILES.includes("reader.html"));
  for(const secret of ["nbl-world-header.js","supabase/functions/nbl-account/index.ts","account.html","university.html",".github/workflows/nbl-google-fixer.yml","privacy.html"]){
    assert.ok(!ALLOWED_FILES.includes(secret));
  }
});
test("Approved confirmed website issue may request proposed repair",()=>{
  assert.deepEqual(validateIssue(verified,"true"),{allowed:true,message:"Confirmed website-only repair is approved."});
});
test("No implicit spending or unconfirmed incident",()=>{
  assert.equal(validateIssue(verified,"false").allowed,false);
  assert.equal(validateIssue({...verified,labels:[{name:"fixer-approved"}]},"true").allowed,false);
  assert.equal(validateIssue({...verified,labels:[{name:"inspector-confirmed"}]},"true").allowed,false);
  assert.equal(validateIssue({...verified,title:"UNVERIFIED: mystery outage"},"true").allowed,false);
  assert.equal(validateIssue({...verified,state:"closed"},"true").allowed,false);
  assert.equal(validateIssue({...verified,pull_request:{} },"true").allowed,false);
  assert.equal(validateIssue({...verified,labels:[...verified.labels,{name:"fixer-dispatched"}]},"true").allowed,false);
});
test("Only small public Reader/Books file diffs may become draft PRs",()=>{
  assert.equal(validatePaths(["books.html","nbl-reader.js"]).allowed,true);
  assert.equal(validatePaths([]).allowed,false);
  for(const file of [
    "mobile/App.js","supabase/functions/nbl-account/index.ts",
    ".github/workflows/nbl-google-fixer.yml","account.html",
    "university.html","../secrets.txt",".env","README.md"
  ])assert.equal(validatePaths([file]).allowed,false,file);
});

test("AI-proposed patch is strictly bounded by lines, files and bytes",()=>{
  const one=[{path:"nbl-reader.js",added:12,deleted:3}];
  assert.equal(validatePatchBudget(one,2048).allowed,true);
  assert.equal(validatePatchBudget(one,0).allowed,false);
  assert.equal(validatePatchBudget(one,FIXER_PATCH_LIMITS.maxPatchBytes+1).allowed,false);
  assert.equal(validatePatchBudget([{path:"nbl-reader.js",added:100,deleted:1}],1024).allowed,false);
  assert.equal(validatePatchBudget([{path:"nbl-reader.js",added:NaN,deleted:1}],1024).allowed,false);
  assert.equal(validatePatchBudget([{path:"nbl-reader.js",added:5,deleted:-1}],1024).allowed,false);
  assert.equal(validatePatchBudget([{path:"nbl-reader.js",added:5,deleted:3},{path:"nbl-reader.js",added:4,deleted:1}],1024).allowed,false);
  assert.equal(validatePatchBudget([
    {path:"books.html",added:2,deleted:0},{path:"reader.html",added:2,deleted:0},
    {path:"nbl-reader.js",added:2,deleted:0},{path:"nbl-reader.css",added:2,deleted:0}
  ],1024).allowed,false);
  assert.equal(validatePatchBudget([{path:"university.html",added:1,deleted:1}],1024).allowed,false);
});
