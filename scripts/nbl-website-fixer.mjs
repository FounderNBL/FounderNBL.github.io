// NBL source-only Fixer: deterministic incident selection, diff policy, and
// versioned repair receipt. AI never decides its own scope or authority.
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
import {createHash} from "node:crypto";
import {contract,checkContract,checkSource} from "./nbl-website-green.mjs";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
export const policy=Object.freeze(JSON.parse(readFileSync(join(root,"config/nbl-website-fixer-policy.json"),"utf8")));
const forbidden=/university|nblu|campus|grey|virgo|nblschool|games?|block.?boss|playground|desk|stripe|billing|checkout|price|payment|clerk|locke|entitlement|credential|secret|token|\.github|workflow/i;
export function policyCheck(p=policy){
 if(p.version!==1||p.homeRepository!=="FounderNBL/FounderNBL.github.io"||
    !Array.isArray(p.allowedEditPaths)||p.allowedEditPaths.length<2||
    p.maxModelAttempts!==1||p.maxFiles>4||p.maxChangedLines>250||
    p.maxPatchBytes>20000||p.requireIndependentRetest!==true||
    p.changeDestination!=="draft_pr_only"||p.requireFounderReviewBeforeMerge!==true)
   throw Error("repair_scope_or_budget_invalid");
 for(const path of p.allowedEditPaths){
  if(!/^[a-zA-Z0-9._/-]+$/.test(path)||path.includes("..")||forbidden.test(path))
   throw Error("protected_edit_path");
 }
 return true;
}
const sha=x=>createHash("sha256").update(x).digest("hex");
export function chooseRepairIncident(findings,read=(p)=>readFileSync(join(root,p))){
 policyCheck(); if(checkContract().length)throw Error("green_contract_not_authoritative");
 const repairable=[];
 for(const f of findings){
  if(f.status!=="FAIL")continue;
  const allowed={
   "source:homepage-title":"index.html",
   "source:beans-identity":"nbl-world-header.js",
   "source:account-door":"account.html",
   "source:pulse-door":"pulse/index.html",
   "source:messenger-private-entrance":"messenger/index.html",
   "art:pulse":"index.html","art:messenger":"index.html"
  }[f.id];
  if(!allowed||!policy.allowedEditPaths.includes(allowed))continue;
  if(f.id.startsWith("art:")){
   // No attempt to hallucinate missing approved art. Only text reference drift.
   const art=contract.source.officialWorldArt.find(x=>x.id===f.id.slice(4));
   try{
    if(sha(read(art.sourceImage))!==art.sha256)continue;
    const html=read("index.html").toString();
    const card=html.split('<section class="pulse-world-door"')[1]?.split("</section>")[0]||"";
    if(card.includes('src="/'+art.sourceImage+'"'))continue; // not a reference drift
   }catch{continue;}
  }
  repairable.push({id:f.id,file:allowed,reason:f.reason});
 }
 // A critical unrelated source failure must NOT be silently patched by guessing.
 if(!repairable.length)return {eligible:false,reason:findings.some(x=>x.status==="FAIL")?
   "no_approved_reproducible_code_failure":"no_confirmed_source_defect"};
 const selected=repairable.slice(0,2);
 const identifier=sha(JSON.stringify(selected.map(x=>x.id))).slice(0,12);
 return {eligible:true,incident:"website-green-"+identifier,kind:"reproduced_source_contract_failure",
  selected,reference:"config/nbl-website-green-baseline.json",
  targetRepo:"FounderNBL/FounderNBL.github.io",
  maxAttempts:1,review:"draft_pr_only",testSuite:[
   "scripts/nbl-website-green.test.mjs","scripts/check-official-social-world-cards.test.mjs"
  ]};
}
export function checkPatch(diff, p=policy){
 policyCheck(p);
 if(typeof diff!=="string"||!diff.trim()||Buffer.byteLength(diff)>p.maxPatchBytes)
  return {ok:false,why:"missing_or_oversize_patch"};
 if(/GIT binary patch|Binary files |^deleted file mode |^new file mode |^rename (from|to) |^copy (from|to) |^new file mode 120000/m.test(diff))
  return {ok:false,why:"binary_or_deleted_file_rejected"};
 const headers=[...diff.matchAll(/^diff --git a\/(.+) b\/(.+)$/gm)];
 if(!headers.length||headers.length>p.maxFiles)return {ok:false,why:"file_count_rejected"};
 const touched=[];let lines=0;
 for(const m of headers){
  const name=m[1];
  if(name!==m[2]||!p.allowedEditPaths.includes(name)||touched.includes(name))
   return {ok:false,why:"unapproved_path",path:name};
  touched.push(name);
 }
 for(const line of diff.split("\n")){
  if((line.startsWith("+")&&!line.startsWith("+++"))||
     (line.startsWith("-")&&!line.startsWith("---"))){
   lines++;
   if(/(?:sk-proj-|ghp_|github_pat_|sk_live_)[a-zA-Z0-9_-]{10,}/.test(line))
     return {ok:false,why:"credential_pattern_in_patch"};
  }
 }
 if(lines>p.maxChangedLines)return {ok:false,why:"too_many_changed_lines"};
 return {ok:true,paths:touched,changedLines:lines,sha256:sha(diff)};
}
export function verifiedLesson(incident,verdict,verification,patchText){
 if(!incident?.eligible||!verdict?.ok||verification?.sourceTests!=="PASS"||
    verification?.originalFailureReproduced!==true||verification?.independentRetest!=="PASS")
  throw Error("unverified_cannot_become_memory");
 // Store the actual approved, independently tested code, not merely a checksum.
 // Do not trust caller-provided verdict or memory text without rechecking the diff.
 const fresh=checkPatch(patchText);
 if(!fresh.ok||fresh.sha256!==verdict.sha256||
    JSON.stringify(fresh.paths)!==JSON.stringify(verdict.paths))
  throw Error("memory_patch_not_the_independently_approved_source_change");
 return {
  schema:1,id:incident.incident,status:"independent_tests_verified_source_repair",
  originalIssue:incident.selected.map(s=>({id:s.id,reason:s.reason})),
  rootCauseEvidence:"Confirmed failing source contract: "+incident.selected.map(s=>s.id).join(", "),
  changedPaths:fresh.paths,
  patchSha256:fresh.sha256,
  unifiedDiff:patchText,
  reuseRule:"Reproduce the same source defect, verify the design authority and independently retest before proposing a similar patch; never blindly replay code.",
  testedBy:"NBL website source suite plus independent same-run browser validation",
  sourceReceipt:verification.sourceReceipt||null,
  githubRun:process.env.GITHUB_RUN_ID||null,
  sourceRevision:process.env.GITHUB_SHA||null,
  approvedExpectationRef:process.env.GITHUB_SHA?"https://github.com/FounderNBL/FounderNBL.github.io/blob/"+process.env.GITHUB_SHA+"/config/nbl-website-green-baseline.json":null,
  approval:"Founder must review draft PR; only merged lessons are available on main",
  verifiedAt:new Date().toISOString()
 };
}
function writeReceipt(name,value){
 mkdirSync(join(root,".inspector"),{recursive:true});
 writeFileSync(join(root,".inspector",name),JSON.stringify(value,null,2)+"\n");
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [command,arg]=process.argv.slice(2);
 try{
  if(command==="plan"){
   const findings=checkSource();
   const plan=chooseRepairIncident(findings);
   writeReceipt("website-fixer-incident.json",{at:new Date().toISOString(),...plan,sourceFailures:findings.filter(x=>x.status==="FAIL").map(x=>x.id)});
   if(process.env.GITHUB_OUTPUT){
    const {appendFileSync}=await import("node:fs");
    appendFileSync(process.env.GITHUB_OUTPUT,"eligible="+plan.eligible+"\nincident="+(plan.incident||"none")+"\n");
   }
   console.log("NBL_FIXER_INCIDENT",JSON.stringify(plan));
  }else if(command==="policy"){
   const diff=readFileSync(arg,"utf8"),verdict=checkPatch(diff);
   writeReceipt("website-fixer-policy.json",verdict);
   console.log("NBL_FIXER_PATCH",JSON.stringify(verdict));
   if(!verdict.ok)process.exitCode=1;
  }else if(command==="lesson"){
   const incident=JSON.parse(readFileSync(join(root,".inspector/website-fixer-incident.json"),"utf8"));
   const diff=readFileSync(arg,"utf8"),verdict=checkPatch(diff);
   const proof=JSON.parse(readFileSync(join(root,".inspector/website-fixer-retest.json"),"utf8"));
   const lesson=verifiedLesson(incident,verdict,proof,diff);
   mkdirSync(join(root,policy.allowedRemembranceDir),{recursive:true});
   writeFileSync(join(root,policy.allowedRemembranceDir,lesson.id+".json"),JSON.stringify(lesson,null,2)+"\n");
   console.log("NBL_FIXER_LESSON",JSON.stringify({id:lesson.id,verified:true}));
  }else throw Error("expected_plan_policy_or_lesson");
 }catch(e){console.error("NBL_FIXER_ERROR",String(e?.message||e).slice(0,250));process.exitCode=1;}
}
