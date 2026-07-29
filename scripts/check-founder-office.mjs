import { access, readFile } from "node:fs/promises";

const files = {
  index: await readFile("enter/index.html", "utf8"),
  game: await readFile("enter/game.js", "utf8"),
  retro: await readFile("enter/retro-room.js", "utf8"),
  content: await readFile("enter/room-content.js", "utf8"),
  performance: await readFile("enter/performance-budget.js", "utf8")
};

const errors = [];
const requireText = (fileName, text, reason) => {
  if (!files[fileName].includes(text)) errors.push(`${fileName}: ${reason}`);
};

const performanceIndex = files.index.indexOf('src="performance-budget.js"');
const retroIndex = files.index.indexOf('src="retro-room.js"');
const contentIndex = files.index.indexOf('src="room-content.js"');
const gameIndex = files.index.indexOf('src="game.js"');

if (!(performanceIndex >= 0 && retroIndex > performanceIndex && contentIndex > retroIndex && gameIndex > contentIndex)) {
  errors.push("index: performance-budget.js, retro-room.js, room-content.js, and game.js must load in that order.");
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
requireText("performance", "maximumPixelRatio", "the adaptive phone rendering budget is missing.");

requireText("content", 'asset: "../if-it-is-is-it-banner.png"', "the exact If it is is it? poster is not assigned.");
requireText("content", 'position: [0, 4.26, -4.34]', "the poster is not centered directly behind the chair.");
requireText("content", 'asset: "../desk-clue-plaque.png"', "the exact clue plaque is not assigned.");
requireText("content", 'position: [0, 0.84, 0.64]', "the clue is not attached to the front of the desk.");
requireText("content", 'asset: "../founder-nameplate.png"', "the exact Founder nameplate is not assigned to the desk.");
requireText("content", 'asset: "../new-beansland-family-photo.png"', "the exact Family photo is not assigned to the desk.");
requireText("content", 'loadTexture("../official-nbl-emblem.png"', "the exact NBL chair emblem is missing.");
requireText("content", '["The Desk Clue", "../desk-clue-plaque.png"]', "the clue inspector does not show the exact plaque.");
requireText("content", '["The Empty Chair", "../official-nbl-emblem.png"]', "the chair inspector does not show the exact emblem.");
requireText("content", "function buildExactLamp", "the NBL desk lamp model is missing.");
requireText("content", "function relocateBookcases", "the bookcases are not moved away from the wall artifacts.");
requireText("content", 'dataset.nblRoomContent = "exact-founder-layout"', "the exact room content marker is missing.");

const requiredAssets = [
  "if-it-is-is-it-banner.png",
  "founder-graduation-remarks.png",
  "founder-doctorate-degree.png",
  "founder-masters-degree.png",
  "new-beansland-family-photo.png",
  "founder-nameplate.png",
  "desk-clue-plaque.png",
  "official-nbl-emblem.png",
  "nbl-writing-mark.png",
  "founder-office-room.png"
];

await Promise.all(requiredAssets.map(async (path) => {
  try {
    await access(path);
  } catch {
    errors.push(`asset: required exact room file '${path}' is missing.`);
  }
}));

if (errors.length) {
  console.error("Founder’s Office integrity check failed:\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Founder’s Office syntax, puzzle, exact assets, and room placement checks passed.");
