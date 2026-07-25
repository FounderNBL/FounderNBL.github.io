import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

const $ = (id) => document.getElementById(id);
const game = $("game");
const intro = $("intro");
const enterButton = $("enterButton");
const pauseButton = $("pauseButton");
const prompt = $("prompt");
const status = $("status");
const inspector = $("inspector");
const closeInspector = $("closeInspector");
const artifactTitle = $("artifactTitle");
const artifactStory = $("artifactStory");
const storyButton = $("storyButton");
const artifactCanvas = $("artifactCanvas");
const zoomIn = $("zoomIn");
const zoomOut = $("zoomOut");
const resetView = $("resetView");
const lookPad = $("lookPad");
const ctx = artifactCanvas.getContext("2d");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02050a);
scene.fog = new THREE.FogExp2(0x02050a, 0.024);

const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 1.72, 6.9);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
game.appendChild(renderer.domElement);

const controls = new PointerLockControls(camera, renderer.domElement);
scene.add(camera);

const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const center = new THREE.Vector2(0, 0);
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const interactive = [];
const move = { forward: false, back: false, left: false, right: false };

let currentHit = null;
let highlighted = null;
let gameStarted = false;
let lampState = 0;
let chairUnlocked = false;
let transition = null;
let walkingTime = 0;

const artifacts = {
  graduation: {
    title: "Graduation Remarks",
    crop: [0.055, 0.13, 0.15, 0.39],
    story: "The ceremony marks an achievement, but the remarks explain what the achievement is for. The class continues tomorrow. Still walking."
  },
  banner: {
    title: "If it is is it?",
    crop: [0.355, 0.135, 0.30, 0.22],
    story: "New Beansland is a creative home for stories, questions, worlds, memory, philosophy, and the paths connecting them."
  },
  doctorate: {
    title: "Doctor of Narrative Architecture",
    crop: [0.81, 0.14, 0.10, 0.25],
    story: "The degree represents perception, narrative systems, civic imagination, worldbuilding, and the responsibility to build structures strong enough to hold difficult questions."
  },
  masters: {
    title: "Master of Applied Skepticism",
    crop: [0.90, 0.12, 0.085, 0.28],
    story: "The supporting degree represents inquiry, evidence, analogical reasoning, category recognition, and knowing what room you are in."
  },
  family: {
    title: "The New Beansland Family",
    crop: [0.215, 0.51, 0.12, 0.14],
    story: "The family was not assembled. It accumulated. Every member has an origin, a voice, a role, and a place in the world."
  },
  founder: {
    title: "Jamel Hawkins — Founder",
    crop: [0.345, 0.58, 0.14, 0.075],
    story: "Founder of New Beansland. Builder of stories, questions, worlds, and the rooms connecting them. Still walking."
  },
  yolanda: {
    title: "For You, Mom — Yolanda",
    crop: [0.68, 0.50, 0.13, 0.18],
    story: "You are my first love, my forever angel, and the reason I am who I am. Everything I do, I do for you."
  },
  clue: {
    title: "The Desk Clue",
    crop: [0.43, 0.74, 0.16, 0.105],
    story: "If it is too dark, use a light. The lamp changes the room in three touches."
  },
  chair: {
    title: "The Empty Chair",
    crop: [0.42, 0.39, 0.16, 0.24],
    story: "The chair is empty because the Founder is still walking, still building, and still moving through New Beansland."
  }
};

const roomImage = new Image();
roomImage.src = "../founder-office-room.png";
const textureLoader = new THREE.TextureLoader();
const roomTexture = textureLoader.load("../founder-office-room.png");
roomTexture.colorSpace = THREE.SRGBColorSpace;
roomTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

function material(color, roughness = 0.72, metalness = 0.08) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function box(name, size, position, color, options = {}) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    material(color, options.roughness, options.metalness)
  );
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = options.castShadow !== false;
  mesh.receiveShadow = options.receiveShadow !== false;
  scene.add(mesh);
  return mesh;
}

