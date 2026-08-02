(() => {
  "use strict";

  const byId = (id) => document.getElementById(id);
  const clipPicker = byId("clipPicker");
  const clipList = byId("clipList");
  const emptyTimeline = byId("emptyTimeline");
  const clearButton = byId("clearButton");
  const clipCount = byId("clipCount");
  const durationSummary = byId("durationSummary");
  const outputShape = byId("outputShape");
  const frameRate = byId("frameRate");
  const formatNote = byId("formatNote");
  const previewButton = byId("previewButton");
  const exportButton = byId("exportButton");
  const stopButton = byId("stopButton");
  const previewVideo = byId("previewVideo");
  const stagePlaceholder = byId("stagePlaceholder");
  const progressBar = byId("progressBar");
  const statusText = byId("statusText");
  const resultPanel = byId("resultPanel");
  const resultVideo = byId("resultVideo");
  const downloadLink = byId("downloadLink");
  const renderVideo = byId("renderVideo");
  const renderCanvas = byId("renderCanvas");
  const renderContext = renderCanvas.getContext("2d", { alpha: false });

  const clips = [];
  let nextClipId = 1;
  let activeJob = null;
  let resultUrl = "";
  let audioContext = null;
  let audioDestination = null;
  let audioSource = null;

  const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
  const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const rounded = Math.round(seconds);
    const hours = Math.floor(rounded / 3600);
    const minutes = Math.floor((rounded % 3600) / 60);
    const remainingSeconds = rounded % 60;
    if (hours) return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB";
    const megabytes = bytes / (1024 * 1024);
    return megabytes < 10 ? `${megabytes.toFixed(1)} MB` : `${Math.round(megabytes)} MB`;
  }

  function setStatus(message, progress = null) {
    statusText.textContent = message;
    if (progress !== null) {
      const percent = Math.max(0, Math.min(100, progress * 100));
      progressBar.style.width = `${percent}%`;
    }
  }

  function getTotalDuration() {
    return clips.reduce((total, clip) => total + (clip.duration * clip.repeat) + clip.hold, 0);
  }

  function updateSummary() {
    const count = clips.length;
    clipCount.textContent = `${count} ${count === 1 ? "clip" : "clips"}`;
    durationSummary.textContent = `Estimated result: ${formatTime(getTotalDuration())}`;
    emptyTimeline.hidden = count > 0;
    clearButton.disabled = count === 0 || Boolean(activeJob);
    previewButton.disabled = count === 0 || Boolean(activeJob);
    exportButton.disabled = count === 0 || Boolean(activeJob) || !supportsExport();
  }

  function supportsExport() {
    return Boolean(window.MediaRecorder && renderCanvas.captureStream);
  }

  function pickMimeType() {
    if (!window.MediaRecorder) return "";
    const candidates = [
      "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
      "video/mp4",
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm"
    ];
    return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
  }

  function refreshFormatNote() {
    if (!supportsExport()) {
      formatNote.textContent = "This browser can preview clips but does not support browser video export. Chrome or Edge on Android or desktop is recommended.";
      return;
    }
    const mimeType = pickMimeType();
    if (!mimeType) {
      formatNote.textContent = "This browser did not report a supported recording format. Preview may work, but export may not.";
      return;
    }
    const friendly = mimeType.includes("mp4") ? "MP4" : "WebM";
    formatNote.textContent = `This browser will export ${friendly}. Export runs in real time, and the page must stay open.`;
  }

  function waitForMedia(video, eventName, timeout = 15000) {
    return new Promise((resolve, reject) => {
      let timer = 0;
      const cleanup = () => {
        clearTimeout(timer);
        video.removeEventListener(eventName, onReady);
        video.removeEventListener("error", onError);
      };
      const onReady = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error("This browser could not read one of the selected video files."));
      };
      timer = setTimeout(() => {
        cleanup();
        reject(new Error("A selected video took too long to load."));
      }, timeout);
      video.addEventListener(eventName, onReady, { once: true });
      video.addEventListener("error", onError, { once: true });
    });
  }

  async function inspectFile(file) {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = url;
    try {
      if (video.readyState < 1) await waitForMedia(video, "loadedmetadata");
      return {
        id: nextClipId++,
        file,
        url,
        duration: Number.isFinite(video.duration) ? video.duration : 0,
        width: video.videoWidth || 1280,
        height: video.videoHeight || 720,
        repeat: 1,
        hold: 0
      };
    } catch (error) {
      URL.revokeObjectURL(url);
      throw error;
    }
  }

  function buildNumberInput(labelText, value, min, max, step, onChange) {
    const label = document.createElement("label");
    label.textContent = labelText;
    const input = document.createElement("input");
    input.type = "number";
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(value);
    input.addEventListener("change", () => {
      const parsed = Number(input.value);
      const safe = Math.max(min, Math.min(max, Number.isFinite(parsed) ? parsed : min));
      input.value = String(safe);
      onChange(safe);
      clearResult();
      updateSummary();
    });
    label.append(input);
    return label;
  }

  function iconButton(label, text, handler, className = "") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `icon-button ${className}`.trim();
    button.setAttribute("aria-label", label);
    button.title = label;
    button.textContent = text;
    button.addEventListener("click", handler);
    return button;
  }

  function renderClips() {
    clipList.replaceChildren();
    clips.forEach((clip, index) => {
      const item = document.createElement("li");
      item.className = "clip-card";
      item.dataset.clipId = String(clip.id);

      const number = document.createElement("span");
      number.className = "clip-number";
      number.setAttribute("aria-hidden", "true");

      const main = document.createElement("div");
      main.className = "clip-main";
      const name = document.createElement("strong");
      name.className = "clip-name";
      name.textContent = clip.file.name;
      const meta = document.createElement("span");
      meta.className = "clip-meta";
      meta.textContent = `${formatTime(clip.duration)} · ${clip.width}×${clip.height} · ${formatBytes(clip.file.size)}`;
      main.append(name, meta);

      const controls = document.createElement("div");
      controls.className = "clip-controls";
      controls.append(
        buildNumberInput("Repeat", clip.repeat, 1, 20, 1, (value) => { clip.repeat = value; }),
        buildNumberInput("Hold last frame (sec)", clip.hold, 0, 30, 0.5, (value) => { clip.hold = value; })
      );

      const buttons = document.createElement("div");
      buttons.className = "icon-buttons";
      const up = iconButton("Move clip earlier", "↑", () => moveClip(index, index - 1));
      const down = iconButton("Move clip later", "↓", () => moveClip(index, index + 1));
      const remove = iconButton("Remove clip", "✕", () => removeClip(index), "remove");
      up.disabled = index === 0 || Boolean(activeJob);
      down.disabled = index === clips.length - 1 || Boolean(activeJob);
      remove.disabled = Boolean(activeJob);
      buttons.append(up, down, remove);
      controls.append(buttons);

      item.append(number, main, controls);
      clipList.append(item);
    });
    updateSummary();
  }

  function moveClip(from, to) {
    if (activeJob || to < 0 || to >= clips.length) return;
    const [clip] = clips.splice(from, 1);
    clips.splice(to, 0, clip);
    clearResult();
    renderClips();
  }

  function removeClip(index) {
    if (activeJob) return;
    const [clip] = clips.splice(index, 1);
    if (clip) URL.revokeObjectURL(clip.url);
    clearResult();
    renderClips();
  }

  function clearClips() {
    if (activeJob) return;
    clips.splice(0).forEach((clip) => URL.revokeObjectURL(clip.url));
    previewVideo.pause();
    previewVideo.removeAttribute("src");
    previewVideo.load();
    stagePlaceholder.hidden = false;
    clearResult();
    setStatus("Add clips to begin.", 0);
    renderClips();
  }

  function clearResult() {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    resultUrl = "";
    resultVideo.removeAttribute("src");
    resultVideo.load();
    resultPanel.hidden = true;
    downloadLink.removeAttribute("href");
  }

  async function addFiles(fileList) {
    const files = Array.from(fileList || []).filter((file) => file.type.startsWith("video/"));
    if (!files.length) return;
    setStatus(`Reading ${files.length} ${files.length === 1 ? "clip" : "clips"}…`);
    clipPicker.disabled = true;
    try {
      for (const file of files) {
        const clip = await inspectFile(file);
        clips.push(clip);
      }
      clearResult();
      renderClips();
      setStatus("Clips are ready. Arrange them, repeat them, or add a hold.", 0);
    } catch (error) {
      setStatus(error.message || "A video could not be added.", 0);
    } finally {
      clipPicker.value = "";
      clipPicker.disabled = false;
    }
  }

  function createJob(type) {
    const job = { type, cancelled: false };
    activeJob = job;
    stopButton.hidden = false;
    clipPicker.disabled = true;
    renderClips();
    return job;
  }

  function finishJob() {
    activeJob = null;
    stopButton.hidden = true;
    clipPicker.disabled = false;
    renderClips();
  }

  function stopActiveJob() {
    if (!activeJob) return;
    activeJob.cancelled = true;
    previewVideo.pause();
    renderVideo.pause();
    setStatus("Stopping…");
  }

  async function loadIntoVideo(video, clip) {
    video.pause();
    video.src = clip.url;
    video.load();
    if (video.readyState < 2) await waitForMedia(video, "loadeddata");
    video.currentTime = 0;
    if (video.readyState < 3) await waitForMedia(video, "canplay");
  }

  async function waitForPlayback(video, job, update) {
    while (!job.cancelled && !video.ended) {
      update(video.currentTime || 0);
      await sleep(80);
    }
    if (job.cancelled) throw new DOMException("Cancelled", "AbortError");
    update(video.duration || 0);
  }

  async function holdFor(seconds, job, update) {
    if (!seconds) return;
    const start = performance.now();
    while (!job.cancelled) {
      const elapsed = Math.min(seconds, (performance.now() - start) / 1000);
      update(elapsed);
      if (elapsed >= seconds) return;
      await nextFrame();
    }
    throw new DOMException("Cancelled", "AbortError");
  }

  async function previewSequence() {
    if (!clips.length || activeJob) return;
    const job = createJob("preview");
    stagePlaceholder.hidden = true;
    clearResult();
    const total = Math.max(0.001, getTotalDuration());
    let completed = 0;

    try {
      for (let clipIndex = 0; clipIndex < clips.length; clipIndex += 1) {
        const clip = clips[clipIndex];
        for (let repetition = 0; repetition < clip.repeat; repetition += 1) {
          await loadIntoVideo(previewVideo, clip);
          setStatus(`Previewing clip ${clipIndex + 1} of ${clips.length}…`, completed / total);
          await previewVideo.play();
          await waitForPlayback(previewVideo, job, (current) => {
            setStatus(`Previewing clip ${clipIndex + 1} of ${clips.length}…`, (completed + current) / total);
          });
          completed += clip.duration;
        }
        previewVideo.pause();
        await holdFor(clip.hold, job, (held) => {
          setStatus(`Holding the last frame of clip ${clipIndex + 1}…`, (completed + held) / total);
        });
        completed += clip.hold;
      }
      setStatus("Preview finished.", 1);
    } catch (error) {
      if (error.name === "AbortError") setStatus("Preview stopped.", completed / total);
      else setStatus(error.message || "The sequence could not be previewed.", completed / total);
    } finally {
      previewVideo.pause();
      finishJob();
    }
  }

  function chooseCanvasSize() {
    const first = clips[0];
    let shape = outputShape.value;
    if (shape === "auto") {
      const ratio = first.width / Math.max(1, first.height);
      shape = ratio > 1.1 ? "landscape" : ratio < 0.9 ? "portrait" : "square";
    }
    if (shape === "portrait") return { width: 720, height: 1280 };
    if (shape === "square") return { width: 720, height: 720 };
    return { width: 1280, height: 720 };
  }

  function drawFrame(video) {
    const width = renderCanvas.width;
    const height = renderCanvas.height;
    renderContext.fillStyle = "#02060b";
    renderContext.fillRect(0, 0, width, height);
    if (!video.videoWidth || !video.videoHeight) return;
    const scale = Math.min(width / video.videoWidth, height / video.videoHeight);
    const drawWidth = video.videoWidth * scale;
    const drawHeight = video.videoHeight * scale;
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;
    renderContext.drawImage(video, x, y, drawWidth, drawHeight);
  }

  async function ensureAudioTrack() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioContext) {
      audioContext = new AudioContextClass();
      audioDestination = audioContext.createMediaStreamDestination();
      audioSource = audioContext.createMediaElementSource(renderVideo);
      audioSource.connect(audioDestination);
    }
    if (audioContext.state === "suspended") await audioContext.resume();
    return audioDestination.stream.getAudioTracks()[0] || null;
  }

  async function renderClip(clip, job, onProgress) {
    await loadIntoVideo(renderVideo, clip);
    drawFrame(renderVideo);
    await renderVideo.play();

    while (!job.cancelled && !renderVideo.ended) {
      drawFrame(renderVideo);
      onProgress(renderVideo.currentTime || 0);
      await nextFrame();
    }

    renderVideo.pause();
    drawFrame(renderVideo);
    if (job.cancelled) throw new DOMException("Cancelled", "AbortError");
    onProgress(clip.duration);
  }

  function makeFileName(mimeType) {
    const now = new Date();
    const stamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
      "-",
      String(now.getHours()).padStart(2, "0"),
      String(now.getMinutes()).padStart(2, "0")
    ].join("");
    const extension = mimeType.includes("mp4") ? "mp4" : "webm";
    return `new-beansland-video-${stamp}.${extension}`;
  }

  async function exportSequence() {
    if (!clips.length || activeJob) return;
    if (!supportsExport()) {
      setStatus("This browser cannot export video. Try Chrome or Edge.", 0);
      return;
    }

    const total = getTotalDuration();
    if (total > 300) {
      const proceed = window.confirm("This result is longer than five minutes. Browser export can use a lot of phone memory and will take at least that long. Continue?");
      if (!proceed) return;
    }

    const mimeType = pickMimeType();
    if (!mimeType) {
      setStatus("No supported export format was found in this browser.", 0);
      return;
    }

    const job = createJob("export");
    clearResult();
    stagePlaceholder.hidden = true;
    const size = chooseCanvasSize();
    renderCanvas.width = size.width;
    renderCanvas.height = size.height;
    renderContext.imageSmoothingEnabled = true;
    renderContext.imageSmoothingQuality = "high";

    let recorder = null;
    let canvasStream = null;
    let combinedStream = null;
    let completed = 0;

    try {
      const fps = Number(frameRate.value) || 30;
      canvasStream = renderCanvas.captureStream(fps);
      const audioTrack = await ensureAudioTrack();
      const tracks = [...canvasStream.getVideoTracks()];
      if (audioTrack) tracks.push(audioTrack);
      combinedStream = new MediaStream(tracks);

      const chunks = [];
      recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: size.width >= 1200 ? 5_000_000 : 3_500_000,
        audioBitsPerSecond: 128_000
      });
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data && event.data.size) chunks.push(event.data);
      });

      const stopped = new Promise((resolve, reject) => {
        recorder.addEventListener("stop", resolve, { once: true });
        recorder.addEventListener("error", () => reject(new Error("The browser stopped recording the video.")), { once: true });
      });

      recorder.start(1000);
      setStatus("Building the combined video. Keep this page open…", 0);

      for (let clipIndex = 0; clipIndex < clips.length; clipIndex += 1) {
        const clip = clips[clipIndex];
        for (let repetition = 0; repetition < clip.repeat; repetition += 1) {
          await renderClip(clip, job, (current) => {
            setStatus(`Building clip ${clipIndex + 1} of ${clips.length}…`, (completed + current) / Math.max(0.001, total));
          });
          completed += clip.duration;
        }

        await holdFor(clip.hold, job, (held) => {
          drawFrame(renderVideo);
          setStatus(`Extending the last frame of clip ${clipIndex + 1}…`, (completed + held) / Math.max(0.001, total));
        });
        completed += clip.hold;
      }

      await sleep(180);
      recorder.stop();
      await stopped;

      if (job.cancelled) throw new DOMException("Cancelled", "AbortError");
      const blob = new Blob(chunks, { type: mimeType });
      if (!blob.size) throw new Error("The browser created an empty video file.");

      resultUrl = URL.createObjectURL(blob);
      resultVideo.src = resultUrl;
      downloadLink.href = resultUrl;
      downloadLink.download = makeFileName(mimeType);
      resultPanel.hidden = false;
      setStatus(`Combined video ready · ${formatBytes(blob.size)}`, 1);
      resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      if (recorder && recorder.state !== "inactive") recorder.stop();
      if (error.name === "AbortError") setStatus("Video build stopped. No partial file was saved.", completed / Math.max(0.001, total));
      else setStatus(error.message || "The combined video could not be built.", completed / Math.max(0.001, total));
    } finally {
      renderVideo.pause();
      renderVideo.removeAttribute("src");
      renderVideo.load();
      if (canvasStream) canvasStream.getTracks().forEach((track) => track.stop());
      finishJob();
    }
  }

  clipPicker.addEventListener("change", () => addFiles(clipPicker.files));
  outputShape.addEventListener("change", clearResult);
  frameRate.addEventListener("change", clearResult);
  clearButton.addEventListener("click", clearClips);
  previewButton.addEventListener("click", previewSequence);
  exportButton.addEventListener("click", exportSequence);
  stopButton.addEventListener("click", stopActiveJob);
  previewVideo.addEventListener("loadeddata", () => { stagePlaceholder.hidden = true; });

  window.addEventListener("beforeunload", () => {
    clips.forEach((clip) => URL.revokeObjectURL(clip.url));
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  });

  refreshFormatNote();
  renderClips();
})();
