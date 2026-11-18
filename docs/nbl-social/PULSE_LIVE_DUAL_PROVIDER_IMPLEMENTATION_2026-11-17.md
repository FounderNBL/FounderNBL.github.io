# Pulse Live — Stream + Google integration contract (DRAFT / NOT LIVE)

**Founder authorization:** Prepare the Pulse Live dual-provider connection. This document is a scoped implementation contract, **not** evidence of working broadcasting. No provider streams, charges, releases, or production configuration are activated by this branch.

## Verified current source (November 17, 2026)

- The production website owner is this repository's `pulse/index.html`, not the copied `FounderNBL/Pulse/web` source.
- Pulse currently renders a **hidden, disabled** `.pulse-live` control: `Go Live · setup pending`. The left-nav Live entry is also a coming-soon placeholder.
- Existing `supabase/functions/nbl-stream/index.ts` signs **Feeds** sessions with Clerk JWT identity and requires Stream moderation. It has **no video livestream create/start/stop/token/usage API**. Do not repurpose its Feeds token as proof of video access.
- Stream Video's dashboard has a `livestream` call type; Founder configured 300-second maximum duration and left participants uncapped. **100 audience viewers is not enforced by that field**.
- The existing `nbl_private` call type is for Messenger private calls; do not modify or reuse it for public broadcasts.
- Google Cloud Live Stream API was enabled manually in NBL FOUNDATION. No Google channel, input, encoder, CDN, budget gate or authenticated server connection has been verified. Enabling an API alone is not an integration.
- Existing `NBL_FCM_SERVICE_ACCOUNT_JSON` is an Android notification credential, **not** a Google livestream authorization or streaming bridge.

## Required working implementation — separate from existing Messenger

1. **Provider-agnostic backend**, with `stream` and `google` adapters behind one Clerk-authenticated Pulse Live API. Never put Stream API secrets or Google service-account credentials in browser/Android bundles. Preserve existing `nbl-stream` Feeds and `nbl_private` calls.
2. **Start flow**: validate Clerk actor and actual Creator/free entitlement server-side; atomically reserve a 5-minute session budget, maximum 100 audience seats and one active broadcast per eligible account; reject if reservation/monitoring unavailable. Return an authorized Stream Video livestream token and call identifier, or Google ingest/playback setup only after a tested browser-to-RTMP/SRT bridge exists.
3. **Broadcast**: mobile/browser camera and microphone permission, backstage preview, Start/Stop, public viewer player and moderated live chat. Provider-confirmed LIVE state only. Never show LIVE based solely on client clicks.
4. **Metering**: 300-second maximum duration, viewer-minutes, per-provider unit prices, processing/ingest/egress/storage/recording costs, reserve/settle/refund ledger, audience seat admission and stop/expiry cleanup. No 'unlimited' participants, viewers or duration.
5. **Provider routing**: Stream first for paid Creator sessions, Google for an explicitly approved free-user quota or **budget-approved** fallback. A Google API being enabled or promotional credits being available is **not** a hard billing stop. Do not automatically start Google channels when Stream is exhausted without a funded reservation and working Google adapter.
6. **Google hard stop**: an NBL-controlled, fail-closed session admission gate, finite channel lifetime and reliable teardown. Cloud Billing budget notifications alone are not a hard cap. Existing sessions need shutdown policy. Verify Google Cloud actual credit balance and billing mode separately; do not assume $0 after credits expire.
7. **Creator billing**: proposed $9.99/month and 48-hour offer are **not active**. The Founder's customer-first policy (Desk #73) governs costs; existing Beans 48-hour free allowance stays separate. No credit-card capture, subscription or universal NBL Money implementation under this work.
8. **Safety**: rate limits, verified entitlements, privacy/consent, moderation, abuse reports, copyright/takedown, streaming rights and authenticated stop authority. Recording, transcription and snapshots should default OFF until separately approved; avoid unanticipated costs.
9. **Verification**: tests for 2 separate Clerk users, expired/forged tokens, 5-minute forced stop, 101st viewer rejection, duplicate start, partial provider failure, zero-budget admission denial, charge/ledger idempotency, end-call cleanup and stream viewer playback. Test no-cost paths first; any billable real-stream test needs Founder approval.

## Release gate

Keep Pulse's current Go Live button **disabled** until the provider-specific backend, hard spending controls and real end-to-end viewer test pass. Do not merge/deploy or change Google/Stream billing settings automatically. This document is the first tracked draft in the authorized website repository, not a completed integration.

**Existing related records:** Website issue #450 (Stream Video MVP), #448 (Stream setup), #455 (Messenger/Stream contract); Desk #111 (recovery), #73 (financial policy), #116 (universal NBL Money later).
