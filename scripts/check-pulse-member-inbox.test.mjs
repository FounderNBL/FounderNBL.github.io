import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const panel=read("pulse/member-inbox.mjs");
const pulse=read("pulse/index.html");
const app=read("messenger/social-v1.mjs");
const service=read("supabase/functions/nbl-social/index.ts");
test("Pulse native member messages reuse existing NBL authenticated service",()=>{
 for(const action of ['list_threads','list_messages','direct','send'])
  assert.match(service,new RegExp('action==="'+action+'"'));
 assert.match(app,/mountMemberInbox\(payload=>secured\(SOCIAL_API,payload\),/);
 assert.match(panel,/invoke\(body\)/);
 assert.match(panel,/action:"list_threads"/);
 assert.match(panel,/action:"list_messages"/);
 assert.match(panel,/action:"direct"/);
 assert.match(panel,/action:"send"/);
 assert.match(panel,/thread_type==="direct"/);
});
test("Pulse message buttons and direct links stay within Pulse",()=>{
 assert.match(pulse,/id="pulseMemberInboxNav"/);
 assert.match(pulse,/id="pulseMemberInbox"/);
 assert.match(pulse,/id="pulseMemberThreads"/);
 assert.match(pulse,/id="pulseMemberReplyForm"/);
 assert.match(pulse,/id="pulseInstagramInbox"/);
 assert.match(app,/showPulseMemberInbox\(item.handle\)/);
 assert.match(app,/showPulseMemberInbox\(handle\)/);
 assert.match(app,/parameters.get\("messages"\)==="1"/);
 assert.doesNotMatch(pulse,/iframe id="pulseMessengerFrame"/);
});
test("Pulse DMs are never placed in public feed or used for Meta messaging",()=>{
 assert.match(panel,/document\.createElement\(tag\)/);
 assert.match(panel,/textContent=String\(text\)/);
 assert.doesNotMatch(panel,/innerHTML|localStorage|sessionStorage|fetch\(|STREAM_BRIDGE|META_COMMUNITY_API|instagram_business/);
 assert.match(service,/thread_access_denied/);
 assert.match(service,/student_contact_restricted/);
 assert.match(service,/blocked/);
});
