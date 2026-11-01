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

assert.match(app, /<h1>NBL Messenger<\/h1>/);
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

// The separate Messenger app must not remove protected student rooms.
assert.match(university, /id="nbl-social"/);
assert.match(university, /\/messenger\//);
assert.match(university, /Professor Grey/);
assert.match(university, /study.hall/i);
assert.match(oldHumanChat, /data-chat-send-form/); // old bookmarks still work
assert.match(website, /href="\/messenger\//); // discoverable without Beans

// A zero-thread inbox is NOT proof that nobody else has registered.
// Welcome existing verified Founder without inventing fake member profiles.
assert.match(app, /data-chat-invite hidden/);
assert.match(app, /data-chat-share-invite/);
assert.match(app, /data-chat-copy-invite/);
assert.match(app, /data-chat-handle-setup hidden/);
assert.match(app, /data-chat-founder-marker hidden/);
assert.match(app, /href="\/account\.html"/);
assert.match(js, /const INVITE_URL="https:\/\/newbeansland\.org\/messenger\/"/);
assert.match(js, /const founder=state\.me\?\.role==="founder"/);
assert.match(js, /if\(invite\)invite\.hidden=!empty/);
assert.match(js, /await navigator\.share\(/);
assert.match(js, /navigator\.clipboard\?\.writeText/);
assert.ok(js.includes('$("[data-chat-invite]").hidden=true;'), "Account switch must hide prior account welcome");
assert.doesNotMatch(js, /navigator\.contacts|\.getContacts\(/);
assert.doesNotMatch(app, /type="file"/);
assert.match(sw, /nbl-messenger-shell-20261031-phone-alert/);


for(const item of [
 "data-chat-notification-settings",
 "data-chat-notify-enable",
 "data-chat-notify-disable",
 "data-chat-notify-preview",
 "data-chat-notification-founder",
 "data-chat-notify-title",
 "data-chat-notify-body",
 "data-chat-notify-sender",
 "nbl-infinity-sound.js"
])assert.ok(app.includes(item),"Phone notification UI lost: "+item);
for(const item of [
 'action:"push_config"',
 'action:"push_subscribe"',
 'action:"push_unsubscribe"',
 'action:"push_template_set"',
 'reg.pushManager.subscribe({',
 'await reg.showNotification(',
 'window.Notification.requestPermission()',
 'await forgetPushForDifferentAccount(userId)',
 'await disablePhonePush()'
])assert.ok(js.includes(item),"Phone push workflow lost: "+item);
assert.match(js,/state.me\?\.role!=="founder"/);
assert.match(js,/window.NBLInfinitySound\?\.play\("people"\)/);
assert.match(sw,/self.addEventListener\("push"/);
assert.match(sw,/self.addEventListener\("notificationclick"/);
assert.match(sw,/new URL\("\/messenger\/",self.location.origin\)/);
assert.doesNotMatch(sw,/event\.data\?\.json\(\)[\s\S]*token/);
assert.doesNotMatch(app,/type="file"/);

console.log("PASS: NBL Messenger independent app, direct social runtime, protected University, and legacy routing and authentic early-member invites and phone notification controls preserved.");
