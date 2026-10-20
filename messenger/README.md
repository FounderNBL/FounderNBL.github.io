# NBL Messenger — independent web application

This app lives at `/messenger/` and is **not Beans AI**. It has its own
document, JavaScript bundle, stylesheet, web-app manifest, app icon, and
restricted service worker. It is installable from a mobile browser. It is
not yet a Play Store Android package or a stand-alone domain.

## Runtime and identity
- Existing **NBL Clerk account**; no new credentials or separate student identity.
- Existing deployed `nbl-social` Supabase Edge Function used directly.
- Existing private `nbl_social_*` tables; no destructive migration or paid
  second Supabase project. Existing DMs and block/report protections remain.
- Shared same-origin notification helpers `/social-realtime.js` and
  `/nbl-infinity-sound.js` are intentionally reused from the public site.
  These should be moved into a dedicated shared package before domain split.
- **No Beans token/usage fees** for human messages.

## University
University's **Class Chat / Study Hall / student-to-school tools are retained**
inside `/university-campus.html#nbl-social`, using their existing protected
server authorization. Messenger does not grant student status or Grey access.
Campus nav/footer link to this independent Messenger app. University enrollment
and checkout are unchanged.

## Separation / compatibility
- Beans mobile application and Beans Edge Functions are unchanged.
- Legacy `/member-chat.html` and `/chat.html` remain intact temporarily for
  compatibility; no threads or history have been moved or deleted.
- The `/messenger/` service worker caches **only public static shell files**.
  It never intercepts or stores Clerk/Supabase requests or message content.
- Standalone domain, native packaging, social feed, profiles and monetization
  are future work. They are **not** claimed to be implemented by this split.

## Verification
- Check unauthenticated `/messenger/`: sign-in prompt, no message contents.
- Sign in with normal account; send/receive direct message with second account.
- Check block, mute, report and realtime notifications. No Beans credits debited.
- Check enrolled student can access Class Chat and Study Hall from campus.
- Check nonstudent cannot enter protected campus rooms.
- Check `/member-chat.html` still opens for existing bookmarks.
- Install to home screen on Android; open from launcher.
- No production promotion without these end-to-end checks.
