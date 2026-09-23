import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const canvas = document.getElementById("officeCanvas");
const entryOverlay = document.getElementById("entryOverlay");
const enterButton = document.getElementById("enterOffice");
const loadStatus = document.getElementById("loadStatus");
const promptEl = document.getElementById("interactionPrompt");
const grabButton = document.getElementById("grabButton");
const useButton = document.getElementById("useButton");
const inspector = document.getElementById("inspector");
const closeInspector = document.getElementById("closeInspector");
const artifactModel = document.getElementById("artifactModel");
const artifactImage = document.getElementById("artifactImage");
const artifactFallback = document.getElementById("artifactFallback");
const artifactKicker = document.getElementById("artifactKicker");
const artifactTitle = document.getElementById("artifactTitle");
const artifactSubtitle = document.getElementById("artifactSubtitle");
const artifactBody = document.getElementById("artifactBody");
const toast = document.getElementById("toast");
const moveZone = document.getElementById("moveZone");
const moveKnob = document.getElementById("moveKnob");
const lookZone = document.getElementById("lookZone");
const lookKnob = document.getElementById("lookKnob");

const isCoarse = matchMedia("(pointer: coarse)").matches;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x03070d);
scene.fog = new THREE.FogExp2(0x03070d, 0.035);

const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.05, 70);
camera.position.set(0, 1.68, 7.2);
camera.rotation.order = "YXZ";

const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isCoarse, alpha: false, powerPreference: "high-performance" });
renderer.setSize(innerWidth, innerHeight, false);
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isCoarse ? 1.35 : 1.8));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const loader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
const raycaster = new THREE.Raycaster();
const center = new THREE.Vector2(0, 0);
const clock = new THREE.Clock();

const keyState = new Set();
let interactives = [];
const loadedObjects = new Map();
const proxyObjects = new Map();
const moveInput = new THREE.Vector2();
const lookInput = new THREE.Vector2();

let currentKey = null;
let started = false;
let paused = false;
let inspectorOpen = false;
let yaw = 0;
let pitch = -0.02;
let draggingLook = false;
let lastPointer = new THREE.Vector2();
let lampState = 0;
let toastTimer = null;
let loadCount = 0;
const totalLoads = 11;

