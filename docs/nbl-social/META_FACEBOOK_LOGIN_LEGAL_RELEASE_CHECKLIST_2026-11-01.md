# New Beansland — Meta Facebook Login / Messenger / Social legal setup

**Prepared for the NBL Messenger + Social launch:** November 1, 2026. Canonical privacy, terms, and deletion URLs remain unchanged; these full-coverage documents are staged on the legal review branch.

## Meta App Basic fields
- Display name: New Beansland (existing app).
- App domain: `newbeansland.org` (no protocol).
- Privacy Policy URL: `https://newbeansland.org/privacy.html`
- Terms of Service URL: `https://newbeansland.org/terms.html`
- User Data Deletion: choose **Data deletion instructions URL** (not an unimplemented callback).
- Deletion instructions URL: `https://newbeansland.org/account-deletion.html`
- Category: Social Networking **if shown**; otherwise ask Founder to select the closest accurate option.
- App icon: Founder's approved square NBL Messenger artwork, exported/uploaded as Meta-compliant 1024 × 1024 PNG/JPG under 5 MB. Do not alter the approved mark without Founder review.
- App secret: keep ONLY in Meta and Clerk protected configuration; never commit to GitHub, copy into notes, or send in chat.

## Existing Facebook Login/Clerk setup
- Clerk production account domain: `clerk.newbeansland.org`
- Meta Valid OAuth Redirect URI: `https://clerk.newbeansland.org/v1/oauth_callback` — Founder reported validator **Valid** on 2026-11-01.
- NBL Messenger and draft NBL Social both use the *existing* Clerk instance. No separate social account provider is planned.
- Basic sign-in scope: `email` plus baseline profile; request age-range only if Meta allows and NBL can actually use the value responsibly. Facebook Login is not proof of age.
- Do not request personal timeline, friends, photos, videos, likes, or birthday just to run NBL's own social features.
- Separate permissions, approval, and actual engineering required for Facebook Page/Instagram Professional cross-posting. User selection must be explicit; Facebook personal profile auto-publishing is not a supported promise.

## Launch-ready legal coverage in THIS branch
1. `privacy.html` — All account services: Messenger messages, Social profile/posts/media/feeds, Meta-linked data, actual/optional providers, user rights, retention/deletion, audience controls, safety, cookies, and 13+ access.
2. `terms.html` — Messenger/Social behavior, user-generated-content licenses and rights, moderation, appeals, reporting, connected publishing, account ownership, age and access rules.
3. `account-deletion.html` — Publicly readable deletion and disconnection instructions for Facebook-linked data, messages, social content, and all accounts, with unauthenticated email submission, verification, vendor coordination, and external-copy limitations.

## Must confirm before Meta submission / public access
- Review final legal text for legal sufficiency and accuracy; do not claim a feature is live or safety controls enforced if still only planned.
- Confirm privacy, terms, and deletion URLs open publicly over HTTPS in an ordinary anonymous browser **after the branch is approved/merged/deployed**. No login wall. Current web-tool fetch was unavailable, so live reachability is unverified.
- Confirm both `founder@newbeansland.org` and alternate `foundernewbeansland@gmail.com` are monitored for deletion requests; route them through a reliable fulfillment process, including any provider-held data.
- Confirm the approved image was uploaded in Meta's Basic page and the category was selected. Complete Meta's data deletion, app review, and business-verification tasks shown in the dashboard.
- Test Facebook sign-in with Founder/tester accounts without affecting other Clerk authentication methods; verify existing NBL account binding and non-duplication.
- **NBL Social not launched:** separate Stream Feeds approval, 2-account end-to-end test, moderation, reporting, block controls, age-gating, data deletion handling, and Founder launch authorization remain outstanding.
- NBL Kidz K–12 is a future, separate education/privacy design; this 13+ social policy is not a school/child consent policy.
- **Do not touch Beans dialogue development or release a Social app as part of these legal changes.**

## Meta paperwork source links
- Privacy Policy: https://newbeansland.org/privacy.html
- Terms: https://newbeansland.org/terms.html
- Deletion: https://newbeansland.org/account-deletion.html

**Prepared:** Complete NBL legal-page revisions are staged for an approved website update. Meta authentication settings and the separate Social feature launch follow their respective release steps.
