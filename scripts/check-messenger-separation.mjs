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

console.log("PASS: NBL Messenger independent app, direct social runtime, protected University, and legacy routing preserved.");