const panelData = {
  desk: {
    kicker: "Founder’s Office",
    title: "The Desk",
    subtitle: "The working center of the room.",
    model: "/NBL_Office_Desk.glb",
    body: `<p>The Founder’s desk is not a display case. It is the working surface where New Beansland keeps becoming New Beansland.</p><p class="closing-line">Work lives here.</p>`
  },
  founder: {
    kicker: "Founder",
    title: "Jamel Hawkins",
    subtitle: "Still walking. Still building.",
    model: "/Founder_Plaque.glb",
    image: "/founder-nameplate.png",
    body: `
      <p>New Beansland was built by Founder — the mind behind the stories, questions, worlds, and experiments that live here.</p>
      <p>This space connects books, ideas, philosophy, imagination, memory, and lived experience into one universe. It is not just a website. It is a room full of paths.</p>
      <p>Some lead to stories. Some lead to questions. Some lead to worlds. All of them lead back to intention.</p>
      <p><strong>Contact the Founder</strong><br><a href="mailto:foundernewbeansland@gmail.com">foundernewbeansland@gmail.com</a></p>
      <p class="closing-line">Builder of New Beansland. Keeper of the walk.</p>
    `
  },
  banner: {
    kicker: "About New Beansland",
    title: "If it is is it?",
    subtitle: "Stories. Questions. Worlds.",
    image: "/if-it-is-is-it-banner.png",
    body: `
      <p>New Beansland is a creative home built for people who do not just look — they notice.</p>
      <p>It is a place where storytelling, philosophy, imagination, memory, and meaning can live together. The books are not isolated projects. They are connected rooms in a larger universe.</p>
      <ul><li><strong>Stories</strong> for the worlds we enter.</li><li><strong>Questions</strong> for the things we cannot ignore.</li><li><strong>Worlds</strong> for the spaces beyond the page.</li><li><strong>Voices</strong> for the people, ideas, and presence inside it all.</li></ul>
      <p class="closing-line">This is not just a page. It is a world under construction.</p>
    `
  },
  doctorate: {
    kicker: "Founder Academic Record",
    title: "Doctor of Narrative Architecture",
    subtitle: "New Beansland Institute of Evidence-Based Practice",
    model: "/Institute_Of_Evidence-Based_Practice_Certificate.glb",
    image: "/founder-doctorate-degree.png",
    body: `
      <p>This degree represents advanced study in perception, narrative systems, worldbuilding, civic imagination, and narrative architecture.</p>
      <p><strong>Areas of distinction</strong></p>
      <ul><li>Story structure and universe design</li><li>Philosophical inquiry</li><li>Ethical imagination</li><li>Symbolic and narrative systems</li><li>Connecting thought to lived experience</li></ul>
      <p>It recognizes the ability to take an idea apart, understand its structure, and build a world strong enough to hold it.</p>
      <p class="closing-line">In imagination he built.</p>
    `
  },
  masters: {
    kicker: "Founder Academic Record",
    title: "Master of Applied Skepticism",
    subtitle: "Analogical Systems · Inquiry · Evidence",
    model: "/Master_Of_Applied_Skepticism_Certificate-optimized.glb",
    image: "/founder-masters-degree.png",
    body: `
      <p>This degree supports the first. It represents training in applied skepticism, analogical reasoning, inquiry, evidence, and recognizing when an idea or comparison does not fit.</p>
      <p><strong>Core disciplines</strong></p>
      <ul><li>Category recognition</li><li>Evidence inspection</li><li>Analogical reasoning</li><li>Question-based inquiry</li><li>Knowing what room you are in</li></ul>
      <p>Together, the degrees tell the story: first learn how to identify broken reasoning, then learn how to build better systems, stories, and worlds.</p>
      <p class="closing-line">In skepticism he trusted. In understanding he built.</p>
    `
  },
  graduation: {
    kicker: "Framed Record",
    title: "Graduation Remarks",
    subtitle: "A speech about the work behind the walk.",
    image: "/founder-graduation-remarks.png",
    body: `
      <p>This frame preserves the Founder’s Graduation Remarks as part of the office’s official history.</p>
      <p>The message is not that the work is finished. The message is that learning how to question, inspect, imagine, and build created a responsibility to keep going.</p>
      <p>The degree marks an achievement. The remarks explain what the achievement is for.</p>
      <p class="closing-line">The ceremony ended. The walk did not.</p>
    `
  },
  yolanda: {
    kicker: "Family Keepsake",
    title: "For You, Mom",
    subtitle: "Yolanda · The one-room light",
    model: "/For You, Mom Keepsake Necklace_Meshy_AI_2026-08-04_bb6999.glb",
    image: "/founders-office-yolanda.png",
    body: `
      <p>You are my first love, my forever angel, and the reason I am who I am. Everything I do, I do for you.</p>
      <p>The office lighting carries a quiet Easter egg from the line:</p>
      <p><strong>“Mama, you were magic in a one-room light.”</strong></p>
      <p>This keepsake explains where the Founder came from. The lamp does not merely light the room; it ties the room back to Yolanda.</p>
      <p class="closing-line">I love you.</p>
    `
  },
  family: {
    kicker: "New Beansland Family",
    title: "Who Walks With Me",
    subtitle: "The family was not assembled. It accumulated.",
    image: "/new-beansland-family-photo.png",
    body: `
      <p>The framed photograph represents the New Beansland family — not a collection of interchangeable characters, but a family in which every member has a distinct origin, voice, personality, role, and place.</p>
      <p>Some arrived early. Some arrived later. Some were expected. Some became part of the environment before anyone realized the room had changed.</p>
      <p>The photograph grounds the office in the truth that the worlds were not built alone.</p>
      <p class="closing-line">Different paths. One family.</p>
    `
  },
  chair: {
    kicker: "Still Walking",
    title: "The Chair Is Empty",
    subtitle: "The Founder is not absent.",
    model: "/New_Beansland_University_Crest-optimized.glb",
    image: "/official-nbl-emblem.png",
    body: `
      <p>The empty chair represents presence and purpose.</p>
      <p>The Founder is still walking, still building, and still moving through New Beansland. The chair does not mark disappearance. It marks work that continues beyond the room.</p>
      <p class="closing-line">Still building. Still thinking. Still walking.</p>
    `
  },
  clue: {
    kicker: "Clue",
    title: "If it’s too dark, use a light.",
    subtitle: "The room is telling you what to touch.",
    model: "/Use_A_Light_.glb",
    image: "/desk-clue-plaque.png",
    body: `
      <p>The lamp works in three touches:</p>
      <ul><li><strong>First touch:</strong> the room begins to wake.</li><li><strong>Second touch:</strong> the walk is fully lit and the chair unlocks.</li><li><strong>Third touch:</strong> the room returns to rest.</li></ul>
      <p class="closing-line">One room. One light.</p>
    `
  },
  lamp: {
    kicker: "One-room light",
    title: "The Light",
    subtitle: "Use it. The room changes.",
    model: "/NBL_Desk_Lamp.glb",
    image: "/nbl-office-lamp.png",
    body: `<p>The lamp is an object and a key. In this room, light is part of the story.</p><p class="closing-line">One room. One light.</p>`
  },
  bean: {
    kicker: "Desk Toy",
    title: "Beanie Bean",
    subtitle: "A little piece of New Beansland on the desk.",
    model: "/Beanie Bean_Meshy_AI_2026-09-20_19b948-optimized.glb",
    body: `<p>Pick it up, turn it around, and put it back in the room. New Beansland keeps little pieces of itself everywhere.</p>`
  },
  toy1: {
    kicker: "NBL Model",
    title: "NBL Model Toy",
    subtitle: "A physical little world inside the bigger one.",
    model: "/NBL_Model_Toy.glb",
    body: `<p>One of the New Beansland model figures kept in the Founder’s Office.</p>`
  },
  toy2: {
    kicker: "NBL Model",
    title: "NBL Model Toy II",
    subtitle: "Another piece from the shelf and the floor.",
    model: "/NBL_Model_Toy_2-optimized.glb",
    body: `<p>The second New Beansland model figure. The office is allowed to feel lived in, not staged.</p>`
  }
};

