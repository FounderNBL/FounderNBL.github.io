# My Pulse — Founder-only publishing bridge (DRAFT / NOT DEPLOYED)

## Why this exists
My Pulse (the Founder's ChatGPT social HQ) needs a secure **outbound tool connection**
to existing NBL Pulse. This folder does **not** turn the existing Pulse website into
a new app, replace its Stream Feeds composer, alter NBL Messenger or connect Meta.

## Implemented source
- `prepare`: validates caption, artist/company identity, individually assigned
  destination accounts and previously uploaded trusted Stream image URLs. Returns
  an exact-payload SHA-256 fingerprint. **No external post.**
- `approve`: requires the current Founder's Clerk session JWT (verified through
  NBL Clerk JWKS plus the server-owned role table) and returns a 5-minute token
  bound to that exact caption, media, Pulse account and channel.
- `publish`: requires a separately configured **server-side connector secret**,
  a matching founder approval token and an explicit deployment enable switch;
  submits to the EXISTING Stream Feeds `user:<founder Clerk id>` feed with forced
  moderation, deterministic activity ID and a provider response receipt.
- `status`: reveals capability flags only to the bridge caller.
- Meta destinations are **NOT** wired and fail closed (no Facebook, Instagram or
  arbitrary personal account writes). No proxying from a user request to a
  third-party Page or Instagram account.

## Remaining integration work — this is NOT connected yet
1. Review this draft PR, run Deno/type and offline request tests, and check the
   exact Stream v3 server API request in an authorized test environment.
2. Implement/upload approved images to Stream through an authenticated Founder
   upload path; local ChatGPT `sandbox:` images are NOT Stream CDN URLs.
   Never make private unreleased masters or signed secrets publicly accessible.
3. Configure the Edge Function secrets **only inside Supabase**:
   `MY_PULSE_BRIDGE_KEY` (random 32+ characters),
   `MY_PULSE_APPROVAL_KEY` (independent random 32+ characters),
   `STREAM_API_KEY`, `STREAM_API_SECRET`, and the existing
   Supabase URL/service role key. Keep `MY_PULSE_PUBLISH_ENABLED=false` until
   direct Founder approval and a successful dry acceptance check.
4. Register a separate authorized ChatGPT custom app/action/connector using
   the OpenAPI contract. A GitHub commit or Supabase deployment cannot register
   tools into ChatGPT. Configure server-to-server authorization securely; never
   put connector secrets in a public repo, website or prompt.
5. Add a Founder-authenticated website approval UI. The one-time approval is
   not simply the model claiming the Founder said yes. Connect the actual
   authenticated Clerk session and show full final image/caption/accounts.
6. Add a persistent one-time approval/idempotency ledger (atomic consumption
   and audit receipt) before enabling production publishing. A deterministic
   provider ID alone does not prove exactly-once execution.
7. Check Pulse moderation is ready for server-side posts. Provider rejects
   and network timeouts must not be reported as success.
8. Configure and independently verify appropriate Facebook Page and Instagram
   professional account OAuth scopes/App Review (separately), then add explicit
   account-by-account adapters and receipts. No cross-post fallback.

## Security / release rules
- Feature branch only. No live production path is changed by this PR.
- Nothing deploys, schedules, posts or spends automatically.
- Never merge or deploy without separate approval. No new paid provider.
- The API is *not ready for production* until steps above are completed.
- No actual Shia photo, token or private credentials are stored in this folder.
- The previously requested caption is:
  `New music on the way 🎶🔥 #Shia`
  It remains **DRAFT — NOT POSTED**.

## Source reference
Desk #114: My Pulse charter, identity separation and approval rules.
Desk #111: Pulse existing member feed, Meta publish permissions unverified.
Existing `messenger/social-v1.mjs`: signed-in Stream `feed.addActivity`
and authenticated media upload.