function cropTexture(crop) {
  const texture = roomTexture.clone();
  texture.needsUpdate = true;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(crop[2], crop[3]);
  texture.offset.set(crop[0], 1 - crop[1] - crop[3]);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function registerInteractive(mesh, data) {
  mesh.userData = { ...mesh.userData, ...data };
  mesh.userData.originalScale = mesh.scale.clone();
  interactive.push(mesh);
}

function artifactPlane(id, size, position, rotationY = 0) {
  const data = artifacts[id];
  const frame = box(
    `${id}-frame`,
    [size[0] + 0.16, size[1] + 0.16, 0.12],
    [position[0], position[1], position[2] + 0.03],
    0x8b6127,
    { roughness: 0.38, metalness: 0.45 }
  );
  frame.rotation.y = rotationY;

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size[0], size[1]),
    new THREE.MeshStandardMaterial({
      map: cropTexture(data.crop),
      roughness: 0.58,
      emissive: 0xffd47a,
      emissiveIntensity: 0
    })
  );
  mesh.position.set(...position);
  mesh.rotation.y = rotationY;
  scene.add(mesh);
  registerInteractive(mesh, { artifactId: id, prompt: `Inspect ${data.title}` });
  return mesh;
}

// The exact office artwork anchors the 3D set. Geometry in front of it creates depth.
const backdrop = new THREE.Mesh(
  new THREE.PlaneGeometry(13.8, 7.76),
  new THREE.MeshBasicMaterial({ map: roomTexture, toneMapped: false })
);
backdrop.position.set(0, 3.05, -4.42);
scene.add(backdrop);

const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 14), material(0x25170f, 0.9));
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const rug = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 6.4), material(0x071325, 0.88));
rug.rotation.x = -Math.PI / 2;
rug.position.set(0, 0.012, 1.5);
rug.receiveShadow = true;
scene.add(rug);

box("left-wall", [0.35, 6, 11], [-7, 3, 0.8], 0x17120f, { castShadow: false });
box("right-wall", [0.35, 6, 11], [7, 3, 0.8], 0x17120f, { castShadow: false });
box("ceiling", [14, 0.3, 11], [0, 6, 0.8], 0x100b08, { castShadow: false });

box("desk", [8.7, 1.25, 2.2], [0, 0.72, -0.5], 0x3a2011, { roughness: 0.58 });
box("desk-top", [9.2, 0.18, 2.45], [0, 1.43, -0.5], 0x5a3219, { roughness: 0.48 });
box("chair-seat", [1.7, 0.32, 1.4], [0, 1.1, -2], 0x151211, { roughness: 0.84 });
const chairBack = box("chair-back", [1.75, 2.25, 0.35], [0, 2.3, -2.45], 0x151211, { roughness: 0.84 });
registerInteractive(chairBack, { artifactId: "chair", prompt: "The chair is waiting for the light" });

scene.add(new THREE.HemisphereLight(0xb8c9e2, 0x28160d, 0.34));
const fillLight = new THREE.DirectionalLight(0x8ca8c7, 1.5);
fillLight.position.set(-4, 5, 5);
scene.add(fillLight);

const keyLight = new THREE.SpotLight(0xffd58c, 0, 14, Math.PI / 4.5, 0.55, 1.4);
keyLight.position.set(3.1, 4.6, -0.5);
keyLight.target.position.set(0.8, 1.3, -1.4);
keyLight.castShadow = true;
scene.add(keyLight, keyLight.target);

[-4.8, 0, 4.8].forEach((x) => {
  const light = new THREE.PointLight(0xffd7a2, 3.2, 8, 2);
  light.position.set(x, 5.65, 1.8);
  scene.add(light);
});

artifactPlane("graduation", [1.25, 2.2], [-5.25, 3.15, -4.25]);
artifactPlane("banner", [4.15, 1.75], [0, 3.75, -4.25]);
artifactPlane("doctorate", [1.35, 2.05], [4.6, 3.25, -4.25]);
artifactPlane("masters", [1.35, 2.05], [6.05, 3.25, -4.25]);
artifactPlane("family", [1.55, 1], [-3.3, 2, -1.67]);
artifactPlane("founder", [2.05, 0.55], [-1.4, 1.82, -1.67]);
artifactPlane("yolanda", [1.55, 1.25], [3.35, 2.05, -1.67]);
artifactPlane("clue", [2.3, 0.75], [0, 0.86, 0.63], Math.PI);

