# LIVE SITE HANDOFF — FounderNBL.github.io

**Production rule:** This document applies to the live New Beansland™ production repository: `FounderNBL/FounderNBL.github.io`.

Do **not** treat `playhouse/` or `FounderNBL/New-Beansland-Playground` as the source of truth for live public assets. Do not change Playhouse while doing production cleanup unless the Founder explicitly asks for it.

## Completed in this cleanup

- Added a live runtime correction for the clothing commercial audio so `clothing.html` uses the existing `NBL clothes2.mp3` file instead of the stale `NBL clothes .mp3` reference.
- Kept the main Clothing navigation visible and horizontally scrollable on screens under 820px instead of letting the page hide Home / Books / TV & Film / Institute / Clothing / Founder’s Office.
- Reduced dependence on the Playground for clothing images where a known live-repo equivalent already exists:
  - `NBL-pose-template.png`
  - `NBL-hat-sweats-outfit.png`
  - `NBL-highs.png`
  - model-front fallback → `NBL-Model-Front.png`
- Preserved the existing global New Beansland™ trademark runtime treatment.
- Left the live Cash App / current bookstore flow intact. Do not remove a working checkout method until Stripe live payment links are actually created and tested.

## Remaining clothing asset migration

The following Clothing images are still external dependencies because no exact safe local replacement has been confirmed in the live repo:

- `NBL-hoodie-outfit.png`
- `Nbl-leather-outfit.png`
- `NBL-Being-Black.png`
- `NBL-Ice-Out-outfit.png`
- `NBL-sneakers-black.jpg`

When the exact approved files are available, copy them into the live repo (recommended: `assets/clothing/`) and change `clothing.html` to local paths. After every Clothing image is local, remove the Playground/CDN fallback from `nbl-portal.js`.

## Duplicate asset cleanup — do not delete blindly

There are confirmed byte-identical root/asset duplicates, especially book covers, trailers, homepage artwork, and Founder’s Office assets. The canonical long-term location should be under `assets/`, but root copies must not be deleted until all live HTML/JS/CSS references have been repointed and verified.

Confirmed duplicate families include:

- People Zoo front/back/trailer/live-cover at root and `assets/books/people-zoo/`
- Doctor/Rocketship standard and Islamic covers/trailers at root and `assets/books/doctor-rocketship/`
- `New_New_homepage.png` and `assets/site/homepage/New_New_homepage.png`
- multiple Founder’s Office assets at root and `assets/founder-office/`
- multiple brand assets at root and `assets/brand/`

Important: similarly named files are **not always identical**. Compare blob SHA/content before deleting.

## Large media

Two especially large root videos need optimization, but they are not confirmed disposable duplicates:

- `@FounderNBL.mp4` — about 24.9 MB
- `NBL-Commercial-Short-last.mp4` — about 19.8 MB

Compress and/or migrate them to a canonical media folder only after the live pages that use them are identified and updated. Do not simply delete them.

## Books / direct ebook payments

`books.html` is the real live bookstore. The tiny `doctor-rocketship-shop.html` and `people-zoo-shop.html` files intentionally redirect into it.

Current direct digital prices on the live page:

- Doctor/Rocketship Test — Standard Illustrated eBook: $3.00
- Doctor/Rocketship Test — Islamic Dilemma Illustrated eBook: $3.00
- The People Zoo eBook: $5.00
- Doctor/Rocketship + People Zoo digital bundle: $6.00

The NBLBOOKS Stripe account is connected in live mode, but the current connector authorization does **not** have permission to create Payment Links. Do not replace the current direct-order flow until Stripe write permission is granted, the four live links are created, buyer email collection is verified, and a real low-risk test purchase succeeds.

Target flow later:

`NewBeansland.org Buy button → Stripe hosted checkout → buyer email/payment recorded → New Beansland™ manually sends the correct EPUB/PDF.`

Lulu remains separate for print/global distribution.

## Studio

`/studio` is a valid starting point for the music player. Keep public playback/media there. Add artwork, previews, and purchase links later if desired.

Never put Suno, Grok, Runway, Stripe secret keys, or other private API credentials into this public GitHub Pages repository.

## Engine / 3D

Leave `engine/` as Phase 1 contracts/tests and keep `assets/3d/models`, `textures`, and `posters` as placeholders until real models and a private backend exist.

Do not wire public GitHub Pages directly to private provider keys.

## Print-ready clothing files

Campaign mockups and product photos are not printer masters. Keep a separate set of small, transparent, high-resolution PNG artwork files for print vendors. Do not use full campaign photos as print logos.

## Resume order

1. Merge/test the current live clothing fixes.
2. Move the remaining approved Clothing images into `assets/clothing/`.
3. Repoint all duplicate root references to canonical `assets/` paths, verify the site, then delete exact duplicates.
4. Compress/migrate oversized videos without breaking live pages.
5. Reauthorize Stripe with Payment Link write permission and build/test the four ebook payment links.
6. Improve Studio only after store reliability is locked.
7. Leave Engine/3D for the later private-backend phase.
