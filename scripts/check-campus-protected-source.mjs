// Founder 2026-11-13: independent public school tour; protected .org identity and student systems unchanged.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const home=read("index.html"),redirect=read("university.html");
const legacy=read("university-enrollment.html"),campus=read("campus.html"),alias=read("university-campus.html"),header=read("nbl-world-header.js");
const chat=read("chat.html"),realtime=read("social-realtime.js");
// Validate the complete HTTPS redirect target, not a substring an attacker-controlled host could contain.
const schoolUrl="https://nblschool.com/";
const assertSchoolRedirect=(page,document)=>{
 const refresh=document.match(/<meta\s+http-equiv="refresh"\s+content="0;url=([^"]+)">/i);
 assert.ok(refresh, `${page}: missing school redirect`);
 assert.equal(new URL(refresh[1]).href,schoolUrl,`${page}: redirect must use the official school origin`);
 assert.match(document,/<link rel="canonical" href="https:\/\/nblschool\.com\/">/);
 assert.match(document,/<a href="https:\/\/nblschool\.com\/">/);
};
assert.match(home,/class="world-card official-art reveal" href="https:\/\/nblschool\.com\/"/);
assertSchoolRedirect("university.html",redirect);
// The old substring test would accept an attacker URL with the school URL inside its query string.
assert.throws(
 ()=>assertSchoolRedirect("unsafe alternate host",'<meta http-equiv="refresh" content="0;url=https://attacker.invalid/?next=https://nblschool.com/">'),
 /official school origin/
);
assert.ok(!redirect.includes("data-nbl-university-interest-form"));
assert.ok(!redirect.includes("billing/checkout"));
assert.ok(!redirect.includes("nblu-one-entry"));
assert.ok(!redirect.includes("/billing/checkout"));
assertSchoolRedirect("university-enrollment.html",legacy);
for(const page of [campus,alias]){
 assertSchoolRedirect("campus alias",page);
 assert.ok(!page.includes("data-coursework-pdf"));
}
assert.ok(header.includes('["university","University","/university.html",false]'));
assert.ok(!header.includes('class="nbl-chat-drawer-item nbl-beans-grey-link"'));
assert.ok(chat.includes("data-chat-guest"));
assert.ok(chat.includes("data-chat-app hidden"));
assert.ok(realtime.includes("config:{private:true}"));
console.log("PASS protected University kept closed; public navigation goes to school campus only");