const lampBase = box("lamp-base", [0.75, 0.18, 0.75], [2.1, 1.61, -1.2], 0x9a6e2d, { roughness: 0.35, metalness: 0.7 });
const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.4, 18), material(0xb18438, 0.3, 0.72));
lampStem.position.set(2.1, 2.82, -1.2);
lampStem.castShadow = true;
scene.add(lampStem);
const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.58, 0.78, 24, 1, true), material(0x071325, 0.55, 0.18));
lampShade.position.set(2.1, 3.62, -1.2);
lampShade.rotation.x = Math.PI;
scene.add(lampShade);
registerInteractive(lampBase, { action: "lamp", prompt: "Touch the one-room light" });
registerInteractive(lampShade, { action: "lamp", prompt: "Touch the one-room light" });

function showPrompt(text) {
  prompt.textContent = text;
  prompt.classList.toggle("show", Boolean(text));
}

function setHighlight(mesh) {
  if (highlighted === mesh) return;
  if (highlighted) {
    highlighted.scale.copy(highlighted.userData.originalScale || new THREE.Vector3(1, 1, 1));
    if (highlighted.material?.emissive) highlighted.material.emissiveIntensity = 0;
  }
  highlighted = mesh;
  if (highlighted) {
    highlighted.scale.multiplyScalar(1.025);
    if (highlighted.material?.emissive) highlighted.material.emissiveIntensity = 0.18;
  }
}

function updateLamp() {
  lampState = (lampState + 1) % 3;
  keyLight.intensity = lampState === 1 ? 18 : lampState === 2 ? 42 : 0;
  renderer.toneMappingExposure = lampState === 0 ? 0.95 : lampState === 1 ? 1.04 : 1.12;
  chairUnlocked = lampState === 2;
  chairBack.userData.prompt = chairUnlocked ? "Inspect the empty chair" : "The chair is waiting for the light";
  status.textContent = lampState === 1
    ? "The room is waking. Touch the light again."
    : lampState === 2
      ? "The walk is lit. The chair is ready."
      : "The room returns to rest.";
}

let scale = 1;
let offsetX = 0;
let offsetY = 0;
let dragging = false;
let dragStart = { x: 0, y: 0 };

function applyArtifact() {
  artifactCanvas.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
}

function resetArtifact() {
  scale = 1;
  offsetX = 0;
  offsetY = 0;
  applyArtifact();
}

function drawArtifact(id) {
  const data = artifacts[id];
  if (!data || !roomImage.complete) return;
  const [x, y, w, h] = data.crop;
  const sx = x * roomImage.naturalWidth;
  const sy = y * roomImage.naturalHeight;
  const sw = w * roomImage.naturalWidth;
  const sh = h * roomImage.naturalHeight;
  artifactCanvas.width = Math.max(720, Math.round(sw * 2.4));
  artifactCanvas.height = Math.max(520, Math.round(sh * 2.4));
  ctx.clearRect(0, 0, artifactCanvas.width, artifactCanvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(roomImage, sx, sy, sw, sh, 0, 0, artifactCanvas.width, artifactCanvas.height);
  resetArtifact();
}

function revealInspector(id) {
  const data = artifacts[id];
  artifactTitle.textContent = data.title;
  artifactStory.textContent = data.story;
  artifactStory.hidden = true;
  storyButton.textContent = "Learn its story";
  drawArtifact(id);
  inspector.hidden = false;
  closeInspector.focus();
}

function beginArtifactTransition(mesh, id) {
  if (transition) return;
  controls.unlock();
  showPrompt("");
  const clone = mesh.clone();
  clone.material = mesh.material.clone();
  clone.position.copy(mesh.getWorldPosition(new THREE.Vector3()));
  clone.quaternion.copy(mesh.getWorldQuaternion(new THREE.Quaternion()));
  clone.scale.copy(mesh.getWorldScale(new THREE.Vector3()));
  scene.add(clone);
  mesh.visible = false;

  const cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection);
  const targetPosition = camera.position.clone().add(cameraDirection.multiplyScalar(1.55));
  targetPosition.y = camera.position.y;
  const startPosition = clone.position.clone();
  const startQuaternion = clone.quaternion.clone();
  const targetQuaternion = camera.quaternion.clone();

  transition = {
    id,
    mesh,
    clone,
    elapsed: 0,
    duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.02 : 0.72,
    startPosition,
    targetPosition,
    startQuaternion,
    targetQuaternion
  };
  status.textContent = `Approaching ${artifacts[id].title}…`;
}

