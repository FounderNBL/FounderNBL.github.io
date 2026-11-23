// NBL Pulse Live — Go Live UI.
// No Stream secret, no Facebook Page token, no stream key anywhere in this file.
// The Stream apiKey/token arrive at runtime from nbl-live and are held only
// in memory (never localStorage / sessionStorage). Clerk publishable key below
// is the public key already used by web/messenger/call.mjs and social-v1.mjs.
// StreamVideoClient version matches call.mjs (1.27.0, the version proven in
// this repo). A newer client (1.67.1 at check time, 2026-11-16) exists; do
// not upgrade it in this change — verify it separately first.
// Only load the video SDK when a member actually starts or watches a stream.
// A blocked video CDN must never disable Founder status/OFF controls.
const STREAM_VIDEO_SDK = "https://esm.sh/@stream-io/video-client@1.27.0?bundle";
let streamVideoClientPromise;
async function videoClientConstructor() {
  if (!streamVideoClientPromise) {
    streamVideoClientPromise = import(STREAM_VIDEO_SDK).then((module) => {
      if (typeof module.StreamVideoClient !== "function") throw Error("Pulse video client unavailable.");
      return module.StreamVideoClient;
    }).catch((error) => {
      streamVideoClientPromise = null; // allow a later attempt if the network recovers
      throw error;
    });
  }
  return streamVideoClientPromise;
}

const ENDPOINT = "https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-live";
const CALL_TYPE = "livestream";
const CLERK_KEY = "pk_live_Y2xlcmsubmV3YmVhbnNsYW5kLm9yZyQ";
const ACCOUNT = "https://accounts.newbeansland.org";
const HLS_URL = "https://esm.sh/hls.js@1.7.4";
const POLL_MS = 15000;
const DEFAULT_TITLE = "NBL Pulse Live";

const $ = (s) => document.querySelector(s);
const state = {
  clerk: null, client: null, call: null, sub: null,
  callId: null, userId: null, mode: "idle", // idle | backstage | live | viewing
  hls: null, tracks: new Map(), previewBound: null,
  liveSince: null, timerId: null, pollId: null, busy: false, viewerConnecting: false,
  recordingRequested: false, liveEnabled: false,
  isAdmin: false, screenOnly: false, screenReady: false,
  destination: "pulse", facebookReady: false, googleReady: false,
  googleCheckMessage: "",
  mediaSubs: [],
  soundId: null, soundButton: null,
};

function setStatus(text) { const el = $("#pulseLiveStatus"); if (el) el.textContent = text; }
// The feed advertises only a confirmed LIVE status, never ON or backstage.
function updateLiveDiscovery(data) {
  const alert = $("#pulseLiveFeedAlert");
  if (!alert) return;
  const live = data?.enabled === true && data?.status === "live" && typeof data?.callId === "string";
  alert.hidden = !live;
  const title = $("#pulseLiveFeedAlertTitle");
  if (live && title) title.textContent = String(data.title || DEFAULT_TITLE).slice(0, 140);
}
function showError(text) {
  const el = $("#pulseLiveError");
  if (!el) return;
  el.hidden = !text; el.textContent = text || "";
}
function show(id, on) { const el = $(id); if (el) el.hidden = !on; }
function setBusy(on) {
  state.busy = on;
  for (const id of ["#pulseLiveStart", "#pulseLiveGoLive", "#pulseLiveEnd", "#pulseLiveToggle", "#pulseLiveCameraToggle", "#pulseLiveMicToggle"]) {
    const el = $(id); if (el) el.disabled = on;
  }
}

const REASON_TEXT = {
  host_not_eligible: "You need an active NBL Pulse member profile to start a live broadcast.",
  live_already_active: "A Pulse Live broadcast is already running.",
  live_disabled: "Pulse Live is OFF until the NBL launch switch is approved.",
  admin_only: "The NBL Founder account is required to operate this switch.",
  live_control_unavailable: "Pulse Live could not read its protected ON/OFF control. Broadcasting remains OFF.",
  stream_call_type_unsafe: "Stream safety permissions are not verified. Pulse Live remains OFF.",
  stream_call_type_unavailable: "The Stream live service is not ready. Pulse Live remains OFF.",
  live_not_found: "That broadcast could not be found.",
  live_not_backstage: "This broadcast is no longer backstage.",
  live_expired: "This broadcast ended automatically after the time limit.",
  session_expired: "This broadcast ended automatically after the time limit.",
  live_rate_limited: "Daily start limit reached. Try again tomorrow.",
  live_monthly_allowance_used: "Your 20 free Pulse Live minutes have been used for this UTC month. They reset next month.",
  live_budget_reached: "NBL Pulse Live has reached its monthly pilot limit. New broadcasts are paused to protect costs.",
  live_unavailable: "Pulse Live is unavailable right now. Try again in a moment.",
  live_stop_unconfirmed: "Broadcast shutdown was not confirmed. Press End Live again.",
  stream_cleanup_pending: "A previous broadcast still needs cleanup. Do not start another one.",
  sign_in_required: "Sign in to watch Pulse Live.",
  facebook_not_configured: "Facebook Live is not enabled for the connected Page. Choose Pulse only.",
  facebook_auth_required: "Meta rejected the saved Page authorization.",
  facebook_live_permission_denied: "Meta rejected the Live Video permission.",
  facebook_live_restricted: "Meta reports a Page livestream restriction.",
  facebook_failed: "Meta could not create the Facebook broadcast.",
  facebook_rtmp_failed: "Stream could not connect to Facebook RTMP.",
  facebook_ingest_unavailable: "Meta did not return a usable RTMPS destination.",
  facebook_cleanup_pending: "Facebook shutdown is not confirmed. Use End Live before retrying.",
  google_not_configured: "Google relay is not enabled or configured. Choose Pulse only.",
  google_start_failed: "Google relay failed. End this session before choosing Pulse only.",
  live_destination_conflict: "Choose one optional destination.",
  recording_not_available: "Recording is disabled in Stream settings. Uncheck Save recording or enable it before going live.",
};
function plainError(error, fallback) {
  const reason = error?.reason || error?.message || "";
  if (REASON_TEXT[reason]) return REASON_TEXT[reason];
  if (error?.name === "TypeError" || /failed to fetch|networkerror/i.test(String(error?.message || "")))
    return "Could not reach Pulse Live. Check your connection and try again.";
  return fallback || "Pulse Live is unavailable right now. Try again in a moment.";
}

