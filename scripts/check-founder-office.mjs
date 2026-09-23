import { readFile, stat } from "node:fs/promises";

const html = await readFile("founder-office.html", "utf8");
const game = await readFile("founder-office-3d.js", "utf8");
const css = await readFile("founder-office-3d.css", "utf8");
const enter = await readFile("enter/index.html", "utf8");
const errors = [];

const requireText = (source, text, reason) => {
  if (!source.includes(text)) errors.push(reason);
};

requireText(html, 'id="officeCanvas"', "3D canvas is missing.");
requireText(html, 'id="moveZone"', "BODY movement control is missing.");
requireText(html, 'id="lookZone"', "HEAD movement control is missing.");
requireText(html, 'id="grabButton"', "GRAB control is missing.");
requireText(html, 'id="useButton"', "USE control is missing.");
requireText(html, 'founder-office-3d.js', "production 3D module is not loaded.");
requireText(enter, '../founder-office.html', "/enter/ no longer redirects to the live Founder Office.");

for (const key of ["desk","lamp","bean","toy1","toy2","founder","yolanda","chair","doctorate","masters","clue","graduation","banner","family"]) {
  requireText(game, key, `interaction '${key}' is missing.`);
}

requireText(game, "lampState = (lampState + 1) % 3", "three-touch lamp sequence is missing.");
requireText(game, "lampState < 2", "chair light gate is missing.");
requireText(game, "bindStick(moveZone", "BODY joystick is not wired.");
requireText(game, "bindStick(lookZone", "HEAD joystick is not wired.");
requireText(game, "Sequential loading", "phone-safe sequential GLB loading is missing.");
requireText(game, 'renderer.shadowMap.enabled = true', "room shadows are disabled.");
requireText(game, 'THREE.ACESFilmicToneMapping', "filmic tone mapping is missing.");
requireText(css, ".portrait-note", "portrait fallback controls/hint are missing.");
requireText(css, ".inspector", "3D artifact inspector styling is missing.");

const requiredGlbs = [
  "Beanie Bean_Meshy_AI_2026-09-20_19b948-optimized.glb",
  "For You, Mom Keepsake Necklace_Meshy_AI_2026-08-04_bb6999.glb",
  "Founder_Plaque.glb",
  "Institute_Of_Evidence-Based_Practice_Certificate.glb",
  "Master_Of_Applied_Skepticism_Certificate-optimized.glb",
  "NBL_Desk_Lamp.glb",
  "NBL_Model_Toy.glb",
  "NBL_Model_Toy_2-optimized.glb",
  "NBL_Office_Desk.glb",
  "New_Beansland_University_Crest-optimized.glb",
  "Use_A_Light_.glb"
];

const requiredImages = [
  "if-it-is-is-it-banner.png",
  "founder-graduation-remarks.png",
  "founder-doctorate-degree.png",
  "founder-masters-degree.png",
  "new-beansland-family-photo.png",
  "founder-nameplate.png",
  "desk-clue-plaque.png",
  "official-nbl-emblem.png",
  "founders-office-yolanda.png",
  "founder-office-room.png"
];

for (const path of [...requiredGlbs, ...requiredImages]) {
  try {
    const info = await stat(path);
    if (!info.isFile() || info.size <= 0) errors.push(`asset '${path}' is empty or invalid.`);
  } catch {
    errors.push(`required asset '${path}' is missing.`);
  }
}

if (game.includes("assets/3d/models/founder-")) {
  errors.push("production code still references the broken zero-byte Founder Office GLB copies.");
}

if (errors.length) {
  console.error("Founder’s Office integrity check failed:\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Founder’s Office 3D controls, lamp puzzle, responsive UI, and real GLB asset checks passed.");
