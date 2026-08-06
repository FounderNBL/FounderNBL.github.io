import { access, readFile } from "node:fs/promises";

const files = {
  html: await readFile("video-workshop.html", "utf8"),
  css: await readFile("video-workshop.css", "utf8"),
  js: await readFile("video-workshop.js", "utf8")
};

const errors = [];
const requireText = (file, text, message) => {
  if (!files[file].includes(text)) errors.push(`${file}: ${message}`);
};

requireText("html", 'id="clipPicker"', "video picker is missing");
requireText("html", 'id="clipList"', "sequence list is missing");
requireText("html", 'id="previewButton"', "preview control is missing");
requireText("html", 'id="exportButton"', "export control is missing");
requireText("html", 'id="renderCanvas"', "render canvas is missing");
requireText("html", 'src="video-workshop.js"', "workshop JavaScript is not loaded");
requireText("html", "Your files stay on your device", "local-processing statement is missing");
requireText("js", "renderCanvas.captureStream", "browser canvas recording is missing");
requireText("js", "new MediaRecorder", "combined video recorder is missing");
requireText("js", "clip.repeat", "clip repeating is missing");
requireText("js", "clip.hold", "last-frame extension is missing");
requireText("js", "function previewSequence", "sequence preview is missing");
requireText("js", "function exportSequence", "combined export is missing");
requireText("js", "createMediaStreamDestination", "audio capture is missing");
requireText("css", ".clip-list", "sequence styling is missing");
requireText("css", ".result-panel", "result styling is missing");

for (const asset of ["nbl-writing-mark.png"]) {
  try {
    await access(asset);
  } catch {
    errors.push(`asset: required file '${asset}' is missing`);
  }
}

if (errors.length) {
  console.error("Video Workshop check failed:\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Video Workshop structure and browser-processing checks passed.");
