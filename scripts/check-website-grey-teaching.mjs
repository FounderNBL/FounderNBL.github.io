import fs from "node:fs";
import assert from "node:assert/strict";

const js=fs.readFileSync("nbl-world-header.js","utf8");
const modes=["explain","socratic","worked_example","misconception","practice","exit_ticket","review_plan","source_walkthrough"];
for(const id of modes){
 assert.ok(js.includes('<option value="'+id+'">'),"Missing Professor Grey tool: "+id);
}
assert.ok(js.includes('data-nbl-grey-teaching-tool'),"Grey mode selector missing");
assert.ok(js.includes('const teachingTool=plusTeachingTool?.value||""'),"Selected tool not bound to session");
assert.ok(js.includes('mode:"guided_learning",teachingTool,'),"Tool not forwarded to existing protected Grey route");
assert.ok(js.includes('if(plusTeachingTool) plusTeachingTool.disabled=true;'),"Multiple concurrent tool submissions not disabled");
assert.ok(js.includes('if(plusTeachingTool) plusTeachingTool.disabled=false;'),"Grey tool selector never recovers on failure");
const panel=js.indexOf('data-nbl-plus-live'),picker=js.indexOf('data-nbl-grey-teaching-tool');
assert.ok(panel>=0&&picker>panel,"Grey tools must stay inside the protected University view");
assert.ok(js.includes("refreshPlusAccess"),"Grey enrollment authorization has been removed");
assert.ok(js.includes("showPlusLocked"),"Grey access lock has been removed");
assert.ok(js.includes('mode:"beans"'),"Beans and Grey modes have been collapsed");
console.log("[website-grey-tools] PASS: eight protected teaching modes use the existing signed-in University rail.");
