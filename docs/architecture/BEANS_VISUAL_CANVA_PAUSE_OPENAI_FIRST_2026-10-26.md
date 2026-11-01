# Founder visual direction — Canva paused, Beans remains the only visual assistant (2026-10-26)

**Status:** Website source candidate only. No production merge, Supabase deploy, image-generation API spend, Google provider activation, account disconnect, or checkout is authorized by this note.

## Founder correction and outcome

The Founder reports Canva OAuth/connect continues to loop. Pause **all customer-facing Canva launches and design creation/listing UI** for now. Do not force customers through a broken OAuth loop. The account page should show a minimal **Disconnect Canva** control **only if** that verified customer's existing connection is present; do not revoke people's consent or erase tokens automatically. The separate protected backend connector code and its OAuth credentials remain intact for reversible future repairs but are not advertised in the website.

Visual intelligence is a **native ability of Beans**, not another public person or chat: camera, photo/files, image understanding and image generation share his normal conversation, account identity, tool-meters and authorization. The website can offer more than the compact Android app while keeping **the same Beans persona**. Professor Grey/Virgo is a separate existing instructor identity with its own role, teaching style and protected University access—unaffected.

## Existing real machinery

- The website's `nbl-world-header.js` includes Beans camera, attachment, image and chat rail. Its Canva toolbox was a secondary in-chat visual panel. The Canva tool launch button is hidden/removed in this candidate; the legacy implementation is retained behind no visible entry for rollback and has no new calls from the public tool selector.
- The website `account.html` continues to offer GitHub connected-app management, while removing Canva begin/list/create/reconnect UI. Existing authorized Canva users retain the right to disconnect.
- NBL Chat source `supabase/functions/nbl-foundation-runtime/index.ts` currently defaults image creation to `OPENAI_IMAGE_MODEL || "gpt-image-2"`; image-capability and billing execution **must be independently verified against the actual deployed backend**. The user's existing OpenAI balance is not a promise of unlimited images.
- Current OpenAI documentation (as reviewed on 2026-10-26) offers GPT Image 2.5 Sunburst for fine editing and Flare for fast image generation. The Responses `image_generation` tool can participate naturally in a dialogue. These are **possible configuration/engineering upgrades, not deployed changes**.
- Google's Gemini API currently offers image generation/editing, including `gemini-nano-banana-2.1` and `gemini-3-pro-image`. A Google adapter is **OPTIONAL** and only after actual secret/account/billing support, model capability checks, consent and comparison with OpenAI. Do not enable a saved Google agent named STILL or create a second public assistant.

## Guardrails

1. Do not alter real customer Canva data or provider tokens just to retire a broken UI; preserve an explicit disconnect path.
2. Do not silently switch all image generation to a new provider/model, allow double-billing, or promise unrestricted editing. Keep member/Founder image entitlement and per-request cost tracking.
3. The old public visual-panel test expectations are superseded: updated browser/source tests should now verify **no customer Canva button**, plus **Beans image/camera/attachment controls remain**. Old NBL Chat BrowserStack scripts that still expect a Canva toolbox must be amended before being run against this candidate; do not call the new design failed solely because an obsolete test expects the retired UI.
4. Do not touch University, Grey, AAB/signing, games, Stripe price/product state, OAuth secrets, Google agents, or the active Supabase 19/66-file bundles.
5. Before merge: direct source checks, browser tests and current repo/website integration review. Real paid image generation, connected customer sessions and Android live devices require separate bounded end-to-end execution with truthful results. **No GitHub Actions** per Founder directive.

## Source references

- `docs/architecture/BEANS_STILL_SINGLE_VISUAL_FEATURE_2026-10-25.md` — prior rationale; this 2026-10-26 pause supersedes the customer-facing Canva recommendation only.
- `nbl-world-header.js` and `account.html` — candidate website UI.
- `scripts/check-nbl-connect-account.test.mjs` and `tests/browser/website-smoke.spec.mjs` — updated regression expectations.
- `FounderNBL/NBL-Chat/supabase/functions/nbl-foundation-runtime/index.ts` — existing model image path, not a guarantee of active paid provider success.

**Priority:** Beans' native OpenAI visual flow first; Google optional second after genuine verification; Canva paused, reversible; no separate Still chatbot.
