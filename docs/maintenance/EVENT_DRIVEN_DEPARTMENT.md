# NBL Maintenance Department — event-first operations

One department, four eligible repositories: `FounderNBL/FounderNBL.github.io`, `FounderNBL/Beans`, `FounderNBL/Pulse`, and `FounderNBL/NBL-Messenger`. Each repository owns its source and remains isolated. The shared read-only event worker is `.github/workflows/nbl-maintenance-shared-events.yml` in this public website repo, invoked from the three private repositories using GitHub reusable workflows.

## Cost and trigger policy

- Website PRs: existing scoped source/browser checks; changed main website source or an explicit manual dispatch: full live route + browser checks and the existing NBL source Fixer only after independently verified defects.
- Beans/Pulse/Messenger PRs and matching main source changes: a centralized, reusable, **offline read-only test runner** checks the affected repository. The same input contract and evidence receipt format are used across those three projects. No paid AI and no user records enter these tests.
- Six-hour scheduled website heartbeat: **exactly two anonymous GETs**, HTTPS site + public NBL Core readiness. No Playwright, install, paid API, customer activity, source sweep, University, Desk, Playground, or games.
- Source defects may be escalated through a separately verified, scoped coding Fixer. A source-test failure is an incident, **not** evidence the Fixer has already repaired it. The website's existing Fixer is not generalized to private repos until proven safely.
- Existing unrelated legacy safety/assurance workflows are not silently disabled by this department; their separate policy must be reconciled before claiming there are no other scheduled runs.

## What event-driven means and does not mean

GitHub PR/push events are **code change events**. They are not chat messages, Pulse posts, Messenger DMs or service-runtime errors. NBL's existing Supabase/Cloudflare application telemetry remains the appropriate source of errors arising during real user activity. Ingestion/deduplicated runtime error-to-incident dispatch is a **remaining integration requirement** and is **not falsely claimed as installed**. Do not create a GitHub Actions run for each message, post or app interaction.

## Beans intelligence boundaries

`Walking With the Person` is already part of Beans: five natural adaptive cues (Sound, Amount, Explore, Analyze, Nudge), with no saved sliders or second persona. Check the existing conversation correction and the canonical 2,500-development-profile parity tests. `The Other You` remains a separate later paid and consent-based experience; the Maintenance Department must not activate it, infer durable personality traits or test University, Grey or Virgo classrooms.

## Scope / safety

All checks are source/read-only or anonymous GET, provider calls require explicit preexisting authority, and no workflow merges, signs, deploys, sends messages, modifies accounts or copies secrets. Security conditions that require authenticated audit logs or actual user-session observations remain UNVERIFIED until explicit safe integration.
