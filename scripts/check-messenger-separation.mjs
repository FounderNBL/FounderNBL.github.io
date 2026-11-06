// NBL Messenger: source-only release gate. Does not access user content.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read = p => readFileSync(new URL("../" + p, import.meta.url), "utf8");
const app = read("messenger/index.html");
const js = read("messenger/app.js");
const manifest = JSON.parse(read("messenger/manifest.webmanifest"));
const sw = read("messenger/sw.js");
const university = read("university-campus.html");
const oldHumanChat = read("member-chat.html");
const website = read("index.html");

assert.match(app, /<h1>[\s\S]*?NBL Messenger<\/h1>/);
assert.match(app, /href="\/messenger\/manifest.webmanifest"/);
assert.match(app, /src="\/messenger\/app.js/);
assert.match(app, /data-chat-find-form/);
assert.match(app, /data-chat-send-form/);
assert.match(app, /nbl-infinity-sound.js/);
assert.equal(manifest.scope, "/messenger/");
assert.equal(manifest.display, "standalone");

assert.match(js, /functions\/v1\/nbl-social/);
assert.doesNotMatch(js, /const NBL_CORE_API/);
assert.doesNotMatch(js, /nbl-chat-gateway|beans-public|\bcredit\.debit\b/);
for(const action of ['"list_threads"','"list_messages"','"find_users"','"direct"','"send"','"block"','"report"']){
  assert.ok(js.includes(action), `Existing human messaging action lost: ${action}`);
}
assert.match(sw, /NEVER cache identity, messages, or Supabase responses/);
assert.match(sw, /event.request.method !== "GET"/);
assert.match(sw, /SHELL.includes\(url.pathname\)/);
assert.doesNotMatch(sw, /functions\/v1|clerk\.newbeansland\.org/);

// Messenger and independent school are separate websites. Old .org campus redirects.
assert.match(university, /url=https:\/\/nblschool\.com\//);
assert.match(oldHumanChat, /data-chat-send-form/); // old bookmarks still work
assert.match(website, /href="\/messenger\//);
assert.match(website, /class="nav-messenger-launch"/);
assert.match(website, /src="\/messenger\/icon\.svg"/);
assert.match(app, /data-chat-featured-founder hidden/);
assert.match(js, /action:"find_users",q:"NBLFounderOfficial"/);
assert.match(js, /user\.verified===true/); // discoverable without Beans

// A zero-thread inbox is NOT proof that nobody else has registered.
// Welcome existing verified Founder without inventing fake member profiles.
assert.match(app, /data-chat-invite hidden/);
assert.match(app, /data-chat-share-invite/);
assert.match(app, /data-chat-copy-invite/);
assert.match(app, /data-chat-handle-setup hidden/);
assert.match(app, /data-chat-founder-marker hidden/);
// Private campus remains separate; none of its promotional breadcrumbs appear in Messenger.
assert.doesNotMatch(app, /Class Chat|Study Hall|Student rooms|University Social Chat|University enrollment|university-campus\.html/);
assert.match(app, /data-chat-account-toggle/);
assert.match(app, /data-chat-profile-form/);
assert.match(app, /data-chat-open-clerk/);
assert.match(app, /data-chat-download-messages/);
// Hosted account profile is the reliable path for Facebook/Google connection management.
assert.ok(!js.includes("openUserProfile("), "The broken embedded Clerk profile action must not be used");
assert.ok(js.includes('location.assign(ACCOUNT_PORTAL+"/user?redirect_url="+encodeURIComponent(returnUrl));'),
  "Manage connections must navigate to the hosted Clerk profile and back to Messenger");
assert.ok(app.includes('/messenger/app.js?v=20261105-stage1'),
  "Messenger must load the new account navigation handler");
assert.match(js, /accountRequest\("profile"/);
assert.match(js, /filter\(row=>row\.thread_type==="direct"\)/);
assert.match(js, /Recent direct messages only: up to 200 threads and the latest 100 messages per thread/);
assert.match(app, /href="\/account\.html"/);
assert.match(js, /const INVITE_URL="https:\/\/newbeansland\.org\/messenger\/index\.html"/);
assert.match(js, /const founder=state\.me\?\.role==="founder"/);
assert.match(js, /if\(invite\)invite\.hidden=!empty/);
assert.match(js, /await navigator\.share\(/);
assert.match(js, /navigator\.clipboard\?\.writeText/);
assert.ok(js.includes('$("[data-chat-invite]").hidden=true;'), "Account switch must hide prior account welcome");
assert.match(js, /navigator\.contacts\?\.select/);
assert.doesNotMatch(app, /type="file"/);
assert.match(sw, /nbl-messenger-shell-20261105-stage1/);


for(const item of [
 "data-chat-notification-settings",
 "data-chat-notify-enable",
 "data-chat-notify-disable",
 "data-chat-notify-preview",
 "nbl-infinity-sound.js"
])assert.ok(app.includes(item),"Phone notification UI lost: "+item);
for(const item of [
 'action:"push_config"',
 'action:"push_subscribe"',
 'action:"push_unsubscribe"',
 'reg.pushManager.subscribe({',
 'await reg.showNotification(',
 'window.Notification.requestPermission()',
 'await forgetPushForDifferentAccount(userId)',
 'await disablePhonePush()'
])assert.ok(js.includes(item),"Phone push workflow lost: "+item);
// Founder operations are not shipped in the customer-facing Messenger HTML or JS.
for(const forbidden of ["data-chat-notification-founder","notification-founder","Founder controls","push_template_set","saveFounderPhoneTemplate"]){
 assert.ok(!app.includes(forbidden),"Public Messenger HTML exposes an internal form: "+forbidden);
 assert.ok(!js.includes(forbidden),"Public Messenger JS exposes internal control code: "+forbidden);
}
assert.match(app,/data-chat-notification-settings hidden/);
assert.match(js,/window.NBLInfinitySound\?\.play\("people"\)/);
assert.match(sw,/self.addEventListener\("push"/);
assert.match(sw,/self.addEventListener\("notificationclick"/);
assert.match(sw,/new URL\("\/messenger\/",self.location.origin\)/);
assert.doesNotMatch(sw,/event\.data\?\.json\(\)[\s\S]*token/);
assert.doesNotMatch(app,/type="file"/);

// Meta Page inbox uses Founder verification, not a second NBL identity.
assert.match(app,/data-chat-meta-page hidden/);
assert.match(app,/data-chat-meta-threads/);
assert.match(js,/functions\/v1\/nbl-meta-page-inbox/);
assert.match(js,/state\.me\?\.role!=="founder"/);
assert.match(js,/metaPageRequest\("reply"/);
assert.match(js,/stateResult\.receivedPageMessage/);
assert.match(js,/no Facebook Page message has arrived through the verified webhook/);
assert.doesNotMatch(js,/NBL_META_PAGE_ACCESS_TOKEN|NBL_META_APP_SECRET/);
console.log("PASS: NBL Messenger independent app, direct social runtime, protected University, and legacy routing and authentic early-member invites and customer phone alerts preserved without Founder controls.");

const callPage=read("messenger/call.html"), callJs=read("messenger/call.mjs");
assert.match(app,/data-chat-video-call hidden/);
assert.match(js,/async function startVideoCall\(\)/);
assert.match(js,/action:"start",threadId/);
assert.match(js,/action:"send",threadId,message:"NBL video call invitation: "/);
assert.match(js,/IS_CALL_ID/);
assert.match(callPage,/id="microphone"/);
assert.match(callPage,/id="camera"/);
assert.match(callPage,/id="leave"/);
assert.match(callJs,/videoRequest\("join"\)/);
assert.doesNotMatch(js,/STREAM_API_SECRET|VIDEO_SECRET/);
console.log("PASS: NBL Messenger draft video invitation uses direct chats and secured call service.");
