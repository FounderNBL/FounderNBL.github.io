import {test} from "node:test";
import assert from "node:assert/strict";
import {ALLOWED_REPO,ALLOWED_FILES,PATCH_LIMITS,validateIssue,validatePaths,validatePatch} from "../../scripts/nbl-google-fixer-policy.mjs";
import {readFileSync} from "node:fs";
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

const sampleStats=[{path:"nbl-reader.js",added:12,deleted:8}];
const patch=(stats=sampleStats,patchBytes=3000,hasForbiddenMetadata=false)=>
  validatePatch({stats,patchBytes,hasForbiddenMetadata});
test("Bounded reader patch passes, larger rewrites fail closed",()=>{
  assert.equal(patch().allowed,true);
  assert.equal(patch([],3000).allowed,false);
  assert.equal(patch(sampleStats,0).allowed,false);
  assert.equal(patch(sampleStats,PATCH_LIMITS.maxPatchBytes+1).allowed,false);
  assert.equal(patch(sampleStats,3000,true).allowed,false);
  assert.equal(patch([{path:"books.html",added:121,deleted:0}]).allowed,false);
  assert.equal(patch([{path:"books.html",added:100,deleted:0},{path:"reader.html",added:100,deleted:1}]).allowed,false);
  assert.equal(patch([{path:"nbl-reader.js",added:0,deleted:0}]).allowed,false);
  assert.equal(patch([{path:"nbl-reader.css",added:NaN,deleted:3}]).allowed,false);
  assert.equal(patch([{path:"nbl-reader.js",added:2,deleted:1},{path:"nbl-reader.js",added:2,deleted:1}]).allowed,false);
  assert.equal(patch([{path:"books.html",added:2,deleted:1},{path:"reader.html",added:2,deleted:1},{path:"nbl-reader.js",added:2,deleted:1},{path:"nbl-reader.css",added:2,deleted:1}]).allowed,false);
  assert.equal(patch([{path:".github/workflows/nbl-google-fixer.yml",added:2,deleted:1}]).allowed,false);
});
test("Gemini action and CLI version are pinned; only current model is configured",()=>{
  const workflow=readFileSync(".github/workflows/nbl-google-fixer.yml","utf8");
  assert.match(workflow,/google-github-actions\\/run-gemini-cli@[0-9a-f]{40}/);
  assert.match(workflow,/gemini_cli_version: ['"]?0\\.63\\.0/);
  assert.match(workflow,/gemini_model: gemini-3\\.5-flash-lite/);
  assert.doesNotMatch(workflow,/run-gemini-cli@v0\\b|gemini_cli_version: latest|gemini-2\\.5-flash-lite/);
  assert.ok(workflow.includes("node scripts/nbl-google-fixer-guard.mjs validate-patch"));
});
test("Reader JS and CSS changes always trigger real browser CI",()=>{
  const wf=readFileSync(".github/workflows/nbl-website-chat-parity.yml","utf8");
  for(const path of ['nbl-reader.js','nbl-reader.css']){
    assert.equal(wf.split('      - "'+path+'"').length-1,2);
  }
  assert.match(wf,/npx playwright test --project=chromium --project=mobile-chromium/);
});
