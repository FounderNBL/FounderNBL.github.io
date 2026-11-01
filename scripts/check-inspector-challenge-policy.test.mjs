// Source assertions for public route monitoring. Not visitor E2E evidence.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const workflow=readFileSync(new URL("../.github/workflows/nbl-live-production-watch.yml",import.meta.url),"utf8");

test("Cloudflare challenge remains UNVERIFIED, never fabricated customer failure or PASS",()=>{
  assert.ok(workflow.includes("INSPECTOR_NETWORK_DENIAL url="));
  assert.ok(workflow.includes("cf_mitigated="));
  assert.ok(workflow.includes("403|429|000)"));
  assert.ok(workflow.includes("UNVERIFIED url="));
  assert.ok(workflow.includes("independent browser confirmation required"));
});

test("Runner bot challenges no longer open or reopen stale issues",()=>{
  const begin=workflow.indexOf("- name: Report unverified runner routes without reopening stale incidents");
  const finish=workflow.indexOf("\n  deep-browser-inspection:",begin);
  assert.ok(begin>0 && finish>begin);
  const step=workflow.slice(begin,finish);
  assert.ok(step.includes("steps.routes.outputs.all_verified == 'false'"));
  assert.ok(step.includes("GITHUB_STEP_SUMMARY"));
  assert.doesNotMatch(step,/gh issue (create|comment|close|reopen)/);
  assert.doesNotMatch(step,/GH_TOKEN/);
});

test("Confirmed route and browser failures still open actionable incidents",()=>{
  assert.ok(workflow.includes("- name: Open or update route incident"));
  assert.ok(workflow.includes("if: failure()"));
  assert.ok(workflow.includes("- name: Open or update browser incident"));
  assert.ok(workflow.includes("gh issue create"));
  assert.ok(workflow.includes('exit "$failed"'));
});
