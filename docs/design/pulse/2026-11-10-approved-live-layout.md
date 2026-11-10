# NBL Pulse — Founder-approved live desktop and mobile design (2026-11-10)

The Founder supplied desktop and mobile reference images in this conversation and ordered the existing live website implemented immediately. The working page is **`/pulse/` on `newbeansland.org`**; this is a responsive redesign of that page, not a new social network or separate login.

## Visual contracts

- Desktop: NBL global navigation; Pulse navigation rail at left; horizontally scrollable round NBL brand highlights, compact post composer and actual Stream feed in the middle; featured NBL destinations, notification/feed shortcuts and links at right. Deep black/purple surfaces, neon violet borders, substantial media cards and clean readable type.
- Phone: full-width feed cards, circular highlight scroller, small creator field and three real media controls; fixed five-destination bottom dock (Home, Following, Create, Notifications, Messenger). My Posts and Friends remain available from the top More menu.
- The **first-load welcome panel is NBL-branded introductory content** and automatically disappears whenever real Stream feed cards are present. No invented users, reactions, followers, live audiences, or trending metrics. Disabled member stories explicitly say *coming soon*.
- Real input IDs, auth/session logic, Stream feed permissions, reply/like/share/comment actions, moderation, file and external-video validation, and separate private Messenger route must remain intact.
- The Photo/Video/Video link shortcuts reveal and use the existing `#postMedia`, `#videoLink`, and `#videoShareRights` controls. Text-only posting remains a single submission. No new spending, providers, APIs, or membership changes.

## Implementation

- `pulse/index.html` — responsive structure and accessible labels, no duplicate fake feeds
- `pulse/pulse-live-design.css` — design overrides after previously approved styles
- `pulse/pulse-live-design.mjs` — small composer/dock interaction layer; no independent social API requests
- `scripts/check-pulse-reference-layout.mjs` — layout, hooked controls and no fabricated activity assertions

## Rollback

Remove the last stylesheet and module references from `pulse/index.html`, then revert the Pulse-only HTML changes. The preserved `messenger/social-v1.mjs` remains the actual social engine throughout. This change does not touch University, games, payment services, or Android.