function updateTransition(delta) {
  if (!transition) return;
  transition.elapsed += delta;
  const raw = Math.min(1, transition.elapsed / transition.duration);
  const eased = 1 - Math.pow(1 - raw, 3);
  transition.clone.position.lerpVectors(transition.startPosition, transition.targetPosition, eased);
  transition.clone.quaternion.slerpQuaternions(transition.startQuaternion, transition.targetQuaternion, eased);
  transition.clone.scale.setScalar(1 + eased * 0.42);

  if (raw >= 1) {
    const { id, mesh, clone } = transition;
    scene.remove(clone);
    clone.geometry?.dispose?.();
    clone.material?.dispose?.();
    mesh.visible = true;
    transition = null;
    revealInspector(id);
    status.textContent = `Inspecting ${artifacts[id].title}`;
  }
}

function openInspector(id, mesh) {
  if (id === "chair" && !chairUnlocked) {
    status.textContent = "The chair is locked. The clue points to the light.";
    return;
  }
  if (!artifacts[id]) return;
  beginArtifactTransition(mesh, id);
}

function closeArtifact() {
  inspector.hidden = true;
  status.textContent = "Back in the room. Keep looking.";
  if (gameStarted && matchMedia("(pointer:fine)").matches) controls.lock();
}

function interact() {
  if (!currentHit || transition) return;
  const object = currentHit.object;
  if (object.userData.action === "lamp") updateLamp();
  else if (object.userData.artifactId) openInspector(object.userData.artifactId, object);
}

function updateTarget() {
  raycaster.setFromCamera(center, camera);
  const hits = raycaster.intersectObjects(interactive, false);
  currentHit = hits.find((hit) => hit.distance <= 4.2) || null;
  setHighlight(currentHit?.object || null);
  showPrompt(currentHit ? `${currentHit.object.userData.prompt} · Click / Tap / E` : "");
}

function clampPlayer() {
  camera.position.x = THREE.MathUtils.clamp(camera.position.x, -5.8, 5.8);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, -3.15, 5.4);
  if (camera.position.z < 1.4 && Math.abs(camera.position.x) < 4.9) camera.position.z = 1.4;
}

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  updateTransition(delta);

  const moving = move.forward || move.back || move.left || move.right;
  if (gameStarted && inspector.hidden && !transition) {
    velocity.x -= velocity.x * 10 * delta;
    velocity.z -= velocity.z * 10 * delta;
    direction.z = Number(move.forward) - Number(move.back);
    direction.x = Number(move.right) - Number(move.left);
    direction.normalize();
    const speed = 4.1;
    if (move.forward || move.back) velocity.z -= direction.z * speed * delta;
    if (move.left || move.right) velocity.x -= direction.x * speed * delta;
    controls.moveRight(-velocity.x);
    controls.moveForward(-velocity.z);
    clampPlayer();
    walkingTime += moving ? delta * 8 : delta * 2;
    camera.position.y = 1.72 + (moving ? Math.sin(walkingTime) * 0.018 : Math.sin(walkingTime) * 0.004);
    updateTarget();
  }

  renderer.render(scene, camera);
}

