## Current Founder decision — October 14, 2026: member services on .org

**THIS OVERRIDES October 8 routing instructions below.** Clerk production for newbeansland.org does not provide a shared signed-in session to nblworld.com. Founder expressly approved moving human-to-human Chat, University/Professor Grey/Virgo, all NBL-owned paid account services, and member interactions to **https://newbeansland.org**. The existing Beans and account gateway already run here. The independent **nblworld.com** domain is for **commercial sales/discovery** (Shopify, books, external merchant links) and must not own a second Clerk sign-in or NBL Stripe checkout. Source migration is staged in PRs and is not live/verified until approved, merged and tested. Keep protected NBL academic content and credentials on Supabase/LOCKE servers, and keep University checkout held until account binding and second-account isolation are proven. Preserve all game/Office/video art and files unchanged. Newest Founder decision beats older README/test text.

---

## Founder public-site boundary — October 8, 2026

**NewBeansland.org is for visitors to look, touch, explore and READ.** It is not the long-term functional Beans, human-chat or University application.

Link visitors to **[NBL World](https://nblworld.com/)** when they need to DO something: use Beans, talk with other members, attend University, manage student accounts/credits or transact. Do not build duplicate chat/University product engines on the two public sites. Existing public pages and assets remain undisturbed until a separate intentional functional handoff.

Desk owns paper planning, review and dispatch; NBL-Chat holds chat-related implementation; Playground protects private NBL intellectual property (NOT API keys). Runtime integration credentials and access checks remain private on authorized servers/CI.

Historical README descriptions presenting NewBeansland.org as the canonical customer Beans platform and listing old prices are superseded by the [current Founder Desk plan](https://github.com/FounderNBL/nbl-desk/blob/main/NBL_FOUNDER_REPO_ROUTING_PAPER_PLAN_2026-10-08.md). No Office/game/video/E2E work and no live routes, billing or content changes in this **paper** pass.

---
# New Beansland

Official public production repository for **New Beansland**.

New Beansland is an evolving creative world created by Founder Jamel Hawkins and built to be explored through its public site, books, University, stories, music, clothing, and interactive rooms.

This repository contains public-facing production pages, assets, and checks that protect the live experience. Private continuity, experimental development, internal system architecture, and future backend/AI work are kept outside the public production repository.

**Public site:** https://newbeansland.org/

**Production hosting:** GitHub Pages. Replit is a mirror/test bench; Cloudflare Wrangler is not the production deployment path.


## NBL Chat™ historical website-first parity contract (October 5, superseded October 8)

The October 8 Founder ownership decision makes **NBL World (nblworld.com)** the customer-facing home of interactive Beans, human NBL Chat, University and accounts. Both the Android and website Beans interfaces must use the same **NBL Core** protected backend/intelligence; their presentation can differ. The existing public New Beansland website is a discovery/read/explore surface. This README update changes documentation only; no interactive customer migration or release is claimed.

The following older website-first checklist and prices are **preserved as historical design evidence only**, not active pricing, release permission or instruction to build duplicate public-site product engines. The old mobile-versus-website visual comparison remains useful for retained capabilities but no longer overrides the NBL World source-of-truth for the live member journey. Native billing, permissions, and device APIs may differ technically, but they should not invent a second product or a different user experience.

Current website Chat standard includes:

- NBL-branded side drawer;
- New Chat and recent signed-in conversation history;
- Beans as the regular Chat experience;
- NBL Chat™ is the regular brand; NBL CHAT PLUS™ is the premium brand featuring Professor Grey™ and the Virgo System™, powered by OpenAI; Professor Grey™ / Virgo System™ general reasoning is included with NBL CHAT PLUS™; protected Guided Learning course access remains separately entitlement-gated through NBL University;
- locked plan language: $4.99 Beans / 300 replies, $19.99 Plus / 1,050 replies, $9.99 Get More / +500;
- NBL University and account doors;
- NBL CHAT PLUS™ file/photo/code/image tools route through the server-side entitlement and metering rail;

Website first. App follows.
