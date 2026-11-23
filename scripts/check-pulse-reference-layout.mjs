import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read = p => readFileSync(new URL("../"+p,import.meta.url),"utf8");
const html=read("pulse/index.html"),css=read("pulse/pulse-reference-ui.css");
const engine=read("messenger/social-v1.mjs");
const liveCss=read("pulse/pulse-live-design.css"),liveUi=read("pulse/pulse-live-design.mjs");
const founderCss=read("pulse/pulse-founder-ui.css");
const mobileCss=read("pulse/pulse-mobile-app.css"), liveClient=read("pulse/live.mjs");
const businessClient=read("pulse/business-assets.mjs"),businessCss=read("pulse/pulse-meta-business.css");
assert.doesNotMatch(html+css, /the[\s-]*city|thecity|cityworld|phone.mockup/i, "Pulse must not include forbidden promotional content");
assert.match(html,/href="\/pulse\/" class="pulse-site-current" aria-current="page"/);
assert.match(html,/id="pulseUnifiedInboxNav"[^>]*class="pulse-message-tab"/);
assert.match(html,/href="\/messenger\/">Open the full Pulse Connect app/);
assert.match(html,/pulse\/pulse-reference-ui\.css\?v=20261109-no-city/);
assert.match(html,/class="pulse-rail"/);
assert.match(html,/id="pulseStories" class="pulse-stories" aria-label="Pulse video highlights and official channels"/);
assert.match(html,/class="pulse-create-shortcut" href="#composeTitle"/);
assert.match(html,/<section id="socialApp" hidden/);
assert.match(html,/social-v1\.mjs/);
assert.match(html,/pulse-story-highlights\.mjs\?v=20261121-existing-video/);
assert.match(html,/pulse-story-highlights\.css\?v=20261121-existing-video/);
assert.match(html,/id="pulseStoryFeedVideos"/);
for (const id of ["manageBusinessAssets","metaBusinessPanel","metaBusinessConnect","metaBusinessBusinesses","metaBusinessPages","metaBusinessInstagramAccounts"])
  assert.ok(html.includes('id="'+id+'"'),"Live Pulse Meta Business hook missing: "+id);
