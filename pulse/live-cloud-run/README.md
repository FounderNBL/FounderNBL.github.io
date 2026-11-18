# Pulse Live Cloud Run — controlled, not activated

This is an **OFF-by-default control service**, not yet a functioning video ingest/encoder, broadcaster, or Google Live Stream channel manager. Never describe it as a completed Go Live feature.

## Deployment guardrails

- Only `PULSE_LIVE_ENABLED=true` permits future broadcast admissions, and only **after** actual authorization, provider integration, budget enforcement and automatic teardown exist.
- No public HTTP switch endpoint. `/status` is read-only. Do not expose admin credentials in the browser.
- Deploy with the NBL Google Runtime service account only after verifying IAM permissions, allowed identity attachment, Cloud Run deploy authorization, and the intended project.
- Set **min instances 0** and a low max instance count; do not deploy with `--allow-unauthenticated` unless a separate reviewed authentication boundary is implemented.
- Cloud Run scale-to-zero and disabled admissions do **not** guarantee $0 charges: Google Live Stream channels, storage, load balancers and other services have independent costs.
- The Founder can say **turn Pulse Live ON/OFF** in ChatGPT. The assistant must use a connected, authorized Google Cloud control tool to actually change the deployed service, verify the state, and report the result. If no such tool is connected, say so; never claim a spoken command alone toggled Google Cloud.
- OFF must block new admissions and terminate existing sessions via a separate tested teardown controller; simply changing this flag is insufficient for a hard spending cutoff.
- No deploy, merge, channel creation, or spending is authorized by this file alone.

## Status

`GET /health` or `GET /status` returns `broadcastingEnabled` and `broadcastingImplemented:false`. No actual Google streaming is wired yet.