// --- Clerk: copied pattern from web/messenger/call.mjs + social-v1.mjs ---
function clerkDomain() {
  const part = (CLERK_KEY.split("_")[2] || "").replace(/-/g, "+").replace(/_/g, "/");
  return atob(part.padEnd(Math.ceil(part.length / 4) * 4, "=")).replace(/\$/, "");
}
async function initClerk() {
  if (state.clerk) return state.clerk;
  if (!window.Clerk) {
    await new Promise((resolve, reject) => {
      const tag = document.createElement("script");
      tag.src = "https://" + clerkDomain() + "/npm/@clerk/clerk-js@6/dist/clerk.browser.js";
      tag.crossOrigin = "anonymous";
      tag.setAttribute("data-clerk-publishable-key", CLERK_KEY);
      tag.onload = resolve;
      tag.onerror = () => reject(Error("NBL sign-in did not load."));
      document.head.append(tag);
    });
  }
  await window.Clerk.load();
  state.clerk = window.Clerk;
  return state.clerk;
}
async function clerkToken() {
  const c = await initClerk();
  if (!c.isSignedIn || !c.session) {
    const e = Error("Sign in to NBL again."); e.reason = "sign_in_required"; throw e;
  }
  const token = await c.session.getToken(); // same call as call.mjs / social-v1.mjs
  if (!token) { const e = Error("NBL session expired. Sign in again."); e.reason = "sign_in_required"; throw e; }
  state.userId = c.user?.id || state.userId;
  return token;
}
function signInLink() {
  const a = document.createElement("a");
  a.href = ACCOUNT + "/sign-in?redirect_url=" + encodeURIComponent(location.href);
  a.textContent = "Sign in to NBL";
  return a;
}

// --- nbl-live API ---
// auth: "none" (no header) | "optional" (try anonymous, retry authed on
// sign_in_required) | "required" (Clerk JWT, throws if signed out).
async function liveApi(action, body = {}, auth = "required") {
  const payload = { action, ...body };
  const send = async (token) => {
    const headers = { "content-type": "application/json" };
    if (token) headers.authorization = "Bearer " + token;
    const res = await fetch(ENDPOINT, {
      method: "POST", headers, body: JSON.stringify(payload), cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok !== true) {
      const e = Error(data.message || data.reason || "Pulse Live is unavailable.");
      e.reason = data.reason || null; e.status = res.status; throw e;
    }
    return data;
  };
  if (auth === "required") return send(await clerkToken());
  if (auth === "none") return send(null);
  try { return await send(null); } // "optional": anonymous first (status may be public)
  catch (e) {
    if (e.reason !== "sign_in_required") throw e;
    const c = await initClerk().catch(() => null);
    if (!c?.isSignedIn || !c.session) throw e;
    return send(await clerkToken());
  }
}

// --- Timers / polling ---
function fmtElapsed(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return h + ":" + m + ":" + sec;
}
function startTimer() {
  stopTimer();
  if (!state.liveSince || state.mode !== "live") { show("#pulseLiveElapsed", false); return; }
  const tick = () => {
    const el = $("#pulseLiveElapsed");
    if (el && state.liveSince) { el.hidden = false; el.textContent = fmtElapsed(Date.now() - state.liveSince); }
  };
  tick(); state.timerId = setInterval(tick, 1000);
}
function stopTimer() { if (state.timerId) clearInterval(state.timerId); state.timerId = null; }
function startPoll() {
  stopPoll();
  state.pollId = setInterval(() => { if (!state.busy) void refreshStatus(true); }, POLL_MS);
}
function stopPoll() { if (state.pollId) clearInterval(state.pollId); state.pollId = null; }

// --- Stream teardown (leave only on unload — never auto-POST end) ---
function clearTracks() {
  for (const parts of state.tracks.values())
    for (const unbind of parts.cleanup) { try { unbind(); } catch {} }
  state.tracks.clear();
  document.querySelectorAll("#pulseLiveViewer .pulse-live-remote").forEach((el) => el.remove());
  state.previewBound = null;
}
function destroyHls() {
  try { state.hls?.destroy(); } catch {}
  state.hls = null;
  const v = $("#pulseLiveVideo"); if (v) { try { v.pause(); } catch {} v.removeAttribute("src"); v.load(); }
}
async function teardownStream() {
  const wasViewer = state.mode === "viewing";
  stopTimer(); stopSoundWatch();
  state.sub?.unsubscribe(); state.sub = null;
  for (const subscription of state.mediaSubs) subscription.unsubscribe();
  state.mediaSubs = [];
  show("#pulseLiveMediaControls", false);
  clearTracks(); destroyHls();
  show("#pulseLiveViewer", false); // An ended viewer call must not leave a stale player.
  try { await state.call?.leave(); } catch {}
  try { await state.client?.disconnectUser(); } catch {}
  state.call = null; state.client = null; state.mode = "idle";
  if (wasViewer) state.callId = null; // Never pin discovery to an ended viewer call.
  state.screenOnly = false; state.screenReady = false; state.liveSince = null;
  show("#pulseLiveElapsed", false); show("#pulseLiveBadge", false);
}

// --- HLS viewer (preferred) ---
async function attachHls(url) {
  destroyHls();
  const video = $("#pulseLiveVideo");
  show("#pulseLiveVideo", true);
  show("#pulseLiveViewer", true);
  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
    await video.play().catch(() => {});
    return true;
  }
  try {
    const mod = await import(HLS_URL);
    const Hls = mod.default;
    if (!Hls?.isSupported()) throw Error("HLS unsupported");
    const hls = new Hls({});
    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => { void video.play().catch(() => {}); });
    state.hls = hls;
    return true;
  } catch {
    return false; // caller falls back to WebRTC viewer
  }
}

