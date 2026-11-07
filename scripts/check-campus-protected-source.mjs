// Founder 2026-11-07: School closed; this gate confirms no public admissions cashier.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const home=read("index.html"),admissions=read("university.html");
const legacy=read("university-enrollment.html"),campus=read("campus.html");
const alias=read("university-campus.html"),header=read("nbl-world-header.js");
const chat=read("chat.html"),realtime=read("social-realtime.js");
assert.ok(home.includes('href="university.html"'));
assert.ok(admissions.includes("school is under construction"));
assert.ok(admissions.includes("data-nbl-university-interest-form"));
assert.ok(admissions.includes("https://nblschool.com/"));
assert.ok(!admissions.includes("nblu-one-entry"));
assert.ok(!admissions.includes("/billing/checkout"));
assert.ok(legacy.includes("university.html#early-registration"));
for(const page of [campus,alias]){
  assert.ok(page.includes("https://nblschool.com/"));
  assert.ok(!page.includes("data-coursework-pdf"));
}
assert.ok(!header.includes('class="nbl-chat-drawer-item nbl-beans-grey-link"'));
assert.ok(chat.includes("data-chat-guest"));
assert.ok(chat.includes("data-chat-app hidden"));
assert.ok(realtime.includes("config:{private:true}"));
console.log("PASS: closed University entry is free-only; protected school domain remains separate.");
