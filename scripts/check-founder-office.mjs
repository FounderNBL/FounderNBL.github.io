import { readFile, stat } from "node:fs/promises";
import vm from "node:vm";

const html = await readFile("founder-office.html", "utf8");
const errors = [];

const requireText = (source, text, reason) => {
  if (!source.includes(text)) errors.push(reason);
};

const forbidText = (source, text, reason) => {
  if (source.includes(text)) errors.push(reason);
};

// Current approved office: fixed room view + hotspots + object inspection.
// Do not force the retired first-person walking/joystick build back into production.
requireText(html, 'class="room-stage"', "Founder Office room stage is missing.");
requireText(html, 'class="room-image"', "Founder Office room image is missing.");
requireText(html, 'src="founder-office-room.png"', "Founder Office master room image is missing.");
requireText(html, '@google/model-viewer', "3D artifact viewer dependency is missing.");

for (const key of ["graduation","banner","doctorate","masters","family","founder","chair","yolanda","clue"]) {
  requireText(html, `data-panel="${key}"`, `hotspot '${key}' is missing.`);
}
requireText(html, 'data-action="lamp"', "lamp hotspot is missing.");
requireText(html, 'setLampState((lampState + 1) % 3)', "three-touch lamp sequence is missing.");
requireText(html, 'panel === "chair" && lampState !== 2', "chair light gate is missing.");
requireText(html, 'panel === "clue"', "clue-to-lamp behavior is missing.");
requireText(html, 'id="deskBean"', "interactive Beanie Bean is missing.");
requireText(html, 'id="beanGrab"', "Beanie Bean pick-up control is missing.");
requireText(html, 'returnBeanHome', "Beanie Bean return-home behavior is missing.");

forbidText(html, 'id="officeCanvas"', "Retired walking-game canvas returned to the approved static office.");
forbidText(html, 'id="moveZone"', "Retired BODY joystick returned to the approved static office.");
forbidText(html, 'id="lookZone"', "Retired HEAD joystick returned to the approved static office.");

// Catch accidental literal escape corruption and other inline JavaScript parse failures.
const inlineScripts = [...html.matchAll(/<script(?![^>]*\\bsrc=)[^>]*>([\\s\\S]*?)<\\/script>/gi)]
  .map((match) => match[1])
  .filter((source) => source.trim());

for (const source of inlineScripts) {
  try {
    new vm.Script(source);
  } catch (error) {
    errors.push(`inline Founder Office JavaScript does not parse: ${error.message}`);
  }
}

const requiredAssets = [
  "founder-office-room.png",
  "official-nbl-emblem.png",
  "Beanie Bean_Meshy_AI_2026-09-20_19b948-optimized.glb",
  "Founder_Plaque.glb",
  "Master_Of_Applied_Skepticism_Certificate-optimized.glb",
  "For You, Mom Keepsake Necklace_Meshy_AI_2026-08-04_bb6999.glb",
  "New_Beansland_University_Crest-optimized.glb",
  "Use_A_Light_.glb"
];

for (const path of requiredAssets) {
  try {
    const info = await stat(path);
    if (!info.isFile() || info.size <= 0) errors.push(`asset '${path}' is empty or invalid.`);
  } catch {
    errors.push(`required asset '${path}' is missing.`);
  }
}

if (errors.length) {
  console.error("Founder’s Office integrity check failed:\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Founder’s Office approved static/hotspot experience, lamp puzzle, Beanie interaction, syntax, and required assets passed.");