// --- Participants rendering (pattern copied from call.mjs) ---
// Stream TrackType values carried in participant.publishedTracks.
const TRACK_VIDEO = 2, TRACK_SCREEN = 3;
// The wrapper must already be in the visible DOM when a video element is
// bound: Stream sizes its track subscription from the element's rendered
// size and treats 0x0 (hidden or detached) as "do not subscribe".
function buildRemoteEntry(p, area, sig) {
  const wrapper = document.createElement("div");
  wrapper.className = "pulse-live-remote";
  const label = document.createElement("p");
  label.className = "pulse-live-meta"; label.textContent = p.name || "NBL Pulse Live";
  wrapper.append(label);
  area.append(wrapper);
  const cleanup = [];
  const bind = (fn) => { const unbind = fn(); if (typeof unbind === "function") cleanup.push(unbind); };
  for (const [kind, wanted] of [["videoTrack", sig.includes("v")], ["screenShareTrack", sig.includes("s")]]) {
    if (!wanted) continue;
    const video = document.createElement("video");
    video.autoplay = true; video.muted = true; video.playsInline = true; video.className = "pulse-live-video";
    wrapper.append(video);
    bind(() => state.call.bindVideoElement(video, p.sessionId, kind));
  }
  for (const kind of sig.includes("s") ? ["audioTrack", "screenShareAudioTrack"] : ["audioTrack"]) {
    const audio = document.createElement("audio"); audio.autoplay = true; audio.controls = true;
    audio.setAttribute("aria-label", "Livestream sound; tap play if your browser blocks audio autoplay");
    wrapper.append(audio);
    bind(() => state.call.bindAudioElement(audio, p.sessionId, kind));
  }
  return { wrapper, cleanup, sig };
}
function renderViewerParticipants(participants) {
  const area = $("#pulseLiveViewer");
  if (!area || !state.call) return;
  // Other viewers publish nothing; only render people who are broadcasting.
  const sources = participants.filter((p) => !p.isLocalParticipant && p.publishedTracks?.length);
  const current = new Set(sources.map((p) => p.sessionId));
  const drop = (id, parts) => {
    for (const unbind of parts.cleanup) { try { unbind(); } catch {} }
    parts.wrapper.remove(); state.tracks.delete(id);
  };
  for (const [id, parts] of state.tracks) if (!current.has(id)) drop(id, parts);
  for (const p of sources) {
    const sig = (p.publishedTracks.includes(TRACK_VIDEO) ? "v" : "") + (p.publishedTracks.includes(TRACK_SCREEN) ? "s" : "");
    const existing = state.tracks.get(p.sessionId);
    if (existing?.sig === sig) continue;
    if (existing) drop(p.sessionId, existing);
    state.tracks.set(p.sessionId, buildRemoteEntry(p, area, sig));
  }
  // Viewer count: participantCount is unverified in video-client 1.27.0 —
  // fall back to the remote participant count if it is not a number.
  const count = typeof state.call?.state?.participantCount === "number"
    ? state.call.state.participantCount
    : participants.filter((p) => !p.isLocalParticipant).length;
  const vc = $("#pulseLiveViewers");
  if (vc) { vc.hidden = false; vc.textContent = count + (count === 1 ? " viewer" : " viewers"); }
}
// Browsers refuse to start audio before a user gesture. Offer a tap target
// whenever a bound audio stream is attached but not playing.
function startSoundWatch() {
  stopSoundWatch();
  const area = $("#pulseLiveViewer");
  if (!area) return;
  const button = document.createElement("button");
  button.type = "button"; button.hidden = true; button.className = "pulse-live-primary";
  button.textContent = "Tap to turn on sound";
  button.addEventListener("click", () => {
    area.querySelectorAll("audio").forEach((a) => { a.muted = false; void a.play().catch(() => {}); });
    button.hidden = true;
  });
  area.prepend(button);
  state.soundButton = button;
  state.soundId = setInterval(() => {
    button.hidden = ![...area.querySelectorAll("audio")].some((a) => a.srcObject && a.paused);
  }, 1000);
}
function stopSoundWatch() {
  if (state.soundId) clearInterval(state.soundId);
  state.soundId = null;
  state.soundButton?.remove(); state.soundButton = null;
}
function renderHostPreview(participants) {
  const local = participants.find((p) => p.isLocalParticipant);
  const video = $("#pulseLivePreview");
  if (!local || !video || !state.call) return;
  if (state.previewBound === local.sessionId) return;
  clearTracks();
  try {
    const unbind = state.call.bindVideoElement(video, local.sessionId, state.screenOnly ? "screenShareTrack" : "videoTrack");
    state.tracks.set(local.sessionId, { wrapper: video, cleanup: [unbind] });
    state.previewBound = local.sessionId;
  } catch { /* preview stays hidden; audio/camera still live */ }
}

