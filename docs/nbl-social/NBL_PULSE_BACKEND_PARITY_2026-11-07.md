# Pulse backend parity — November 7, 2026

This copy starts from the **deployed** `nbl-social` v39 and adds `social_profile`, `friends_list`, `friend_request`, `friend_accept`, `friend_decline`, and `friend_remove`. The existing Messenger actions and Clerk session authentication are preserved. No secrets are in source.

The migration creates a private, RLS-enabled friend-request table with no browser grants. Friend requests require consent; blocked users and protected University members stay inaccessible, and new requests are capped at 20/day/account. All actions go through the server with Clerk authorization. This is not Stream AI moderation.

**Still required before unrestricted public release:** two-account Clerk integration tests, Stream Feeds v3 write/read isolation, provider moderation, media upload protection, billing and Go Live limits. No paid services enabled by this PR. Keep Go Live disabled until enforced server-side.