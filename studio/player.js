(() => {
  const tracks = Array.isArray(window.NBL_TRACKS) ? window.NBL_TRACKS : [];
  const $ = (id) => document.getElementById(id);
  const audio = $("audio");
  const video = $("trackVideo");
  const cover = $("coverArt");
  const stage = $("visualStage");
  const canvas = $("visualizer");
  const ctx = canvas.getContext("2d");
  const play = $("playButton");
  const prev = $("prevButton");
  const next = $("nextButton");
  const seek = $("seek");
  const volume = $("volume");
  const currentTime = $("currentTime");
  const duration = $("duration");
  const title = $("trackTitle");
  const artist = $("trackArtist");
  const nowLabel = $("nowLabel");
  const notice = $("previewNotice");
  const purchase = $("purchaseButton");
  const trackList = $("trackList");

  let index = 0;
  let previewEnded = false;
  let audioContext = null;
  let analyser = null;
  let sourceNode = null;
  let data = null;
  let raf = null;

  const fmt = (seconds) => {
    if (!Number.isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  function ensureAudioGraph() {
    if (audioContext) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    audioContext = new AudioCtx();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.78;
    sourceNode = audioContext.createMediaElementSource(audio);
    sourceNode.connect(analyser);
    analyser.connect(audioContext.destination);
    data = new Uint8Array(analyser.frequencyBinCount);
  }

  function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(stage.clientWidth * ratio);
    canvas.height = Math.floor(stage.clientHeight * ratio);
    canvas.style.width = `${stage.clientWidth}px`;
    canvas.style.height = `${stage.clientHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drawMotion() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    ctx.clearRect(0, 0, w, h);

    const g = ctx.createRadialGradient(w * 0.5, h * 0.44, 5, w * 0.5, h * 0.5, Math.max(w, h) * 0.65);
    g.addColorStop(0, "rgba(214,161,75,.20)");
    g.addColorStop(.38, "rgba(7,20,33,.52)");
    g.addColorStop(1, "rgba(2,6,11,.98)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    let energy = 0.18;
    if (analyser && data) {
      analyser.getByteFrequencyData(data);
      let total = 0;
      for (const v of data) total += v;
      energy = Math.max(.12, total / data.length / 255);
    }

    const bars = 42;
    const gap = 5;
    const bw = Math.max(3, (w - gap * (bars - 1)) / bars);
    for (let i = 0; i < bars; i++) {
      const sample = data ? data[Math.floor((i / bars) * data.length)] / 255 : (Math.sin(Date.now() / 500 + i * .48) + 1) / 4;
      const height = Math.max(8, sample * h * .34 + energy * 18);
      const x = i * (bw + gap);
      const y = h * .58 - height / 2;
      const grad = ctx.createLinearGradient(0, y, 0, y + height);
      grad.addColorStop(0, "rgba(240,197,111,.95)");
      grad.addColorStop(1, "rgba(111,71,24,.16)");
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, bw, height);
    }

    const pulse = 90 + energy * 160;
    ctx.beginPath();
    ctx.arc(w * .5, h * .42, pulse, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(240,197,111,${.08 + energy * .25})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    raf = requestAnimationFrame(drawMotion);
  }

  function syncVideo() {
    if (!video.src || video.hidden) return;
    if (Math.abs(video.currentTime - audio.currentTime) > .35) video.currentTime = audio.currentTime;
  }

  function renderList() {
    trackList.innerHTML = "";
    tracks.forEach((track, i) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "track-row";
      row.innerHTML = `
        <img src="${track.cover || "../assets/brand/NBL-Studios.png"}" alt="" />
        <span class="track-meta"><strong>${track.title}</strong><span>${track.artist}${track.credit ? ` • ${track.credit}` : ""}</span></span>
        <span class="track-badge">${track.badge || "NBL"}</span>`;
      row.addEventListener("click", () => load(i, true));
      trackList.appendChild(row);
    });
  }

  function setActiveRow() {
    [...trackList.children].forEach((node, i) => node.classList.toggle("active", i === index));
  }

  function load(i, autoplay = false) {
    if (!tracks.length) return;
    index = (i + tracks.length) % tracks.length;
    const track = tracks[index];
    previewEnded = false;
    audio.pause();
    video.pause();
    audio.src = track.audio || "";
    cover.src = track.cover || "../assets/brand/NBL-Studios.png";
    title.textContent = track.title || "Untitled";
    artist.textContent = track.artist || "New Beansland";
    nowLabel.textContent = track.badge ? `NOW PLAYING • ${track.badge}` : "NOW PLAYING";
    notice.textContent = track.previewSeconds ? `${track.previewSeconds}-second preview` : "";

    if (track.video) {
      video.src = track.video;
      video.hidden = false;
      stage.classList.add("video-active");
    } else {
      video.removeAttribute("src");
      video.load();
      video.hidden = true;
      stage.classList.remove("video-active");
    }

    if (track.purchaseUrl) {
      purchase.href = track.purchaseUrl;
      purchase.hidden = false;
    } else {
      purchase.hidden = true;
    }

    setActiveRow();
    seek.value = 0;
    currentTime.textContent = "0:00";
    duration.textContent = "0:00";
    play.textContent = "▶";

    if (!track.audio) {
      notice.textContent = "Audio file not attached yet";
      return;
    }
    audio.load();
    if (autoplay) startPlayback();
  }

  async function startPlayback() {
    const track = tracks[index];
    if (!track?.audio || previewEnded) return;
    ensureAudioGraph();
    if (audioContext?.state === "suspended") await audioContext.resume();
    try {
      await audio.play();
      if (!video.hidden) {
        video.currentTime = audio.currentTime;
        video.play().catch(() => {});
      }
      play.textContent = "❚❚";
    } catch (error) {
      console.warn("Playback blocked or unavailable", error);
    }
  }

  function pausePlayback() {
    audio.pause();
    video.pause();
    play.textContent = "▶";
  }

  play.addEventListener("click", () => audio.paused ? startPlayback() : pausePlayback());
  prev.addEventListener("click", () => load(index - 1, true));
  next.addEventListener("click", () => load(index + 1, true));
  volume.addEventListener("input", () => { audio.volume = Number(volume.value); });
  seek.addEventListener("input", () => {
    if (!Number.isFinite(audio.duration)) return;
    const track = tracks[index];
    const cap = track.previewSeconds ? Math.min(audio.duration, track.previewSeconds) : audio.duration;
    audio.currentTime = (Number(seek.value) / 100) * cap;
    syncVideo();
  });

  audio.addEventListener("loadedmetadata", () => {
    const track = tracks[index];
    const cap = track.previewSeconds ? Math.min(audio.duration, track.previewSeconds) : audio.duration;
    duration.textContent = fmt(cap);
  });

  audio.addEventListener("timeupdate", () => {
    const track = tracks[index];
    const cap = track.previewSeconds ? Math.min(audio.duration || track.previewSeconds, track.previewSeconds) : audio.duration;
    currentTime.textContent = fmt(audio.currentTime);
    if (Number.isFinite(cap) && cap > 0) seek.value = Math.min(100, audio.currentTime / cap * 100);
    syncVideo();
    if (track.previewSeconds && audio.currentTime >= track.previewSeconds) {
      pausePlayback();
      previewEnded = true;
      audio.currentTime = 0;
      seek.value = 0;
      currentTime.textContent = "0:00";
      notice.textContent = "Preview complete";
      if (track.purchaseUrl) purchase.hidden = false;
    }
  });

  audio.addEventListener("ended", () => load(index + 1, true));
  window.addEventListener("resize", resizeCanvas);
  document.addEventListener("visibilitychange", () => { if (document.hidden) video.pause(); });

  renderList();
  resizeCanvas();
  drawMotion();
  if (tracks.length) load(0, false);
})();
