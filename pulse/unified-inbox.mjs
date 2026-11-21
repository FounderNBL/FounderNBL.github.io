// NBL Pulse unified message center: one private view for supported inboxes.
// Direct messages stay at their existing NBL/Meta providers. No DM content,
// access tokens, or message identifiers are copied to analytics or storage.
import {showPulseMemberThread} from "./member-inbox.mjs?v=20261121-single-social-v1";
import {showPulseInstagramThread} from "./instagram-inbox.mjs?v=20261121-dm-page-v3";

const $ = selector => document.querySelector(selector);
const create = (tag, cls, value) => {
  const item = document.createElement(tag);
  if (cls) item.className = cls;
  if (value !== undefined) item.textContent = String(value);
  return item;
};
const memberThreadId = /^[0-9a-f-]{36}$/i;
const instagramThreadId = /^[A-Za-z0-9_=-]{6,512}$/;
const readableDate = value => {
  const time = Date.parse(String(value || ""));
  return Number.isFinite(time) ? new Date(time).toLocaleString() : "";
};

// Pure normalizers: no private message bodies or participant IDs in previews.
export function normalizePulseThreads(data) {
  return (Array.isArray(data?.threads) ? data.threads : [])
    .filter(thread => thread?.thread_type === "direct" && memberThreadId.test(String(thread.id || "")))
    .map(thread => ({
      provider: "pulse", id: String(thread.id),
      label: "@" + String(thread.contactNickname || thread.peer?.handle || "NBL member").slice(0,80),
      updated: String(thread.updated_at || ""), source: "NBL Pulse"
    }));
}
export function normalizeInstagramThreads(data) {
  return (Array.isArray(data?.conversations) ? data.conversations : [])
    .filter(thread => instagramThreadId.test(String(thread?.id || "")))
    .map(thread => ({
      provider: "instagram", id: String(thread.id),
      label: "@" + String(thread.people?.[0]?.username || "Instagram user").slice(0,80),
      updated: String(thread.updated_at || ""), source: "Instagram · @nbl_world"
    }));
}
export function sortConversations(entries) {
  return [...entries].sort((a,b) => {
    const ta = Date.parse(a.updated), tb = Date.parse(b.updated);
    return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
  });
}