const materials = {
  wall: new THREE.MeshStandardMaterial({ color: 0x0a1624, roughness: 0.82, metalness: 0.02 }),
  wallInset: new THREE.MeshStandardMaterial({ color: 0x101f31, roughness: 0.72, metalness: 0.03 }),
  trim: new THREE.MeshStandardMaterial({ color: 0xb89545, roughness: 0.34, metalness: 0.65 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x2f1b12, roughness: 0.54, metalness: 0.04 }),
  woodDark: new THREE.MeshStandardMaterial({ color: 0x160d09, roughness: 0.68, metalness: 0.02 }),
  leather: new THREE.MeshStandardMaterial({ color: 0x14100e, roughness: 0.5, metalness: 0.02 }),
  rug: new THREE.MeshStandardMaterial({ color: 0x17253a, roughness: 0.9, metalness: 0 })
};

function meshBox(name, size, pos, material, cast = false, receive = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), material);
  mesh.name = name;
  mesh.position.copy(pos);
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  scene.add(mesh);
  return mesh;
}

function addTrim(x, y, z, sx, sy, sz) {
  return meshBox("Gold trim", new THREE.Vector3(sx, sy, sz), new THREE.Vector3(x, y, z), materials.trim);
}

function tagInteractive(root, key) {
  root.userData.interactionKey = key;
  root.traverse((child) => {
    if (child.isMesh) {
      child.userData.interactionKey = key;
      child.castShadow = true;
      child.receiveShadow = true;
      interactives.push(child);
    }
  });
}

