import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const js=readFileSync(new URL("../nbl-world-header.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../nbl-beans-experience.css",import.meta.url),"utf8");
test("drawer tool opener does not bubble into outside click closer",()=>{assert.match(js,/chatDrawerTools\?\.addEventListener\("click",event=>\{\s*event\.stopPropagation\(\);\s*setChatDrawerOpen\(false\);\s*setBeansToolMenu\(true\)/)});
test("desktop sidebar follows explicit disclosure state",()=>{assert.match(js,/chatDrawer\.hidden=!open;\s*chatDrawer\.inert=!open/);assert.match(js,/chatDrawer\.classList\.toggle\("is-open",open\)/);assert.match(css,/nbl-desktop-drawer-open #nbl-chat-panel-beans/);assert.match(css,/nbl-chat-drawer-toggle\{display:inline-flex\}/)});
test("Canva entry and existing connector remain available",()=>{assert.match(js,/data-nbl-tool="still-canva"/);assert.match(js,/operation:"canva_create_design"/);assert.match(js,/operation:"canva_begin"/)});
