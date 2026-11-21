// NBL Pulse — Meta Business Management assets panel.
// No tokens, stream keys, or app credentials anywhere in this file.
// The Meta access token lives server-side only (nbl-meta-business Edge
// Function); this module only ever sends the member's Clerk JWT and receives
// asset lists. Tokens are held only in memory (never localStorage /
// sessionStorage). Clerk publishable key below is the public key already
// used by web/messenger/call.mjs, social-v1.mjs and live.mjs.
// Follows the live.mjs patterns: Clerk JWT helper, POST JSON helper with
// auth modes, plain-language errors. Dependency-free.
const ENDPOINT = "https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-meta-business";
const CLERK_KEY = "pk_live_Y2xlcmsubmV3YmVhbnNsYW5kLm9yZyQ";
const ACCOUNT = "https://accounts.newbeansland.org";

const $ = (s) => document.querySelector(s);
const state = { clerk: null, busy: false, connected: false, loaded: false };

// --- Clerk: copied pattern from live.mjs / social-v1.mjs ---
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
  return token;
}

// --- nbl-meta-business API ---
// auth: "none" (no header) | "optional" (try anonymous, retry authed on
// sign_in_required) | "required" (Clerk JWT, throws if signed out).
async function metaBusinessApi(action, body = {}, auth = "required") {
  const payload = { action, ...body };
  const send = async (token) => {
    const headers = { "content-type": "application/json" };
    if (token) headers.authorization = "Bearer " + token;
    const res = await fetch(ENDPOINT, {
      method: "POST", headers, body: JSON.stringify(payload), cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok !== true) {
      const e = Error(data.message || data.reason || "Meta Business is unavailable.");
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

const REASON_TEXT = {
  sign_in_required: "Sign in to NBL to manage business assets.",
  founder_only: "The NBL Founder account is required to manage business assets.",
  meta_token_unavailable: "Your Meta connection expired. Connect again to refresh it.",
  meta_unavailable: "Meta Business could not be reached. Try again in a moment.",
};
function plainError(error, fallback) {
  const reason = error?.reason || error?.message || "";
  if (REASON_TEXT[reason]) return REASON_TEXT[reason];
  if (error?.name === "TypeError" || /failed to fetch|networkerror/i.test(String(error?.message || "")))
    return "Could not reach Meta Business. Check your connection and try again.";
  return fallback || "Meta Business is unavailable right now. Try again in a moment.";
}

function setStatus(text) { const el = $("#metaBusinessStatus"); if (el) el.textContent = text; }
function setBusy(on) {
  state.busy = on;
  const connect = $("#metaBusinessConnect");
  if (connect) connect.disabled = on;
}

// --- Asset lists ---
function assetLabel(asset) {
  if (asset.username) return asset.username + (asset.name ? " — " + asset.name : "");
  return asset.name || asset.id || "Unnamed asset";
}
function renderAssetList(containerId, heading, assets, assetType) {
  const container = $(containerId);
  if (!container) return;
  container.replaceChildren();
  const title = document.createElement("h3");
  title.textContent = heading;
  container.append(title);
  if (!assets || !assets.length) {
    const empty = document.createElement("p");
    empty.textContent = "No " + heading.toLowerCase() + " found yet.";
    container.append(empty);
    return;
  }
  for (const asset of assets) {
    const row = document.createElement("label");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = asset.selected === true;
    box.disabled = state.busy;
    box.addEventListener("change", () => { void onSelect(assetType, asset.id, box); });
    const text = document.createElement("span");
    text.textContent = assetLabel(asset);
    row.append(box, text);
    container.append(row);
  }
}
function renderAssets(data) {
  renderAssetList("#metaBusinessBusinesses", "Businesses", data.businesses, "business");
  renderAssetList("#metaBusinessPages", "Pages", data.pages, "page");
  renderAssetList("#metaBusinessInstagramAccounts", "Instagram accounts", data.instagram_accounts, "instagram");
  const selected = (data.pages || []).filter((a) => a.selected).length
    + (data.businesses || []).filter((a) => a.selected).length
    + (data.instagram_accounts || []).filter((a) => a.selected).length;
  setStatus("Connected to Meta Business. " + selected + (selected === 1 ? " asset" : " assets") + " saved for future business tools. Existing Pulse publishing and Instagram DMs still use their own approved connections.");
}

async function onSelect(assetType, assetId, box) {
  const selected = box.checked;
  box.disabled = true;
  try {
    await metaBusinessApi("select", { asset_type: assetType, asset_id: assetId, selected }, "required");
    setStatus("Business asset selection saved. This does not change the existing Pulse publishing or messaging permissions.");
  } catch (e) {
    box.checked = !selected; // revert on failure
    setStatus(plainError(e, "That asset could not be updated. Try again."));
  } finally {
    box.disabled = false;
  }
}

async function refreshStatus() {
  let data;
  try {
    // Signed-out status intentionally returns disconnected, so the Founder MUST
    // send their Clerk JWT instead of accidentally accepting anonymous zeros.
    data = await metaBusinessApi("status", {}, "required");
  } catch (e) {
    setStatus(plainError(e, "Could not check Meta Business status."));
    return;
  }
  state.connected = data.connected === true;
  if (!state.connected) {
    setStatus("Business assets are not connected yet. Connect Meta Business to list your Pages and Instagram accounts.");
    return;
  }
  setStatus("Connected to Meta Business. Loading your assets…");
  await loadAssets();
}

async function loadAssets() {
  let data;
  try {
    data = await metaBusinessApi("assets", {}, "required");
  } catch (e) {
    setStatus(plainError(e, "Could not load your business assets."));
    return;
  }
  state.loaded = true;
  renderAssets(data);
}

async function onConnect() {
  if (state.busy) return;
  setBusy(true);
  setStatus("Opening Meta sign-in…");
  try {
    const data = await metaBusinessApi("connect-url", {}, "required");
    if (typeof data.auth_url !== "string" || !data.auth_url.startsWith("https://www.facebook.com/"))
      throw Error("Meta sign-in link was not verified.");
    location.assign(data.auth_url); // Meta authorization page, then back to Pulse
  } catch (e) {
    setStatus(plainError(e, "Could not open Meta sign-in. Try again."));
    setBusy(false);
  }
}

async function onDisconnect() {
  if (state.busy) return;
  if (!confirm("Remove this Business Management connection from Pulse? This only deletes the Business Management copy of your token and asset choices; it will not disconnect Instagram DMs, Facebook Page posting, or Pulse Live.")) return;
  setBusy(true);
  setStatus("Disconnecting Meta Business…");
  try {
    await metaBusinessApi("disconnect", {}, "required");
    state.connected = false;
    state.loaded = false;
    renderAssets({ businesses: [], pages: [], instagram_accounts: [] });
    setStatus("Meta Business was disconnected locally. Your other Meta connections were left alone.");
  } catch (e) {
    setStatus(plainError(e, "Could not disconnect Meta Business. Try again."));
  } finally {
    setBusy(false);
  }
}

// Links to the existing in-Pulse tools only — anchor navigation, no rebuild:
// the Pulse composer is the #postForm form (publishPost in social-v1.mjs),
// and Pulse Live is #pulseLive (live.mjs).
function addToolLinks() {
  const panel = $("#metaBusinessPanel");
  if (!panel || $("#metaBusinessTools")) return;
  const tools = document.createElement("p");
  tools.id = "metaBusinessTools";
  const composer = document.createElement("a");
  composer.href = "#postForm";
  composer.textContent = "Post in Pulse";
  const live = document.createElement("a");
  live.href = "#pulseLive";
  live.textContent = "Pulse Live";
  tools.append(composer, " · ", live);
  panel.append(tools);
  const disconnect = document.createElement("button");
  disconnect.id = "metaBusinessDisconnect";
  disconnect.type = "button";
  disconnect.textContent = "Disconnect Meta Business";
  disconnect.addEventListener("click", () => { void onDisconnect(); });
  panel.append(disconnect);
}

export function initMetaBusiness() {
  const panel = $("#metaBusinessPanel");
  if (!panel) return;
  const manage = $("#manageBusinessAssets");
  if (manage) manage.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) {
      document.querySelector("#connectProviders")?.removeAttribute("open");
      panel.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      if (!state.loaded) void refreshStatus();
    }
  });
  $("#metaBusinessConnect")?.addEventListener("click", () => { void onConnect(); });
  addToolLinks();
  const params = new URLSearchParams(location.search);
  const result = params.get("meta_business");
  if (result === "connected") {
    panel.hidden = false;
    setStatus("Meta Business connected. Loading your assets…");
    void loadAssets();
  } else if (result === "error") {
    panel.hidden = false;
    const safe = params.get("code");
    const errors = {
      invalid_state: "The Meta login expired. Return to Pulse and use Connect again.",
      meta_unconfigured: "The server Meta app secret is missing. Do not repeat authorization until configured.",
      token_exchange_failed: "Meta rejected the code exchange. Check the callback URL registered in Meta.",
      permission_missing: "Meta did not grant business_management. Check the app permission or Login for Business configuration.",
      profile_failed: "Meta account verification failed during connection.",
      asset_sync_failed: "Meta authorization worked, but Pulse could not read your business assets. Check business_management and assigned asset access.",
      storage_failed: "Meta authorization worked, but Pulse could not store the connection.",
      meta_unavailable: "Meta could not complete authorization. Review Meta login permissions before retrying."
    };
    setStatus(errors[safe] || "Meta Business connection did not finish. Check the authorization settings before retrying.");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => { if ($("#metaBusinessPanel")) initMetaBusiness(); });
} else if ($("#metaBusinessPanel")) { initMetaBusiness(); }
