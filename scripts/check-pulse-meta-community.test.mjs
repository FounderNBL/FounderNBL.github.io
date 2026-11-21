import assert from "node:assert/strict";
import test from "node:test";
import {execFileSync} from "node:child_process";
import {readFileSync} from "node:fs";
const read=x=>readFileSync(new URL("../"+x,import.meta.url),"utf8");
const backend=read("server/supabase/functions/nbl-meta-community/index.ts");
const view=read("pulse/meta-community.mjs");
const pulse=read("messenger/social-v1.mjs");
const page=read("pulse/index.html");

test("New Founder Meta UI module is valid JS and stays out of member feeds",()=>{
 execFileSync(process.execPath,["--check",new URL("../pulse/meta-community.mjs",import.meta.url).pathname]);
 assert.match(pulse,/state\.me\?\.role==="founder"/);
 assert.match(pulse,/founderFacebookShareButton/);
 assert.match(pulse,/initMetaCommunity\(/);
 assert.match(page,/20261119-meta-review-scopes/);
 assert.doesNotMatch(view,/localStorage|sessionStorage|innerHTML|META_APP_SECRET|PAGE_ACCESS_TOKEN/);
});
test("No unauthorized Meta posting or comment replies",()=>{
 assert.match(backend,/founder_access_required/);
 assert.match(backend,/await founder\(req\)/);
 assert.match(backend,/pages_manage_posts/);
 assert.match(backend,/pages_read_engagement/);
 assert.match(backend,/pages_show_list/);
 assert.match(backend,/nbl_chat_usage_accounts/);
 assert.match(backend,/nbl_connect_oauth_states/);
 assert.match(backend,/consumed_at/);
 assert.match(backend,/confirm!=="publish"/);
 assert.match(backend,/confirm!=="reply"/);
 assert.match(backend,/not_official_instagram_media/);
 assert.match(backend,/facebook_page_not_connected/);
 assert.match(backend,/instagram_comments_permission_unavailable/);
 assert.match(backend,/nbl_connected_accounts/);
 assert.match(backend,/AES-GCM/);
 assert.doesNotMatch(view,/fetch\(/);
});
test("Existing Instagram photo publish and Messenger remain unmodified",()=>{
 assert.match(pulse,/INSTAGRAM_API\+"\/publish\/prepare"/);
 assert.match(pulse,/INSTAGRAM_API\+"\/publish\/confirm"/);
 assert.match(pulse,/facebookShareLink\(activity.id\)/);
 assert.match(pulse,/location.assign\("\/messenger\/"/);
 assert.doesNotMatch(backend,/nbl-live|nbl-messenger-push/);
});

test("Meta review API diagnostic is Founder-only and never exposes credentials",()=>{
 assert.match(backend,/const PULSE_APP_ID="1167499339147411"/);
 assert.match(backend,/if\(route==="\/review\/diagnostics"\)/);
 assert.match(backend,/debug_token/);
 assert.match(backend,/matches_pulse_app/);
 assert.match(backend,/APP_ID===PULSE_APP_ID/);
 assert.match(backend,/HKDF/);
 assert.match(backend,/AES-GCM/);
 assert.match(view,/Check Meta API permissions/);
 assert.match(view,/review\/diagnostics/);
 assert.doesNotMatch(view,/IG_TOKEN|APP_SECRET|access_token|token_ciphertext/);
});

test("Instagram account discovery supports all official Meta login routes",()=>{
 const instagram=read("server/supabase/functions/nbl-instagram-connect/index.ts");
 for(const source of [backend,instagram]){
  assert.match(source,/me\/assigned_instagram_accounts/);
  assert.match(source,/me\/accounts/);
  assert.match(source,/graph\.instagram\.com/);
  assert.match(source,/instagram_business_account/);
 }
 assert.match(backend,/account\.host/);
 assert.match(instagram,/ig\.host/);
 assert.match(instagram,/publish\/confirm/);
 assert.match(instagram,/founder_access_required/);
 assert.doesNotMatch(view,/IG_TOKEN|APP_SECRET|access_token|token_ciphertext/);
});

test("Reel processing status is read-only and publishing requires explicit confirmation",()=>{
 const instagram=read("server/supabase/functions/nbl-instagram-connect/index.ts");
 const feed=read("messenger/social-v1.mjs");
 assert.match(instagram,/publish\/status/);
 assert.match(instagram,/if\(kind==="status"\)return response/);
 assert.match(instagram,/ready:code==="FINISHED"/);
 assert.match(instagram,/if\(body\.confirm!==kind\)/);
 assert.match(instagram,/founder_access_required/);
 assert.match(feed,/INSTAGRAM_API\+"\/publish\/status"/);
 assert.match(feed,/Instagram processing failed/);
 assert.match(feed,/Check Reel status/);
 assert.match(feed,/window\.confirm\("Publish this video publicly/);
 assert.match(feed,/INSTAGRAM_API\+"\/publish\/confirm"/);
});

test("Facebook Live review OAuth requests Page Live scope without leaking tokens",()=>{
 assert.match(backend,/pages_read_user_content/);
 assert.match(backend,/pages_manage_posts/);
 assert.match(backend,/pages_show_list/);
 const client=read("pulse/live.mjs");
 assert.match(page,/id="pulseLiveFacebookOption"/);
 assert.match(page,/id="pulseLiveScreenOnly"[^>]*checked/);
 assert.doesNotMatch(page,/id="pulseLiveShareScreen"/);
 assert.match(client,/await state\.call\.screenShare\.enable\(\)/);
 assert.match(client,/if \(!screenOnly\) \{\s*await state\.call\.camera\.enable\(\);\s*await state\.call\.microphone\.enable\(\);/);
 assert.match(client,/if \(state\.screenOnly && !state\.screenReady\)/);
 assert.doesNotMatch(client,/FB_PAGE_ACCESS_TOKEN|NBL_PULSE_META_APP_SECRET/);
});


test("Mobile NBL residents continue camera broadcasting without mandatory screen sharing",()=>{
  const live=read("pulse/live.mjs");
  assert.match(live,/option\.disabled = mobile\.matches/);
  assert.match(live,/if \(mobile\.matches\) option\.checked = false/);
});

test("Go Live selects the screen on its own click, without extra button or premature LIVE timer",()=>{
  const client=read("pulse/live.mjs");
  assert.match(client,/async function onGoLive\(\)[\s\S]*?await state\.call\.screenShare\.enable\(\)/);
  assert.match(client,/show\("#pulseLiveBadge", status === "live"\)/);
  assert.match(client,/state\.liveSince = null/);
  assert.match(client,/facebookSelectionTouched/);
  assert.doesNotMatch(client,/#pulseLiveShareScreen/);
});

test("Pulse distinguishes Meta Live publishing access denial from an expired Page token",()=>{
  const client=read("pulse/live.mjs");
  assert.match(client,/facebook_live_permission_denied/);
  assert.match(client,/facebook_live_restricted/);
  assert.match(client,/You are NOT live/);
  assert.doesNotMatch(client,/Supabase needs a valid Page access token/);
});
