# NBL Social — first Stream Feeds source preview
Date: 2026-10-21. Related issue #448. **Review-only; NOT merged or released.**

## Source work staged
- `messenger/social-v1.html`: **unlinked**, noindex signed-in NBL Social preview; keeps existing `/messenger/` DMs as independent door.
- `messenger/social-v1.mjs`: Feeds v3 JS SDK `@stream-io/feeds-client@2.9.0` via version-pinned external ESM preview import, Clerk JWT -> deployed Supabase `nbl-stream` `action=session`; profile display from existing `nbl-social` `action=me`; provider-authenticated user/timeline/foryou/notification feeds; text posts (max 1500), likes, follow/unfollow, comments (max 600), notification screen.
- `messenger/social-v1.css`: mobile-first NBL appearance.
- `scripts/check-nbl-social-v1.mjs` and `.github/workflows/nbl-social-feeds-preview.yml`: source-only tests.
- No changes to live NBL Messenger, its message tables, notification sounds, old service worker, protected University, NBL-Chat V12, Stream dashboard defaults, or billing.

## Actual evidence
1. Existing production `nbl-stream` health request to Stream Chat `/api/v2/app` returned HTTP 200 CONNECTED on 2026-10-21. Spoofed anonymous Founder denied. This proves **Chat provider credentials only**.
2. Stream Feeds default groups user/timeline/foryou/notification/stories/story are present as shown by Founder dashboard screenshots. This does **NOT** prove Feeds API authorizations, user creation, follows, comments, moderation, or push end-to-end.
3. SDK import, code syntax and static assertions can run on PR. **No two-account, real-browser, Feed API, push, video or mobile test has run.** Stream Creator/Maker application has been submitted, but approval is unverified.

## Release blockers / security
- Test new module on isolated preview branch with actual Clerk user; two independent signed-in real accounts must exercise posting, timeline/follows, likes, comments, private notification, signout, errors and isolation. Test that unsupported feed settings and forbidden follower actions deny safely.
- Validate Stream v3 JS SDK import **in real browser**, CSP/cross-origin behavior, and plan to bundle verified pinned dependencies locally rather than rely on a third-party ESM CDN for the final launch. Do not claim import is proven from `node --check`.
- `nbl-stream` currently returns an identity-bound token for Chat. Confirm Stream **Feeds v3 accepts this token and uses the correct permissions** and that Stream user records synchronize correctly. Don't fabricate any post if the provider denies.
- **NBL handle invariant:** Existing Clerk/Supabase `nbl-social` profile handle remains source of truth. This preview does NOT enforce new `@NBL...` username issuance or uniqueness across all accounts; preserve reserved @NBLFounderOfficial and aliases. Plan an audited account migration/validation before public release. Don't derive permanent public handles from client IDs.
- Review moderation/reporting for Feeds. Existing `nbl-social` DMs have block/report; Feeds' automatic moderation, user blocks and abuse handling have **not** been integrated/tested here. Public posting must stay gated until controls are real. No public creator or signed partnership declaration.
- CDN imports and opt-in push, privacy/data disclosure, third-party consent, UGC moderation and abuse rate limits require release review.
- Future NBL Studios livestream/video and audience Chat are separate stage 2; no video calls, recording, usage fees or provider billing initiated by this preview.
- Maker hard limits and video/free usage need current plan confirmation before approving live audiences.

## Acceptance / gate
`node --check messenger/social-v1.mjs && node scripts/check-nbl-social-v1.mjs`.
Check browser signed-out; 2 actual accounts; server-scoped identity and role, per-account feed access, blocked actors, moderated posts, billing alert thresholds. Only with Founder approval: bundle SDK, merge site changes, link Messenger landing, deploy and activate. **No Play Store build or V12 changes.**


## 2026-11-01 — Founder-approved NBL Social → native NBL Messenger handoff (SOURCE ONLY)
- **Decision:** NBL Social uses **existing NBL Messenger** for all private person-to-person chat. Stream Feeds remains the supplier for public activity only; Stream Chat is NOT the DM store or a new customer chat identity.
- The preview shows a **Message** control only for another signed NBL creator with a provider activity actor ID. On click it calls the Clerk-authenticated `nbl-social` `action:social_profile` server lookup, never a Stream display name, and navigates to `/messenger/?dm=<verifiedHandle>`.
- Existing Messenger on website main has an independently staged DM-intent update: it only **prefills** the verified handle in the existing direct-message form; the member must click Open. No automatic thread creation, message, email/SMS delivery, subscription charge, or separate messaging provider.
- The backend social_profile action is staged independently in private NBL-Chat: validates server-side Clerk identity, real NBL profile, student-to-student gate, and blocks. Existing `direct`, `send`, message history, push, University, and security rules are unchanged.
- **SOURCE EXISTS / STAGED, NOT DEPLOYED OR TESTED LIVE.** Companion PRs must be merged and deployed in order before the social preview is activated: NBL-Chat protected profile lookup; website Messenger intent; Stream Feeds preview. No mobile native build; social mobile app remains LATER.
- Still require authenticated 2-account author-to-DM proof, blocked/student edge cases, message privacy, SDK & moderation testing before public feed launch. Do not claim this source gate is an E2E pass.
