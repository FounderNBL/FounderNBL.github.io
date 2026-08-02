import { access, readFile } from "node:fs/promises";

const html = await readFile("playhouse/index.html", "utf8");
const css = await readFile("playhouse/playhouse.css", "utf8");
const js = await readFile("playhouse/playhouse.js", "utf8");
const errors = [];

const requireText = (source, text, message) => {
  if (!source.includes(text)) errors.push(message);
};

requireText(html, 'id="roadHotspot"', "road touch control is missing");
requireText(html, 'id="startWalking"', "Start Walking control is missing");
requireText(html, 'id="shopDialog"', "coffee shop game-pass dialog is missing");
requireText(html, 'id="journeyVideo"', "journey video player is missing");
requireText(html, 'id="setupDialog"', "Founder local video setup is missing");
requireText(html, 'href="video-workshop.html"', "Playhouse workshop link is missing");
requireText(js, "indexedDB.open", "local device video storage is missing");
requireText(js, "requestAnimationFrame", "smooth fallback animation is missing");
requireText(js, "builtInSources", "public video slots are missing");
requireText(js, "maybeShowEvent", "road event system is missing");
requireText(css, ".main-nav", "full navigation styling is missing");
requireText(css, ".road-hotspot", "road interaction styling is missing");

for (const file of [
  "playhouse/playhouse.css",
  "playhouse/playhouse.js",
  "playhouse/video-workshop.html",
  "playhouse/video-workshop.css",
  "playhouse/video-workshop.js",
  "playhouse/nbl-writing-mark.png",
  "playhouse/media/README.md"
]) {
  try { await access(file); }
  catch { errors.push(`required file is missing: ${file}`); }
}

if (errors.length) {
  console.error("Playhouse check failed:\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Playhouse structure, video controls, workshop, and local-media checks passed.");
