// NBL Pulse — redesign wiring only (2026-11-22).
// View switching, composer sheet, appearance, feed search, Live-now
// mirror and the Rehearsal switch. No backend calls, no broadcast or
// send logic here: feeds/composer/inbox stay in social-v1.mjs, Go Live
// stays in live.mjs, business assets stay in business-assets.mjs.
// This module only moves the user between views and toggles UI state.

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

// --- Views ---
// Feed views show stories + composer trigger + feed. Watch is the For You
// feed filtered to video posts (see .pulse-watch-filter). Live and Menu
// are their own center-column sections; their panels are hidden by
// social-v1's selectTab when a feed tab is chosen, and hidden here when
// the user leaves a feed view.
const FEED_VIEWS = new Set(["home", "following", "myposts", "watch", "notifications", "friends", "messages"]);
let currentView = "home";
let feedClickFromWatch = false;

function show(el, on) { if (el) el.hidden = !on; }

function switchView(view, opts = {}) {
  currentView = view;
  const app = $("#socialApp");
  $$("[data-view]").forEach((b) => b.setAttribute("aria-current", b.dataset.view === view ? "page" : "false"));
  show($("#pulseStories"), view === "home" || view === "following" || view === "myposts" || view === "watch");
  show($("#pulseComposerTrigger"), view === "home" || view === "following" || view === "myposts" || view === "watch");
  show($("#pulseWatchNote"), view === "watch");
  show($("#pulseLiveView"), view === "live");
  show($("#pulseMenuView"), view === "menu");
  // Website-only native unified inbox: retain existing member and Instagram
  // transports; never duplicate messages or substitute the old iframe.
  if (view !== "messages") {
    show($("#pulseUnifiedInbox"), false);
    show($("#pulseMemberInbox"), false);
    show($("#pulseInstagramInbox"), false);
  }
  if (app) app.classList.toggle("pulse-watch-filter", view === "watch");
  if (view === "live" || view === "menu" || view === "messages") {
    // Keep the center column to one view: social-v1 re-shows the right
    // panel on the next feed click (selectTab owns those three).
    show($("#feedPanel"), false);
    show($("#friendsPanel"), false);
    show($("#messengerPanel"), false);
  }
  if (view === "menu" && opts.section) {
    const target = document.getElementById(opts.section);
    if (target) target.scrollIntoView({ block: "start" });
  }
}

document.addEventListener("click", (event) => {
  const postLink = event.target.closest('a[href="#postForm"],a[href="#composeTitle"]');
  if (postLink) { event.preventDefault(); openComposer(); return; }
  const liveLink = event.target.closest('a[href="#pulseLive"]');
  if (liveLink) { event.preventDefault(); switchView("live"); return; }
  const button = event.target.closest("[data-view]");
  if (!button) {
    const oldShortcut=event.target.closest("#pulseMenuView .pulse-mobile-more [data-feed]");
    if(oldShortcut)switchView(oldShortcut.dataset.feed==="friends"?"friends":"myposts");
    return;
  }
  if (feedClickFromWatch) { feedClickFromWatch = false; return; }
  const view = button.dataset.view;
  if (view === "messages" && button.id !== "pulseUnifiedInboxNav") {
    // The existing inbox nav owns provider-specific permissions and thread
    // lifecycle. Forward only the click; do not send anything ourselves.
    const nativeNav = $("#pulseUnifiedInboxNav");
    if (nativeNav && !nativeNav.hidden) nativeNav.click();
    else location.assign("/messenger/");
    return;
  }
  if (view === "business") {
    // Business-assets owns the toggle; the panel observer below moves
    // the user to the Menu view when the panel opens.
    $("#manageBusinessAssets")?.click();
    return;
  }
  if (view === "watch") {
    // Watch is the real For You feed, video-only. Load it through the
    // Home tab so social-v1 owns the feed state; the flag keeps that
    // programmatic click from switching the view back to Home. Always
    // click: the feed may still be on Messages/Friends even when the
    // title still reads "For You".
    const homeTab = document.querySelector('[data-view="home"][data-feed="foryou"]');
    if (homeTab) {
      feedClickFromWatch = true;
      homeTab.click();
    }
  }
  switchView(view, { section: button.dataset.menuSection });
});

