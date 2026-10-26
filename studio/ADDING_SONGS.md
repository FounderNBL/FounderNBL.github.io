# Add a song to NBL Music Productions

The public player is already data-driven. Adding one complete release entry to
`catalog.js` automatically adds the song to the record list, player,
previous/next controls, release details and same-site MP3 download button.

## One-song checklist

1. Upload the final `.mp3` and its approved cover image to this repository.
2. Copy the object below into `window.NBL_TRACKS` in `catalog.js`.
3. Replace every placeholder with verified release information. Do not guess
   writers, producers, ownership, dates or featured artists.
4. Keep `purchaseUrl` empty unless the Founder separately approves and verifies
   a real purchase route. Keep `previewSeconds: 0` for a full free stream.
5. Run `node --test scripts/check-nbl-music-free-library.test.mjs` before merge.

```js
{
  id: "unique-song-id",
  title: "Song Title",
  artist: "Artist Name",
  credit: "NBL Music Productions · New Beansland™",
  songwriter: "Verified songwriter",
  producer: "Verified producer",
  label: "Verified label",
  rightsHolder: "Verified master / copyright holder",
  publisher: "Verified publisher or Not listed",
  releaseDate: "Verified date or Not listed",
  album: "Verified album / catalog",
  description: "Approved public release description.",
  cover: "../path/to-approved-cover.png",
  audio: "../path/to-final-song.mp3",
  video: "",
  previewSeconds: 0,
  purchaseUrl: "",
  badge: "ARTIST"
}
```

Do not add unfinished songs, private drafts or unverified rights to the public
catalog. The player needs no code change when a valid entry is added.