// Explicitly override provider defaults before joining: no automatic capture.
async function joinWithoutCapture(call) {
  await call.camera.disable();
  await call.microphone.disableSpeakingWhileMutedNotification?.();
  await call.microphone.disable();
  await call.join({ create: false });
}
function syncHostMedia() {
  const camera = $("#pulseLiveCameraToggle"), mic = $("#pulseLiveMicToggle");
  const cameraOn = state.call?.camera.state.status === "enabled";
  const micOn = state.call?.microphone.state.status === "enabled";
  if (camera) {
    camera.textContent = cameraOn ? "Turn camera off" : "Turn camera on";
    // Screen sharing never exposes camera controls. Audio may be added separately.
    camera.hidden = state.screenOnly;
  }
  if (mic) mic.textContent = micOn ? "Mute microphone" : "Unmute microphone";
  const notice = $("#pulseLiveMediaStatus");
  if (notice) notice.textContent = "Camera " + (cameraOn ? "on" : "off") + " · Microphone " + (micOn ? "on" : "off");
}
async function toggleHostMedia(kind) {
  if (state.busy || (state.screenOnly && kind === "camera") || !state.call || !["backstage","live"].includes(state.mode)) return;
  setBusy(true); showError("");
  try {
    const manager = kind === "camera" ? state.call.camera : state.call.microphone;
    await manager.toggle();
  } catch {
    showError("Could not change " + (kind === "camera" ? "camera" : "microphone") + ". Check your browser permissions and try the control again.");
  } finally { syncHostMedia(); setBusy(false); }
}

// --- WebRTC viewer fallback (needs sign-in: Stream needs a user id) ---
async function joinAsWebRtcViewer(callId) {
  // Joining must be a deliberate Live-view action, even when the feed shows
  // LIVE NOW. Two status polls may overlap; never join the same call twice.
  if (state.viewerConnecting || state.mode !== "idle" || $("#pulseLiveView")?.hidden !== false) return;
  state.viewerConnecting = true;
  try {
    const data = await liveApi("join-viewer", { callId }, "required");
    if (!data.key || !data.token || data.callId !== callId || data.callType !== CALL_TYPE)
      throw Error("Viewer session identity verification failed.");
    if ($("#pulseLiveView")?.hidden !== false) return; // Viewer navigated away during token request.
    const VideoClient = await videoClientConstructor();
    state.client = new VideoClient({ apiKey: data.key, user: { id: state.userId }, token: data.token });
    state.call = state.client.call(CALL_TYPE, callId);
    await joinWithoutCapture(state.call); // viewers never request camera or microphone
    if ($("#pulseLiveView")?.hidden !== false) {
      await teardownStream(); // Leave this viewer only. Never stop the host broadcast.
      return;
    }
    state.mode = "viewing";
    show("#pulseLiveVideo", false); // HLS is disabled; Stream participants own the actual picture.
    show("#pulseLiveViewer", true); // Otherwise all WebRTC tracks are in a hidden parent.
    startSoundWatch();
    state.sub = state.call.state.participants$.subscribe(renderViewerParticipants);
  } catch (error) {
    await teardownStream(); // Clean up failed joins instead of holding an invisible paid slot.
    throw error;
  } finally {
    state.viewerConnecting = false;
  }
}

