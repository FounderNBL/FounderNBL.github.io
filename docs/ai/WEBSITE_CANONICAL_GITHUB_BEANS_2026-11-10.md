# Website Beans — canonical GitHub runtime (2026-11-10)

The website uses the actual Beans source owned by FounderNBL/Beans. The authenticated route is:

newbeansland.org homepage → nbl-world-header.js → NBL Core /chat → nbl-chat-gateway → nbl-chat-meter / LOCKE → nbl-foundation-runtime.

Supabase Foundation v169 deployed ACTIVE with the same GitHub beans-brain.mjs composer and updated beans-model-router.mjs plus beans-claude.mjs. GitHub Beans persona stays a single voice regardless of provider; no PDF-only or browser-based alternate brain.

OpenAI first (routine), stronger OpenAI second (harder), Claude Opus 4.6 last (extra-difficult verified Founder text-only messages). No separate model calls for ordinary NBL chat. Claude is not enabled for ordinary paid members without real LOCKE dollar-cost reservations and settlements. The website does not receive model API keys, Stripe credentials, or server-side secrets.

Backend code was merged in FounderNBL/Beans PR #435. Supabase Foundation v169 read-back confirmed the current router, Claude adapter, and canonical brain. Authentication and subscription enforcement are server-side. A live Claude-paid response is not yet authenticated-tested.

Regression command: node --test scripts/check-github-beans-live-route.test.mjs
