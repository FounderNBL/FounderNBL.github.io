# NBL GitHub local-first workflow (Founder approved cost control)

This is **not a new NBL system**. It is a less expensive way to run the same
source checks, using GitHub Codespaces and the existing GitHub workflows.

## Intended sequence
1. In the selected website repo, choose GitHub **Code > Codespaces** and open a
   **2-core** codespace (check your own remaining monthly quota).
2. Before opening or updating a PR, run:
   `node scripts/nbl-local-site-check.mjs`
3. Fix failing code locally. Do not trigger Copilot automatic code reviews or
   repeat GitHub workflow reruns for ordinary local edits.
4. When the change is ready for Founder review, publish a scoped PR.
   The existing independent source and protected-route checks still decide
   green/HOLD. The chat-parity browser suite is only run **once** in one job
   rather than being installed/executed in two separate runners, and draft
   PRs defer that expensive browser job until marked ready.
5. Stop the Codespace promptly. Closing a browser tab does **not** always
   stop its virtual machine. Do not enable paid prebuilds.

## Budget boundaries
- Codespaces has a separate allowance/budget from Actions and Copilot.
- Running tests in Codespaces spends **Codespaces compute** and never replaces
  source-security CI, signed releases or the authorized real Inspector/Fixer.
- Neither Codespaces nor a cheaper workflow prevents all GitHub spend by itself.
  Verify the **Actions**, **AI credits** and **Codespaces** hard-stop settings
  in `https://github.com/settings/billing/budgets`, using the Founder account.
- Account-level Copilot auto-code-review and push re-review are GitHub settings,
  not controlled by repository instructions. The Founder should turn them off
  if unused; one manual review may still be requested on high-risk changes.
- Never automatically start paid code agents, enable new secrets, alter pricing
  or deploy/publish based only on a green local test.

## Existing protections preserved
The website Inspector, Cloudflare health handshake, LOCKE/security checks,
existing World Cards and source parity remain unchanged. NBL Desk is
records-only, not an Inspector/Fixer target. The Founder alone approves
production changes and higher-risk actions.

## Honest boundary
The local script checks source. It does not prove live deployment, browser
behavior, provider authentication or a reduced **dollar** invoice. Measure
actual billed usage after this workflow has been used.
