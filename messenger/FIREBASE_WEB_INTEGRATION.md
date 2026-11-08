# NBL Messenger Web: NBL FOUNDATION Firebase integration (Founder review candidate)

Scope: `https://newbeansland.org/messenger/` (GitHub repository `FounderNBL/FounderNBL.github.io`), **not** `NBL-Messenger-Google`'s unrelated Android starter files.

## What this PR connects
- Registers the exact existing NBL FOUNDATION Firebase **web** app credentials supplied by Founder. Firebase Web SDK loads from a pinned official gstatic version because the live .org website is plain static HTML/JS with **no npm package manifest or bundler**; `npm install firebase` is unnecessary for this repo.
- Adds an opt-in control in Messenger's *My account* panel. Only after an explicit click (or a previously stored opt-in on the current browser) does `messenger/firebase-web.js` load the Firebase App and Google Analytics SDKs and start collection. Users can turn it off; the setting uses localStorage and does not touch Clerk account data.
- Basic page-view measurement only; no account identifiers, handles, friends, message text, call identifiers, contact lists, or private events are passed by NBL to Google Analytics. Relevant privacy notice updated.
- Google Analytics will show usage only **after real visitors opt in**, if the registered web app's Analytics configuration is operational; a successful static test cannot prove the Firebase service has received a real request.

## Deliberately untouched
- Existing `messenger/app.js`, `messenger/sw.js`, and web-push subscription/VAPID route remain unchanged. Supabase stays the message store and push backend; Stream stays the calling provider; Clerk stays identity.
- No Firebase Auth/Firestore/Storage/Messaging/Functions enabled by client code. Avoids duplicate alerts, a second message database or public Firebase data without rules.
- No Google Cloud billing changes, new API keys, Cloud Run, hosting migration, Firebase Hosting, Play Store changes, University, pricing, or production release. The Firebase web configuration is *public client configuration*, not a service-account private key. All server secrets remain server-side.

## Verification / handoff
- `node scripts/check-messenger-firebase-web.mjs`: confirms correct project/app IDs, opt-in/off, no extra Firebase SDKs, and existing Clerk/Supabase/Stream/Web Push code remains present. Runs offline.
- `node scripts/check-messenger-separation.mjs`: existing Messenger boundary checks (some broader tests may require repository fixtures).
- PR CI `.github/workflows/nbl-messenger-firebase-web.yml` runs offline checks without Google requests.
- **Manual / founder-approved verification before any merge or release:** open a local or branch preview of Messenger, verify sign-in/calls/push still work, choose *My account → Allow usage analytics*, verify an actual Google Analytics DebugView/Realtime event arrives under NBL FOUNDATION, turn off usage analytics and verify collection stops. No customer test messages required.
- Privacy: page-view/device usage can be collected by Google after consent; off does not erase past data, and a browser change has a different consent record. Verify the effective policy is suitable for the intended audience and region before enabling in production.

## Reversal
Revert the focused PR (or remove the `firebase-web.js` module script and optional account panel) to restore exactly the existing Messenger behavior. This is not a dependency for Messenger operation.

**Founder release gate:** PR is draft, not merged or deployed. Do not trigger publication until Founder says to do it.
