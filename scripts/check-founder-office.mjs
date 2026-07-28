import { readFile } from "node:fs/promises";

const files = {
  index: await readFile("enter/index.html", "utf8"),
  game: await readFile("enter/game.js", "utf8"),
  retro: await readFile("enter/retro-room.js", "utf8"),
  performance: await readFile("enter/performance-budget.js", "utf8")
};

const errors = [];
const requireText = (fileName, text, reason) => {
  if (!files[fileName].includes(text)) errors.push(`${fileName}: ${reason}`);
};

const performanceIndex = files.index.indexOf('src="performance-budget.js"');
const retroIndex = files.index.indexOf('src="retro-room.js"');
const gameIndex = files.index.indexOf('src="game.js"');

if (!(performanceIndex >= 0 && retroIndex > performanceIndex && gameIndex > retroIndex)) {
  errors.push("index: performance-budget.js, retro-room.js, and game.js must load in that order.");
}

for (const artifact of ["graduation", "banner", "doctorate", "masters", "family", "founder", "yolanda", "clue", "chair"]) {
  requireText("game", `${artifact}: {`, `required artifact '${artifact}' is missing.`);
}

requireText("game", "function updateLamp()", "the three-touch lamp sequence is missing.");
requireText("game", "chairUnlocked", "the chair unlock state is missing.");
requireText("game", "beginArtifactTransition", "artifact approach animation is missing.");
requireText("game", "revealInspector", "artifact inspection is missing.");
requireText("game", "Touch the one-room light", "the lamp interaction prompt is missing.");

requireText("retro", "function installRetroRoom", "the retro room installer is missing.");
requireText("retro", "function buildRoomShell", "the low-poly room shell is missing.");
requireText("retro", "function buildBookcase", "the low-poly bookcases are missing.");
requireText("retro", "function enhancePuzzleLamp", "the puzzle lamp visual enhancement is missing.");
requireText("retro", "function rebuildArtifactFrames", "the artifact frame enhancement is missing.");
requireText("performance", "maximumPixelRatio", "the adaptive phone rendering budget is missing.");

if (errors.length) {
  console.error("Founder’s Office integrity check failed:\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Founder’s Office syntax, load order, puzzle, and artifact checks passed.");
