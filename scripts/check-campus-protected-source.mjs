// Founder 2026-11-13: independent public school tour; protected .org identity and student systems unchanged.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const home=read("index.html"),redirect=read("university.html");
const legacy=read("university-enrollment.html"),campus=read("campus.html"),alias=read("university-campus.html"),header=read("nbl-world-header.js");
const chat=read("chat.html"),realtime=read("social-realtime.js");
assert.ok(home.includes('class="world-card official-art reveal" href="https://nblschool.com/"'));
assert.ok(redirect.includes("https://nblschool.com/"));
assert.ok(!redirect.includes("data-nbl-university-interest-form"));
assert.ok(!redirect.includes("billing/checkout"));
assert.ok(!redirect.includes("nblu-one-entry"));
assert.ok(!redirect.includes("/billing/checkout"));
assert.ok(legacy.includes("url=https://nblschool.com/"));
for(const page of [campus,alias]){
 assert.ok(page.includes("https://nblschool.com/"));
 assert.ok(!page.includes("data-coursework-pdf"));
}
assert.ok(header.includes('["university","University","/university.html",false]'));
assert.ok(!header.includes('class="nbl-chat-drawer-item nbl-beans-grey-link"'));
assert.ok(chat.includes("data-chat-guest"));
assert.ok(chat.includes("data-chat-app hidden"));
assert.ok(realtime.includes("config:{private:true}"));
console.log("PASS protected University kept closed; public navigation goes to school campus only");
