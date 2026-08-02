(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const playerShell = $("playerShell");
  const journeyVideo = $("journeyVideo");
  const videoFallback = $("videoFallback");
  const fallbackWorld = $("fallbackWorld");
  const playerTitle = $("playerTitle");
  const playerNote = $("playerNote");
  const timeline = $("timeline");
  const timeReadout = $("timeReadout");
  const playPause = $("playPause");
  const eventCard = $("eventCard");
  const eventText = $("eventText");
  const shopDialog = $("shopDialog");
  const setupDialog = $("setupDialog");
  const setupStatus = $("setupStatus");

  const titles = {
    night: "Night Walk",
    forward: "Arrival Test",
    backward: "Walk Back"
  };

  const builtInSources = {
    night: "media/NBL-start-walking.mp4",
    forward: "media/Another-walk.mp4",
    backward: "media/Backwards-walk.mp4"
  };

  const eventPlan = [
    { at: 0.25, text: "The lanterns react as the traveler passes." },
    { at: 0.55, text: "A future clue, choice, or conversation can happen here." },
    { at: 0.82, text: "The town remembers the traveler’s progress before the next level." }
  ];

  let currentMode = "night";
  let activeObjectUrl = "";
  let fallbackFrame = 0;
  let fallbackStart = 0;
  let fallbackProgress = 0;
  let fallbackPlaying = false;
  let shownEvents = new Set();
  let resumeAfterEvent = false;

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return "0:00";
    const whole = Math.max(0, Math.floor(seconds));
    return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
  };

  const openDialog = (dialog) => {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  };

  const closeDialog = (dialog) => {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  };

  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => closeDialog(button.closest("dialog")));
  });

  [shopDialog, setupDialog].forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog(dialog);
    });
  });

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("new-beansland-playhouse", 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("media")) db.createObjectStore("media");
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function saveLocalMedia(key, file) {
    const db = await openDatabase();
    await new Promise((resolve, reject) => {
      const tx = db.transaction("media", "readwrite");
      tx.objectStore("media").put({ blob: file, name: file.name, type: file.type, savedAt: Date.now() }, key);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }

  async function loadLocalMedia(key) {
    const db = await openDatabase();
    const value = await new Promise((resolve, reject) => {
      const tx = db.transaction("media", "readonly");
      const request = tx.objectStore("media").get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return value;
  }

  async function clearLocalMedia() {
    const db = await openDatabase();
    await new Promise((resolve, reject) => {
      const tx = db.transaction("media", "readwrite");
      tx.objectStore("media").clear();
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }

  async function refreshSetupStatus() {
    try {
      const rows = await Promise.all(["night", "forward", "backward"].map(loadLocalMedia));
      const labels = rows.map((row, index) => row ? `${["Night", "Forward", "Backward"][index]}: ${row.name}` : null).filter(Boolean);
      setupStatus.textContent = labels.length ? labels.join(" · ") : "No local videos are stored on this device. The Playhouse will try the public files, then use the smooth camera fallback.";
    } catch (error) {
      setupStatus.textContent = "Local video storage is unavailable in this browser. Public files and the fallback still work.";
    }
  }

  async function publicSourceExists(url) {
    try {
      const response = await fetch(url, { method: "HEAD", cache: "no-store" });
      return response.ok;
    } catch (_) {
      return false;
    }
  }

  async function resolveSource(mode) {
    try {
      const local = await loadLocalMedia(mode);
      if (local?.blob) {
        if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl);
        activeObjectUrl = URL.createObjectURL(local.blob);
        return { url: activeObjectUrl, label: `Using local ${local.name}` };
      }
    } catch (_) {}

    const publicUrl = builtInSources[mode];
    if (await publicSourceExists(publicUrl)) return { url: publicUrl, label: "Using the Playhouse public video" };
    return null;
  }

  function resetEvents() {
    shownEvents = new Set();
    eventCard.hidden = true;
  }

  function maybeShowEvent(progress) {
    const nextIndex = eventPlan.findIndex((event, index) => progress >= event.at && !shownEvents.has(index));
    if (nextIndex < 0) return;
    shownEvents.add(nextIndex);
    eventText.textContent = eventPlan[nextIndex].text;
    resumeAfterEvent = !journeyVideo.paused || fallbackPlaying;
    journeyVideo.pause();
    fallbackPlaying = false;
    playPause.textContent = "Play";
    eventCard.hidden = false;
  }

  eventCard.addEventListener("click", () => {
    eventCard.hidden = true;
    if (!resumeAfterEvent) return;
    if (!videoFallback.hidden) startFallback(true);
    else journeyVideo.play().catch(() => {});
  });

  function stopFallback() {
    fallbackPlaying = false;
    cancelAnimationFrame(fallbackFrame);
  }

  function renderFallback(progress) {
    fallbackProgress = Math.min(1, Math.max(0, progress));
    timeline.value = Math.round(fallbackProgress * 1000);
    fallbackWorld.style.transform = `scale(${1.02 + fallbackProgress * 0.42}) translate3d(0,${fallbackProgress * -3.4}%,0)`;
    timeReadout.textContent = `${formatTime(fallbackProgress * 18)} / 0:18`;
    maybeShowEvent(fallbackProgress);
  }

  function fallbackTick(now) {
    if (!fallbackPlaying) return;
    if (!fallbackStart) fallbackStart = now - fallbackProgress * 18000;
    renderFallback((now - fallbackStart) / 18000);
    if (fallbackProgress >= 1) {
      fallbackPlaying = false;
      playPause.textContent = "Play";
      return;
    }
    fallbackFrame = requestAnimationFrame(fallbackTick);
  }

  function startFallback(resume = false) {
    journeyVideo.pause();
    journeyVideo.removeAttribute("src");
    journeyVideo.load();
    journeyVideo.hidden = true;
    videoFallback.hidden = false;
    if (!resume) {
      fallbackProgress = 0;
      fallbackStart = 0;
      resetEvents();
      renderFallback(0);
    } else {
      fallbackStart = performance.now() - fallbackProgress * 18000;
    }
    fallbackPlaying = true;
    playPause.textContent = "Pause";
    playerNote.textContent = "The selected video is not publicly available yet, so this device is showing the smooth locked-camera prototype. Use Founder Video Setup to load the real file from your phone.";
    fallbackFrame = requestAnimationFrame(fallbackTick);
  }

  async function startMode(mode) {
    currentMode = mode;
    resetEvents();
    stopFallback();
    playerTitle.textContent = titles[mode];
    playerShell.hidden = false;
    playerShell.scrollIntoView({ behavior: "smooth", block: "start" });
    timeline.value = 0;
    timeReadout.textContent = "0:00 / 0:00";
    playPause.textContent = "Play";
    videoFallback.hidden = true;
    journeyVideo.hidden = false;
    journeyVideo.pause();
    journeyVideo.removeAttribute("src");
    journeyVideo.load();

    const source = await resolveSource(mode);
    if (!source) {
      startFallback();
      return;
    }

    playerNote.textContent = `${source.label}. Touching the road starts this same player; the final game-rendered walk can replace the file without rebuilding the entrance.`;
    journeyVideo.src = source.url;
    journeyVideo.load();
    journeyVideo.play().catch(() => {
      playPause.textContent = "Play";
    });
  }

  journeyVideo.addEventListener("play", () => {
    stopFallback();
    playPause.textContent = "Pause";
  });

  journeyVideo.addEventListener("pause", () => {
    if (videoFallback.hidden) playPause.textContent = "Play";
  });

  journeyVideo.addEventListener("error", () => startFallback());

  journeyVideo.addEventListener("timeupdate", () => {
    if (!journeyVideo.duration) return;
    const progress = journeyVideo.currentTime / journeyVideo.duration;
    timeline.value = Math.round(progress * 1000);
    timeReadout.textContent = `${formatTime(journeyVideo.currentTime)} / ${formatTime(journeyVideo.duration)}`;
    maybeShowEvent(progress);
  });

  journeyVideo.addEventListener("ended", () => {
    playPause.textContent = "Play";
    playerNote.textContent = currentMode === "backward" ? "Back at the coffee shop porch. The road is ready for another level." : "Arrival complete. The final version can unlock the next room or level here.";
  });

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => startMode(button.dataset.mode));
  });

  $("roadHotspot").addEventListener("click", () => startMode("night"));
  $("startWalking").addEventListener("click", () => openDialog(shopDialog));
  $("openShop").addEventListener("click", () => openDialog(shopDialog));
  $("playPreview").addEventListener("click", () => {
    closeDialog(shopDialog);
    startMode("night");
  });
  $("openSetup").addEventListener("click", async () => {
    await refreshSetupStatus();
    openDialog(setupDialog);
  });

  $("closePlayer").addEventListener("click", () => {
    journeyVideo.pause();
    stopFallback();
    playerShell.hidden = true;
    $("hero").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  playPause.addEventListener("click", () => {
    if (!videoFallback.hidden) {
      if (fallbackPlaying) {
        fallbackPlaying = false;
        cancelAnimationFrame(fallbackFrame);
        playPause.textContent = "Play";
      } else {
        startFallback(true);
      }
      return;
    }
    if (journeyVideo.paused) journeyVideo.play().catch(() => {});
    else journeyVideo.pause();
  });

  $("restartWalk").addEventListener("click", () => {
    resetEvents();
    if (!videoFallback.hidden) {
      stopFallback();
      startFallback();
    } else {
      journeyVideo.currentTime = 0;
      journeyVideo.play().catch(() => {});
    }
  });

  timeline.addEventListener("input", () => {
    const progress = Number(timeline.value) / 1000;
    resetEvents();
    eventPlan.forEach((event, index) => { if (event.at < progress) shownEvents.add(index); });
    if (!videoFallback.hidden) {
      stopFallback();
      renderFallback(progress);
      playPause.textContent = "Play";
    } else if (journeyVideo.duration) {
      journeyVideo.currentTime = progress * journeyVideo.duration;
    }
  });

  $("muteToggle").addEventListener("click", (event) => {
    journeyVideo.muted = !journeyVideo.muted;
    event.currentTarget.textContent = journeyVideo.muted ? "Muted" : "Sound";
  });

  $("fullScreen").addEventListener("click", async () => {
    try {
      const stage = $("videoStage");
      if (!document.fullscreenElement) await stage.requestFullscreen();
      else await document.exitFullscreen();
    } catch (_) {}
  });

  const fileBindings = {
    nightFile: "night",
    forwardFile: "forward",
    backwardFile: "backward"
  };

  Object.entries(fileBindings).forEach(([inputId, key]) => {
    $(inputId).addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setupStatus.textContent = `Saving ${file.name} to this device…`;
      try {
        await saveLocalMedia(key, file);
        await refreshSetupStatus();
      } catch (error) {
        setupStatus.textContent = "The browser could not store that video. Keep the page open and try a smaller file, or use the public media folder later.";
      }
    });
  });

  $("clearLocalMedia").addEventListener("click", async () => {
    try {
      await clearLocalMedia();
      if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl);
      activeObjectUrl = "";
      await refreshSetupStatus();
    } catch (_) {
      setupStatus.textContent = "The browser could not clear its local video storage.";
    }
  });

  window.addEventListener("beforeunload", () => {
    if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl);
  });

  refreshSetupStatus();
})();
