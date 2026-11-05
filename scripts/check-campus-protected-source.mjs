// .org is a University cashier, not an academic campus. The actual school has its
// own source, Worker, identity and release checks in FounderNBL/NBL-University.
// This gate verifies the web-domain boundary and existing billing guardrails.
// It does NOT claim production school-origin sign-in or coursework E2E proof.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const home=read("index.html"),admissions=read("university.html");
const billing=read("university-storefront.js"),oldTuition=read("university-enrollment.html");
const campus=read("campus.html"),alias=read("university-campus.html");
const header=read("nbl-world-header.js");
const chat=read("chat.html"),realtime=read("social-realtime.js");
assert.match(home,/href="university\.html"/);
assert.match(admissions,/id="nblu-one-entry"/);
assert.match(admissions,/https:\/\/nblschool\.com\//);
assert.doesNotMatch(admissions,/nbl-world-header\.js|data-campus-gate|data-campus hidden|Study Hall|Class Chat|Grey classroom/i);
assert.match(oldTuition,/url=https:\/\/newbeansland\.org\/university\.html#enroll/);
for(const page of [campus,alias]){
 assert.match(page,/http-equiv="refresh" content="0;url=https:\/\/nblschool\.com\//);
 assert.doesNotMatch(page,/data-campus-gate|data-campus hidden|data-social-dm-handle|data-school-office/);
}
// Beans no longer exposes Professor Grey as a chat shortcut; the independent school link is on the admissions page.
assert.doesNotMatch(header,/class="nbl-chat-drawer-item nbl-beans-grey-link"/);
assert.match(admissions,/https:\/\/nblschool\.com\//);
assert.match(chat,/data-chat-guest/);
assert.match(chat,/data-chat-app hidden/);
assert.match(realtime,/config:{private:true}/);
// These options are independent and have distinct Stripe price objects.
for(const key of ["foundation","foundation_university","full_foundation","full_nblu_diy","full_nblu","beans_university_monthly","foundation_student_continuation","nblu_continuation"]){
 assert.ok(admissions.includes('value="'+key+'"'),"Missing offer: "+key);
}
for(const mapped of ['plan:"foundation"','plan:"full_foundation"','plan:"full_nblu"','plan:"nblu_continuation"']){
 assert.ok(billing.includes(mapped),"Existing server billing handoff missing: "+mapped);
}
for(const held of ["full_nblu_diy","foundation_university","beans_university_monthly","foundation_student_continuation"]){
 assert.match(billing,new RegExp(held+':\\{[\\s\\S]*?plan:null'),"Non-wired plan must not charge: "+held);
}
assert.match(billing,/if\(!item\.plan\)/);
assert.match(billing,/trustedStripe/);
assert.match(billing,/nbl-chat-gateway/);
for(const secret of ["STRIPE_SECRET_KEY","SUPABASE_SERVICE_ROLE_KEY","OPENAI_API_KEY","sk-proj-"]){
 assert.ok(!billing.includes(secret),"Public admissions must not expose "+secret);
}
console.log("PASS: one NBL University admissions and payment door on .org, school.com academic routing and held checkout boundaries. School-origin E2E belongs to school CI.");
