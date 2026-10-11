# NBL Google Fixer — independent public-website coding backup (release held)

**Status: code on main from PR #368; this safety-hardening follow-up is under review; live Google model connection remains UNVERIFIED.** No Gemini API request or autonomous repair has been proven. The web Reader and Android V10 release remain separate.

## Purpose
The Founder wants a coding backup that works through GitHub Actions when ChatGPT is unavailable. The main planned Fixer dispatch in **FounderNBL/nbl-desk PR #38** uses Copilot after confirmed Inspector evidence and separate approval. This alternative uses **Google's Gemini API + Gemini CLI** and requires **NO ChatGPT session** and **NO Replit**. The two are separate providers, though both routes still require GitHub to be operational.

## First permitted pilot — public Books / Reader only
- Manual GitHub Actions `workflow_dispatch` by a repository maintainer. No scheduled paid usage; no automatic fallback during outages in this version.
- An existing **public website** GitHub Issue must be open and labeled **inspector-confirmed** and **fixer-approved**; the approval checkbox must be checked.
- Gemini reads the public issue and public NBL Reader/Books code and may edit only `books.html`, `reader.html`, `nbl-reader.js`, `nbl-reader.css`, and `tests/browser/nbl-reader.spec.mjs`.
- Headless model is configured with file reading and editing tools only, **no shell tool**, no sensitive backend, deployment, authentication, billing, or credential edit permission. The reviewed action is pinned by commit SHA (`f77273f4c914e4bf38440cf36a0369cb64a37489`, release v0.1.22) and Gemini CLI is pinned to `0.63.0` instead of `latest`.
- The proposal job has **read-only GitHub permissions**, and GitHub checkout credentials aren't persisted. The Google model cannot push to GitHub from that job.
- Changed path allowlist, explicit maximum **3 files / 120 changed lines per file / 200 total changed lines / 16,000-byte patch**, prohibited binary/rename/mode changes, and JavaScript syntax guard run after it finishes. A separate write-capable job validates the patch **before applying it**. Any extra file, rewrite-scale patch, or no-op fails closed. Browser CI now runs when Reader JS or CSS changes alone.
- Only a separate job **without the Gemini API key** applies the validated patch and opens a **draft PR**. GitHub PR CI must pass and a person must review before any merge/deployment.
- This is deliberately NOT an overnight autonomous repair system and NOT a promise that Google's agent will solve a real incident: the first actual end-to-end model run is still untested.

## One Founder action for pilot
1. In **Google AI Studio** (https://aistudio.google.com/apikey), create a Gemini Developer API key for an appropriately isolated test project **only if the project security policy permits it**. The first pilot uses current model `gemini-3.5-flash-lite` (2.5 access is limited for new projects); check availability and free-tier quotas for that project.
2. In GitHub, open **FounderNBL/FounderNBL.github.io** → Settings → Secrets and variables → Actions → New repository secret. Secret **name exactly** `NBL_GOOGLE_FIXER_API_KEY`; paste its **value only there**, never here or into a repository file.
3. After the follow-up security PR passes CI and merges, create a harmless **public website** issue (e.g. styling or Reader spacing), add labels `inspector-confirmed` and `fixer-approved`, then Actions → **NBL Google Fixer (approved public website repairs)** → Run workflow. Specify the issue number and tick approval.
4. Review the **draft PR** it creates and verify changes manually. If nothing safe can be repaired or no key/available quota, the workflow should fail/stop without deploying or charging customers.

**Important data boundary:** Gemini's free-tier data may be used by Google to improve products under published terms. **Do not use a free-tier key on private NBL-Chat, NBL Desk, Supabase code, private client files, payment data, or customer information.** For private-code assistance, first verify a suitable paid-data privacy agreement / approved Vertex AI configuration, least privilege, cost budget and safe test environment.

**Important credit boundary:** Google's $300 Free Trial welcome credit is NOT eligible for Gemini Developer API usage. Do not promise to spend it on this AI. Independent free API quotas can be used where offered; quotas/rates/model availability may change.


## About the Google Cloud Agent Platform page that says "API Keys are Disallowed"
The Cloud Console screenshot is from the **Google Cloud Agent Platform authentication** page. The rejection is an **organization policy**, not a statement that all Google APIs are down. Owning a *project* does not automatically confer `Organization Policy Administrator` privileges at its organization/folder. Inspect the effective inherited constraint and only change it from an authorized organization policy scope after reviewing security implications; never disable an org-wide security policy casually.

**ADC in Cloud Shell is for development within that authenticated runtime, not a token to paste into GitHub.** For secure GitHub-to-Google Cloud automation without long-lived service account keys, investigate Google Workload Identity Federation using a dedicated service account with least-privilege Vertex AI access, restricted to this repo and approved branch/workflow. That would be a separately reviewed alternative to the Gemini Developer API key route. Neither the WIF pool, service account roles, nor Vertex AI paid model quotas have been set up or tested by this PR.

If API keys are disallowed and the Founder chooses not to alter policy, leave Google Fixer unactivated. Copilot remains the existing code-repair path.

## Future backup stages (NOT DONE YET)
1. **Provider fallback for Beans itself:** server-side NBL AI router with a primary OpenAI provider, independent secondary Google provider, per-feature consent/data rules, timeouts and circuit breaker; never expose provider keys to Android or website; preserve LOCKE account access and user isolation. A model fallback alone cannot fix a Supabase/network outage.
2. **GitHub Copilot → Google Fixer dispatch:** only for *approved public website incidents* and only on a verified Copilot service failure, not a bad code result or security policy denial. Preserve approval, budget and deduplication. Separate issue-level fallback must never double-charge from concurrent engines.
3. **Whole-system disaster recovery:** encrypted database backups with restore drills, independent object storage backups, DNS/host failover procedures, secondary runtime with matching auth and entitlement boundaries, documented runbooks. GitHub-hosted Fixers both stop if GitHub is unavailable. Cloudflare and Google Cloud can be evaluated separately, but the user has not approved a paid standby server and no infrastructure cutover has occurred.

## No automatic production change
Never merge AI-generated proposals, expose API keys in logs/PRs, publish Android updates, rotate Supabase credentials, or change Stripe products through this Google Fixer workflow.