// --- Status / viewer flow ---
async function refreshStatus(silent = false) {
  let data;
  try {
    data = await liveApi("status", state.callId ? { callId: state.callId } : {}, "required");
  } catch (e) {
    updateLiveDiscovery(null);
    if (e.reason === "sign_in_required" && !silent) {
      setStatus("Sign in to watch Pulse Live.");
      $("#pulseLiveStatus")?.append(" ", signInLink());
      show("#pulseLiveSetup", false); show("#pulseLiveHost", false);
      return;
    }
    if (!silent) { setStatus("Could not verify Pulse Live status."); showError(plainError(e)); }
    return;
  }
  if (!data || typeof data !== "object") { updateLiveDiscovery(null); return; }
  updateLiveDiscovery(data);
  state.liveEnabled = data.enabled === true;
  state.isAdmin = data.isAdmin === true;
  const navStatus = $("#pulseLiveNavStatus");
  if (navStatus) navStatus.textContent = data.status === "live" ? "LIVE" :
    data.status === "backstage" ? "Preparing" : (state.liveEnabled ? "ON" : "OFF");
  show("#pulseLiveAdmin", data.isAdmin === true);
  // Recording incurs provider work only after the authorized Founder opts in.
  show("#pulseLiveRecordOption", data.isAdmin === true);
  show("#pulseLiveRecordNote", data.isAdmin === true);
  const toggle = $("#pulseLiveToggle");
  if (toggle) toggle.textContent = state.liveEnabled ? "Turn Pulse Live OFF" : "Turn Pulse Live ON";
  // A read-only private Google check is available only to the Founder.
  show("#pulseGoogleCheck", state.isAdmin);
  // Host visibility: the server's isHost flag wins. If absent, the Start
  // button stays visible and full host controls appear only after a
  // successful start.
  if (data.isHost === true) { show("#pulseLiveSetup", data.enabled === true && state.mode === "idle"); show("#pulseLiveHost", state.mode !== "idle"); }
  else if (data.isHost === false) { show("#pulseLiveSetup", false); show("#pulseLiveHost", false); }
  else if (state.mode === "idle") { show("#pulseLiveSetup", data.enabled === true); show("#pulseLiveHost", false); }
  // Capabilities come from the authenticated server, not browser guesses.
  if (state.mode === "idle" && data.status === "idle" && !state.busy) {
    state.facebookReady = state.isAdmin && data.facebook?.canStart === true;
    const googleConfigured = state.isAdmin && data.google?.configured === true && data.google?.routingEnabled === true;
    // A configured Google relay is NOT necessarily reachable; never re-enable
    // it after a failed check just because a routine status poll succeeded.
    state.googleReady = state.googleReady && googleConfigured;
    if (!googleConfigured) state.googleCheckMessage = "";
    const destination = $("#pulseLiveDestination");
    show("#pulseLiveDestinationOption", state.isAdmin);
    if (destination) {
      destination.querySelector('option[value="facebook"]').disabled = !state.facebookReady;
      destination.querySelector('option[value="google"]').disabled = !state.googleReady;
      if ((destination.value === "facebook" && !state.facebookReady) || (destination.value === "google" && !state.googleReady)) destination.value = "pulse";
    }
    const note = $("#pulseLiveDestinationStatus");
    if (note) note.textContent = state.googleCheckMessage ||
      ("Pulse only is independent of external relays. Facebook: " + (state.facebookReady ? "configured; account eligibility still applies" : "not enabled/configured") +
      ". Google: " + (state.googleReady ? "READY" : googleConfigured ? "configured; check Google relay setup before selection" : "not enabled/configured") + ".");
  }
  const status = data.status;
  if (state.mode === "live" && data.facebook?.status === "live") setStatus("You are LIVE on Pulse and Facebook");
  if (status === "ended" || status === "failed") {
    if (state.mode === "viewing" || state.mode === "live" || state.mode === "backstage") {
      await teardownStream();
      state.callId = null; // Do not keep polling an ended call instead of new Live sessions.
      setStatus("Stream ended."); showError("");
      show("#pulseLiveBadge", false); show("#pulseLiveViewer", false); show("#pulseLivePreview", false);
      show("#pulseLiveSetup", data.enabled === true && data.isHost !== false);
    }
    return;
  }
  if (status !== "live" && status !== "backstage") {
    if (state.mode === "viewing") await teardownStream();
    if (status === "idle") {
      const remaining = data.isAdmin ? null : data.allowance?.remainingSeconds;
      const extra = typeof remaining === "number" && Number.isFinite(remaining)
        ? " " + Math.ceil(remaining / 60) + " free Live minutes left this month (no rollover)." : "";
      setStatus(data.enabled !== true ? "Pulse Live is OFF until the NBL launch is approved." : (data.isHost ? "Ready to start your Pulse Live broadcast." + extra : "No live broadcast right now."));
      show("#pulseLiveBadge", false);
      show("#pulseLiveSetup", data.enabled === true && data.isHost === true);
      show("#pulseLiveHost", false);
    }
    return;
  }
  // Active broadcast.
  state.callId = data.callId || state.callId;
  const title = $("#pulseLiveTitle");
  if (title && data.title) { title.hidden = false; title.textContent = data.title; }
  if (status === "backstage" && data.isHost !== true && state.mode !== "backstage") {
    // Backstage stays host-only: viewers see "starting soon", never the preview.
    setStatus("A Pulse Live broadcast is getting ready — check back soon.");
    return;
  }
  if (state.mode === "viewing" || state.mode === "live" || state.mode === "backstage") {
    return;
  } // already watching/hosting
  // Discover LIVE in the feed without silently consuming a viewer slot.
  // Watching requires the member to select the visible Live view.
  if ($("#pulseLiveView")?.hidden !== false) return;
  if (data.startedAt) state.liveSince = new Date(data.startedAt).getTime();
  show("#pulseLiveBadge", status === "live");
  if (status !== "live") show("#pulseLiveElapsed", false);
  setStatus(status === "live" ? "LIVE — " + (data.title || DEFAULT_TITLE) : "Backstage — only you can see this");
  if (data.hlsPlaylistUrl) {
    state.mode = "viewing";
    const ok = await attachHls(data.hlsPlaylistUrl);
    if (!ok) {
      showError("HLS playback is unavailable in this browser");
      try { await joinAsWebRtcViewer(state.callId); showError(""); }
      catch (e) { showError(plainError(e, "HLS playback is unavailable in this browser")); }
    }
    startPoll();
  } else if (state.callId) {
    try { await joinAsWebRtcViewer(state.callId); startPoll(); }
    catch (e) { if (!silent) showError(plainError(e)); }
  }
}

