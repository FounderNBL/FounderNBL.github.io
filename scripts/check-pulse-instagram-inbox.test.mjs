import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const api=read("server/supabase/functions/nbl-instagram-connect/index.ts");
const ui=read("pulse/index.html");
const panel=read("pulse/instagram-inbox.mjs");
const social=read("messenger/social-v1.mjs");
test("Instagram Direct API stays founder-only and requires browser Origin",()=>{
 assert.match(api,/async function privateInbox\(/);
 assert.match(api,/if\(!ORIGINS\.has\(origin\)\)/);
 assert.match(api,/const actor=await founderUser\(req\)/);
 assert.match(api,/if\(!actor\)return response\(req,\{ok:false,reason:"founder_access_required"\},403\)/);
 assert.match(api,/const ig=await officialInstagramInboxAccount\(grant\.token\)/);
 assert.match(api,/if\(!owner\|\|others\.length!==1/);
 assert.match(api,/reason:"conversation_not_owned"/);
 assert.match(api,/if\(body\.confirm!=="send"/);
 assert.match(api,/reason:"instagram_dm_reply_window_closed"/);
 assert.match(api,/Date\.now\(\)-lastInbound<=24\*60\*60\*1000/);
 assert.match(api,/https:\/\/"\+ig\.host\+"\/"\+VERSION/);
 assert.match(api,/ig\.host==="graph\.facebook\.com"\?ig\.pageId:ig\.id/);
 assert.doesNotMatch(api,/console\.(log|warn|error)\([^\n]*(message|token|raw|body)\b/i);
});
test("Instagram Inbox reads Meta conversations and messages with no DM persistence",()=>{
 assert.match(api,/inboxId\+"\/conversations"/);
 assert.match(api,/encodeURIComponent\(conversationId\)\+"\/messages"/);
 assert.match(api,/safeMessage/);
 assert.match(api,/async function founderInboxToken\(userId:string\)/);
 assert.match(api,/\.eq\("clerk_user_id",userId\)\.eq\("provider","instagram"\)/);
 assert.match(api,/crypto\.subtle\.decrypt\(/);
 assert.match(api,/const grant=await founderInboxToken\(actor\)/);
 assert.match(api,/if\(!grant\.token\)/);
 assert.match(api,/async function officialInstagramAccount\(accessToken=INSTAGRAM_TOKEN\)/);
 assert.match(api,/instagram_authorization_received/);
 assert.match(api,/reply_window_open:replyWindowOpen/);
 assert.match(api,/processing:"inbox_polling"/);
 assert.doesNotMatch(api,/nbl_ig_dm_messages|nbl_ig_dm_threads/);
});
test("Pulse Founder inbox is on the Pulse page with a separate NBL Messenger link",()=>{
 assert.match(ui,/id="pulseInstagramInboxNav"/);
 assert.match(ui,/id="pulseInstagramInbox"/);
 assert.match(ui,/id="pulseIgConversations"/);
 assert.match(ui,/id="pulseIgThread"/);
 assert.match(ui,/id="pulseIgReplyForm"/);
 assert.match(ui,/id="pulseIgClose"/);
 assert.match(ui,/id="pulseIgRefresh"/);
 assert.match(ui,/id="pulseIgConnect"/);
 assert.match(panel,/invoke\("\/begin",\{\}\)/);
 assert.match(panel,/location\.assign\(url\.href\)/);
 assert.match(social,/parameters\.get\("instagram_dm"\)==="1"/);
 assert.match(api,/instagram_dm=1&instagram_connect=/);
 assert.doesNotMatch(panel,/messaging permission is not approved for this connected account\/app/);
 assert.doesNotMatch(ui,/href="\/messenger\/"/);
 assert.match(ui,/social-v1\.mjs\?v=20261121-single-social-v1/);
 assert.match(social,/import \{mountInstagramInbox\} from "\.\.\/pulse\/instagram-inbox\.mjs/);
 assert.match(social,/if\(state\.me\?\.role==="founder"&&location\.pathname\.startsWith\("\/pulse"\)\)/);
 assert.match(social,/mountInstagramInbox\(\(path,payload\)=>secured\(INSTAGRAM_API\+path,payload\)\)/);
});
test("Only explicit sends can message; no demo fakes, leaked tokens or HTML injection",()=>{
 assert.match(panel,/window\.confirm\("Send this private reply/);
 assert.match(panel,/confirm:"send"/);
 assert.match(panel,/invoke\("\/inbox\/"\+path,payload\)/);
 assert.match(panel,/document\.createElement\(tag\)/);
 assert.match(panel,/textContent=String\(text\)/);
 assert.doesNotMatch(panel,/innerHTML|localStorage|sessionStorage|console\.log|autoReply|fakeMessage|testMessage/);
 assert.match(panel,/document\.visibilityState==="visible"/);
 assert.match(panel,/window\.setInterval/);
});

test("OAuth state is one-time, tied to Founder and lasts through Meta business selection",()=>{
 assert.match(api,/Date\.now\(\)\+60\*60\*1000/,"Allow one hour for existing asset selection");
 assert.match(api,/state_hash:hashed,provider:"instagram",clerk_user_id:id/);
 assert.match(api,/\.eq\("state_hash",hashed\)\.eq\("provider","instagram"\)\.is\("consumed_at",null\)/);
 assert.match(api,/\.gt\("expires_at",now\)/);
 assert.match(api,/auth_type:"rerequest"/,"Re-request permissions when the config has been corrected");
 assert.match(api,/config_id:CONFIG_ID/,"Use the existing Business Login config rather than a second Instagram app");
 assert.doesNotMatch(api,/url\.searchParams\.set\("scope"/,"Business Login config_id is the permission authority");
});
test("Meta Business Login Instagram messaging grant is checked and recorded without leaking secrets",()=>{
 assert.match(api,/REQUIRED_DM_PERMISSION="instagram_manage_messages"/);
 assert.match(api,/async function inspectMessagingGrant\(token:string\)/);
 assert.match(api,/graph\.facebook\.com\/"\+VERSION\+"\/me\/permissions/);
 assert.match(api,/authorization":"Bearer "\+token/);
 assert.match(api,/messaging:dmGrant\.status,required_messaging_permission:REQUIRED_DM_PERMISSION/);
 assert.match(api,/granted_scopes:dmGrant\.granted/);
 assert.match(api,/dmGrant\.status==="missing"\?"instagram_dm_permission_missing":"instagram_authorization_received"/);
 assert.match(api,/data\.permissions\?\.messaging==="missing"/);
 assert.match(api,/reason:"instagram_dm_permission_missing"/);
 assert.doesNotMatch(api,/console\.(log|warn|error)\(/,"OAuth state, user tokens and message contents stay out of logs");
});
test("Pulse inbox explains Meta permission remediation without claiming a real DM exchange",()=>{
 assert.match(panel,/instagram_dm_permission_missing:/);
 assert.match(panel,/instagram_manage_messages is missing from the existing Facebook Login for Business configuration/);
 assert.match(panel,/Press Refresh inbox to verify messaging access/);
 assert.match(panel,/connected==="instagram_dm_permission_missing"/);
 assert.doesNotMatch(panel,/instagram_business_manage_messages/,"Do not mix Instagram Login and Facebook Login scopes");
});

test("Instagram Facebook Login inbox uses the verified linked Page token and opaque safe IDs",()=>{
 assert.match(api,/async function officialInstagramInboxAccount/);
 assert.match(api,/page\.access_token,via:"page",pageId/);
 assert.match(api,/instagram_business_account\{id,username\}/);
 assert.match(api,/const inboxId=ig\.host==="graph\.facebook\.com"\?ig\.pageId:ig\.id/);
 assert.match(api,/params\.platform="instagram"/);
 assert.match(api,/graphInboxRead\(encodeURIComponent\(conversationId\)/);
 assert.match(api,/ownIds\.has\(String\(p\?\.id/);
 assert.match(panel,/instagram_dm_page_access_required:/);
});
