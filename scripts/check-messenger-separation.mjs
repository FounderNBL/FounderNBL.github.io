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
assert.match(website, /href="\/pulse\//);
assert.match(website, /class="nav-pulse-launch"/);
assert.doesNotMatch(website, /people talking to people/i);
assert.match(website,/class="world-card messenger-world-card/);
assert.match(website,/href="\/messenger\/"/);
assert.ok(website.includes('src="https://cdn.shopify.com/s/files/1/1014/2230/1474/files/NBL_Messenger_Beans_Worldcard.jpg?v=1794414396"'),"Messenger homepage card should use Founder-approved Beans artwork");
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
assert.doesNotMatch(app, /pulse-embedded|iframe/);
assert.match(app,/href="\/messenger\/messenger-skin.css\?v=20261109-standalone"/);
assert.match(app,/data-chat-app hidden/);
assert.match(app, /data-chat-profile-form/);
assert.match(app, /data-chat-open-clerk/);
assert.match(app, /data-chat-download-messages/);
// Hosted account profile is the reliable path for Facebook/Google connection management.
assert.ok(!js.includes("openUserProfile("), "The broken embedded Clerk profile action must not be used");
assert.ok(js.includes('location.assign(ACCOUNT_PORTAL+"/user?redirect_url="+encodeURIComponent(returnUrl));'),
  "Manage connections must navigate to the hosted Clerk profile and back to Messenger");
assert.ok(app.includes('/messenger/app.js?v=20261109-live-ringing'),
  "Pulse Messenger must load the current account and call handler");
assert.match(js, /accountRequest\("profile"/);
assert.match(js, /filter\(row=>row\.thread_type==="direct"\)/);
assert.match(js, /callButton.hidden=!ready\|\|state.selected\?\.thread_type!=="direct"/);
assert.match(js, /const callWindow=window\.open\("","_blank"\)/);
assert.match(js, /callWindow\.location\.replace\(callerUrl\.href\)/);
assert.doesNotMatch(js,/callButton\.hidden[^;]*state\.me\?\.role/);
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
assert.match(sw, /nbl-messenger-shell-20261109-live-ringing/);
assert.match(sw,/messenger\/messenger-skin.css/);


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
assert.match(sw,/new URL\(target,self.location.origin\)/);
assert.doesNotMatch(sw,/event\.data\?\.json\(\)[\s\S]*token/);
assert.doesNotMatch(app,/type="file"/);

// Pulse Messenger keeps the Facebook business Page inbox off the personal chat screen.
assert.doesNotMatch(app,/data-chat-meta-page|Facebook Page inbox/);
assert.ok(!js.includes("metaPageRequest")&&!js.includes("nbl-meta-page-inbox"),"Business Page inbox must not ship in personal Messenger");
assert.ok(js.includes('searchParams.get("dm")'),"Pulse member message link handoff lost");
assert.ok(js.includes("const suggested=pulseMessageIntent()"),"Pulse suggested recipient lost");
assert.ok(js.includes("Press Open to start the private conversation"),"Explicit member action required");
assert.ok(!js.includes('action:"direct",handle:suggested'),"A link must never auto-create a private conversation");
assert.ok(app.includes('href="/pulse/"'),"Pulse navigation lost");
assert.match(app,/NBL Messenger/);
assert.equal(manifest.name,"NBL Messenger");
console.log("PASS: NBL Messenger independent app, direct social runtime, protected University, and legacy routing and authentic early-member invites and customer phone alerts preserved without Founder controls.");

const callPage=read("messenger/call.html"), callJs=read("messenger/call.mjs");
assert.match(app,/data-chat-video-call hidden/);
assert.match(js,/async function startVideoCall\(\)/);
assert.match(js,/action:"start",threadId/);
assert.doesNotMatch(js,/action:"send",threadId,message:"NBL video call invitation: "/);
assert.match(js,/callerUrl\.searchParams\.set\("outgoing","1"\)/);
assert.match(js,/incomingRingTimer=setInterval/);
assert.match(sw,/action:"decline",title:"Decline"/);
assert.match(read("messenger/call.mjs"),/params\.get\("decline"\)==="1"/);
assert.match(js,/IS_CALL_ID/);
assert.match(callPage,/id="microphone"/);
assert.match(callPage,/id="camera"/);
assert.match(callPage,/id="leave"/);
assert.match(callJs,/videoRequest\("join"\)/);
assert.match(callJs,/const PRIVATE_CALL_TYPE="nbl_private"/);
assert.match(callJs,/access\.callType!==PRIVATE_CALL_TYPE/);
assert.match(callJs,/client\.call\(PRIVATE_CALL_TYPE,callId\)/);
assert.doesNotMatch(callJs,/client\.call\(access\.callType,callId\)|client\.call\("default"/);
assert.match(callPage,/NBL Private · Member-only video/);
assert.match(callPage,/call\.mjs\?v=20261109-live-ringing/);
assert.doesNotMatch(js,/STREAM_API_SECRET|VIDEO_SECRET/);
console.log("PASS: NBL Messenger draft video invitation uses direct chats and secured call service.");
