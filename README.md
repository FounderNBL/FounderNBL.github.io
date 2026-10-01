# New Beansland

Official public production repository for **New Beansland**.

New Beansland is an evolving creative world created by Founder Jamel Hawkins and built to be explored through its public site, books, University, stories, music, clothing, and interactive rooms.

This repository contains public-facing production pages, assets, and checks that protect the live experience. Private continuity, experimental development, internal system architecture, and future backend/AI work are kept outside the public production repository.

**Public site:** https://newbeansland.org/

**Production hosting:** GitHub Pages. Replit is a mirror/test bench; Cloudflare Wrangler is not the production deployment path.


## NBL Chat™ product standard

For NBL Chat™ experience and behavior, **the production website is the reference implementation**.

The Android/mobile client should follow the website's product language, drawer structure, Beans / Professor Grey™ separation, account/history behavior, pricing labels, and capability state wherever the native platform allows it. Native billing, permissions, and device APIs may differ technically, but they should not invent a second product or a different user experience.

Current website Chat standard includes:

- NBL-branded side drawer;
- New Chat and recent signed-in conversation history;
- Beans as the regular Chat experience;
- NBL Chat™ is the regular brand; NBL CHAT PLUS™ is the premium brand featuring Professor Grey™ and the Virgo System™, powered by OpenAI; Professor Grey™ / Guided Learning course access remains separately entitlement-gated through NBL University;
- locked plan language: $4.99 Beans / 300 replies, $19.99 Plus / 1,050 replies, $9.99 Get More / +500;
- NBL University and account doors;
- NBL CHAT PLUS™ file/photo/code/image tools route through the server-side entitlement and metering rail;

Website first. App follows.
