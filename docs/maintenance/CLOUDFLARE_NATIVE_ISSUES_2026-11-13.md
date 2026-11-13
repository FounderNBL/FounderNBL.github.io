# Cloudflare native Issues — NBL operational monitoring and Founder handoff

**Founder order (November 13, 2026):** Implement what Cloudflare can already do for the NBL Maintenance Department without adding a paid AI, new Inspector Worker, or scheduled deep scans. The Desk is a **record archive**, never an Inspector target or alert sink.

## Cloudflare account state verified through its API

- Existing Cloudflare Workers Issues detection enabled on `nbl-inspector-security-department` and `foundernbl-github-io`.
- Website `wrangler.jsonc` must retain `observability.enabled: true`, `observability.issues.enabled: true`, and `redact_query_string: true` to avoid disabling detection on later deployments. Existing private Inspector's `cloudflare/nbl-inspector-worker/wrangler.json` already has Issues enabled.
- Existing Cloudflare notification policy **"NBL Maintenance — scoped Cloudflare Workers Issues"**, type `workers_observability_real_time_issue`, uses the account's **already registered security-alert email** (never commit the address, secrets, or raw issue payload).
- **Four enabled Cloudflare Issues automations**, *service-scoped*, not account-wide:
  - `nbl-inspector-security-department` repeated-error threshold **2 occurrences**;
  - same service recurrence after **3600 seconds** quiet;
  - `foundernbl-github-io` repeated-error threshold **2 occurrences**;
  - same service recurrence after **3600 seconds** quiet.
- Scope deliberately EXCLUDES `nbl-university-school`, all game repositories, the Desk, and unrelated Workers. The website Worker is a shared Worker, so passive platform errors cannot be filtered by URL path with this service-level automation; no held route is proactively probed.
- Current Cloudflare Worker Issues inventory initially showed **zero observed issues**; an enabled notification policy proves configuration, **not** that a real message was delivered. Check alert history and Issues automation run history when real eligible events occur; a delivery receipt is not an independently verified repaired service.
- The existing Inspector Worker remains private, fetch returns 404, and its light twice-daily schedule is unchanged: `17 1,13 * * *` UTC. No WAF or DNS exception. Bot challenges stay `UNVERIFIED`.

## What the native configuration does and does not do

Cloudflare Workers Issues groups uncaught Worker errors, error-level logs and Worker 5xx responses. The enabled automations will deliver diagnostic notifications when their rules fire. They do **not** diagnose outages of non-Workers services, create guaranteed GitHub issues/PRs, grant repair authority, or perform safe customer-session checks.

The existing Cloudflare Inspector's scheduled health checks can **request** a Beans platform Inspector after a verified repeated HOLD, but its `NBL_GITHUB_INSPECTOR_DISPATCH_TOKEN` secret was absent when checked. Until the Founder installs a **fine-grained GitHub token limited to `FounderNBL/Beans` Actions workflow dispatch** and the live event is verified, this handoff is `UNVERIFIED`. Cloudflare Worker *issue notifications themselves* currently go to the existing email, not a GitHub dispatch webhook; a secure, explicitly approved webhook receiver is a separate future integration.

**No automatic merge, code edit, Fixer execution, paid AI, access to customer messages, University or game inspection, secret transfer or Android release is authorized by these automations.** Alerting is read-only. The Founder stays the approval authority.

## Founder-only completion

1. In **Cloudflare Dashboard → Workers & Pages → nbl-inspector-security-department → Settings → Variables and Secrets**, add `NBL_GITHUB_INSPECTOR_DISPATCH_TOKEN` as an **encrypted secret** only after creating a GitHub fine-grained token restricted to **one repository: FounderNBL/Beans**, with **Actions: Read and write** (plus required metadata read), not Contents write, no Desk repo permission. Never place it in Git source or a chat message.
2. Optional: supply the separate `NBL_CLOUDFLARE_INSPECTOR_TOKEN` as an encrypted **read-only Cloudflare API token** for approved production-zone configuration evidence. The Worker's basic public/Core health checks do not need it. Do not grant WAF editing.
3. Once authorized, verify an actual confirmed HOLD produces an eligible dispatch to `FounderNBL/Beans/.github/workflows/nbl-platform-inspector.yml` and a real independent run result; HTTP 204 only means GitHub accepted dispatch. Do NOT create a fake production outage to test.
4. Review the **Cloudflare Observability → Issues → Automations** and **Alerts → History** for the first legitimate notification. If an email was not delivered, confirm the already registered alert destination and account-level notification settings. Issue payloads can include stack traces and request context: review privacy before sending to external webhooks or AI agents.
5. A full native Worker issue → authenticated GitHub event → independent Inspector → Founder-approved repair needs a separately permitted HTTPS webhook destination/receiver; no webhook exists, and no new public route, paid service or token was silently created.

**Status boundary:** Cloudflare-native error detection, scoped email notification policies and four service automations are configured; production notification delivery, automatic GitHub escalation, and repair closure have not yet been end-to-end verified.
