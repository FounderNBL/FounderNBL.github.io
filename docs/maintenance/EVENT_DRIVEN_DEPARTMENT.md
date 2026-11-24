# NBL Maintenance Department — event-first operations

One department with three current product source homes: `FounderNBL/FounderNBL.github.io` (website), `FounderNBL/Beans` (Foundation), and `FounderNBL/Pulse` (social and integrated Messenger). Each repository owns its source and remains isolated. The shared read-only event worker is `.github/workflows/nbl-maintenance-shared-events.yml` in the website repo, invoked from Beans and Pulse. The retired `FounderNBL/NBL-Messenger` caller remains supported only for compatibility; it is not a new development or production target. Playground and GitLab archival copies are not Inspector/Fixer targets.

## Cost and trigger policy

- Website PRs: existing scoped source/browser checks; changed main website source or an explicit manual dispatch: full live route + browser checks and the existing NBL source Fixer only after independently verified defects.
- Beans/Pulse PRs and matching main source changes: the existing reusable **offline read-only test runner** checks the affected repository; the retired Messenger caller is left intact for compatibility only. On a failed **main-push** source test for Beans or Pulse, the runner also saves `repair-handoff.json` containing the exact repository, source commit and GitHub run. It is a verified locator for independent investigation, **not** a verified root cause, chosen fix, a paid model call or an automatic repair. No user records enter the tests.
- Twice-daily website heartbeat, at **01:47 and 13:47 UTC**: **exactly two anonymous GETs**, HTTPS site + public NBL Core readiness. No Playwright, install, paid API, customer activity, source sweep, University, Desk, Playground, or games.
- Source defects may be escalated through the existing separately verified, scoped Fixer only after genuine independent reproduction and the applicable approval/budget gates. The handoff is an input to the current Foundation/Inspector/Fixer, **not** a new model or automatically dispatched bot. Beans' private Fixer remains gated; the website Fixer is not generalized to private repositories without evidence.
- Deep browser/live website inspections run only on relevant main source changes or explicit manual dispatch, not on the scheduled heartbeat.
- The existing Cloudflare-origin Worker runs lightweight cross-service heartbeat checks at **01:17 and 13:17 UTC** and may request deeper checks only after a confirmed repeatable HOLD, never on a clean scheduled run. Without an authorized GitHub dispatch secret the downstream request is UNVERIFIED, not active.
- Website CodeQL runs on source push/PR or manual command, not an unrelated weekly timer. Beans release-sync is similarly event/manual only. The separate daily voice-auth safety check is grouped inside the 13:00 UTC health window.
- This schedule is an availability safety net, not a claim that customer journeys, authentication, Cloudflare challenges, or every provider was fully inspected.

## What event-driven means and does not mean

GitHub PR/push events are **code change events**. They are not chat messages, Pulse posts, Messenger DMs or service-runtime errors. NBL's existing Supabase/Cloudflare application telemetry remains the appropriate source of errors arising during real user activity. Ingestion/deduplicated runtime error-to-incident dispatch is a **remaining integration requirement** and is **not falsely claimed as installed**. Do not create a GitHub Actions run for each message, post or app interaction.

## Beans intelligence boundaries

`Walking With the Person` is already part of Beans: five natural adaptive cues (Sound, Amount, Explore, Analyze, Nudge), with no saved sliders or second persona. Check the existing conversation correction and the canonical 2,500-development-profile parity tests. `The Other You` remains a separate later paid and consent-based experience; the Maintenance Department must not activate it, infer durable personality traits or test University, Grey or Virgo classrooms.

## Scope / safety

All checks are source/read-only or anonymous GET, provider calls require explicit preexisting authority, and no workflow merges, signs, deploys, sends messages, modifies accounts or copies secrets. Security conditions that require authenticated audit logs or actual user-session observations remain UNVERIFIED until explicit safe integration.
