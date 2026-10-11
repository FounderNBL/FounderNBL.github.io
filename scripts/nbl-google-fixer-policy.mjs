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

export const FIXER_PATCH_LIMITS = Object.freeze({
  maxFiles: 3,
  maxChangedLines: 140,
  maxLinesPerFile: 100,
  maxPatchBytes: 32768
});
export function validatePatchBudget(records, patchBytes) {
  const deny = message => ({allowed:false,message});
  if (!Array.isArray(records) || records.length < 1) return deny("Patch contains no tracked changes.");
  if (records.length > FIXER_PATCH_LIMITS.maxFiles) return deny("Too many changed files for one repair.");
  if (!Number.isSafeInteger(patchBytes) || patchBytes <= 0 || patchBytes > FIXER_PATCH_LIMITS.maxPatchBytes)
    return deny("Patch exceeds byte budget or has an invalid byte count.");
  const paths = records.map(x=>x.path);
  const permitted = validatePaths(paths);
  if (!permitted.allowed) return permitted;
  if (new Set(paths).size !== paths.length) return deny("Patch contains repeated file records.");
  let changedLines = 0;
  for (const item of records) {
    if (!Number.isSafeInteger(item.added) || !Number.isSafeInteger(item.deleted) ||
        item.added < 0 || item.deleted < 0)
      return deny("Binary or invalid diff statistics are not permitted.");
    if (item.added + item.deleted > FIXER_PATCH_LIMITS.maxLinesPerFile)
      return deny("Change exceeds the per-file line budget: " + item.path);
    changedLines += item.added + item.deleted;
  }
  if (changedLines < 1 || changedLines > FIXER_PATCH_LIMITS.maxChangedLines)
    return deny("Patch exceeds total changed-line budget or contains no modifications.");
  return {allowed:true,message:"Diff is within the small-repair safety budget."};
}
