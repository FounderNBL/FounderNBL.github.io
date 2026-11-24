# TikTok connection
Registered Web callback: https://newbeansland.org/pulse/tiktok-callback.html
Webhook: https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-tiktok-connect/webhook
Production credentials: NBL_TIKTOK_CLIENT_KEY and NBL_TIKTOK_CLIENT_SECRET. Keep production disabled until approval using NBL_TIKTOK_PRODUCTION_ENABLED (only true enables).
Sandbox credentials: NBL_TIKTOK_SANDBOX_CLIENT_KEY and NBL_TIKTOK_SANDBOX_CLIENT_SECRET. Clone the production configuration into a Sandbox, register callback, add target TikTok account, enable private Direct Post. Do not replace production keys.
Uses existing NBL_CONNECT_TOKEN_AES_KEY. Grant records are private service-role only. For verified deletion requests, remove member's TikTok grants, states and posting records; revoke the grant first where possible. Webhooks are HMAC-verified; revocation removes matching prior grants. Posting status is owner-checked by polling. No automatic posts, no downloaded third-party videos, no public sandbox posts.
Required scopes: user.info.basic, video.upload, video.publish; video.list optional only if granted. Remove unused products/scopes from review. Share Kit is not used. No music library, collaboration, editing/deletion, messaging, or LIVE permission is claimed.
Run node --test scripts/check-pulse-tiktok.test.mjs; then authenticate a real sandbox target, upload an original video, check status, and disconnect. A real sandbox demo is required before first review.
