import "./check-pulse-share-worker.test.mjs";
import "./check-pulse-instagram-inbox.test.mjs";
import "./check-pulse-member-inbox.test.mjs";
import "./check-pulse-unified-inbox.test.mjs";
import "./check-pulse-post-controls.test.mjs";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {parsePublicVideo} from "../messenger/social-video-connect.mjs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const ui=read("messenger/social-v1.html"),js=read("messenger/social-v1.mjs"),css=read("messenger/social-v1.css"),embeds=read("messenger/social-video-connect.mjs");
const existing=read("messenger/app.js");
const campus=read("university-campus.html");
const releases=read("messenger/README.md");
assert.match(ui,/SOCIAL INTEGRATION PREVIEW/);
assert.match(ui,/noindex,nofollow/);
assert.match(ui,/social-v1\.mjs/);
assert.match(ui,/href="\/messenger\/"/);
assert.match(ui,/data-feed="foryou"/);
assert.match(ui,/data-feed="timeline"/);
assert.match(ui,/data-feed="user"/);
assert.match(ui,/data-feed="notification"/);
assert.match(ui,/id="postForm"/);
assert.match(ui,/data-feed="friends"/);
assert.match(ui,/id="friendsPanel"/);
assert.match(ui,/id="friendForm"/);
assert.match(ui,/id="postMedia" type="file"/);
assert.match(js,/action:"friends_list"/);
assert.match(js,/action:"friend_request"/);
assert.match(js,/friend_accept/);
assert.match(js,/friend_decline/);
assert.match(js,/friend_remove/);
assert.match(js,/selectedMedia\(\)/);
assert.match(js,/client\.uploadImage\(\{file\}\)/);
assert.match(js,/client\.uploadFile\(\{file\}\)/);
assert.match(js,/visibility:"public"/);
assert.match(js,/deleteActivityReaction\(\{activity_id:activity\.id,type:"like"\}\)/);
assert.match(js,/video\.controls=true/);
assert.match(css,/social-media/);
// Facebook uses user-controlled sharing of a public NBL post URL, never Page admin scopes.
assert.match(ui,/id="sharedPost"[^>]*hidden/);
assert.match(ui,/og:title/);
assert.match(ui,/social-v1\.mjs\?v=20261120-public-author-handles/);
assert.match(js,/const PUBLIC_SOCIAL_URL="https:\/\/newbeansland\.org\/messenger\/social-v1\.html"/);
assert.match(js,/new URL\(PUBLIC_SOCIAL_URL\)/);
assert.match(js,/dest\.searchParams\.set\("post",id\)/);
assert.match(js,/www\.facebook\.com\/sharer\/sharer\.php\?u=/);
assert.match(js,/https:\/\/newbeansland\.org\/pulse\/share\?post=/,"Facebook shares must use the first-party Pulse preview");
assert.match(js,/share\.target="_blank"/);
assert.match(js,/share\.rel="noopener noreferrer"/);
assert.match(js,/state\.client\.getActivity\(\{id:linkedPostId\}\)/);
assert.match(js,/isShareablePost\(activity\)/);
assert.match(js,/visibility:"public"/);
assert.doesNotMatch(js,/pages_manage_posts|pages_manage_metadata|pages_messaging|user_posts|access_token|autoPublishToFacebook/);
assert.doesNotMatch(ui,/Facebook Page inbox/);
assert.match(js,/@stream-io\/feeds-client@2\.9\.0/);
assert.match(js,/functions\/v1\/nbl-stream/);
assert.match(js,/functions\/v1\/nbl-social/);
assert.match(js,/action:"social_profile",userId:authorId/);
assert.ok(js.includes('new URL("/messenger/",location.origin)'));
assert.match(js,/url.searchParams.set\("dm",handle\)/);
assert.doesNotMatch(js,/url.searchParams.set\("messages","1"\)/);
assert.doesNotMatch(js,/target.searchParams.set\("embed","pulse"\)/);
assert.match(js,/const friends=state.selected==="friends"/);
assert.match(js,/location.assign\(url.pathname\+url.search\)/);
assert.doesNotMatch(js,/StreamChat|connectStreamChat|channel\.sendMessage/);
assert.match(ui,/Message an author through the existing NBL Messenger/);