function unregisterInteractive(root) {
  const removed = new Set();
  root.traverse((child) => { if (child.isMesh) removed.add(child); });
  interactives = interactives.filter((mesh) => !removed.has(mesh));
}

function addPictureProxy(key, url, position, size) {
  const group = new THREE.Group();
  group.name = `Proxy ${key}`;
  group.position.copy(position);

  const frame = new THREE.Mesh(new THREE.BoxGeometry(size.x + .12, size.y + .12, .09), materials.woodDark);
  frame.castShadow = true;
  group.add(frame);

  const gold = new THREE.Mesh(new THREE.BoxGeometry(size.x + .055, size.y + .055, .035), materials.trim);
  gold.position.z = .065;
  group.add(gold);

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(size.x, size.y), new THREE.MeshBasicMaterial({ color: 0xd8c9a7, side: THREE.DoubleSide }));
  plane.position.z = .092;
  group.add(plane);

  textureLoader.load(encodeURI(url), (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    plane.material.map = tex;
    plane.material.color.set(0xffffff);
    plane.material.needsUpdate = true;
  });

  tagInteractive(group, key);
  scene.add(group);
  proxyObjects.set(key, group);
  return group;
}

function buildRoom() {
  meshBox("Floor", new THREE.Vector3(12, .16, 14), new THREE.Vector3(0, -.08, 0), materials.wood, false, true);
  meshBox("Back wall", new THREE.Vector3(12, 5.9, .18), new THREE.Vector3(0, 2.95, -5.4), materials.wall);
  meshBox("Left wall", new THREE.Vector3(.18, 5.9, 14), new THREE.Vector3(-6, 2.95, 0), materials.wall);
  meshBox("Right wall", new THREE.Vector3(.18, 5.9, 14), new THREE.Vector3(6, 2.95, 0), materials.wall);
  meshBox("Ceiling", new THREE.Vector3(12, .14, 14), new THREE.Vector3(0, 5.9, 0), materials.woodDark);

  const rug = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 5.6), materials.rug);
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, .012, -1.15);
  rug.receiveShadow = true;
  scene.add(rug);

  for (const x of [-4.55, -1.55, 1.55, 4.55]) {
    meshBox("Wall panel", new THREE.Vector3(2.55, 4.6, .05), new THREE.Vector3(x, 3.0, -5.27), materials.wallInset);
    addTrim(x - 1.28, 3.0, -5.21, .04, 4.65, .035);
    addTrim(x + 1.28, 3.0, -5.21, .04, 4.65, .035);
  }
  addTrim(0, .62, -5.2, 11.6, .05, .04);
  addTrim(0, 5.35, -5.2, 11.6, .05, .04);

  for (const side of [-1, 1]) {
    meshBox("Side inset", new THREE.Vector3(.05, 3.25, 3.4), new THREE.Vector3(side * 5.89, 3.0, -1.2), materials.wallInset);
  }

  const chair = new THREE.Group();
  chair.name = "Founder chair";
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.15, .18, 1.05), materials.leather);
  seat.position.y = .82;
  chair.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.28, 1.72, .18), materials.leather);
  back.position.set(0, 1.72, .42);
  back.rotation.x = -.08;
  chair.add(back);
  for (const sx of [-.48, .48]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(.12, .8, .12), materials.woodDark);
    leg.position.set(sx, .4, sx < 0 ? -.32 : .32);
    chair.add(leg);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(.12, .13, .92), materials.woodDark);
    arm.position.set(sx * 1.12, 1.18, 0);
    chair.add(arm);
  }
  chair.position.set(0, 0, -3.0);
  scene.add(chair);
  tagInteractive(chair, "chair");

  addPictureProxy("graduation", "/founder-graduation-remarks.png", new THREE.Vector3(-4.35, 3.18, -5.12), new THREE.Vector2(1.65, 2.0));
  addPictureProxy("banner", "/if-it-is-is-it-banner.png", new THREE.Vector3(-1.35, 3.48, -5.10), new THREE.Vector2(3.6, 1.55));
  addPictureProxy("doctorate", "/founder-doctorate-degree.png", new THREE.Vector3(2.45, 3.35, -5.11), new THREE.Vector2(1.45, 1.85));
  addPictureProxy("masters", "/founder-masters-degree.png", new THREE.Vector3(4.18, 3.35, -5.11), new THREE.Vector2(1.45, 1.85));
  addPictureProxy("family", "/new-beansland-family-photo.png", new THREE.Vector3(-2.95, 1.45, -4.72), new THREE.Vector2(1.25, .88));
  addPictureProxy("clue", "/desk-clue-plaque.png", new THREE.Vector3(0, .86, -1.86), new THREE.Vector2(1.58, .55));
}

