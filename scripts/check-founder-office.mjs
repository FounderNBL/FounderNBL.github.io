import { access, readFile } from "node:fs/promises";

const files = {
  index: await readFile("enter/index.html", "utf8"),
  game: await readFile("enter/office-v2.js", "utf8"),
  css: await readFile("enter/office-v2.css", "utf8")
};

const errors = [];
const requireText = (fileName, text, reason) => {
  if (!files[fileName].includes(text)) errors.push(`${fileName}: ${reason}`);
};

requireText("index", 'href="office-v2.css', "V2 stylesheet is not active.");
requireText("index", 'src="office-v2.js', "V2 game module is not active.");
if (files.index.includes('src="game.js"') || files.index.includes('game-enhancements.js') || files.index.includes('retro-room.js')) {
  errors.push("index: legacy Founder Office blueprint runtime is still active.");
}

for (const id of ["moveStick","lookStick","grabButton","useButton","inspector","viewerCanvas"]) {
  requireText("index", `id="${id}"`, `required V2 control '${id}' is missing.`);
}

requireText("css", ".left-stick", "left/body stick styling is missing.");
requireText("css", ".right-stick", "right/head stick styling is missing.");
requireText("css", "@media(orientation:portrait)", "portrait reduced-control layout is missing.");
requireText("game", 'bindStick(moveStick,moveKnob,moveAxis)', "body movement stick is not wired.");
requireText("game", 'bindStick(lookStick,lookKnob,lookAxis)', "head movement stick is not wired.");
requireText("game", 'grabButton.addEventListener', "grab action is not wired.");
requireText("game", 'useButton.addEventListener', "use action is not wired.");
requireText("game", 'function show3D(item)', "3D inspection is missing.");
requireText("game", 'function showImage(item)', "flat/original-image fallback inspection is missing.");

for (const ref of [
  "../NBL_Office_Desk.glb",
  "../NBL_Desk_Lamp.glb",
  "../NBL_Model_Toy.glb",
  "../NBL_Model_Toy_2-optimized.glb",
  "../Founder_Plaque.glb",
  "../Master_Of_Applied_Skepticism_Certificate-optimized.glb",
  "../Institute_Of_Evidence-Based_Practice_Certificate.glb",
  "../Use_A_Light_.glb",
  "../New_Beansland_University_Crest-optimized.glb"
]) {
  requireText("game", ref, `current 3D asset reference '${ref}' is missing.`);
}

for (const ref of [
  "../if-it-is-is-it-banner.png",
  "../founder-graduation-remarks.png",
  "../founder-doctorate-degree.png",
  "../founder-masters-degree.png",
  "../new-beansland-family-photo.png",
  "../founder-nameplate.png",
  "../desk-clue-plaque.png",
  "../founders-office-yolanda.png",
  "../official-nbl-emblem.png"
]) {
  requireText("game", ref, `current flat/original asset reference '${ref}' is missing.`);
}

const requiredAssets = [
  "NBL_Office_Desk.glb",
  "NBL_Desk_Lamp.glb",
  "NBL_Model_Toy.glb",
  "NBL_Model_Toy_2-optimized.glb",
  "Founder_Plaque.glb",
  "Master_Of_Applied_Skepticism_Certificate-optimized.glb",
  "Institute_Of_Evidence-Based_Practice_Certificate.glb",
  "Use_A_Light_.glb",
  "New_Beansland_University_Crest-optimized.glb",
  "if-it-is-is-it-banner.png",
  "founder-graduation-remarks.png",
  "founder-doctorate-degree.png",
  "founder-masters-degree.png",
  "new-beansland-family-photo.png",
  "founder-nameplate.png",
  "desk-clue-plaque.png",
  "founders-office-yolanda.png",
  "official-nbl-emblem.png"
];

await Promise.all(requiredAssets.map(async (path) => {
  try {
    await access(path);
  } catch {
    errors.push(`asset: required current Founder Office file '${path}' is missing.`);
  }
}));

if (errors.length) {
  console.error("Founder’s Office V2 integrity check failed:\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Founder’s Office V2 current-assets, controls, grab/use, and inspection checks passed.");