// --- Host flow ---
async function onGoogleCheck() {
  const button = $("#pulseGoogleCheck"), note = $("#pulseLiveDestinationStatus");
  if (!state.isAdmin || !button || !note || state.busy) return;
  button.disabled = true;
  note.textContent = "Checking the Google relay without starting a broadcast…";
  try {
    const data = await liveApi("google-check", {}, "required");
    const readiness = data.google || {};
    const reasons = {
      server_bridge_missing: "private Google controller URL or identity is missing",
      google_identity_missing: "the protected Google invoker identity is missing in Supabase. The Cloud Run URL has been recovered automatically; an API key cannot authorize private Cloud Run.",
      google_identity_invalid: "the existing Google invoker identity in Supabase is invalid. Correct the protected service-account setting; do not paste it in chat.",
      google_controller_url_invalid: "the configured Google Cloud Run address is invalid. The standard nbl-pulse-live URL is recovered automatically only when it is absent.",
      google_channel_id_invalid: "the private Google channel identifier is invalid. The known NBL channel name is nbl-pulse-channel.",
      google_route_disabled: "Google routing is OFF in Pulse server configuration",
      google_input_missing: "Google RTMP input is not provisioned",
      google_channel_missing: "Google channel is not provisioned",
      google_input_not_attached: "Google input is not attached to its channel",
      google_output_not_configured: "private Google HLS output is not configured",
      google_watchdog_or_start_disabled: "Google independent auto-stop or channel start is not enabled",
      google_channel_not_stopped: "Google channel is not safely stopped",
      google_controller_unreachable: "Pulse cannot reach the protected Google controller"
    };
    note.textContent = readiness.ready === true
      ? "Google relay READY. Choose Pulse + Google relay to run a controlled paid test; Stream still supplies the camera."
      : "Google relay NOT READY: " + (reasons[readiness.reason] || "check the Google setup") + ". No broadcast started. Pulse only works independently of Google.";
    state.googleReady = state.isAdmin && readiness.ready === true;
    state.googleCheckMessage = note.textContent;
    const destination = $("#pulseLiveDestination");
    const option = destination?.querySelector('option[value="google"]');
    if (option) option.disabled = !state.googleReady;
    if (!state.googleReady && destination?.value === "google") destination.value = "pulse";
  } catch (error) {
    state.googleReady = false;
    const destination = $("#pulseLiveDestination");
    const option = destination?.querySelector('option[value="google"]');
    if (option) option.disabled = true;
    if (destination?.value === "google") destination.value = "pulse";
    note.textContent = "Google readiness check failed: " + plainError(error, "check Pulse backend status") + ". No broadcast started. Pulse only works independently of Google.";
    state.googleCheckMessage = note.textContent;
  } finally { button.disabled = false; }
}
async function onToggleLive() {
  if (state.busy) return;
  const enabled = !state.liveEnabled;
  if (!enabled && !confirm("Turn Pulse Live OFF and stop the active broadcast for everyone?")) return;
  setBusy(true); showError(""); setStatus("Verifying Founder Live switch…");
  try {
    const data = await liveApi("admin-switch", { enabled }, "required");
    state.liveEnabled = data.enabled === true;
    if (!enabled) setStatus("Pulse Live OFF — " + (data.shutdown === "confirmed" ? "broadcast ended." : "no active broadcast."));
    else setStatus("Pulse Live is ON for eligible NBL members.");
  } catch (e) {
    showError(plainError(e, "Could not confirm Pulse Live switch. Check the status before trying again."));
    if (!enabled) setStatus("Pulse Live OFF requested; remote shutdown may need another attempt.");
  } finally {
    setBusy(false);
    await refreshStatus(false);
  }
}
async function onStart() {
  if (state.busy) return;
  const title = ($("#pulseLiveTitleInput")?.value || "").trim().slice(0, 140) || DEFAULT_TITLE;
  const recordRequested = $("#pulseLiveRecord")?.checked === true;
  const destination = $("#pulseLiveDestination")?.value || "pulse";
  // Never silently start another destination when Google was chosen; move
  // the picker to working Pulse-only mode and require a fresh Start click.
  if (destination === "google" && !state.googleReady) {
    const picker = $("#pulseLiveDestination");
    if (picker) picker.value = "pulse";
    showError("Google relay is not ready. Switched to Pulse only; press Start Live again to use Stream without Google.");
    return;
  }
  if (destination === "facebook" && !state.facebookReady) { showError("Facebook relay is not ready. Choose Pulse only."); return; }
  if (!["pulse","facebook","google"].includes(destination)) return;
  const screenOnly = $("#pulseLiveScreenOnly")?.checked === true;
  const screenMic = screenOnly && $("#pulseLiveScreenMic")?.checked === true;
  setBusy(true); showError(""); setStatus("Starting your backstage…");
  try {
    // Founder Start explicitly prepares the existing call-member screenshare grant.
    if (screenOnly && state.isAdmin) await liveApi("admin-switch", { enabled: true }, "required");
    const data = await liveApi("start", { title, facebook_enabled: destination === "facebook", google_enabled: destination === "google", record_requested: recordRequested }, "required");
    if (!data.key || !data.token || !data.callId || data.callType !== CALL_TYPE)
      throw Error("Live session identity verification failed.");
    state.callId = data.callId;
    state.destination = destination;
    if (Boolean(data.facebook?.enabled) !== (destination === "facebook") || Boolean(data.google?.requested) !== (destination === "google")) throw Error("live_destination_conflict");
    state.recordingRequested = recordRequested;
    const VideoClient = await videoClientConstructor();
  state.client = new VideoClient({ apiKey: data.key, user: { id: state.userId }, token: data.token });
    state.call = state.client.call(CALL_TYPE, data.callId);
    await joinWithoutCapture(state.call);
    state.screenOnly = screenOnly; state.screenReady = !screenOnly;
    // Start Live is the explicit user action that requests device access.
    // Permission denial leaves that device off and permits a backstage retry.
    if (!screenOnly) {
      try { await state.call.camera.enable(); } catch {}
      try { await state.call.microphone.enable(); } catch {}
    } else if (screenMic) {
      // Explicit user choice: camera remains OFF; mic is optional in screen mode.
      try { await state.call.microphone.enable(); } catch {}
    }
    state.mode = "backstage";
    state.liveSince = null;
    show("#pulseLiveBadge", false); show("#pulseLiveElapsed", false);
    show("#pulseLiveSetup", false); show("#pulseLiveHost", true);
    show("#pulseLiveGoLive", true); show("#pulseLiveEnd", true);
    show("#pulseLivePreview", !screenOnly);
    show("#pulseLiveMediaControls", !screenOnly || screenMic);
    if (!screenOnly || screenMic) {
      state.mediaSubs = [state.call.camera.state.status$.subscribe(syncHostMedia), state.call.microphone.state.status$.subscribe(syncHostMedia)];
      syncHostMedia();
      if (!screenOnly && state.call.camera.state.status !== "enabled" && state.call.microphone.state.status !== "enabled")
        showError("Both camera and microphone are off. Turn on at least one device to broadcast.");
      if (screenMic && state.call.microphone.state.status !== "enabled")
        showError("Microphone is off. Use Unmute microphone before going live if you want viewers to hear you.");
    }
    setStatus(screenOnly
      ? (screenMic ? "Backstage — camera OFF, screen sharing selected. Check microphone status, then press Go Live to choose a screen."
        : "Backstage — camera and microphone OFF. Click Go Live to choose a screen and broadcast.")
      : "Backstage — only you can see this. Press Go Live when ready.");
    state.sub = state.call.state.participants$.subscribe(renderHostPreview);
    startPoll();
  } catch (e) {
    const originalError = plainError(e);
    // If a call/DB row was created, release it after a browser camera,
    // microphone or join failure; otherwise it would occupy the only slot.
    if (state.callId) {
      await liveApi("end", { callId: state.callId }, "required").catch(() => {});
      state.callId = null;
    }
    await teardownStream();
    showError(originalError);
    setStatus("Could not start Pulse Live.");
  } finally { setBusy(false); }
}
// Request screen capture directly from the Go Live click; browser user
// activation cannot survive asynchronous fetches. The browser screen/window
// picker is still mandatory. No camera/mic is enabled in Screen Only mode.
async function onGoLive() {
  if (state.busy || !state.callId || state.mode !== "backstage") return;
  if (!state.screenOnly && state.call?.camera.state.status !== "enabled" && state.call?.microphone.state.status !== "enabled") { showError("Turn on at least one device before broadcasting, or end and choose screen sharing."); return; }
  setBusy(true); showError("");
  let choosingScreen = false;
  try {
    if (state.screenOnly && !state.screenReady) {
      choosingScreen = true;
      setStatus("Choose a window or screen to broadcast. Camera stays OFF; microphone follows your setting.");
      await state.call.screenShare.enable();
      choosingScreen = false;
      state.screenReady = true;
      state.previewBound = null;
      show("#pulseLivePreview", true);
    }
    setStatus("Connecting your public livestream…");
    const data = await liveApi("go-live", { callId: state.callId }, "required");
    if (data.live !== true) throw Error("Pulse Live could not go live.");
    state.mode = "live";
    state.liveSince = data.startedAt ? new Date(data.startedAt).getTime() : Date.now();
    show("#pulseLiveGoLive", false);
    show("#pulseLiveBadge", true);
    const b = $("#pulseLiveBadge");
    if (b) b.textContent = "LIVE";
    setStatus("You are LIVE on Pulse" + (data.facebook?.status === "live" ? " and Facebook" : data.facebook?.status === "connecting" ? " · Facebook connecting" : data.google?.requested ? " · Google relay requested" : ""));
    startTimer();
  } catch (e) {
    if (choosingScreen) {
      setStatus("Backstage — you are NOT live. Camera and microphone remain OFF.");
      showError("Choose a screen or window when Edge asks. Press Go Live again if you cancelled.");
    } else {
      setStatus("Backstage — you are NOT live. Press Go Live to retry.");
      showError(plainError(e));
    }
  } finally { setBusy(false); }
}
async function onEnd() {
  if (state.busy || !state.callId) return;
  if (!confirm("End this Pulse Live broadcast for everyone?")) return;
  setBusy(true); showError("");
  try { await liveApi("end", { callId: state.callId }, "required"); }
  catch (e) {
    showError("Could not confirm the stream stopped. Retry End Live; do not close the browser until shutdown is confirmed.");
    setStatus("Stop not confirmed — broadcast may still be running.");
    setBusy(false);
    return;
  }
  setBusy(false);
  const wasLive = state.mode === "live";
  await teardownStream();
  state.callId = null;
  show("#pulseLiveBadge", false);
  const vc = $("#pulseLiveViewers"); if (vc) vc.hidden = true;
  show("#pulseLivePreview", false); show("#pulseLiveViewer", false);
  show("#pulseLiveGoLive", false); show("#pulseLiveEnd", false);
  show("#pulseLiveSetup", true); show("#pulseLiveHost", false);
  setStatus(wasLive ? (state.recordingRequested
    ? "Live ended. Your saved video may take a few minutes to process; select My saved Live videos to find it."
    : "Live ended successfully. No video was saved because Save this Live video was OFF.")
    : "Backstage ended. No broadcast or recording was made.");
}