function addLights() {
  scene.add(new THREE.HemisphereLight(0x8ba4c7, 0x24160f, 1.0));

  const key = new THREE.DirectionalLight(0xffd9a5, 2.0);
  key.position.set(-3.5, 5.6, 4.8);
  key.castShadow = true;
  key.shadow.mapSize.set(isCoarse ? 1024 : 2048, isCoarse ? 1024 : 2048);
  key.shadow.camera.left = -8;
  key.shadow.camera.right = 8;
  key.shadow.camera.top = 8;
  key.shadow.camera.bottom = -8;
  scene.add(key);

  for (const x of [-3.7, 0, 3.7]) {
    const light = new THREE.PointLight(0xffd08b, .85, 9, 2);
    light.position.set(x, 5.1, -1.0);
    scene.add(light);
  }

  const lampLight = new THREE.PointLight(0xffb84f, 0, 7, 1.7);
  lampLight.position.set(1.95, 2.15, -1.35);
  lampLight.castShadow = !isCoarse;
  scene.add(lampLight);
  scene.userData.lampLight = lampLight;

  const chairGlow = new THREE.PointLight(0xffd06c, 0, 4, 2);
  chairGlow.position.set(0, 1.8, -3.0);
  scene.add(chairGlow);
  scene.userData.chairGlow = chairGlow;
}

function fitModel(root, targetSize, desired, anchor = "ground") {
  root.position.set(0, 0, 0);
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxAxis = Math.max(size.x || 1, size.y || 1, size.z || 1);
  root.scale.multiplyScalar(targetSize / maxAxis);

  const fitted = new THREE.Box3().setFromObject(root);
  const center3 = new THREE.Vector3();
  fitted.getCenter(center3);

  if (anchor === "center") {
    root.position.set(desired.x - center3.x, desired.y - center3.y, desired.z - center3.z);
  } else {
    root.position.set(desired.x - center3.x, desired.y - fitted.min.y, desired.z - center3.z);
  }
}

function markLoaded(label) {
  loadCount += 1;
  loadStatus.textContent = loadCount < totalLoads ? `Loading artifacts ${loadCount}/${totalLoads}` : "Founder’s Office ready";
  if (loadCount >= totalLoads) setTimeout(() => { loadStatus.style.opacity = ".72"; }, 1200);
}

async function loadWorldModel(spec) {
  return new Promise((resolve) => {
    loader.load(encodeURI(spec.url), (gltf) => {
      const root = gltf.scene;
      root.name = spec.key;
      root.rotation.set(spec.rotation.x, spec.rotation.y, spec.rotation.z);
      fitModel(root, spec.target, spec.position, spec.anchor || "ground");
      tagInteractive(root, spec.interaction || spec.key);
      scene.add(root);
      loadedObjects.set(spec.key, root);

      if (spec.replaceProxy && proxyObjects.has(spec.replaceProxy)) {
        const proxy = proxyObjects.get(spec.replaceProxy);
        unregisterInteractive(proxy);
        scene.remove(proxy);
        proxyObjects.delete(spec.replaceProxy);
      }
      markLoaded(spec.label || spec.key);
      resolve(root);
    }, undefined, () => {
      markLoaded(`${spec.label || spec.key} kept as original image`);
      resolve(null);
    });
  });
}