function setMove(code, value) {
  if (code === "KeyW" || code === "ArrowUp") move.forward = value;
  if (code === "KeyS" || code === "ArrowDown") move.back = value;
  if (code === "KeyA" || code === "ArrowLeft") move.left = value;
  if (code === "KeyD" || code === "ArrowRight") move.right = value;
}

document.addEventListener("keydown", (event) => {
  setMove(event.code, true);
  if (event.code === "KeyE" && inspector.hidden) interact();
  if (event.code === "Escape" && !inspector.hidden) closeArtifact();
});
document.addEventListener("keyup", (event) => setMove(event.code, false));

renderer.domElement.addEventListener("click", () => {
  if (!gameStarted || !inspector.hidden || transition) return;
  if (currentHit) interact();
  else if (matchMedia("(pointer:fine)").matches && !controls.isLocked) controls.lock();
});

enterButton.addEventListener("click", () => {
  intro.hidden = true;
  gameStarted = true;
  status.textContent = "You crossed the threshold. Find the light. Look closely.";
  if (matchMedia("(pointer:fine)").matches) controls.lock();
});

pauseButton.addEventListener("click", () => {
  if (!gameStarted) return;
  controls.isLocked ? controls.unlock() : matchMedia("(pointer:fine)").matches && controls.lock();
});

closeInspector.addEventListener("click", closeArtifact);
inspector.addEventListener("click", (event) => {
  if (event.target === inspector) closeArtifact();
});
storyButton.addEventListener("click", () => {
  artifactStory.hidden = !artifactStory.hidden;
  storyButton.textContent = artifactStory.hidden ? "Learn its story" : "Hide the story";
});
zoomIn.addEventListener("click", () => {
  scale = Math.min(scale + 0.25, 4);
  applyArtifact();
});
zoomOut.addEventListener("click", () => {
  scale = Math.max(scale - 0.25, 0.65);
  applyArtifact();
});
resetView.addEventListener("click", resetArtifact);

artifactCanvas.addEventListener("pointerdown", (event) => {
  dragging = true;
  dragStart = { x: event.clientX - offsetX, y: event.clientY - offsetY };
  artifactCanvas.classList.add("dragging");
  artifactCanvas.setPointerCapture(event.pointerId);
});
artifactCanvas.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  offsetX = event.clientX - dragStart.x;
  offsetY = event.clientY - dragStart.y;
  applyArtifact();
});
artifactCanvas.addEventListener("pointerup", (event) => {
  dragging = false;
  artifactCanvas.classList.remove("dragging");
  artifactCanvas.releasePointerCapture(event.pointerId);
});
artifactCanvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  scale = THREE.MathUtils.clamp(scale + (event.deltaY < 0 ? 0.16 : -0.16), 0.65, 4);
  applyArtifact();
}, { passive: false });

document.querySelectorAll("[data-move]").forEach((button) => {
  const key = button.dataset.move;
  const start = (event) => { event.preventDefault(); move[key] = true; };
  const stop = (event) => { event.preventDefault(); move[key] = false; };
  button.addEventListener("pointerdown", start);
  button.addEventListener("pointerup", stop);
  button.addEventListener("pointercancel", stop);
  button.addEventListener("pointerleave", stop);
});

let lookPointer = null;
lookPad.addEventListener("pointerdown", (event) => {
  lookPointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
  lookPad.setPointerCapture(event.pointerId);
});
lookPad.addEventListener("pointermove", (event) => {
  if (!lookPointer || lookPointer.id !== event.pointerId) return;
  const dx = event.clientX - lookPointer.x;
  const dy = event.clientY - lookPointer.y;
  lookPointer.x = event.clientX;
  lookPointer.y = event.clientY;
  camera.rotation.order = "YXZ";
  camera.rotation.y -= dx * 0.006;
  camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x - dy * 0.005, -1.2, 1.2);
});
lookPad.addEventListener("pointerup", (event) => {
  if (lookPointer?.id === event.pointerId) lookPointer = null;
});

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
});

roomImage.addEventListener("error", () => {
  status.textContent = "The room loaded, but an inspection image could not be prepared.";
});

animate();