async function onFindRecording() {
  const result = $("#pulseLiveSavedResult");
  const button = $("#pulseLiveFindRecording");
  if (!result || !button) return;
  button.disabled = true;
  result.replaceChildren("Checking Stream for your saved recording…");
  try {
    const data = await liveApi("recordings", {}, "required");
    if (!data.ready || !Array.isArray(data.recordings) || !data.recordings.length) {
      result.replaceChildren("No recording is ready yet. Stream processing may take several minutes. Try again later.");
      return;
    }
    result.replaceChildren();
    for (const item of data.recordings) {
      if (typeof item.url !== "string" || !item.url.startsWith("https://")) continue;
      const row = document.createElement("div");
      row.className = "pulse-recording-row";
      const link = document.createElement("a");
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Watch or download: " + (item.filename || "Pulse Live");
      row.append(link);
      if (typeof data.callId === "string" && typeof item.sessionId === "string" && item.sessionId && item.filename) {
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "btn small";
        remove.textContent = "Delete recording";
        remove.setAttribute("aria-label", "Delete saved Pulse Live recording " + item.filename);
        remove.addEventListener("click", async () => {
          if (!window.confirm("Permanently delete this saved Pulse Live recording from Stream? It cannot be undone. This does not remove copies already shared elsewhere.")) return;
          remove.disabled = true;
          try {
            const deleted = await liveApi("delete-recording", {
              callId: data.callId, sessionId: item.sessionId, filename: item.filename, confirm: "delete"
            }, "required");
            if (deleted?.deleted !== true) throw Error("Recording deletion was not confirmed.");
            // Show removal only after provider confirms deletion.
            row.remove();
            if (!result.querySelector(".pulse-recording-row"))
              result.replaceChildren("Recording deleted from Stream. Copies shared elsewhere are not removed.");
          } catch (error) {
            remove.disabled = false;
            showError(plainError(error, "Could not delete the recording. It has not been marked deleted."));
          }
        });
        row.append(remove);
      }
      result.append(row);
    }
  } catch (error) {
    if (error?.reason === "recording_not_found")
      result.replaceChildren("No saved Live video exists yet. To save your next broadcast, select Save this Live video before Start Live.");
    else result.replaceChildren(plainError(error, "Could not retrieve the recording yet."));
  } finally { button.disabled = false; }
}

