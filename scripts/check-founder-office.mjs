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

// Approved office: fixed living-museum room image + hotspots + lightweight 2D object interactions.
// Keep the old walking/GLB experiments as history, but do not load them in the production office.
requireText(html, 'class="room-stage"', "Founder Office room stage is missing.");
requireText(html, 'class="room-image"', "Founder Office room image is missing.");
requireText(html, 'src="founder-office-room.png"', "Founder Office master room image is missing.");

for (const key of ["graduation","banner","doctorate","masters","family","founder","chair","yolanda","clue"]) {
  requireText(html, `data-panel="${key}"`, `hotspot '${key}' is missing.`);
}

requireText(html, 'data-action="lamp"', "lamp hotspot is missing.");
requireText(html, 'setLampState((lampState + 1) % 3)', "three-touch lamp sequence is missing.");
requireText(html, 'panel === "chair" && lampState !== 2', "chair light gate is missing.");
requireText(html, 'panel === "clue"', "clue-to-lamp behavior is missing.");

requireText(html, 'id="floorBean"', "Beans is not grounded on the office floor/rug.");
requireText(html, 'id="nblToyLeft"', "left NBL display toy is missing.");
requireText(html, 'id="nblToyRight"', "right NBL display toy is missing.");
requireText(html, 'data-floor-figure', "shared floor-figure interaction markers are missing.");
requireText(html, 'function setupFloorFigure(figure)', "shared Beans/toy interaction is missing.");
requireText(html, 'floorFigures.forEach(setupFloorFigure)', "not all floor figures use the shared interaction.");
requireText(html, 'returnFigureHome', "floor figures do not snap back home.");

requireText(html, 'src="/Beans.png"', "Beans lightweight image asset is missing from the room.");
requireText(html, 'src="/NBL-Model-Front.png"', "NBL toy lightweight image asset is missing from the room.");
requireText(html, 'className = "office-artifact-image"', "museum artifact image preview is missing.");

forbidText(html, 'model-viewer', "Heavy model-viewer dependency returned to the active Founder Office.");
forbidText(html, '.glb', "A GLB reference returned to the active Founder Office.");
forbidText(html, 'id="officeCanvas"', "Retired walking-game canvas returned to the approved museum office.");
forbidText(html, 'id="moveZone"', "Retired BODY joystick returned to the approved museum office.");
forbidText(html, 'id="lookZone"', "Retired HEAD joystick returned to the approved museum office.");

// The Office must stay on the shared website shell so current Beans remains available here too.
requireText(html, '<script defer src="/nbl-portal.js"></script>', "NBL portal shell is not wired on Founder Office.");
requireText(html, '<script defer src="/nbl-world-header.js?v=20261004-shopify"></script>', "shared NBL world/Beans header is not wired on Founder Office.");

// Catch accidental literal escape corruption and other inline JavaScript parse failures.
const inlineScripts = html
  .split("<script")
  .slice(1)
  .map((block) => {
    const open = block.indexOf(">");
    const close = block.indexOf("</script>");
    if (open < 0 || close < 0) return "";
    const attrs = block.slice(0, open);
    if (/\\bsrc\\s*=/.test(attrs)) return "";
    return block.slice(open + 1, close);
  })
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
  "Beans.png",
  "NBL-Model-Front.png",
  "founder-nameplate.png",
  "founder-doctorate-degree.png",
  "founder-masters-degree.png",
  "founder-graduation-remarks.png",
  "yolanda-family-keepsake.png",
  "new-beansland-family-photo.png"
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

console.log("Founder’s Office living museum, lamp puzzle, Beans + two shared toy interactions, lightweight assets, Beans shell wiring, and syntax passed.");