async function loadArtifacts() {
  const specs = [
    { key: "desk", label: "Founder desk", url: "/NBL_Office_Desk.glb", position: new THREE.Vector3(0, 0, -1.65), rotation: new THREE.Euler(0, Math.PI, 0), target: 5.0, interaction: "desk" },
    { key: "lamp", label: "Desk lamp", url: "/NBL_Desk_Lamp.glb", position: new THREE.Vector3(1.95, 1.18, -1.45), rotation: new THREE.Euler(0, -.45, 0), target: 1.3, interaction: "lamp" },
    { key: "bean", label: "Beanie Bean", url: "/Beanie Bean_Meshy_AI_2026-09-20_19b948-optimized.glb", position: new THREE.Vector3(.8, 1.2, -1.65), rotation: new THREE.Euler(0, -.25, 0), target: .74, interaction: "bean" },
    { key: "toy2", label: "Model Toy II", url: "/NBL_Model_Toy_2-optimized.glb", position: new THREE.Vector3(1.3, .02, .65), rotation: new THREE.Euler(0, -2.35, 0), target: 1.08, interaction: "toy2" },
    { key: "toy1", label: "Model Toy", url: "/NBL_Model_Toy.glb", position: new THREE.Vector3(-1.35, .02, .45), rotation: new THREE.Euler(0, 2.5, 0), target: 1.12, interaction: "toy1" },
    { key: "founder", label: "Founder plaque", url: "/Founder_Plaque.glb", position: new THREE.Vector3(-.85, 1.15, -1.86), rotation: new THREE.Euler(0, .08, 0), target: .95, interaction: "founder" },
    { key: "yolanda", label: "Yolanda keepsake", url: "/For You, Mom Keepsake Necklace_Meshy_AI_2026-08-04_bb6999.glb", position: new THREE.Vector3(2.75, 1.18, -1.72), rotation: new THREE.Euler(0, -.3, 0), target: .62, interaction: "yolanda" },
    { key: "crest", label: "University crest", url: "/New_Beansland_University_Crest-optimized.glb", position: new THREE.Vector3(0, 1.72, -2.53), rotation: new THREE.Euler(0, 0, 0), target: .72, interaction: "chair", anchor: "center" },
    { key: "doctorate-model", label: "Evidence-Based Practice certificate", url: "/Institute_Of_Evidence-Based_Practice_Certificate.glb", position: new THREE.Vector3(2.45, 3.35, -5.03), rotation: new THREE.Euler(0, 0, 0), target: 1.75, interaction: "doctorate", replaceProxy: "doctorate", anchor: "center" },
    { key: "masters-model", label: "Applied Skepticism certificate", url: "/Master_Of_Applied_Skepticism_Certificate-optimized.glb", position: new THREE.Vector3(4.18, 3.35, -5.03), rotation: new THREE.Euler(0, 0, 0), target: 1.75, interaction: "masters", replaceProxy: "masters", anchor: "center" },
    { key: "clue-model", label: "Use a Light clue", url: "/Use_A_Light_.glb", position: new THREE.Vector3(0, .85, -1.94), rotation: new THREE.Euler(-.05, 0, 0), target: 1.45, interaction: "clue", replaceProxy: "clue", anchor: "center" }
  ];
  for (const spec of specs) await loadWorldModel(spec);
}

function interactionLabel(key) {
  if (!key) return "";
  if (key === "lamp") return "GRAB to inspect · USE the one-room light";
  if (key === "chair" && lampState < 2) return "The chair is waiting for the light";
  return `GRAB · ${panelData[key]?.title || key}`;
}