// On phones the sidebar is a fixed five-button navigation bar. Move this
// exact control (never clone it) into the scrollable Pulse feed so all buttons
// remain tappable, while restoring its original desktop sidebar placement.
function placeLivePanel() {
  // Muse redesign: move the ONE existing, current Pulse Live panel into its view.
  // This does not recreate or change any Stream, Meta, Google, or device controls.
  const root = $("#pulseLive");
  const slot = $("#pulseLiveView");
  if (!root || !slot) return;
  if (root.parentElement !== slot) slot.append(root);
}

export function initPulseLive() {
  const root = $("#pulseLive");
  if (!root) return;
  placeLivePanel();
  // Desktop-only screen capture must not replace the normal camera/mic path
  // on phones where window/tab selection is generally unavailable.
  const option = $("#pulseLiveScreenOnly");
  const screenMicOption = $("#pulseLiveScreenMicOption");
  const screenMic = $("#pulseLiveScreenMic");
  const recordChoice = $("#pulseLiveRecord");
  // Never restore a previously checked recording preference by accident.
  if (recordChoice) recordChoice.checked = false;
  const mobile = window.matchMedia("(max-width: 760px)");
  const syncScreenOption = () => {
    if (!option) return;
    const unsupported = mobile.matches || typeof navigator.mediaDevices?.getDisplayMedia !== "function";
    option.disabled = unsupported;
    if (unsupported) option.checked = false;
    if (screenMic && unsupported) screenMic.checked = false;
    if (screenMicOption) screenMicOption.hidden = unsupported || !option.checked;
    const label = option.closest("label");
    if (label) label.hidden = unsupported;
  };
  syncScreenOption();
  option?.addEventListener("change", syncScreenOption);
  mobile.addEventListener("change", () => { placeLivePanel(); syncScreenOption(); });
  $("#pulseLiveStart")?.addEventListener("click", () => { void onStart(); });
  $("#pulseLiveCameraToggle")?.addEventListener("click", () => { void toggleHostMedia("camera"); });
  $("#pulseLiveMicToggle")?.addEventListener("click", () => { void toggleHostMedia("microphone"); });
  $("#pulseLiveToggle")?.addEventListener("click", () => { void onToggleLive(); });
  $("#pulseGoogleCheck")?.addEventListener("click", () => { void onGoogleCheck(); });
  $("#pulseLiveGoLive")?.addEventListener("click", () => { void onGoLive(); });
  $("#pulseLiveEnd")?.addEventListener("click", () => { void onEnd(); });
  $("#pulseLiveFindRecording")?.addEventListener("click", () => { void onFindRecording(); });
  document.addEventListener("pulse:view-change", (event) => {
    if (event.detail?.view === "live") {
      if (!state.busy) void refreshStatus(false);
    } else if (state.mode === "viewing") {
      // Leave the viewer call only; NEVER stop the host broadcast.
      void teardownStream();
    }
  });
  window.addEventListener("pagehide", () => {
    stopPoll(); stopTimer();
    // Leave only — never POST end on unload (a refresh must not kill the stream).
    try { void state.call?.leave(); } catch {}
    try { void state.client?.disconnectUser(); } catch {}
  });
  void refreshStatus(false);
  // Poll while idle too so Pulse viewers discover broadcasts without reloading.
  startPoll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => { if ($("#pulseLive")) initPulseLive(); });
} else if ($("#pulseLive")) { initPulseLive(); }
