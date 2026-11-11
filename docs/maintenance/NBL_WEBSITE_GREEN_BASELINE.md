# NBL LIVE WEBSITE — WHAT GREEN MEANS

Founder-approved website baseline contract: config/nbl-website-green-baseline.json
Website repository: FounderNBL/FounderNBL.github.io
Health Inspector workflow: .github/workflows/nbl-live-production-watch.yml

## Definition

GREEN is not "GitHub Actions ran." It means approved page design, behavior,
security boundaries and service health were independently checked and matched
their versioned approved references.

Evidence outcomes:
- PASS: the named, scoped check matches verified evidence.
- FAIL: a reproducible discrepancy or confirmed public failure. Preserve evidence
  and hand off to the existing incident/Fixer process; no auto-merge or deploy.
- UNVERIFIED: a check could not be completed or requires authenticated evidence.
  GitHub bot challenges and missing safe member credentials cannot mean green or outage.

Full website GREEN cannot be certified by source and unauthenticated probes alone.
Current reports intentionally say fullWebsiteGreen=false.

## Approved visual / behavior reference

- Homepage New Beansland title and six existing original world-card destinations
  remain. Do not navigate into or inspect University or games.
- Pulse social card opens /pulse/ and uses the approved
  /NBL_Pulse_World_Card.png (1672x941,
  SHA256 7f0833f25852a2839cdbbdbdfeb3a26481acb3c674e9cb32d62079bb8af7b6e1).
- Messenger card opens /messenger/ and uses the approved
  /NBL_Messenger_Beans_Worldcard.png (1254x1254,
  SHA256 0c6041b211aa0b1f4d32db4108a0ad440f9ea069d51ccfba7609d8a6fab1fdd7).
- Both artworks display uncropped, load fully on desktop/mobile and preserve
  their separate destinations. The obsolete World-card SVGs are NOT approved.
- Beans opens his existing chat. Signed-out Messenger never displays member
  threads. These checks never authenticate or create customer data.
- CodeQL and existing source/security guardrails remain independent.

## Live service reference

- Approved public .org routes return the expected HTML from .org.
- Cloudflare-first configuration handshake runs with existing read-only checks,
  without claiming that zone status alone proves visitor access.
- Supabase NBL Core GET /health confirms gateway, public Beans and the
  correct signed-in/public route identities. No paid model call.
- Public Pulse/Messenger PNG CDN bytes are compared to the approved SHA256
  and image dimensions, so a stale deployed image is caught.
- Public browser checks run on desktop Chromium and mobile Chromium.
  Screenshots are preserved as candidate references; they are NOT yet
  Founder-approved pixel-difference baselines.

## Evidence we must not fake

- LOCKE needs safe two-account server-side authorization tests. Guest screen
  visibility is not proof of correct protected entitlements.
- Security/intrusions need authorized GitHub, Cloudflare, Clerk and Supabase
  security logs. Public HTTP cannot certify that no one broke in.
- Performance, accessibility and screenshot numerical budgets need observed
  history and Founder-approved thresholds.
- Recovery and customer-data integrity require separate, permissioned plans.

Until these are independently verified, the overall full-site verdict remains
UNVERIFIED even if the specific source/live checks pass.

## The schedule / one department

The existing NBL Website Health Inspector, not a new duplicate workflow,
runs at 00:17, 06:17, 12:17, 18:17 UTC (GitHub scheduler may delay starts).
Its runs inspect the approved website, live routes, original image bytes,
Core service health, public desktop/mobile behavior and security handshake.
PR checks read local source only. Verified failures create existing incident
handoffs; unverified bot challenges do not open fake outages. Artifacts and
reports provide audit receipts.

Held scope: University/nblschool/Grey/Virgo, games/Block Boss, billing/Stripe,
protected customer data, secrets, privilege changes, paid AI, auto-fixes,
automatic merges, deployments and Android releases. No changes to Beans.
No workflow-history deletion. No pretending a Fixer is self-healing.

Every approved future change updates the saved reference and associated tests.
The reference is versioned; it does not automatically rewrite itself.

Don't eat the acorn.
