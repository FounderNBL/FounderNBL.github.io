import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { buildMysticStudy } from "./mystic-scene.js";
import { createRelics, relicFromIntersection } from "./relics.js";
import { createGateController } from "./gate.js";

const $ = (id) => document.getElementById(id);
const game = $("game");
const intro = $("intro");
const enterButton = $("enterButton");
const pauseButton = $("pauseButton");
const prompt = $("prompt");
const status = $("status");
const clueBox = $("clueBox");
const clueKicker = $("clueKicker");
const clueTitle = $("clueTitle");
const clueText = $("clueText");
const closeClue = $("closeClue");
const lookPad = $("lookPad");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(64, innerWidth / innerHeight, .08, 70);
camera.position.set(0, 1.72, 6.7);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.03;
game.appendChild(renderer.domElement);

const controls = new PointerLockControls(camera, renderer.domElement);
scene.add(camera);

const chamber = buildMysticStudy(scene);
const { relics } = createRelics(scene);
const interactiveMeshes = [];
relics.forEach((relic) => relic.traverse((child) => child.isMesh && interactiveMeshes.push(child)));

const raycaster = new THREE.Raycaster();
const center = new THREE.Vector2(0, 0);
const clock = new THREE.Clock();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const move = { forward: false, back: false, left: false, right: false };
const inspected = new Set();
let currentRelic = null;
let started = false;
let clueOpen = false;
let lookTouch = null;

function updateStatus() {
  const left = 3 - inspected.size;
  status.textContent = left > 0 ? `${inspected.size}/3 relics witnessed · ${left} remain${left === 1 ? "s" : ""}` : "The ward has released.";
}

const gate = createGateController({
  modal: $("gateModal"),
  closeButton: $("closeGate"),
  unlockButton: $("unlockButton"),
  statusNode: $("checkoutStatus"),
  onClose: () => {
    if (started && matchMedia("(pointer:fine)").matches) controls.lock();
  }
});

function showPrompt(text = "") {
  prompt.textContent = text;
  prompt.classList.toggle("show", Boolean(text));
}

function openClue(relic) {
  if (!relic) return;
  clueOpen = true;
  controls.unlock();
  clueKicker.textContent = relic.kicker;
  clueTitle.textContent = relic.title;
  clueText.textContent = relic.clue;
  clueBox.hidden = false;
  inspected.add(relic.id);
  updateStatus();
}

function closeClueBox() {
  clueBox.hidden = true;
  clueOpen = false;
  if (inspected.size === 3) {
    setTimeout(() => gate.open(), 300);
  } else if (started && matchMedia("(pointer:fine)").matches) {
    controls.lock();
  }
}

closeClue.addEventListener("click", closeClueBox);

function inspectCurrent() {
  if (!started || clueOpen || gate.isOpen()) return;
  if (currentRelic) openClue(currentRelic);
}

renderer.domElement.addEventListener("click", () => {
  if (!started) return;
  if (!controls.isLocked && matchMedia("(pointer:fine)").matches) controls.lock();
  inspectCurrent();
});

enterButton.addEventListener("click", () => {
  started = true;
  intro.hidden = true;
  updateStatus();
  if (matchMedia("(pointer:fine)").matches) controls.lock();
});

pauseButton.addEventListener("click", () => {
  controls.unlock();
  intro.hidden = false;
});

function setMove(key, value) {
  if (key === "KeyW" || key === "ArrowUp") move.forward = value;
  if (key === "KeyS" || key === "ArrowDown") move.back = value;
  if (key === "KeyA" || key === "ArrowLeft") move.left = value;
  if (key === "KeyD" || key === "ArrowRight") move.right = value;
}

addEventListener("keydown", (event) => {
  setMove(event.code, true);
  if (event.code === "KeyE") inspectCurrent();
  if (event.code === "Escape" && clueOpen) closeClueBox();
});
addEventListener("keyup", (event) => setMove(event.code, false));

for (const button of document.querySelectorAll("[data-move]")) {
  const name = button.dataset.move;
  const down = (event) => { event.preventDefault(); move[name] = true; };
  const up = (event) => { event.preventDefault(); move[name] = false; };
  button.addEventListener("pointerdown", down);
  button.addEventListener("pointerup", up);
  button.addEventListener("pointercancel", up);
  button.addEventListener("pointerleave", up);
}

lookPad.addEventListener("pointerdown", (event) => {
  lookTouch = { id: event.pointerId, x: event.clientX, y: event.clientY };
  lookPad.setPointerCapture(event.pointerId);
});
lookPad.addEventListener("pointermove", (event) => {
  if (!lookTouch || event.pointerId !== lookTouch.id) return;
  const dx = event.clientX - lookTouch.x;
  const dy = event.clientY - lookTouch.y;
  camera.rotation.order = "YXZ";
  camera.rotation.y -= dx * .0042;
  camera.rotation.x -= dy * .0042;
  camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x, -1.42, 1.42);
  lookTouch.x = event.clientX;
  lookTouch.y = event.clientY;
});
lookPad.addEventListener("pointerup", () => { lookTouch = null; });

function collidesWithTable(position) {
  const b = chamber.tableBounds;
  return position.x > b.minX && position.x < b.maxX && position.z > b.minZ && position.z < b.maxZ;
}

function updateMovement(delta) {
  if (!started || clueOpen || gate.isOpen()) return;
  velocity.x -= velocity.x * 10 * delta;
  velocity.z -= velocity.z * 10 * delta;
  direction.z = Number(move.forward) - Number(move.back);
  direction.x = Number(move.right) - Number(move.left);
  direction.normalize();
  const acceleration = 24;
  if (move.forward || move.back) velocity.z -= direction.z * acceleration * delta;
  if (move.left || move.right) velocity.x -= direction.x * acceleration * delta;

  const previous = camera.position.clone();
  controls.moveRight(-velocity.x * delta);
  controls.moveForward(-velocity.z * delta);
  camera.position.x = THREE.MathUtils.clamp(camera.position.x, chamber.bounds.minX, chamber.bounds.maxX);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, chamber.bounds.minZ, chamber.bounds.maxZ);
  camera.position.y = 1.72;
  if (collidesWithTable(camera.position)) camera.position.copy(previous);
}

function updateInteraction() {
  raycaster.setFromCamera(center, camera);
  raycaster.far = 3.2;
  const hit = raycaster.intersectObjects(interactiveMeshes, false)[0];
  const relic = relicFromIntersection(hit);
  currentRelic = relic;
  showPrompt(relic && !clueOpen && !gate.isOpen() ? `${inspected.has(relic.id) ? "Revisit" : "Inspect"}: ${relic.title}` : "");
}

function animateRelics(time) {
  relics.forEach((relic, index) => {
    const glow = inspected.has(relic.userData?.relic?.id || "") ? .025 : .012;
    relic.position.y += Math.sin(time * .0015 + index) * glow * .02;
  });
  chamber.rune.rotation.z = time * .00025;
  chamber.candleLights.forEach((light, index) => {
    light.intensity = 3.8 + Math.sin(time * .006 + index * 1.7) * .55;
  });
}

function animate(time = 0) {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), .04);
  updateMovement(delta);
  updateInteraction();
  animateRelics(time);
  renderer.render(scene, camera);
}
animate();

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
