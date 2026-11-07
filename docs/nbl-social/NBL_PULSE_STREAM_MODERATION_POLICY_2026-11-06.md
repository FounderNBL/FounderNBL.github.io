# NBL Pulse Stream moderation — Founder-approved policy as code

Date: 2026-11-06. Stage only; no policy installed in Stream or connected to public Feeds.
Original Stream DEV app: NBL Social. Do not create another app.

## Why detached
Policy key pm:nbl-pulse-review-v1 is not a reserved feeds or chat key. Stream Feeds automatically moderates activities/comments when a policy is assigned; this staged key is NOT assigned. Avoids unapproved usage charges, unexpected post removal and modification of NBL Messenger.

## NBL moderation decisions
Text: flag lower-severity threats, hatred, racism, sexual harassment; remove high/critical. Flag scams, spam, bullying and indications of self-harm for human review. Remove doxxing, exploitation and terrorism promotions when detected. Never ban members automatically.
Media: explicitly sexual images/videos are removed at defined thresholds; violence, hate symbols, sensitive PII on photos go to human review. Do not treat swimsuits, ordinary cussing, adult conversation or NBL music as automatically forbidden.
Standard profanity blocklists, politics, platform-bypass rules and Beanslandish/slang bans are intentionally absent.
Upload videos are scanned asynchronously; the NBL app must keep unreviewed video hidden if we require prepublication moderation.

## Commands (from repository root)
Offline safe dry run: node scripts/nbl-pulse-moderation-policy.mjs --dry-run
Source test: node --test scripts/check-nbl-pulse-moderation-policy.test.mjs
Read-only Stream check: node scripts/nbl-pulse-moderation-policy.mjs --inspect
Provider write, named unattached ONLY: NBL_STREAM_APP_ENV=DEV NBL_STREAM_MODERATION_APPLY_ACK=CREATE_UNATTACHED_NBL_PULSE_POLICY node scripts/nbl-pulse-moderation-policy.mjs --apply
Read-only and write mode require environment variables STREAM_API_KEY and STREAM_API_SECRET, supplied securely by the operator. Never paste secrets in chat, GitHub, or screenshots.

## Release gates
1. Verify app credentials and provider account plan/credits/overage terms. Stream publicly advertises $100 monthly moderation allowance; not confirmed for this account.
2. Real two-Clerk-account Feeds SDK tests, server permissions, private notifications, blocking, student permissions and UGC reports/appeals.
3. Real photo/video upload moderation tests and webhook handling; developer-client size limits are insufficient.
4. Account rate limits, budgets, moderation usage tracking and hard limits before turning on any policy.
5. Additional explicit Founder approval before assigning pm:nbl-pulse-review-v1 to Feeds, or creating app-wide feeds configuration. This task does neither.
6. Go Live is separate; no livestream moderation or broadcast spending authorized.

Stream docs: https://getstream.io/moderation/docs/node/configuration/policies/ ; https://getstream.io/moderation/docs/node/integrations/stream-feeds/ ; https://getstream.io/moderation/pricing/
Rollback: remove staged PR; if a draft config is later installed, verify it is unattached before deleting that exact named config.

## Existing credential integration (2026-11-06)
Existing Supabase nbl-stream v14 uses STREAM_API_KEY/STREAM_API_SECRET; GitHub secrets can also be used by a trusted workflow, if present in the **website** repository. No keys are moved or shown.
For this review branch, the guarded workflow triggers once on a branch update, performs offline tests, and attempts to create the **unattached** policy only if both Stream secrets exist as Actions secrets. If they are unavailable, the workflow prints a warning and leaves Stream unchanged.
No public Feeds policy, Chat policy, live calls, videos or bills are enabled. Installing a named unattached config is not public moderation activation. All subsequent changes still need a separate Founder-approved rollout.
