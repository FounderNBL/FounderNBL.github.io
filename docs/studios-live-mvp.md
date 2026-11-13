# NBL Studios LIVE preview — implementation and activation gates

This page is an unlinked, `noindex,nofollow` source preview. It is not a creator announcement or a production launch. It uses generic “NBL member” identities; no creator stage name, social handle, likeness, or launch claim belongs in this page.

## Implemented in this repository

- `studios-live.html` is an unlinked mobile-first preview with Clerk sign-in, provider status, viewer join, host backstage, device/network error recovery, and moderated-audience-chat controls.
- `studio/live-video/src/index.jsx` uses the pinned Stream React Video SDK `@stream-io/video-react-sdk@1.44.0` `EmbeddedLivestream` component. The SDK bundle is built locally and committed under `assets/`; the page does not load the SDK from a CDN.
- The embedded `livestream` UI supplies camera/microphone setup and SDK Go Live / Stop Live controls. The server-issued token and Stream call-type permissions, not browser state, must authorize those actions.
- The browser sends Clerk bearer tokens to `https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-core/stream`. It never receives or stores a Stream API secret. A missing, denied, malformed, or unreachable Video response fails closed; Chat health is not used as Video health.
- The audience chat client calls the same protected stream API and renders message bodies with `textContent`. It does not use Beans, AI, billing, or NBL Usage credits.

## Required NBL Core backend contract — not present or verified here

The current website repository contains no `/nbl-core/stream` implementation, Stream Video credentials, or proof of Video-product entitlement. Stream Chat credentials/health do not establish any of those. Before this preview can connect, NBL Core must implement and test the following. Do not point the UI at a Chat-only bridge.

All actions are authenticated using the current Clerk JWT in the `Authorization: Bearer` header and must resolve the account from verified Clerk claims. Never accept a browser-supplied role, `userId`, Stream user object, API secret, host allowlist, or permission grant.

| Action | Server requirement |
| --- | --- |
| `status` | Query Stream Video server-side for the current call state and return `{ok:true, provider:"stream_video", status:"LIVE"|"OFFLINE"|"UPCOMING", sessionId?, detail?}`. Do not infer Video status from Chat `/health`, local state, or a scheduled page value. |
| `host_access` | Resolve an approved host from protected NBL authorization data. Return `{ok:true, authorized:true}` only for an approved host; otherwise return 403. |
| `host_backstage` | Re-authorize the Clerk identity on every request, create/retrieve the authorized `livestream` call in backstage, and return `{ok:true, provider:"stream_video", apiKey, callId, sessionId, userId, token}`. The token must be minted server-side and scoped to the approved host's Stream user ID and role. |
| `viewer_session` | Require a verified signed-in NBL member and an actually LIVE call; return the same account-bound, short-lived session fields with viewer-only permissions. Deny joining backstage or publishing media. |
| `chat_history`, `chat_send`, `chat_mute`, `chat_report`, `chat_block_sender` | Integrate with the existing human member-chat moderation and block/report records. Enforce membership, thread/session binding, mute/block state, rate limits, and moderation server-side. Do not use Stream Chat as proof of Video activation; do not meter or invoke Beans/AI. |

For every Stream operation, use an NBL Core-held Stream Video API secret and the Stream server SDK/API. The returned Stream API key is a client identifier, not a secret. Validate the token subject against the Clerk account resolved by the server and bind each chat action to the authorized session. Return generic, safe errors; never log bearer tokens or signed Stream tokens.

## Stream Video configuration required before any real test

1. Confirm Stream Video is enabled for the existing Stream application and obtain written account/entitlement and billing confirmation. This repository cannot validate provider access.
2. Configure a `livestream` call type with backstage enabled. Assign `join-backstage`, media publish, and live start/stop permissions only to server-approved hosts. Members who are viewers may join only while the provider reports LIVE and must not publish media or enter backstage.
3. Deny recording/transcription and any unrelated permissions. Disable server-side noise cancellation (its optional audio module is deliberately excluded from this browser bundle). Do not enable HLS/RTMP ingest, OBS broadcasting, production webhooks, or recording for this MVP.
4. Use WebRTC through the pinned React SDK bundle. The React Video SDK documents WebRTC livestream UI and backstage support; it requires a secure browser context and browser media-device/WebRTC support. The repository's Chromium desktop and Pixel 7 mobile Chromium checks exercise only the page/client flow, not real provider media compatibility.
5. If OBS/RTMP is considered later, it requires separate approval, Stream-side RTMP ingest configuration, and server-mediated issuance/rotation of a private stream key. Never put an ingest URL/key in this repository, browser markup, logs, or chat. OBS is not enabled by this work.

## Cost, permission, and release assessment

Stream's SDK README says its “Makers” program may provide monthly video credit to qualifying projects (fewer than five team members and under $10,000 monthly revenue). This is not confirmation that NBL qualifies or that Video is enabled. Current unit rates, overage behavior, concurrent viewer limits, and applicable account terms could not be independently confirmed from this environment. WebRTC participant usage may incur provider charges. Keep the backend disabled until the account owner verifies pricing, budget limits, and usage alerts directly with Stream; do not assume Chat pricing, free credits, or existing Chat entitlement apply to Video.

No production activation, billing, paid stream, recording, OBS/RTMP, announcement, or site navigation change is authorized. Publishing this page requires separate approval. Two-account host-to-viewer playback/chat, anonymous denial, non-host denial, and real device/network recovery remain **UNVERIFIED** until exercised against the protected backend and an entitled Stream Video application.

## References

- [React Video SDK](https://getstream.io/video/docs/react/)
- [React livestream broadcasting and backstage](https://getstream.io/video/docs/react/advanced/broadcasting/)
- [React livestreaming tutorial](https://getstream.io/video/sdk/react/tutorial/livestreaming/)
- [SDK package README and browser SDK examples](https://www.npmjs.com/package/@stream-io/video-react-sdk)
- [Stream Video pricing](https://getstream.io/pricing/video/)
