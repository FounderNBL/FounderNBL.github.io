# Add a song to NBL Music Productions

**Two different release paths exist. Never confuse them.**

The existing public website catalog is for **approved giveaway/showcase music only**.
The Founder knowingly allows the current two City soundtrack/showcase MP3s to be
listened to and downloaded freely. **Never add an exclusive JMELO, Shia, client,
or outside-artist master to the public repository.** Public GitHub history,
static-site assets and ordinary audio URLs are not protected distribution.

## A. Approved FREE showcase release (public repo)

1. Confirm the Founder approved this exact song, artwork, credits and **free
   public download**. Check distribution rights and any samples/licensing.
2. Upload the finished public giveaway MP3 and approved cover to this repo.
3. Copy one complete entry into `window.NBL_TRACKS` in `catalog.js`; the
   current data-driven player adds it to the list, previous/next controls,
   credits, and its **free** same-origin download button.
4. Use verified credits. Do not invent artists, features, rights, dates,
   producers, publishers, or owners.
5. Keep `previewSeconds: 0`, `purchaseUrl: ""` for public freebies.
6. Run `node --test scripts/check-nbl-music-free-library.test.mjs` before review.

```js
{
  id: "unique-song-id",
  title: "Song Title",
  artist: "Verified artist",
  credit: "NBL Music Productions · New Beansland™",
  songwriter: "Verified songwriter",
  producer: "Verified producer",
  label: "Verified label",
  rightsHolder: "Verified master / copyright holder",
  publisher: "Verified publisher or Not listed",
  releaseDate: "Verified date or Not listed",
  album: "Verified album / catalog",
  description: "Founder-approved public giveaway description.",
  cover: "../path/to-approved-public-cover.png",
  audio: "../path/to-approved-free-song.mp3",
  video: "",
  previewSeconds: 0,
  purchaseUrl: "",
  badge: "ARTIST"
}
```

## B. EXCLUSIVE / PAID-DOWNLOAD release (private master)

**Never follow Section A for exclusive music.** Preserve source masters offline
and use the existing private Supabase Storage bucket `nbl-music-masters` for
Founder-approved distribution masters. The bucket is private; do not make it
public. Uploading a file alone must never publish it.

- Record the true artist/featuring credits, track identity, rights clearance,
  final artwork, stream rendition, and sale-eligible master in a server-owned
  catalog. Do not put storage paths, master URLs or entitlement data in this
  public `catalog.js`.
- Free **listening** must use a time-limited, server-authorized streaming
  rendition separate from the sale master. Streaming audio can still be
  recorded by listeners; do not claim DRM or copy-proof protection.
- **Downloads require a verified purchase receipt**, the precise authorized
  track(s), and a short-lived signed delivery link returned server-side.
- The planned JMELO/Shia three-for-$1 MP4 art-track bundle lives in the
  [separate proposed sales plan](https://github.com/FounderNBL/Beans/blob/main/docs/music/NBL_MUSIC_THREE_FOR_ONE_DOLLAR_2026-10-17.md).
  It is NOT enabled by uploading songs or editing this catalog.
- Outside-artist uploads, payouts and creator subscriptions require their own
  rights, moderation, identity and payment safeguards before release.
- If the private catalog, authorized stream, checkout, or fulfillment is
  unverified, **keep the exclusive release off the public site**, not in a
  half-protected public MP3 URL.

NBL World (`nblworld.com`) is discovery only. NBL account services, streaming,
downloads and any eventual paid music checkout belong at
`https://newbeansland.org/studio/`.

## Explicit release rule

No public upload, private master transfer, new price, billing activation,
artist payout, production deploy, merge, or publication without the Founder's
specific approval and a successful verification of the actual release path.
