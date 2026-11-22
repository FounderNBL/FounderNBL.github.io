import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const r=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const html=r("pulse/index.html"),ui=r("pulse/redesign.mjs"),css=r("pulse/pulse-redesign.css"),live=r("pulse/live.mjs");
const ids=[...html.matchAll(/\\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,"duplicate DOM IDs");
for(const id of ["pulseUnifiedInbox","pulseMemberInbox","pulseInstagramInbox","pulseLive","pulseLiveScreenOnly","pulseLiveCameraToggle","pulseLiveDestination","pulseComposerSheet","postForm","pulseBottomBar","pulseMenuView","pulseLiveView","pulseSearch","pulseLiveNow"]){assert.equal(ids.filter(x=>x===id).length,1,"missing/duplicate "+id)}
assert.match(html,/pulse\/tiktok-callback\.html/);
assert.doesNotMatch(html,/<iframe|pulseMessengerFrame/);
assert.match(live,/const slot = \$\("#pulseLiveView"\)/);
assert.match(ui,/pulseUnifiedInboxNav/);
assert.match(ui,/pulse-appearance/);
assert.doesNotMatch(ui,/fetch\s*\(/);
assert.match(css,/html\[data-theme="dark"\]/);
console.log("Muse Pulse website reconciliation: source invariants PASS");