assert.match(js,/secured\(STREAM_BRIDGE,\{action:"session"\}\)/);
assert.match(js,/secured\(SOCIAL_API,\{action:"me"\}\)/);
assert.match(js,/const jwt=await c\.session\.getToken\(\)/);
assert.match(js,/c\.addListener\?\.\(handleNBLAccountChange\)/);
assert.match(js,/state\.unsubscribe\?\.\(\);state\.unsubscribe=null/);
assert.match(js,/state\.client=null;state\.feed=null;state\.user=null;state\.me=null/);
assert.match(js,/assertCurrentAccount\(actorId\)/);
assert.match(js,/if\(api\.user\?\.id!==actorId\)/);
assert.match(js,/location\.reload\(\)/);

assert.match(js,/client\.connectUser\(\{id:api\.user\.id/);
assert.match(js,/new FeedsClient\(api\.key/);
assert.match(js,/getOrCreate\(\{watch:true,limit:20\}\)/);
for(const method of ["addActivity","addActivityReaction","addComment","getComments","getOrCreateFollows","getOrCreateUnfollows"]){
  assert.match(js,new RegExp(method+"\\("),method+" missing");
}
assert.match(js,/textContent=String\(text\)/);
assert.doesNotMatch(js,/(?:innerHTML|document\.write|localStorage|sessionStorage|STR[E]?AM_API_SECRET|SERVICE_ROLE_KEY|\bsecret:)/);
assert.doesNotMatch(js,/https:\/\/.*secret/i);
assert.match(css,/social-card/);
assert.match(existing,/functions\/v1\/nbl-social/);
assert.match(existing,/data-chat-messages/);
assert.match(campus,/https:\/\/nblschool\.com\//); // University now uses its independent school; never change it from Social.
assert.match(releases,/not yet a Play Store Android package/);
console.log("PASS: separate NBL Social preview source, server-owned identity, Stream Feeds calls, existing DMs and University preserved.");

const metaBackend=read("server/supabase/functions/nbl-meta-community/index.ts");
const metaClient=read("pulse/meta-community.mjs");
assert.ok(metaBackend.includes("founder_access_required"));
assert.ok(metaBackend.includes('confirm!=="publish"'));
assert.ok(metaBackend.includes('confirm!=="reply"'));
assert.ok(metaBackend.includes('provider:"facebook"'));
assert.ok(metaClient.includes("Connect NBL Facebook Page"));
assert.ok(metaClient.includes("Manage Instagram comments"));
assert.ok(js.includes("initMetaCommunity("));

const pulse=read("pulse/index.html"),home=read("index.html");
assert.match(home,/id="nbl-pulse-door"/);
assert.match(home,/href="\/pulse\/"/);
assert.doesNotMatch(home,/id="nbl-company-profile"/);
assert.match(pulse,/NBL Pulse/);
assert.doesNotMatch(pulse,/id="messengerPanel"/);
assert.doesNotMatch(pulse,/<iframe|pulseMessengerFrame/);
assert.match(pulse,/src="\/messenger\/icon.svg"/);
assert.doesNotMatch(pulse,/data-feed="messages"/);
assert.match(pulse,/href="\/messenger\/"/);
assert.match(js,/showPulseMemberInbox\(/);
assert.doesNotMatch(pulse,/<h2>Private Messages<\/h2>|Open Messenger ↗/);
assert.match(pulse,/id="socialApp" hidden/);
assert.match(pulse,/data-feed="foryou"/);
assert.match(pulse,/data-feed="notification"/);
assert.match(pulse,/id="postForm"/);
assert.match(pulse,/id="pulseLiveAdmin" hidden/,"Founder switch must default hidden");
assert.match(pulse,/id="pulseLiveToggle"/,"Real Founder ON/OFF control required");
assert.match(pulse,/src="\/pulse\/live\.mjs/,"Pulse Live must be wired to real client");
assert.doesNotMatch(pulse,/Go Live · setup pending/,"Old non-functional placeholder must be removed");
const liveClient=read("pulse/live.mjs");
assert.match(liveClient,/liveApi\("admin-switch"/,"Founder switch must call secured backend");
assert.match(liveClient,/data\.enabled === true/,"Pulse UI must honor backend OFF state");
assert.match(liveClient,/show\("#pulseLiveAdmin", data\.isAdmin === true\)/,"Only server-approved Founder sees control");
assert.doesNotMatch(liveClient,/FB_PAGE_ACCESS_TOKEN|STREAM_API_SECRET/,"Provider secrets must not ship to browser");
assert.match(pulse,/<meta name="robots" content="index,follow">/);
assert.match(pulse,/rel="canonical" href="https:\/\/newbeansland\.org\/pulse\/"/);
assert.doesNotMatch(pulse,/Founder-only live preview|Public publishing and Go Live are not enabled/);
assert.match(pulse,/NBL PULSE · LIVE on New Beansland/);
assert.match(js,/entity_type:"stream:feeds:v3:activity"/);
assert.match(js,/entity_type:"stream:feeds:v3:comment"/);
assert.match(js,/moderation\.flag\(/);
assert.doesNotMatch(js,/Pulse is in Founder-only testing/);
assert.match(js,/location\.pathname\.startsWith\("\/pulse"\)/);
assert.match(pulse,/postMedia" type="file" accept="image\/jpeg,image\/png,image\/webp,video\/mp4,video\/webm" multiple/);
assert.doesNotMatch(pulse,/postMedia" type="file" disabled/);
assert.match(pulse,/postMedia"[^>]*video\/mp4/);
assert.match(pulse,/social-v1\.mjs\?v=20261121-instagram-dm-page-v3/);
assert.match(pulse,/id="pulseInstagramInboxNav"/);
assert.match(pulse,/id="pulseInstagramInbox"/);
assert.match(js,/mountInstagramInbox\(\(path,payload\)=>secured\(INSTAGRAM_API\+path,payload\)\)/);

assert.match(js,/import \{recentHomeBeats\} from "\.\/pulse-home-recent\.mjs"/);
assert.match(js,/ownFeed=selected==="foryou"\?state\.client\.feed\("user",actorId\):null/);
assert.match(js,/recentHomeBeats\(\[primaryRows,ownRows\],\{limit:8\}\)/);
assert.match(js,/getOrCreate\(\{watch:true,limit:20\}\)/);
assert.match(pulse,/id="pulseNewBeatNotice"[^>]*role="status"/);
assert.match(pulse,/id="pulseNewBeatView"/);
assert.match(pulse,/id="pulseNewBeatDismiss"/);
assert.match(pulse,/<meta property="og:title" content="NBL Pulse \| New Beansland">/);
assert.doesNotMatch(pulse,/A post from New Beansland Social/);
assert.match(js,/createNewBeatTracker\(\)/);
assert.match(js,/newBeatTracker\.prime\(primaryRows\)/);
assert.match(js,/newBeatTracker\.collect\(primaryRows,actorId\)/);
assert.match(js,/pulseHandle\(profile\)/);
assert.match(css,/\.pulse-new-beat-notice/);
assert.match(js,/VIDEO_TYPES\.has\(f\.type\)/);
assert.doesNotMatch(js,/Video uploads are not enabled yet/);
assert.match(js,/image_url:trusted/);
assert.match(js,/await state\.client\.uploadImage\(\{file\}\)/);
assert.match(js,/if\(asset\.type==="image"\)await state\.client\.deleteImage/);
assert.match(pulse,/id="pulseLiveStart"/);

// Pulse public avatars, member media and safe provider video embeds.
assert.match(pulse,/id="profileAvatarFile"/);
assert.match(pulse,/id="identityAvatar"/);
assert.match(pulse,/id="connectProviders"/);
assert.match(pulse,/id="copyPulseInvite"/);
assert.match(pulse,/id="composerAvatar"/);
assert.match(pulse,/id="videoLink"/);
assert.match(pulse,/id="videoShareRights"/);
assert.match(embeds,/parsePublicVideo/);
assert.ok(embeds.includes("plugins/video.php"));
assert.ok(embeds.includes("www.instagram.com/embed.js"));
assert.match(embeds,/www\.threads\.com\/embed\.js/);
assert.match(embeds,/plugins\/post\.php/);
assert.match(embeds,/facebook-post/);
assert.match(embeds,/text-post-media/);
assert.deepEqual(parsePublicVideo("https://www.threads.net/@threads/post/DCkkKl_OGb1"),{
  provider:"threads",url:"https://www.threads.com/@threads/post/DCkkKl_OGb1/"
});
assert.deepEqual(parsePublicVideo("https://www.instagram.com/p/C8h9Yi7ABCD/"),{
  provider:"instagram",url:"https://www.instagram.com/p/C8h9Yi7ABCD/"
});
assert.deepEqual(parsePublicVideo("https://www.facebook.com/NewBeansland/posts/123456789"),{
  provider:"facebook-post",url:"https://www.facebook.com/NewBeansland/posts/123456789/"
});
assert.equal(parsePublicVideo("https://threads.com.evil.invalid/@threads/post/DCkkKl_OGb1"),null);
assert.equal(parsePublicVideo("http://www.instagram.com/p/C8h9Yi7ABCD/"),null);
assert.equal(parsePublicVideo("javascript:alert(1)"),null);

assert.match(pulse,/href="\/pulse\/embed-preview\.html"/);
assert.match(js,/threads-share-resolve/);

assert.ok(embeds.includes("www.youtube-nocookie.com/embed/"));
assert.ok(js.includes("mountPublicVideo(activity.custom,media)"));
assert.match(js,/nbl_external_video_url:chosenVideo.url/);
assert.match(pulse,/id="videoLink"/);
assert.match(js,/action:"profile_photo",avatarUrl:upload/);
assert.match(js,/nbl_youtube_id:youtubeId/);
assert.doesNotMatch(js,/profile\?\.verified===true/);
assert.ok(embeds.includes("www.youtube-nocookie.com/embed/"));
assert.match(js,/authorProfile\(userId\)/);


// New member-first NBL Pulse skin is presentation-only: Messenger remains a link, not an iframe.
const pulseSkin=read("pulse/pulse-skin.css");
assert.match(pulse,/\/pulse\/pulse-skin\.css\?v=20261119-independent-columns-v1/);
assert.match(pulseSkin,/#socialApp \.pulse-grid/);
assert.match(pulseSkin,/overflow-y:auto/);
assert.match(pulseSkin,/overscroll-behavior-y:contain/);
assert.match(pulse,/class="pulse-main" tabindex="0"/);
assert.match(pulse,/class="pulse-rail" tabindex="0"/);
assert.match(pulseSkin,/#feedItems/);
assert.match(pulseSkin,/@media\(max-width:760px\)/);
assert.match(pulseSkin,/grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/);
assert.match(pulseSkin,/a\.pulse-message-tab/);
assert.doesNotMatch(pulseSkin,/pulseMessengerFrame|pulse-messenger-panel/);
assert.doesNotMatch(pulse,/<iframe|pulseMessengerFrame/);
assert.match(pulse,/href="\/messenger\/"/);


// One Clerk account must become a discoverable public NBL member automatically.
// Member directory returns public handles for everyone, without emails, IDs, enrollment or private messages.
const socialApi=read("supabase/functions/nbl-social/index.ts");
const accountHandles=read("supabase/migrations/20261114_nbl_one_account_auto_public_handles.sql");
const worldHeader=read("nbl-world-header.js");
const worldCss=read("nbl-world-header.css");
assert.match(accountHandles,/alter column username set default/i);
assert.match(accountHandles,/gen_random_uuid\(\)/);
assert.match(accountHandles,/where username is null or btrim\(username\)=''/i);
assert.match(socialApi,/if\(action==="members_recent"\)/);
assert.match(socialApi,/await actor\(req\)/);
assert.match(socialApi,/pulse_member_directory_unavailable/);
const publicDirectory=socialApi.slice(socialApi.indexOf('if(action==="members_recent")'),socialApi.indexOf('if(action==="direct")'));
const publicSearch=socialApi.slice(socialApi.indexOf('if(action==="find_users")'),socialApi.indexOf('if(action==="members_recent")'));
assert.doesNotMatch(publicDirectory,/students\.has\(|viewerAccess\.allowed/,"No private member visibility");
assert.doesNotMatch(publicSearch,/universitySet\(ids\)|requesterUniversity/,"Search cannot hide members by enrollment");
assert.match(publicDirectory,/!blocked\.has\(String\(p\.clerk_user_id\)\)/,"Blocking remains respected");
assert.match(publicDirectory,/nextOffset:/,"People directory needs pages for every member");
assert.match(publicDirectory,/self:id===me\.userId/,"Member can see own profile in directory");
assert.doesNotMatch(publicDirectory,/email|primaryEmailAddress|displayName:/,"Public directory must not leak PII");
assert.match(js,/await loadMembers\(result\.nextOffset\)/,"All pages can be reached");
assert.match(pulse,/All NBL members/);
assert.match(pulse,/id="pulseMemberItems"/);
assert.match(pulse,/data-feed="friends">People<\/button>/);
assert.match(js,/action:"members_recent"/);
assert.match(js,/await Promise\.all\(\[loadFriends\(\),loadMembers\(\)\]\)/);
assert.match(js,/await feed\.getOrCreate\(\{watch:false\}\)/,
  "Brand new members need an initialized user feed before their first post");
assert.match(js,/Write something or attach a photo/);
const homeHeader=worldHeader.slice(worldHeader.indexOf('header.innerHTML=room.key==="home"'),worldHeader.indexOf('let searchTrigger=null'));
assert.match(homeHeader,/nbl-world-account-primary/,"Main homepage needs actual Clerk sign-in control");
assert.match(homeHeader,/nbl-world-user/,"Main homepage needs actual Clerk sign-out container");
assert.doesNotMatch(homeHeader,/NBL Shop/);
assert.doesNotMatch(worldHeader,/\["shop","Shop"/);
assert.match(worldHeader,/await clerk\.signOut\(\)/);
assert.match(worldCss,/nbl-world-header-home \.nbl-world-user\{display:flex!important/);
assert.doesNotMatch(home,/rel="noopener noreferrer">Shop<\/a>/);

const homeHeaderJs=home.match(/nbl-world-header\.js\?v=([a-zA-Z0-9_-]+)/);
const homeHeaderCss=home.match(/nbl-world-header\.css\?v=([a-zA-Z0-9_-]+)/);
assert.ok(homeHeaderJs && homeHeaderCss,"Homepage must load versioned NBL header assets");
assert.equal(homeHeaderJs[1],homeHeaderCss[1],"Homepage NBL header JavaScript and CSS must use the same cache revision");


// Public author labels are the authenticated NBL username, never a stale
// Stream actor name or a private Messenger contact nickname.
assert.match(js,/handle:state\.me\?\.handle/);
assert.match(js,/function hydrateAuthorName\(userId,label,avatar\)/);
assert.match(js,/const name=pulseHandle\(profile\)/);
assert.match(js,/const authorLabel=signedActor\?"NBL member"/);
assert.match(js,/hydrateAuthorName\(authorId,authorName,avatar\)/);
assert.match(js,/hydrateAuthorName\(commenterId,who\)/);
assert.match(js,/state\.clerk\?\.user\?\.id!==viewer/);
const igPublish=read("server/supabase/functions/nbl-instagram-connect/index.ts");
const fbPublish=read("server/supabase/functions/nbl-meta-community/index.ts");
assert.match(igPublish,/Originally on NBL Pulse · @NBLFounderOfficial/);
assert.match(fbPublish,/Originally on NBL Pulse · @NBLFounderOfficial/);
assert.match(igPublish,/caption:stamped/);
assert.match(fbPublish,/message:sharedMessage/);
assert.match(igPublish,/founder_access_required/);
assert.match(fbPublish,/founder_access_required/);
console.log("PASS: Pulse author handles follow NBL profiles; official Meta posts credit the original Founder.");
