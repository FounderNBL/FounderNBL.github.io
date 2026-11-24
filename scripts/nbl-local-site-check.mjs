/**
 * NBL website local-first preflight. Runs in Codespaces or local Node 22.
 * Zero paid model calls, no secrets, no network requests and no file writes.
 * Does not replace independent CI/Inspector/LOCKE checks.
 */
import {spawnSync} from "node:child_process";

const commands=[
  ["syntax/world header",["--check","nbl-world-header.js"]],
  ["syntax/Beans chat",["--check","chat.js"]],
  ["syntax/member isolation",["--check","social-realtime.js"]],
  ["website chat parity",["scripts/check-website-chat-parity.mjs"]],
  ["website repair regression",["scripts/check-website-repair.mjs"]],
  ["Build-A-Block interactions",["--test","scripts/check-build-a-block-public.test.mjs"]]
];

for (const [label,args] of commands){
 console.log("\n[NBL local preflight] "+label);
 const check=spawnSync(process.execPath,args,{stdio:"inherit",shell:false,timeout:120000});
 if(check.error || check.status!==0){
  console.error("[NBL local preflight] FAIL "+label);
  process.exitCode=1;
  break;
 }
}
if(!process.exitCode)console.log("\n[NBL local preflight] PASS. Run independent GitHub checks before any approved release.");
