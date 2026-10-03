# Cloudflare + GitHub Copilot

When interacting with Cloudflare, use the Cloudflare MCP servers for account-wide platform operations and current Cloudflare documentation.

Use the `cf` CLI unless this project already has a Wrangler configuration file. If `wrangler.jsonc` or `wrangler.toml` is present, keep using Wrangler for project-local development, deploys, bindings, and Worker-specific commands.

Before changing Cloudflare resources:
- inspect the current state first;
- prefer the smallest safe change;
- do not delete or replace resources unless the task explicitly requires it;
- never commit API tokens, OAuth credentials, account secrets, or production secrets;
- use Cloudflare's current docs rather than relying on stale API knowledge.

For DNS, WAF, Zero Trust, R2, account settings, builds, observability, and other account-level operations, prefer the Cloudflare MCP/API tooling.