// The feed can change without a view click (e.g. publishing a post moves
// the feed to My Posts). Keep the shortcut highlight honest, except in
// Watch / Live / Menu, where the shown feed intentionally differs.
const TITLE_TO_VIEW = { "For You": "home", Following: "following", "My Posts": "myposts", Notifications: "notifications", Friends: "friends" };
const feedTitle = $("#feedTitle");
if (feedTitle) {
  new MutationObserver(() => {
    const next = TITLE_TO_VIEW[feedTitle.textContent?.trim() || ""];
    if (next && next !== currentView && FEED_VIEWS.has(currentView)) switchView(next);
  }).observe(feedTitle, { childList: true, characterData: true, subtree: true });
}

// --- Composer sheet (the real #postForm, moved into a <dialog>) ---
const sheet = $("#pulseComposerSheet");
function openComposer() {
  if (!sheet) return;
  // Reuse the current website composer and media rights controls, in place.
  // Move the same node once, do not create a second post form.
  const existing = document.querySelector("#socialApp .social-compose");
  if (existing && existing.parentElement !== sheet) {
    sheet.insertBefore(existing, sheet.querySelector(".pulse-sheet-actions"));
  }
  const composer = sheet.querySelector(".social-compose");
  if (composer) composer.hidden = false;
  if (!sheet.open) sheet.showModal();
  $("#postText")?.focus();
}
function closeComposer() { if (sheet?.open) sheet.close(); }
$("#pulseComposerTriggerBtn")?.addEventListener("click", openComposer);
$("#pulseCreateTop")?.addEventListener("click", openComposer);
$("#pulseCreateBottom")?.addEventListener("click", openComposer);
$("#pulseComposerClose")?.addEventListener("click", closeComposer);
$("#pulseComposerPost")?.addEventListener("click", () => $("#postForm")?.requestSubmit());
$("#pulseComposerMedia")?.addEventListener("click", () => $("#postMedia")?.click());
$("#pulseComposerGoLive")?.addEventListener("click", () => { closeComposer(); switchView("live"); });
sheet?.addEventListener("click", (event) => { if (event.target === sheet) closeComposer(); });
// Posting continues after submit; close the sheet so the status line at
// the top of the page is visible.
$("#postForm")?.addEventListener("submit", () => closeComposer());

// --- Appearance: Auto / Light / Dark (Menu). Light is the default. ---
const THEME_COLORS = { light: "#ffffff", dark: "#0a0716" };
function applyTheme(value) {
  const theme = ["auto", "light", "dark"].includes(value) ? value : "light";
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem("pulse-appearance", theme); } catch {}
  $$("[data-appearance]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.appearance === theme)));
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.content = theme === "dark" ? THEME_COLORS.dark
      : theme === "light" ? THEME_COLORS.light
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? THEME_COLORS.dark : THEME_COLORS.light);
  }
}
$$("[data-appearance]").forEach((b) => b.addEventListener("click", () => applyTheme(b.dataset.appearance)));
try { applyTheme(localStorage.getItem("pulse-appearance") || "light"); } catch { applyTheme("light"); }