assert.match(html,/business-assets\.mjs\?v=20261121-live-meta-business-v1/);
assert.match(html,/pulse-meta-business\.css\?v=20261121-live-meta-business-v1/);
assert.match(businessClient,/nbl-meta-business/);
assert.match(businessClient,/initMetaBusiness/);
assert.match(businessClient,/asset_sync_failed/);
assert.match(businessCss,/#metaBusinessPanel/);
for (const secret of ["NBL_PULSE_META_APP_SECRET","SUPABASE_SERVICE_ROLE_KEY","client_secret","STREAM_API_SECRET"])
  assert.ok(!businessClient.includes(secret),"Secret marker must not ship in browser: "+secret);
assert.match(html,/https:\/\/openai\.com\/news\//);
const requiredIds=["socialApp","identity","guest","signIn","socialStatus","postForm","postText","postMedia","mediaSelection","videoLink","videoShareRights","copyPulseInvite","composerAvatar","profileAvatarFile","saveProfileAvatar","friendsPanel","friendForm","feedPanel","feedItems","refreshFeed","sharedPost"];
for(const id of requiredIds)assert.ok(html.includes('id="'+id+'"'),"Existing runtime hook missing: "+id);
for(const feed of ["foryou","timeline","user","friends","notification"])assert.ok(html.includes('data-feed="'+feed+'"'),"Working feed missing: "+feed);
assert.match(engine,/document\.querySelectorAll\("\[data-feed\]"\)\.forEach\(button=>button\.addEventListener\("click"/);
assert.match(css,/grid-template-columns:minmax\(215px,250px\) minmax\(0,1fr\) minmax\(245px,290px\)/);
assert.match(css,/@media\(max-width:760px\)/);
assert.match(css,/grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/);
assert.match(css,/object-fit:contain/);
assert.doesNotMatch(html,/pulseMessengerFrame|<iframe/);
assert.match(html,/pulse\/pulse-live-design\.css\?v=20261110-visual-release/);
assert.match(html,/pulse\/pulse-live-design\.mjs\?v=20261110-visual-release/);
assert.match(html,/class="pulse-highlights"/);
assert.match(html,/class="pulse-welcome-post"/);
assert.match(html,/class="pulse-featured-card"/);
assert.match(html,/id="pulseComposerExtra" class="pulse-composer-extra" hidden/);
assert.match(html,/data-pulse-compose="photo"/);
assert.match(html,/data-pulse-compose="video"/);
assert.match(html,/data-pulse-compose="link"/);
assert.match(html,/class="pulse-mobile-create"/);
assert.match(html,/class="pulse-mobile-more"/);
assert.match(liveCss,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
assert.match(liveCss,/@media\(max-width:760px\)/);
assert.match(liveCss,/\.pulse-body:has\(#feedItems \.social-card\) \.pulse-welcome-post\{display:none\}/);
assert.match(liveUi,/upload\.click\(\)/);
assert.match(liveUi,/input\.focus\(\{preventScroll:true\}\)/);
assert.doesNotMatch(html+liveCss,/\b(?:followers|watching|12\.4K|24\.7K)\b/i,"No invented popularity metrics");
// Founder-supplied reference: full desktop Pulse product, not a fake image/post.
assert.ok(html.includes('/pulse/pulse-founder-ui.css?v=20261118-live-visibility'));
assert.ok(html.includes('/pulse/pulse-mobile-app.css?v=20261121-pulse-connect-v1'));
assert.ok(html.indexOf('/pulse/pulse-mobile-app.css')>html.indexOf('/pulse/pulse-founder-ui.css'), 'Mobile CSS must load after desktop styles');
assert.ok(html.includes('media="(max-width: 760px)"'), 'Mobile styles must be phone-only');
assert.ok(mobileCss.includes('grid-template-columns:repeat(5,minmax(0,1fr))'), 'Exactly five phone tabs');
assert.ok(mobileCss.includes('.pulse-nav-live'), 'Hide Live from five-tab phone bar');
assert.ok(mobileCss.includes('> #pulseLive'), 'Mobile Live has its own panel');
assert.ok(founderCss.includes('.pulse-body .pulse-live{\n display:block'), 'Desktop must show real Live');
assert.ok(liveClient.includes('function placeLivePanel('), 'Move one real panel, do not clone');
assert.ok(liveClient.includes('import(STREAM_VIDEO_SDK)'), 'Video SDK must load lazily');
assert.ok(!liveClient.includes('import { StreamVideoClient }'), 'No static video CDN gate');
assert.ok(liveClient.includes('state.callId } : {}, "required"'), 'Live status requires Clerk auth');
assert.ok(html.indexOf("/pulse/pulse-founder-ui.css")>html.indexOf("/pulse/pulse-live-design.css"),"Founder stylesheet must load last");
assert.match(html,/class="pulse-company-wordmark"/,"NBL identity is in the global header");
assert.match(html,/href="\/games\.html" title="NBL Games — coming soon"/,"Games is a truthful coming-soon destination");
assert.doesNotMatch(html+founderCss,/href="[^"]*(?:the-city|thecity)|>The City</i,"Do not promote a Studios preview as a Pulse top-level destination");
assert.match(html,/data-feed="friends" aria-label="Explore NBL members"/,"Real member discovery in header");
assert.match(html,/data-feed="notification" aria-label="View Pulse notifications"/,"Real notifications in header");
assert.match(html,/class="pulse-nav-stories" href="#pulseStories"/,"Stories must open the active highlights section");
assert.match(html,/Stories <small>Video highlights/,"Stories navigation must not advertise a retired placeholder");
assert.match(html,/class="pulse-nav-live" href="#pulseLive"/,"Real Live nav points to actual Pulse controls");
assert.match(html,/Live <small id="pulseLiveNavStatus">Checking…<\/small>/,"Nav Live status must come from actual server state, not misleading static OFF/LIVE text");
assert.match(html,/id="pulseLiveAdmin" hidden/,"Founder-only switch is hidden until server authorization");
assert.match(html,/id="pulseLiveToggle"/,"Founder ON/OFF button is wired");
assert.doesNotMatch(html,/Go Live · setup pending/,"Do not retain the fake setup placeholder");
assert.match(html,/src="\/NBL_Studios\.png"/,"Real NBL Studios artwork in featured panel");
assert.match(html,/class="pulse-feature-brand"/);
assert.match(founderCss,/#socialApp \.pulse-grid/);
assert.match(founderCss,/grid-template-columns:minmax\(219px,255px\) minmax\(0,1fr\) minmax\(235px,294px\)/);
assert.match(founderCss,/@media\(max-width:760px\)/);
assert.doesNotMatch(html+founderCss,/Shia|Montana|24\.7K|12\.4K|1\.2K\s*likes|\bwatching\b/i,
 "No invented members, engagement counts, or fake livestreams");
console.log("PASS NBL Pulse: real website layout, live feed hooks, independent Messenger, mobile navigation; no fabricated or excluded content.");

assert.match(html,/id="pulseLiveDestination"/);
assert.match(html,/<option value="pulse" selected>Pulse only/);
assert.match(html,/<option value="facebook" disabled>/);
assert.match(html,/<option value="google" disabled>/);
assert.match(liveClient,/data\.facebook\?\.canStart === true/);
assert.match(liveClient,/facebook_enabled: destination === "facebook", google_enabled: destination === "google"/);
assert.match(liveClient,/typeof navigator\.mediaDevices\?\.getDisplayMedia !== "function"/);
assert.match(liveClient,/if \(!state\.busy\) void refreshStatus\(true\)/);

assert.match(html,/id="pulseLiveScreenOnly" type="checkbox">/,"Camera and microphone default on both supported device sizes");
assert.doesNotMatch(html,/id="pulseLiveScreenOnly"[^>]*\bchecked\b/);
assert.match(html,/id="pulseLiveMediaControls" hidden/);
for (const id of ["pulseLiveCameraToggle","pulseLiveMicToggle","pulseLiveMediaStatus"]) assert.ok(html.includes('id="'+id+'"'));
assert.match(liveClient,/async function joinWithoutCapture\(call\) \{\s*await call\.camera\.disable\(\);[\s\S]*?await call\.microphone\.disable\(\);\s*await call\.join\(\{ create: false \}\);/);
assert.match(liveClient,/await joinWithoutCapture\(state\.call\); \/\/ viewers never request camera or microphone/);
assert.match(liveClient,/if \(!screenOnly\) \{\s*try \{ await state\.call\.camera\.enable\(\); \} catch \{\}\s*try \{ await state\.call\.microphone\.enable\(\); \} catch \{\}/);
assert.match(liveClient,/await manager\.toggle\(\)/);
assert.match(liveClient,/state\.call\?\.camera\.state\.status !== "enabled" && state\.call\?\.microphone\.state\.status !== "enabled"/);
assert.match(liveClient,/state\.mediaSubs = \[\]/);

// Founder November 22: no duplicated dashboard navigation or recording ambiguity.
const redesignCss=read("pulse/pulse-redesign.css");
const redesignUi=read("pulse/redesign.mjs");
const metaCommunity=read("pulse/meta-community.mjs");
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,"Pulse DOM IDs are unique");
assert.match(redesignCss,/\.pulse-topbar \.pulse-tabs \{display:none!important/);
assert.match(redesignCss,/\.pulse-rail \.pulse-rail-activity/);
assert.match(html,/id="pulseStories" class="pulse-stories" aria-label="Pulse video highlights and official channels" hidden/);
assert.match(redesignUi,/show\(\$\("#pulseStories"\), view === "stories"\)/);
assert.match(metaCommunity,/querySelector\("#pulseMenuView"\)/);
assert.match(metaCommunity,/root\.append\(panel\)/);
assert.match(html,/id="pulseLiveRecord" type="checkbox"/);
assert.doesNotMatch(html,/id="pulseLiveRecord"[^>]*\bchecked\b/);
assert.match(html,/id="pulseLiveScreenMic" type="checkbox"/);
assert.match(liveClient,/screenMic = screenOnly &&/);
assert.match(liveClient,/else if \(screenMic\)/);
assert.match(liveClient,/No video was saved because Save this Live video was OFF/);
assert.match(redesignCss,/#pulseLiveMediaControls button/);
assert.match(redesignCss,/html\[data-theme="light"\] body\.pulse-body/);
assert.match(redesignCss,/--pulse-bg:#f7f4ff!important/);
console.log("PASS Pulse single-navigation layout, Founder recording choice, explicit screen microphone, replay feedback.");

assert.match(html,/id="pulseLiveSavedResult" role="status"/);
assert.match(liveClient,/liveApi\("delete-recording"/);
assert.match(liveClient,/window\.confirm\("Permanently delete this saved Pulse Live recording/);
assert.match(liveClient,/if \(deleted\?\.deleted !== true\)/);
assert.match(liveClient,/row\.remove\(\)/);
console.log("PASS Pulse delete recording requires confirmation and provider success.");


// The actual Pulse audience must discover a broadcast, not a saved video or an
// enabled-only Live switch. Desktop-site viewports on touch phones stay usable.
assert.match(html,/id="pulseLiveFeedAlert" class="pulse-live-feed-alert" role="status" hidden/);
assert.match(html,/id="pulseLiveFeedAlertTitle"/);
assert.match(html,/data-view="live" class="btn primary">Watch live/);
assert.match(liveClient,/function updateLiveDiscovery\(data\)/);
assert.match(liveClient,/data\?\.enabled === true && data\?\.status === "live"/);
assert.match(liveClient,/if \(\$\("#pulseLiveView"\)\?\.hidden !== false\) return;/);
assert.match(liveClient,/document\.addEventListener\("pulse:view-change"/);
assert.match(liveClient,/if \(wasViewer\) state\.callId = null/);
assert.match(liveClient,/video\.autoplay = true; video\.muted = true/);
assert.match(redesignUi,/new CustomEvent\("pulse:view-change"/);
assert.match(redesignCss,/@media \(max-width: 760px\), \(pointer: coarse\) and \(max-width: 1280px\)/);
assert.match(redesignCss,/body\.pulse-body #socialApp \.pulse-sidebar,/);
assert.match(redesignCss,/\.pulse-live-feed-alert \{/);
assert.match(redesignCss,/body\.pulse-body \.pulse-bottombar/);
assert.match(redesignCss,/body\.pulse-body \.pulse-topbar #pulseMenuTop/);
assert.match(redesignCss,/\.pulse-live-feed-alert\[hidden\] \{ display: none !important/);
console.log("PASS Pulse confirmed Live discovery, explicit viewer join, responsive touch feed + Connect navigation.");


// Regression for a real bug: previously Stream WebRTC participants joined
// successfully while #pulseLiveViewer remained hidden (HLS is disabled).
// Source gates intentionally do not fabricate a real provider media receipt.
const viewerJoin = liveClient.split("async function joinAsWebRtcViewer(callId) {")[1]
  ?.split("// --- Status / viewer flow ---")[0] || "";
assert.ok(viewerJoin, "The authenticated WebRTC viewer action must exist");
assert.match(viewerJoin,/state\.viewerConnecting \|\| state\.mode !== "idle"/);
assert.match(viewerJoin,/await joinWithoutCapture\(state\.call\)/);
assert.match(viewerJoin,/show\("#pulseLiveViewer", true\)/,
  "A joined Stream video cannot be displayed while its parent stays hidden");
assert.ok(viewerJoin.indexOf('show("#pulseLiveViewer", true)') >
  viewerJoin.indexOf('await joinWithoutCapture(state.call)'),
  "Only reveal the player after Stream confirms the viewer joined");
assert.match(viewerJoin,/if \(\$\("#pulseLiveView"\)\?\.hidden !== false\) return/);
assert.match(liveClient,/show\("#pulseLiveViewer", false\); \/\/ An ended viewer call/);
assert.match(html,/live\.mjs\?v=20261123-google-preflight-v1/);
// Subscriber regression: Stream must never bind remote tracks while detached.
const remoteEntry=liveClient.split("function buildRemoteEntry(p, area, sig) {")[1]
  ?.split("function renderViewerParticipants(")[0] || "";
assert.ok(remoteEntry, "Published remote tracks must get a rendered entry");
assert.ok(remoteEntry.indexOf("area.append(wrapper)") < remoteEntry.indexOf("state.call.bindVideoElement("),
  "Attach the remote wrapper before subscribing to the Stream track");
assert.ok(remoteEntry.indexOf("wrapper.append(video)") < remoteEntry.indexOf("state.call.bindVideoElement("),
  "Attach the remote video before Stream subscribes");
assert.match(liveClient, /p\.publishedTracks\?\.length/, "Ignore passive viewers with no published media");
assert.match(liveClient, /Tap to turn on sound/, "Provide a tap-to-unmute fallback");
assert.match(liveClient, /stopSoundWatch\(\)/, "Clean up sound prompt on teardown");
console.log("PASS Pulse WebRTC viewer is visible before track subscription; sound and cleanup are wired.");
