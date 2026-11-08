// Offline NBL FOUNDATION Firebase Web integration contract.
// No account logins, Firebase traffic, Supabase requests or paid provider calls.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const load=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const page=load("messenger/index.html");
const firebase=load("messenger/firebase-web.js");
const messenger=load("messenger/app.js");
const sw=load("messenger/sw.js");
const privacy=load("privacy.html");

assert.match(page,/src="\/messenger\/firebase-web\.js\?v=20261107"/);
assert.match(page,/type="module"/);
assert.match(page,/data-messenger-analytics-enable/);
assert.match(page,/data-messenger-analytics-disable hidden/);
assert.match(page,/data-messenger-analytics-status/);
assert.match(firebase,/projectId:"project-e2272e79-b25e-4100-908"/);
assert.match(firebase,/appId:"1:956070126246:web:d817e7fdd36d72f1980a67"/);
assert.match(firebase,/messagingSenderId:"956070126246"/);
assert.match(firebase,/measurementId:"G-WD6BG3KRP5"/);
assert.match(firebase,/https:\/\/www\.gstatic\.com\/firebasejs\/13\.2\.0\//);
assert.match(firebase,/import\(SDK\+"firebase-app\.js"\)/);
assert.match(firebase,/import\(SDK\+"firebase-analytics\.js"\)/);
assert.match(firebase,/if\(consented\(\)\)void enable\(\)/);
assert.match(firebase,/consentEpoch\+\+/);
assert.match(firebase,/function disable\(\)/);
assert.match(firebase,/setCollection\(analyticsClient\.value,false\)/);
assert.doesNotMatch(firebase,/firebase-auth|firebase-firestore|firebase-messaging|firebase-storage|firebase-functions/);
assert.doesNotMatch(firebase,/\.getToken\(|\.logEvent\(|setUserId|setUserProperties/);
assert.doesNotMatch(firebase,/AIza[\w-]{30,}.*(secret|private)/i);
// The already-live Clerk, Supabase, Stream and native Web Push paths are not replaced.
assert.match(messenger,/const SOCIAL_API=/);
assert.match(messenger,/const PUSH_API=/);
assert.match(messenger,/const VIDEO_API=/);
assert.match(messenger,/const CLERK_PUBLISHABLE_KEY=/);
assert.match(sw,/self\.addEventListener\("push"/);
assert.match(sw,/NEVER cache identity, messages, or Supabase responses/);
assert.match(privacy,/Optional Google Analytics for NBL Messenger/);
console.log("NBL Messenger Firebase Web opt-in source contracts PASS (no provider traffic).");
