// Public-website-only Google Fixer policy. No AI calls or GitHub writes here.
// Kept independent of NBL-Chat/Desk private code and all production credentials.
export const ALLOWED_REPO = "FounderNBL/FounderNBL.github.io";
export const ALLOWED_FILES = Object.freeze([
  "books.html",
  "reader.html",
  "nbl-reader.css",
  "nbl-reader.js",
  "tests/browser/nbl-reader.spec.mjs"
]);
export function validateIssue(issue, manuallyApproved) {
  const reject = message => ({allowed:false, message});
  if (manuallyApproved !== "true") return reject("Explicit Founder approval checkbox is required.");
  if (!issue || issue.state !== "open" || issue.pull_request) return reject("An open website issue is required.");
  const labels = new Set((issue.labels || []).map(x => typeof x === "string" ? x : x?.name));
  if (!labels.has("inspector-confirmed")) return reject("Issue must be marked inspector-confirmed.");
  if (!labels.has("fixer-approved")) return reject("Issue must be marked fixer-approved.");
  if (labels.has("fixer-dispatched")) return reject("Already dispatched.");
  const text = [issue.title, issue.body].map(x => String(x || "")).join("\n");
  if (/UNVERIFIED/i.test(text.slice(0,300))) return reject("Unverified incidents are not eligible.");
  if (!text.trim() || text.length > 7000) return reject("Issue must be concise and evidence-based (max 7,000 characters).");
  return {allowed:true,message:"Confirmed website-only repair is approved."};
}
export function validatePaths(changes) {
  const changed = [...new Set(changes)];
  if (!changed.length) return {allowed:false,message:"No code changes proposed."};
  for (const path of changed) {
    if (!ALLOWED_FILES.includes(path)) return {allowed:false,message:"Blocked file outside Google Fixer allowlist: "+path};
  }
  return {allowed:true,message:"Changes limited to approved public reader/bookstore files."};
}

export const PATCH_LIMITS = Object.freeze({
  maxFiles: 3,
  maxChangedLinesPerFile: 120,
  maxChangedLinesTotal: 200,
  maxPatchBytes: 16000
});
// Numbers must come from git diff --numstat or git apply --numstat, never AI text.
export function validatePatch({stats,patchBytes,hasForbiddenMetadata=false}) {
  const deny=message=>({allowed:false,message});
  if(!Number.isSafeInteger(patchBytes)||patchBytes<1||patchBytes>PATCH_LIMITS.maxPatchBytes)
    return deny("AI patch exceeds 16,000 bytes or is empty.");
  if(hasForbiddenMetadata) return deny("Binary, rename, copy, file permission, and file-creation changes are forbidden.");
  if(!Array.isArray(stats)||!stats.length||stats.length>PATCH_LIMITS.maxFiles)
    return deny("Google Fixer may change only 1-3 existing public files.");
  const paths=validatePaths(stats.map(x=>x.path));
  if(!paths.allowed) return paths;
  if(new Set(stats.map(x=>x.path)).size!==stats.length) return deny("Duplicate file entries are not permitted.");
  let total=0;
  for(const item of stats){
    if(!Number.isSafeInteger(item.added)||item.added<0||!Number.isSafeInteger(item.deleted)||item.deleted<0)
      return deny("Binary or invalid diff statistics are forbidden.");
    const count=item.added+item.deleted;
    if(count>PATCH_LIMITS.maxChangedLinesPerFile)
      return deny("Too many changed lines in "+item.path);
    total+=count;
  }
  if(!total||total>PATCH_LIMITS.maxChangedLinesTotal)
    return deny("Google Fixer patch exceeds the approved 200-line total.");
  return {allowed:true,message:"Proposed patch fits public-file, size, and line limits."};
}
