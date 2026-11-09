# NBL Pulse — Member-First Layout Skin (Design-Only Draft)
**Date:** November 9, 2026  
**Scope:** Existing `/pulse/` website presentation only.  
**Founder:** “You don't even need pictures to make it look good; you just need to lay out the pictures. The pictures come from the people.”  
**Status:** Review branch / draft PR. **Not deployed, not merged, not a redesign of NBL corporate branding.**

## Objective

Make the current working NBL Pulse feel like a real finished social network **without buying a builder or fabricating content**. The most valuable visuals are *real member posts, avatars, videos, and creator content*. The website supplies the environment and layout. The founder's Facebook references establish familiar social composition but the result uses original NBL styling, not copied branded UI.

## External layout reference study (13 products / one pattern each)

These are **interaction and information-architecture references** drawn from public product/help material, *not copied artwork, code, logos, photography, or proprietary layouts*:

| Reference | Specific useful principle for the existing Pulse interface |
|---|---|
| Facebook — Founder-supplied screenshots | Familiar account + compose + chronological social card hierarchy; mobile first. |
| Instagram — Founder-supplied screenshots | Member media should stand out; edge-friendly imagery with simple reactions. |
| [Threads web](https://about.fb.com/news/2025/04/new-features-threads-web-experience/) | Clean single feed with obvious changeable tabs and composition. |
| [Reddit](https://redditinc.com/news/explore-more-communities-with-reddits-new-feed-updates) | Distinct For You / Following feed selection. |
| [LinkedIn](https://www.linkedin.com/help/linkedin/answer/a518996/posting-and-sharing-content-overview?lang=en) | Simple, always-visible share composer above feed. |
| [X](https://help.x.com/en/using-x/x-timeline) | Readable, predictable single-column feed and clear feed controls. |
| [Bluesky](https://bsky.social/about/blog/01-26-2026-whats-next-at-bluesky) | Feeds should foreground people and conversations, not platform announcements. |
| [Discord](https://discord.com/blog/improving-our-mobile-experience) | Mobile bottom tabs for destinations, especially messages. |
| [Pinterest](https://help.pinterest.com/en/article/explore-the-home-feed) | Member-generated images should shine, but **do not** use masonry for mixed text/video social posts. |
| [Behance](https://help.behance.net/hc/en-us/articles/204484044-Guide-Discover-Creative-Work-on-Behance) | Make creator visuals and attribution prominent while keeping navigation simple. |
| [Substack Notes](https://support.substack.com/hc/en-us/articles/14564821756308-Getting-started-on-Substack-Notes) | Minimal text-first community cards that also support user images and links. |
| [YouTube Community](https://support.google.com/youtube/answer/7124474) | Text, member images and video belong in one coherent post system. |
| [TikTok](https://support.tiktok.com/en/getting-started/for-you/test-for-you) | Full attention on real creator video; don't fill the layout with site-owned decorative photos. |

## Layout decisions from current Pulse markup and stylesheet

- Keep the existing `pulse/index.html` DOM IDs and `messenger/social-v1.mjs` entirely unchanged apart from adding a skin stylesheet and simplifying one visual header label.
- Make Pulse an **application view, not a landing page**: hide oversized informational launch ribbon, placeholder Stories notice, and unavailable Go Live blocks **via CSS only**. No actual feature is removed or enabled. Future real Stories/Live work remains separately scoped.
- On desktop, 3 columns: **208px navigation / fluid member feed / 218px information rail**; rail disappears on smaller screens. The middle column displays composer, real posts and their media. Avoid boxed feed inside another box.
- On phone (`<=760px`), one-column media feed, smaller branded header, **six reachable existing tabs on fixed bottom navigation** (For You, Following, My Posts, Friends, Notifications, NBL Messenger), and a simplified compact profile / Connect row.
- Use large touch targets, consistent surfaces, readable contrast, 14–18px radii, restrained lavender / purple / gold accents, system font, clear focus outline, and reduced-motion accommodation.
- Allow posts to be text-only; show member photos or videos **only when provided**, without stock photography, synthetic activity, pretend stories, fake creators, or generated profile images.
- Do **not crop** member images/videos aggressively; retain `object-fit: contain` so posters decide what they share.
- Keep profile photo uploading, Sign out, Connect providers, privacy restrictions, Facebook/Instagram share, video embed player, status messages, posting, likes, comments, friends, and Messenger iframe functional and wired to the same JavaScript.

## Files and release control

- New: `pulse/pulse-skin.css` — visual-only overrides layered after existing, shared CSS. No external imagery, hosted fonts, new JS, network requests, or backend.
- Changed: `pulse/index.html` — adds CSS link to skin; simplifies title to `NBL PULSE`. DOM controls/IDs and provider scripts stay in place.
- Test: source gate confirms the CSS file exists, is loaded, is responsive, avoids external images and leaves essential social IDs intact.

**Not part of this change:** NBL corporate rebrand, new logos, Pulse functions, payment/pricing, Clerk, Supabase, Stream, videos, profile storage, University, Beans, app/AAB, new domains or sales plans.

**Hold:** This is a **draft visual code proposal**. Founder reviews before merge, live deploy, or further redesign. A source check is not a real rendered-mobile or signed-in E2E test. No external billable calls authorized by this design.