function updateInteraction() {
  if (!started || paused || inspectorOpen) {
    currentKey = null;
    promptEl.classList.remove("show");
    return;
  }
  raycaster.setFromCamera(center, camera);
  raycaster.far = 4.1;
  const hit = raycaster.intersectObjects(interactives, false)[0];
  currentKey = hit?.object?.userData?.interactionKey || null;
  if (currentKey) {
    promptEl.textContent = interactionLabel(currentKey);
    promptEl.classList.add("show");
  } else {
    promptEl.classList.remove("show");
    promptEl.textContent = "";
  }
  grabButton.style.opacity = currentKey ? "1" : ".42";
  useButton.style.opacity = currentKey === "lamp" ? "1" : ".42";
}

function interact(preferUse = false) {
  if (!currentKey || inspectorOpen || paused) return;
  if (currentKey === "lamp") {
    if (preferUse) useLamp();
    else openInspector("lamp");
    return;
  }
  if (preferUse) return;
  if (currentKey === "chair" && lampState < 2) {
    showToast("The chair is waiting for the one-room light.");
    return;
  }
  openInspector(currentKey);
}

function useLamp() {
  lampState = (lampState + 1) % 3;
  const lamp = scene.userData.lampLight;
  const chair = scene.userData.chairGlow;
  if (lampState === 1) {
    lamp.intensity = 5.5;
    chair.intensity = 0;
    renderer.toneMappingExposure = 1.08;
    showToast("The room is waking up. One more touch.");
  } else if (lampState === 2) {
    lamp.intensity = 10;
    chair.intensity = 5.2;
    renderer.toneMappingExposure = 1.17;
    showToast("The walk is lit. The chair is ready.");
  } else {
    lamp.intensity = 0;
    chair.intensity = 0;
    renderer.toneMappingExposure = 1.0;
    showToast("The room returns to rest.");
  }
}

function openInspector(key) {
  const data = panelData[key];
  if (!data) return;
  inspectorOpen = true;
  paused = true;
  artifactKicker.textContent = data.kicker || "";
  artifactTitle.textContent = data.title || "";
  artifactSubtitle.textContent = data.subtitle || "";
  artifactBody.innerHTML = data.body || "";
  artifactFallback.hidden = true;
  artifactModel.hidden = true;
  artifactImage.hidden = true;
  artifactModel.removeAttribute("src");
  artifactImage.removeAttribute("src");

  if (data.model) {
    artifactModel.src = encodeURI(data.model);
    artifactModel.alt = data.title;
    artifactModel.hidden = false;
    artifactModel.addEventListener("error", () => {
      artifactModel.hidden = true;
      if (data.image) {
        artifactImage.src = data.image;
        artifactImage.alt = data.title;
        artifactImage.hidden = false;
      } else {
        artifactFallback.hidden = false;
      }
    }, { once: true });
  } else if (data.image) {
    artifactImage.src = data.image;
    artifactImage.alt = data.title;
    artifactImage.hidden = false;
  } else {
    artifactFallback.hidden = false;
  }

  inspector.hidden = false;
  closeInspector.focus();
}

