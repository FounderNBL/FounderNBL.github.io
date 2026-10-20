import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read=p=>fs.readFileSync(new URL("../"+p,import.meta.url),"utf8");
const css=read("nbl-world-header.css");
const js=read("nbl-world-header.js");
test("Beans uses the character inside the conversation, not as a separate image card",()=>{
 assert.match(js,/class="nbl-beans-presence"/);
 assert.match(js,/class="nbl-beans-log"/);
 assert.match(css,/#nbl-chat-panel-beans \.nbl-beans-presence\s*\{[^}]*position:absolute/s);
 assert.match(css,/#nbl-chat-panel-beans \.nbl-beans-log\s*\{[^}]*background:rgba/s);
});
test("Beans + menu is initially hidden and stays near the composer until tapped",()=>{
 assert.match(js,/data-nbl-tools-menu hidden/);
 assert.match(js,/beansToolsToggle\.addEventListener\("click",\(\)=>setBeansToolMenu\(beansToolsMenu.hidden\)\)/);
 assert.match(css,/#nbl-chat-panel-beans \.nbl-beans-tools-menu\s*\{[^}]*position:absolute;[^}]*bottom:calc\(100% \+ 9px\)/s);
 assert.match(js,/setBeansToolMenu\(false\); \/\/ Reopening Beans/);
 assert.match(js,/event.key==="Escape"&&!beansToolsMenu.hidden/);
});
test("Grey stays locked while official artwork is displayed only behind protected teaching",()=>{
 assert.match(js,/data-nbl-plus-live hidden/);
 assert.match(js,/data-nbl-plus-access/);
 assert.match(css,/\[data-nbl-plus-live\]::before\s*\{[^}]*Professor_Grey\.png/s);
 const campus=read("university-campus.css");
 assert.match(campus,/#grey > \.panel:first-child::before\s*\{[^}]*Professor_Grey\.png/s);
 assert.match(read("university-campus.html"),/data-grey-log/);
});
test("fresh cache keys load new styles and scripts on real entry pages",()=>{
 assert.match(read("index.html"),/20261020-v12-beans-backdrop/);
 assert.match(read("index.html"),/20261020-v12-plus-menu/);
 assert.match(read("university-campus.html"),/20261020-grey-backdrop/);
});
