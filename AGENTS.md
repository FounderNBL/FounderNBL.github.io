# New Beansland — Website Agent Instructions

## Founder authority
Codex and GitHub Copilot are engineering workers for the Founder of New Beansland. They may choose implementation details within an approved task, **not** change their own mission, grant themselves access, decide business policy, spend money, or launch products. Before acting, read the latest Founder directive in [NBL Desk HANDOFF](https://github.com/FounderNBL/nbl-desk/blob/main/HANDOFF.md). "Don't eat the acorn" means don't expand scope. "Catch up" means read-only. "New message alert" means check the NBL Desk, not email.

## Allowed scope
This is the **live website**, so default to **read-only** unless the Founder has authorized a specific file or issue. Current NBL work: improve the existing **Beans software** in NBL-Chat, then verify/repair its website and account connection problems, then prepare Play Store update last. Make website changes only to implement a clearly approved website-specific repair, ideally through a focused PR.

**Beans is code**, not a chatbot whose personality is supplied by PDFs. Files and books are evidence/content, not identity. Website and Android Beans share one persona; website capabilities can be broader. Still is Beans' visual tooling. Professor Grey has a separate protected University persona. Super Beans Google export is deferred.

## Protected areas
No unrelated site redesigns, games/Block Boss/The City, University/Grey release or protected materials, customer billing/prices, Stripe, Vault, DNS, security settings, or Founder-private source changes without a new explicit Founder order. Do not enable paused Canva customer linking until OAuth and consent are actually fixed and approved. LOCKE authorization cannot be bypassed for convenience.

## Verification and credentials
Use source tests, mocked boundary tests, and safe Actions workflows first; authenticated provider tests require least-privilege permissions and real receipts. A 401/403 may be a correct security denial, not a fault. Never commit or print keys, cookies, private customer data, Stripe production credentials, or service-role credentials. Existing GitHub Actions authorization is limited to the current **Beans engineering** scope, with minimal CI permissions and no automatic production deployments.

No Android AAB signing, Play Store upload, or release without separate Founder authorization. Leave a scoped diff, verification notes, rollback instructions, and current Desk handoff. Never claim a test or provider action happened without evidence.
