(() => {
  "use strict";

  const CORE_API = "https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-core";
  const STREAM_API = CORE_API + "/stream";
  const CLERK_PUBLISHABLE_KEY = "pk_live_Y2xlcmsubmV3YmVhbnNsYW5kLm9yZyQ";
  const ACCOUNT_PORTAL = "https://accounts.newbeansland.org";
  const $ = selector => document.querySelector(selector);
  const state = {
    clerk: null,
    streamSessionId: null,
    streamStatus: null,
    chatMuted: false,
    chatTimer: null,
    statusTimer: null,
    unmountVideo: null,
    busy: false
  };
  let sdkPromise = null;

  function setStatus(value, detail) {
    const badge = $("[data-live-provider-status]");
    badge.textContent = value;
    badge.dataset.state = ["LIVE", "OFFLINE", "UPCOMING"].includes(value) ? value : "UNKNOWN";
    $("[data-live-status-detail]").textContent = detail;
  }

  function showError(message) {
    const error = $("[data-live-error]");
    error.textContent = message;
    error.hidden = false;
  }

  function clearError() {
    const error = $("[data-live-error]");
    error.textContent = "";
    error.hidden = true;
  }

  function clerkDomain() {
    const encoded = (CLERK_PUBLISHABLE_KEY.split("_")[2] || "").replace(/-/g, "+").replace(/_/g, "/");
    return atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=")).replace(/\$/, "");
  }

  async function getClerk() {
    if (state.clerk) return state.clerk;
    if (!window.Clerk) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://" + clerkDomain() + "/npm/@clerk/clerk-js@6/dist/clerk.browser.js";
        script.async = true;
        script.crossOrigin = "anonymous";
        script.setAttribute("data-clerk-publishable-key", CLERK_PUBLISHABLE_KEY);
        script.onload = resolve;
        script.onerror = () => reject(new Error("NBL account service could not load."));
        document.head.append(script);
      });
    }
    if (!window.Clerk) throw new Error("NBL account service is unavailable.");
    await window.Clerk.load();
    state.clerk = window.Clerk;
    return state.clerk;
  }

  async function authToken() {
    const clerk = await getClerk();
    if (!clerk.isSignedIn || !clerk.session) throw new Error("Sign in with your NBL account first.");
    const token = await clerk.session.getToken();
    if (!token) throw new Error("Your NBL session expired. Sign in again.");
    return token;
  }

  async function streamRequest(action, fields = {}) {
    const token = await authToken();
    let response;
    try {
      response = await fetch(STREAM_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify({ action, ...fields }),
        cache: "no-store"
      });
    } catch {
      throw new Error("Stream Video service is unreachable. Check your connection and retry.");
    }
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.ok !== true) {
      const error = new Error(payload?.message || "Stream Video is not configured for this account.");
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  async function refreshStatus() {
    const payload = await streamRequest("status");
    if (payload.provider !== "stream_video" || !["LIVE", "OFFLINE", "UPCOMING"].includes(payload.status)) {
      throw new Error("A verified Stream Video status is unavailable.");
    }
    state.streamStatus = payload.status;
    state.streamSessionId = typeof payload.sessionId === "string" ? payload.sessionId : null;
    setStatus(payload.status, payload.detail || "Status verified by Stream Video.");
    const canJoin = payload.status === "LIVE" && Boolean(state.streamSessionId);
    $("[data-live-join]").hidden = !canJoin;
    if (!canJoin && !$("[data-live-session]").hidden && state.sessionMode === "viewer") leaveVideo();
  }

  async function checkHostAccess() {
    const button = $("[data-live-backstage]");
    const hostStatus = $("[data-live-host-status]");
    try {
      const result = await streamRequest("host_access");
      button.hidden = result.authorized !== true;
      hostStatus.textContent = result.authorized === true ? "" : "This account is not authorized to host.";
      hostStatus.hidden = result.authorized === true;
    } catch (error) {
      button.hidden = true;
      hostStatus.textContent = error.status === 403
        ? "This account is not authorized to host."
        : "Host access could not be verified. Only a server-authorized account can enter backstage.";
      hostStatus.hidden = false;
    }
  }

  function deviceErrorMessage(error) {
    if (!navigator.onLine) return "Network connection lost. Reconnect, then use the Stream controls to retry.";
    if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {
      return "Camera or microphone permission was denied. Allow access in your browser settings and retry.";
    }
    if (error?.name === "NotFoundError" || error?.name === "DevicesNotFoundError") {
      return "No camera or microphone was found. Connect a device or join from a supported device and retry.";
    }
    return "Stream Video connection failed. Check your network or device permissions, then retry.";
  }

  function loadVideoSdk() {
    if (!sdkPromise) {
      if (!window.process) {
        window.process = {
          env: { NODE_ENV: "production", I18NEXT_NO_SUPPORT_NOTICE: "true" },
          nextTick: (callback, ...args) => queueMicrotask(() => callback(...args)),
          emit: () => false
        };
      }
      sdkPromise = import("/assets/nbl-studios-live-sdk.js");
    }
    return sdkPromise;
  }

  async function openVideo(payload, mode) {
    const userId = state.clerk?.user?.id;
    if (payload.provider !== "stream_video" ||
        typeof payload.apiKey !== "string" ||
        typeof payload.callId !== "string" ||
        typeof payload.sessionId !== "string" ||
        payload.userId !== userId ||
        typeof payload.token !== "string") {
      throw new Error("The server did not return a valid account-bound Stream Video session.");
    }
    leaveVideo();
    state.sessionMode = mode;
    state.streamSessionId = payload.sessionId;
    const { mountLivestream } = await loadVideoSdk();
    state.unmountVideo = mountLivestream($("[data-live-video]"), {
      apiKey: payload.apiKey,
      callId: payload.callId,
      userId,
      token: payload.token,
      onError: error => showError(deviceErrorMessage(error))
    });
    $("[data-live-session]").hidden = false;
    $("[data-live-chat-section]").hidden = false;
    clearError();
    void loadAudienceChat();
    state.chatTimer = window.setInterval(() => { void loadAudienceChat(); }, 15000);
  }

  function leaveVideo() {
    if (state.chatTimer) window.clearInterval(state.chatTimer);
    state.chatTimer = null;
    state.unmountVideo?.();
    state.unmountVideo = null;
    state.sessionMode = null;
    state.streamSessionId = state.streamSessionId || null;
    $("[data-live-session]").hidden = true;
    $("[data-live-chat-section]").hidden = true;
    $("[data-live-video]").replaceChildren();
  }

  async function joinViewer() {
    if (state.busy || state.streamStatus !== "LIVE" || !state.streamSessionId) return;
    state.busy = true;
    clearError();
    try {
      const payload = await streamRequest("viewer_session", { sessionId: state.streamSessionId });
      await openVideo(payload, "viewer");
    } catch (error) {
      showError(error.message || "Unable to join the live video.");
    } finally {
      state.busy = false;
    }
  }

  async function enterBackstage() {
    if (state.busy) return;
    state.busy = true;
    clearError();
    try {
      const payload = await streamRequest("host_backstage");
      await openVideo(payload, "host");
    } catch (error) {
      showError(error.status === 403
        ? "This account is not authorized to host."
        : error.message || "Unable to enter host backstage.");
    } finally {
      state.busy = false;
    }
  }

  function renderMessages(messages) {
    const area = $("[data-live-chat-messages]");
    area.replaceChildren();
    if (!messages.length) {
      const empty = document.createElement("p");
      empty.className = "hint";
      empty.textContent = "No audience messages yet.";
      area.append(empty);
      return;
    }
    for (const message of messages) {
      const item = document.createElement("article");
      item.className = "chat-message";
      const byline = document.createElement("div");
      byline.className = "chat-byline";
      byline.textContent = "NBL member";
      const body = document.createElement("p");
      body.textContent = String(message.body || "");
      item.append(byline, body);
      if (message.id) {
        const actions = document.createElement("div");
        actions.className = "message-actions";
        const report = document.createElement("button");
        report.type = "button";
        report.className = "button small";
        report.textContent = "Report message";
        report.addEventListener("click", () => { void reportMessage(message.id); });
        const block = document.createElement("button");
        block.type = "button";
        block.className = "button small";
        block.textContent = "Block member";
        block.addEventListener("click", () => { void blockMessageAuthor(message.id); });
        actions.append(report, block);
        item.append(actions);
      }
      area.append(item);
    }
  }

  async function loadAudienceChat() {
    if (!state.streamSessionId) return;
    try {
      const result = await streamRequest("chat_history", { sessionId: state.streamSessionId });
      if (!Array.isArray(result.messages)) throw new Error("Audience chat is not available.");
      state.chatMuted = result.muted === true;
      $("[data-live-chat-mute]").textContent = state.chatMuted ? "Unmute chat" : "Mute chat";
      $("[data-live-chat-mute]").disabled = false;
      $("[data-live-chat-compose]").disabled = state.chatMuted;
      $("[data-live-chat-form] button[type=submit]").disabled = state.chatMuted;
      renderMessages(result.messages);
      $("[data-live-chat-error]").hidden = true;
    } catch {
      $("[data-live-chat-error]").textContent = "Audience chat is unavailable until its moderated member service is enabled.";
      $("[data-live-chat-error]").hidden = false;
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    const compose = $("[data-live-chat-compose]");
    const message = compose.value.trim();
    if (!message || !state.streamSessionId || state.chatMuted) return;
    try {
      await streamRequest("chat_send", { sessionId: state.streamSessionId, message });
      compose.value = "";
      await loadAudienceChat();
    } catch (error) {
      $("[data-live-chat-error]").textContent = error.message || "Message was not sent.";
      $("[data-live-chat-error]").hidden = false;
    }
  }

  async function toggleChatMute() {
    try {
      await streamRequest("chat_mute", { sessionId: state.streamSessionId, muted: !state.chatMuted });
      await loadAudienceChat();
    } catch (error) {
      $("[data-live-chat-error]").textContent = error.message || "Chat mute could not be updated.";
      $("[data-live-chat-error]").hidden = false;
    }
  }

  async function reportMessage(messageId) {
    const reason = window.prompt("Why are you reporting this message? Do not include private information.");
    if (!reason?.trim()) return;
    try {
      await streamRequest("chat_report", { sessionId: state.streamSessionId, messageId, reason: reason.trim().slice(0, 500) });
      $("[data-live-chat-error]").textContent = "Report submitted for human review.";
      $("[data-live-chat-error]").hidden = false;
    } catch (error) {
      $("[data-live-chat-error]").textContent = error.message || "Report could not be submitted.";
      $("[data-live-chat-error]").hidden = false;
    }
  }

  async function blockMessageAuthor(messageId) {
    if (!window.confirm("Block this member? The server will apply your existing member block settings.")) return;
    try {
      await streamRequest("chat_block_sender", { sessionId: state.streamSessionId, messageId });
      await loadAudienceChat();
    } catch (error) {
      $("[data-live-chat-error]").textContent = error.message || "Member could not be blocked.";
      $("[data-live-chat-error]").hidden = false;
    }
  }

  async function boot() {
    const destination = new URL(window.location.href);
    destination.hash = "";
    $("[data-live-signin]").href = ACCOUNT_PORTAL + "/sign-in?redirect_url=" + encodeURIComponent(destination.href);
    $("[data-live-join]").addEventListener("click", () => { void joinViewer(); });
    $("[data-live-backstage]").addEventListener("click", () => { void enterBackstage(); });
    $("[data-live-leave]").addEventListener("click", leaveVideo);
    $("[data-live-chat-form]").addEventListener("submit", event => { void sendMessage(event); });
    $("[data-live-chat-mute]").addEventListener("click", () => { void toggleChatMute(); });
    window.addEventListener("offline", () => showError("Network connection lost. Reconnect, then retry the Stream controls."));
    window.addEventListener("online", () => {
      clearError();
      if (state.clerk?.isSignedIn) void refreshStatus().catch(error => showError(error.message));
    });
    $("[data-live-signout]").addEventListener("click", async () => {
      leaveVideo();
      try {
        await (await getClerk()).signOut();
        window.location.reload();
      } catch {
        window.location.href = ACCOUNT_PORTAL;
      }
    });
    try {
      const clerk = await getClerk();
      if (!clerk.isSignedIn || !clerk.session) {
        $("[data-live-auth]").textContent = "Sign in with your NBL account to view Stream Video status or join.";
        $("[data-live-signin]").hidden = false;
        setStatus("SIGN IN REQUIRED", "No provider status is shown before account authentication.");
        return;
      }
      $("[data-live-auth]").textContent = "Signed in with your NBL account.";
      $("[data-live-signout]").hidden = false;
      try {
        await refreshStatus();
      } catch (error) {
        setStatus("UNAVAILABLE", "Stream Video status could not be verified.");
        showError(error.message || "Stream Video status could not be verified.");
      }
      await checkHostAccess();
      state.statusTimer = window.setInterval(() => {
        if (!document.hidden && state.clerk?.isSignedIn) {
          void refreshStatus().catch(error => {
            setStatus("UNAVAILABLE", "Stream Video status could not be verified.");
            showError(error.message || "Stream Video status could not be verified.");
          });
        }
      }, 20000);
    } catch (error) {
      $("[data-live-auth]").textContent = "NBL account connection is unavailable. Try signing in again.";
      setStatus("UNAVAILABLE", "Stream Video status could not be verified.");
      showError(error.message || "NBL account service is unavailable.");
    }
  }

  void boot();
})();
