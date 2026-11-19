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
 assert.match(page,/20261119-instagram-founder-crosspost-meta-community/);
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
