import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const workflow = readFileSync(".github/workflows/nbl-live-production-watch.yml", "utf8");
const routeInspection = workflow.split("  deep-browser-inspection:")[0];

test("runner route recovery cannot close live route incidents", () => {
  assert.doesNotMatch(routeInspection, /name: Confirm route recovery/);
  // A bot-challenged runner must neither create nor close a customer incident.
  assert.equal(routeInspection.match(/^\s+gh issue close .+$/gm), null);
  assert.match(routeInspection, /Report unverified runner routes without reopening stale incidents/);
  assert.match(routeInspection, /Open or update route incident/);
});

test("Cloudflare preflight must precede ALL deep external route/browser inspections",()=>{
  assert.match(workflow,/jobs:\s*\n  security-heartbeat:/);
  assert.match(workflow,/\n  cloudflare-preflight:/);
  // The isolated anonymous heartbeat intentionally does not require a full
  // Cloudflare preflight. Both deep jobs still do.
  assert.match(workflow,/route-inspection:\s*\n[\s\S]*?needs: cloudflare-preflight/);
  assert.match(workflow,/deep-browser-inspection:\s*\n[\s\S]*?needs: cloudflare-preflight/);
  assert.equal((workflow.match(/needs: cloudflare-preflight/g)||[]).length,2);
  assert.match(workflow,/node scripts\/nbl-cloudflare-handshake\.mjs/);
  assert.match(workflow,/actions\/download-artifact@v[78]/);
  assert.match(workflow,/CLOUDFLARE_HANDSHAKE/);
  assert.doesNotMatch(workflow,/cloudflare\.request\(|skip_waf|bypass_challenge|security_level:.*off/i);
});

test("reuse canonical Cloudflare Inspector credential, never require a duplicate secret",()=>{
  assert.match(workflow,/secrets\.NBL_CLOUDFLARE_INSPECTOR_TOKEN\s*\|\|\s*secrets\.CLOUDFLARE_NBL_INSPECTOR_TOKEN/);
  assert.doesNotMatch(workflow,/run:\s*.*echo.*\$\{\{\s*secrets\./);
});

test("only a cheap security heartbeat is scheduled; full browser inspection follows relevant website changes",()=>{
  const head=workflow.split("permissions:")[0];
  assert.ok(head.includes("\n  push:") && head.includes("branches: [main]"));
  assert.match(head,/47 1,13 \* \* \*/);
  assert.doesNotMatch(head,/17 \*\/6 \* \* \*/);
  assert.doesNotMatch(head,/17 \* \* \* \*/);
  assert.match(workflow,/  security-heartbeat:\n[\s\S]*?github\.event_name == 'schedule'/);
  assert.match(workflow,/node scripts\/nbl-maintenance-heartbeat\.mjs/);
  assert.match(workflow,/  cloudflare-preflight:\n[\s\S]*?github\.event_name != 'schedule'/);
  assert.match(workflow,/  deep-browser-inspection:\n[\s\S]*?github\.event_name != 'schedule'/);
  assert.match(workflow,/npx playwright test tests\/browser\/live-site-health\.spec\.mjs/);
  for(const held of ["!university/**","!nblu/**","!games/**","!playground/**","!desk/**"])
    assert.ok(head.includes(held),"Held source must not trigger full site sweep: "+held);
  assert.doesNotMatch(workflow,/https:\/\/nblschool\.com\//);
  assert.doesNotMatch(workflow,/https:\/\/books\.newbeansland\.org\//);
  assert.doesNotMatch(workflow,/https:\/\/nblworld\.com\//);
  assert.doesNotMatch(workflow,/NBL_EXPECT_BILLING_LIVE|Wait for the deployed Chat asset/);
});

test("NBLU inspection hold excludes campus and University from every public website maintenance runner",()=>{
 const spec=readFileSync("tests/browser/live-site-health.spec.mjs","utf8");
 const smoke=readFileSync(".github/workflows/nbl-live-stack-smoke.yml","utf8");
 for(const source of [workflow,spec,smoke]){
  assert.doesNotMatch(source,/https:\/\/nblschool\.com\//);
  assert.doesNotMatch(source,/https:\/\/newbeansland\.org\/university\.html/);
 }
 assert.doesNotMatch(smoke,/for\(const route of \[[^\]]*"university"/);
});

test("Cloudflare's website Worker retains native Issues and query redaction across deploys",()=>{
 const config=JSON.parse(readFileSync("wrangler.jsonc","utf8"));
 assert.equal(config.name,"foundernbl-github-io");
 assert.equal(config.observability.enabled,true);
 assert.equal(config.observability.issues.enabled,true);
 assert.equal(config.observability.redact_query_string,true);
});