export function mountUnifiedInbox({social, instagram, founder = false}) {
  const hub = $("#pulseUnifiedInbox");
  const nav = $("#pulseUnifiedInboxNav");
  const member = $("#pulseMemberInbox");
  const ig = $("#pulseInstagramInbox");
  const host = $("#pulseInboxThreadHost");
  const list = $("#pulseInboxList");
  const summary = $("#pulseInboxStatus");
  const all = $("#pulseInboxAll");
  const note = $("#pulseInboxProviderNote");
  const refresh = $("#pulseInboxRefresh");
  if (!hub || !nav || !member || !ig || !host || hub.dataset.mounted === "true") return;
  hub.dataset.mounted = "true";
  // Move the two existing, authenticated inboxes into ONE Pulse section.
  // Their proven sending/receiving logic remains the sole message transport.
  host.append(member, ig);
  nav.hidden = false;
  const tabs = Array.from(hub.querySelectorAll("[data-pulse-inbox]"));
  let current = "pulse", loading = false, refreshGeneration = 0;
  let recent = [];

  function message(text) { summary.textContent = String(text); }
  function setTab(name) {
    current = name;
    hub.hidden = false;
    all.hidden = name !== "all";
    member.hidden = name !== "pulse";
    ig.hidden = name !== "instagram";
    note.hidden = !["facebook","tiktok"].includes(name) && !(name === "instagram" && !founder);
    for (const tab of tabs) {
      const active = tab.dataset.pulseInbox === name;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    }
    if (name === "facebook") {
      note.textContent = "Facebook Page messages are not connected to Pulse yet. The existing Facebook Page connection can manage posts, but Messenger requires the approved pages_messaging permission and Page messaging setup. No Facebook messages are being shown or sent here.";
    } else if (name === "tiktok") {
      note.textContent = "TikTok DMs are not connected to Pulse. An eligible TikTok Business account and TikTok Business Messaging API authorization are required before Pulse can read or reply to those messages. No TikTok messages are imported.";
    } else if (name === "instagram" && !founder) {
      note.textContent = "Instagram Direct is available only to the authorized NBL business account administrator. Your private NBL member messages remain available under Pulse.";
      ig.hidden = true;
    }
    if (name === "pulse" || name === "instagram" && founder) note.hidden = true;
    if (name !== "all") message(name === "pulse" ? "NBL private messages." :
      name === "instagram" ? "Official Instagram business messages." :
      "This provider needs its own authorized messaging connection.");
  }

  function renderOverview(entries, errors) {
    list.replaceChildren();
    if (!entries.length) {
      list.append(create("p","social-meta",errors.length ?
        "No connected conversations could be loaded. Check the connection messages below." :
        "No conversations yet. Open Pulse Messages to start one."));
    }
    for (const entry of entries) {
      const button = create("button","pulse-unified-thread");
      button.type = "button";
      const top = create("span","pulse-unified-thread-head");
      top.append(create("strong",null,entry.label), create("small","pulse-unified-provider",entry.source));
      button.append(top);
      const date = readableDate(entry.updated);
      if (date) button.append(create("small","social-meta",date));
      button.addEventListener("click", () => {
        if (entry.provider === "pulse") {
          setTab("pulse");
          void showPulseMemberThread(entry.id);
        } else if (entry.provider === "instagram" && founder) {
          setTab("instagram");
          void showPulseInstagramThread(entry.id);
        }
      });
      list.append(button);
    }
    if (errors.length) {
      for (const reason of errors) list.append(create("p","social-feedback",reason));
    }
    message(entries.length + " conversation" + (entries.length === 1 ? "" : "s") +
      " across connected sources. Facebook and TikTok require separate messaging access.");
  }

  async function loadOverview() {
    if (loading || hub.hidden || current !== "all") return;
    loading = true;
    const generation = ++refreshGeneration;
    refresh.disabled = true;
    message("Checking your connected messages…");
    const requested = [social({action:"list_threads"})];
    if (founder) requested.push(instagram("/inbox/list",{action:"list"}));
    try {
      const results = await Promise.allSettled(requested);
      if (hub.hidden || current !== "all" || generation !== refreshGeneration) return;
      const entries = [];
      const errors = [];
      if (results[0].status === "fulfilled") entries.push(...normalizePulseThreads(results[0].value));
      else errors.push("Pulse member messages could not load. Open Pulse and try Refresh.");
      if (founder) {
        if (results[1].status === "fulfilled") entries.push(...normalizeInstagramThreads(results[1].value));
        else errors.push("Instagram DMs could not load. Check your Meta messaging connection under Instagram.");
      }
      recent = sortConversations(entries);
      renderOverview(recent,errors);
    } finally {
      loading = false;
      refresh.disabled = false;
    }
  }

  function open(name = "pulse", load = true) {
    setTab(name);
    hub.scrollIntoView({behavior:"smooth",block:"start"});
    if (!load) return;
    if (name === "all") void loadOverview();
    else if (name === "pulse") $("#pulseMemberInboxNav")?.click();
    else if (name === "instagram" && founder) $("#pulseInstagramInboxNav")?.click();
  }

  nav.addEventListener("click", () => open("pulse"));
  refresh.addEventListener("click", () => { void loadOverview(); });
  for (const tab of tabs) tab.addEventListener("click", () => open(tab.dataset.pulseInbox));
  hub.querySelector("#pulseInboxClose")?.addEventListener("click", () => {
    hub.hidden = true; member.hidden = true; ig.hidden = true; nav.focus();
  });
  member.querySelector("#pulseMemberClose")?.addEventListener("click", () => open("pulse"));
  ig.querySelector("#pulseIgClose")?.addEventListener("click", () => open("pulse"));
  // A member's profile Message action and ?dm= links must land in the unified section.
  document.addEventListener("pulse:member-inbox-open", () => {
    setTab("pulse");
    hub.scrollIntoView({behavior:"smooth",block:"start"});
  });
}
