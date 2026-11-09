# NBL Messenger independent screen — Founder-scoped redesign, November 9 2026

## Founder direction
"All we got to do is take Messenger out of Pulse and give it its own place. We already had Messenger set up before Pulse." Later: **"Fix it."**

Implementation scope: website only. **No rebuild, no app-store work, no extra provider, no pricing, no changes to LIVE calls or other products**. Source branch and draft PR until the Founder approves merge/deployment.

## Separation / functionality
- `/messenger/` remains the original signed-in NBL Messenger route, using existing Clerk identity and Supabase `nbl-social` direct messages. No AI messages, payment routing, new databases or account migrations.
- Pulse `/pulse/` remains the real Stream Feeds social network; it **does not iframe Messenger** or show Messenger as a feed tab.
- Pulse member posts' **Message** actions open `/messenger/?dm=@handle` directly, preserving the explicit **Open** action before a DM is created.
- Historic `/pulse/?messages=1[&dm=...]` bookmarks are forwarded to `/messenger/` with validated handle transfer.
- The homepage now has separate Pulse and Messenger world cards, with different navigation destinations. The NBL corporate seal stays the company umbrella; Messenger uses product-specific identity.
- `/messenger/` has dedicated polished desktop and phone presentation via additive `messenger-skin.css`. All `data-chat-*` DOM hooks are untouched.
- `/messenger/call.html` is already a separate private call page. Added `call-skin.css` for phone/desktop; `nbl_private`, camera/microphone controls, server gates and user membership checks unchanged.
- `/messenger/manifest.webmanifest` labels Messenger as `NBL Messenger`; service worker's public asset cache includes the new skin, still **never** caches user chats or authenticated provider responses.

## Branding / artwork status
Founder provided four authoritative references:
1. Messenger square app/world-card art, 2. Messenger Beans with phone (transparent), 3. Messenger landscape promo, 4. golden NBL corporate infinity-style logo for **all** products.

**Important:** These were uploaded in the chat, not committed as website assets. This GitHub code draft uses the existing reliable `/messenger/icon.svg` and `/NBL-Brand.png` until those exact Founder asset files are transferred to the website repository. Do not mislabel or invent replacement artwork or claim the supplied binary art is deployed. Preserve user source images and eventually add optimized variants with source attribution at Founder approval.

## Verified baseline and remaining release checks
Current website main as reviewed on November 9 includes PR #543 incoming Answer/Decline, merged November 9. `FounderNBL/Beans` retains private video backend `nbl_private` including Founder-only five-call pilot; this UI branch does **not** unlock it. In-app call invitations, push subscriptions, SW notification click paths remain unchanged.

Do before merge/deploy: CI source gates; actual responsive mobile/desktop visual inspection; signed-in browser two-account isolation; member-to-member explicit DM; no iframe in Pulse; old links redirect; incoming call authorization, Answer/Decline (pilot only, without expanding billing); no user data exposure; confirm new asset files in web repo before adopting official card art. PR #544 older Pulse skin remains draft and **still assumes an embedded Messenger**; reconcile with this separation before adopting it.

**Founder releases only.** Don't eat the acorn.