function closeArtifact() {
  inspector.hidden = true;
  inspectorOpen = false;
  paused = false;
  artifactModel.removeAttribute("src");
  artifactImage.removeAttribute("src");
  canvas.focus?.();
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function updateMovement(dt) {
  if (!started || paused || inspectorOpen) return;
  let x = moveInput.x;
  let y = moveInput.y;

  if (keyState.has("KeyA") || keyState.has("ArrowLeft")) x -= 1;
  if (keyState.has("KeyD") || keyState.has("ArrowRight")) x += 1;
  if (keyState.has("KeyW") || keyState.has("ArrowUp")) y += 1;
  if (keyState.has("KeyS") || keyState.has("ArrowDown")) y -= 1;

  const len = Math.hypot(x, y);
  if (len > 1) { x /= len; y /= len; }

  const speed = keyState.has("ShiftLeft") ? 4.0 : 2.55;
  const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  const next = camera.position.clone()
    .addScaledVector(forward, y * speed * dt)
    .addScaledVector(right, x * speed * dt);

  next.x = THREE.MathUtils.clamp(next.x, -5.35, 5.35);
  next.z = THREE.MathUtils.clamp(next.z, -4.72, 6.35);

  const inDeskX = Math.abs(next.x) < 2.7;
  const inDeskZ = next.z < -.35 && next.z > -2.8;
  if (!(inDeskX && inDeskZ)) {
    camera.position.x = next.x;
    camera.position.z = next.z;
  }
  camera.position.y = 1.68;
}

function updateLook(dt) {
  if (lookInput.lengthSq() > 0.0001 && started && !paused && !inspectorOpen) {
    yaw -= lookInput.x * dt * 2.3;
    pitch -= lookInput.y * dt * 1.8;
  }
  pitch = THREE.MathUtils.clamp(pitch, -1.05, .92);
  camera.rotation.set(pitch, yaw, 0);
}

function setupKeyboardAndMouse() {
  addEventListener("keydown", (e) => {
    keyState.add(e.code);
    if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code)) e.preventDefault();
    if (e.code === "KeyE") interact(false);
    if (e.code === "KeyF") interact(true);
    if (e.code === "Escape" && inspectorOpen) closeArtifact();
  });
  addEventListener("keyup", (e) => keyState.delete(e.code));

  canvas.addEventListener("pointerdown", (e) => {
    if (isCoarse || !started || inspectorOpen) return;
    draggingLook = true;
    lastPointer.set(e.clientX, e.clientY);
    canvas.setPointerCapture?.(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!draggingLook || isCoarse || inspectorOpen) return;
    const dx = e.clientX - lastPointer.x;
    const dy = e.clientY - lastPointer.y;
    lastPointer.set(e.clientX, e.clientY);
    yaw -= dx * .0031;
    pitch -= dy * .0031;
  });
  const endDrag = (e) => {
    draggingLook = false;
    try { canvas.releasePointerCapture?.(e.pointerId); } catch {}
  };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  canvas.addEventListener("dblclick", () => interact(false));
}

function bindStick(zone, knob, target, look = false) {
  let pointerId = null;
  let centerPt = { x: 0, y: 0 };
  const radius = 42;

  const reset = () => {
    pointerId = null;
    target.set(0, 0);
    knob.style.transform = "translate(-50%,-50%)";
  };

  zone.addEventListener("pointerdown", (e) => {
    if (!started || inspectorOpen || pointerId !== null) return;
    pointerId = e.pointerId;
    const rect = zone.getBoundingClientRect();
    centerPt = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    zone.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  zone.addEventListener("pointermove", (e) => {
    if (e.pointerId !== pointerId) return;
    let dx = e.clientX - centerPt.x;
    let dy = e.clientY - centerPt.y;
    const d = Math.hypot(dx, dy);
    if (d > radius) { dx *= radius / d; dy *= radius / d; }
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    if (look) target.set(dx / radius, dy / radius);
    else target.set(dx / radius, -dy / radius);
    e.preventDefault();
  });

  zone.addEventListener("pointerup", reset);
  zone.addEventListener("pointercancel", reset);
}

function onResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isCoarse ? 1.35 : 1.8));
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), .05);
  updateLook(dt);
  updateMovement(dt);
  updateInteraction();
  renderer.render(scene, camera);
}

buildRoom();
addLights();
setupKeyboardAndMouse();
bindStick(moveZone, moveKnob, moveInput, false);
bindStick(lookZone, lookKnob, lookInput, true);

grabButton.addEventListener("pointerdown", (e) => { e.preventDefault(); interact(false); });
useButton.addEventListener("pointerdown", (e) => { e.preventDefault(); interact(true); });
closeInspector.addEventListener("click", closeArtifact);
inspector.addEventListener("click", (e) => { if (e.target === inspector) closeArtifact(); });
enterButton.addEventListener("click", () => {
  started = true;
  entryOverlay.hidden = true;
  showToast("Find the one-room light. Look closely.");
  canvas.focus?.();
});

addEventListener("resize", onResize);
document.addEventListener("visibilitychange", () => { paused = document.hidden || inspectorOpen; });

animate();
loadArtifacts();
