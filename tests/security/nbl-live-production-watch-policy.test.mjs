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