// --- Feed search: filters the Beats already rendered in #feedItems. ---
const searchInput = $("#pulseSearch");
let searchNote = null;
function applySearch() {
  const query = (searchInput?.value || "").trim().toLowerCase();
  const app = $("#socialApp");
  const items = $("#feedItems");
  if (!app || !items) return;
  app.classList.toggle("pulse-search-active", query.length > 0);
  let visible = 0;
  items.querySelectorAll(".social-card").forEach((card) => {
    const match = !query || (card.textContent || "").toLowerCase().includes(query);
    card.classList.toggle("pulse-search-hide", !match);
    if (match) visible += 1;
  });
  if (query && visible === 0) {
    if (!searchNote) {
      searchNote = document.createElement("p");
      searchNote.className = "pulse-search-empty";
      searchNote.textContent = "No Beats in this feed match your search.";
    }
    if (!searchNote.isConnected) items.append(searchNote);
  } else if (searchNote?.isConnected) {
    searchNote.remove();
  }
}
searchInput?.addEventListener("input", applySearch);
const feedItems = $("#feedItems");
if (feedItems) new MutationObserver(applySearch).observe(feedItems, { childList: true });
$("#pulseSearchToggle")?.addEventListener("click", () => {
  const bar = document.querySelector(".pulse-topbar");
  const open = bar?.classList.toggle("pulse-search-open");
  $("#pulseSearchToggle")?.setAttribute("aria-expanded", String(Boolean(open)));
  if (open) searchInput?.focus();
});

// --- Live now (right rail): mirror the real #pulseLiveStatus text. ---
const liveNowStatus = $("#pulseLiveNowStatus");
const liveStatus = $("#pulseLiveStatus");
const liveBadge = $("#pulseLiveBadge");
function mirrorLive() {
  if (liveNowStatus && liveStatus) liveNowStatus.textContent = liveStatus.textContent || "";
  const card = $("#pulseLiveNow");
  if (card && liveBadge) card.toggleAttribute("data-live", !liveBadge.hidden);
}
if (liveStatus) new MutationObserver(mirrorLive).observe(liveStatus, { childList: true, characterData: true, subtree: true });
if (liveBadge) new MutationObserver(mirrorLive).observe(liveBadge, { attributes: true, attributeFilter: ["hidden"] });
mirrorLive();

// --- Legacy Muse prototype rehearsal switch (not offered on the live website).
// No new backend flag: onStart already sends facebook_enabled from the
// Facebook checkbox, so an unchecked + disabled checkbox is the whole
// behaviour. live.mjs re-asserts the checkbox from its own poll, so
// re-apply while Rehearsal is on.
const rehearsal = $("#pulseLiveRehearsal");
const facebookBox = $("#pulseLiveFacebook");
const rehearsalNote = $("#pulseLiveRehearsalNote");
function applyRehearsal() {
  if (!rehearsal || !facebookBox) return;
  if (rehearsal.checked) {
    facebookBox.checked = false;
    facebookBox.disabled = true;
    if (rehearsalNote) rehearsalNote.hidden = false;
  } else {
    if (rehearsalNote) rehearsalNote.hidden = true;
    // Re-enable only if the Page is configured (live.mjs shows the
    // "requires your connected official Page" note when it is not).
    facebookBox.disabled = $("#pulseLiveFacebookNote") ? !$("#pulseLiveFacebookNote").hidden : false;
  }
}
rehearsal?.addEventListener("change", applyRehearsal);
if (facebookBox) new MutationObserver(() => { if (rehearsal?.checked) applyRehearsal(); })
  .observe(facebookBox, { attributes: true, attributeFilter: ["disabled", "checked"] });

// --- Business assets panel: when it opens (button, OAuth return, or
// ?meta_business=), show the Menu view that contains it. ---
const businessPanel = $("#metaBusinessPanel");
if (businessPanel) {
  new MutationObserver(() => { if (!businessPanel.hidden) switchView("menu"); })
    .observe(businessPanel, { attributes: true, attributeFilter: ["hidden"] });
}

// --- Initial view from the URL (social-v1 owns the feed itself). ---
const params = new URLSearchParams(location.search);
if (params.get("messages") === "1") switchView("messages");
else if (params.get("meta_business") === "connected" || params.get("meta_business") === "error") switchView("menu");
else switchView("home");

// Current site keeps Meta business authorization outside the feed views.
$("#pulseBusinessOpen")?.addEventListener("click", () => {$("#manageBusinessAssets")?.click();$("#metaBusinessPanel")?.scrollIntoView({block:"start"});});
document.addEventListener("pulse:member-inbox-open", () => switchView("messages"));
