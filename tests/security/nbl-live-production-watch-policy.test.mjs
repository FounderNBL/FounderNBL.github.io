import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const workflow = readFileSync(".github/workflows/nbl-live-production-watch.yml", "utf8");
const routeInspection = workflow.split("  deep-browser-inspection:")[0];

test("runner route recovery cannot close live route incidents", () => {
  assert.doesNotMatch(routeInspection, /name: Confirm route recovery/);
  assert.deepEqual(
    routeInspection.match(/^\s+gh issue close .+$/gm),
    ['            gh issue close "$old" --repo "$GITHUB_REPOSITORY"'],
  );
});

test("Cloudflare preflight must precede ALL external Inspector visits",()=>{
  assert.match(workflow,/jobs:\s*\n  cloudflare-preflight:/);
  assert.equal((workflow.match(/needs: cloudflare-preflight/g)||[]).length,2);
  assert.match(workflow,/node scripts\/nbl-cloudflare-handshake\.mjs/);
  assert.match(workflow,/actions\/download-artifact@v7/);
  assert.match(workflow,/CLOUDFLARE_HANDSHAKE/);
  assert.doesNotMatch(workflow,/cloudflare\.request\(|skip_waf|bypass_challenge|security_level:.*off/i);
});

test("reuse canonical Cloudflare Inspector credential, never require a duplicate secret",()=>{
  assert.match(workflow,/secrets\.NBL_CLOUDFLARE_INSPECTOR_TOKEN\s*\|\|\s*secrets\.CLOUDFLARE_NBL_INSPECTOR_TOKEN/);
  assert.doesNotMatch(workflow,/run:\s*.*echo.*\$\{\{\s*secrets\./);
});
