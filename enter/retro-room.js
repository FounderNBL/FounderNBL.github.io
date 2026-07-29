import * as THREE from "three";

const graphicsBudget = document.documentElement.dataset.nblGraphicsBudget || "full";
const mobileGraphics = graphicsBudget !== "full";
const conservativeGraphics = graphicsBudget === "conservative";
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

let capturedScene = null;
let capturedRenderer = null;
let installed = false;
let dustMotes = null;
let lampBulbMaterial = null;
let lampGlow = null;
let puzzleSpotlight = null;

const originalSceneAdd = THREE.Scene.prototype.add;
THREE.Scene.prototype.add = function captureFounderScene(...objects) {
  capturedScene ||= this;
  return originalSceneAdd.apply(this, objects);
};

const originalRender = THREE.WebGLRenderer.prototype.render;
THREE.WebGLRenderer.prototype.render = function renderRetroFounderRoom(scene, camera) {
  capturedScene ||= scene;
  capturedRenderer ||= this;

  if (!installed && scene?.children?.length > 10) installRetroRoom(scene, this);
  updateRetroRoom(scene);

  return originalRender.call(this, scene, camera);
};

function seededRandom(seed = 1729) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function pixelTexture(size, draw, repeatX = 1, repeatY = 1) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { alpha: false });
  draw(context, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestMipmapNearestFilter;
  texture.anisotropy = Math.min(2, capturedRenderer?.capabilities?.getMaxAnisotropy?.() || 2);
  return texture;
}

function material({ color = 0xffffff, map = null, roughness = 0.75, metalness = 0.08, emissive = 0x000000, emissiveIntensity = 0 } = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    map,
    roughness,
    metalness,
    emissive,
    emissiveIntensity,
    flatShading: true
  });
}

function buildMaterials() {
  const wood = pixelTexture(64, (context, size) => {
    const random = seededRandom(91);
    context.fillStyle = "#59331d";
    context.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 4) {
      const value = 44 + Math.floor(random() * 22);
      context.fillStyle = `rgb(${value + 42},${value + 10},${Math.floor(value / 2)})`;
      context.fillRect(0, y, size, 2);
    }
    for (let i = 0; i < 18; i += 1) {
      context.fillStyle = "rgba(30,14,7,.55)";
      context.fillRect(Math.floor(random() * size), Math.floor(random() * size), 8 + Math.floor(random() * 16), 1);
    }
  }, 3, 1);

  const darkWood = pixelTexture(64, (context, size) => {
    const random = seededRandom(1337);
    context.fillStyle = "#23130c";
    context.fillRect(0, 0, size, size);
    for (let x = 0; x < size; x += 5) {
      context.fillStyle = random() > 0.5 ? "#321a10" : "#170d08";
      context.fillRect(x, 0, 2, size);
    }
    for (let i = 0; i < 24; i += 1) {
      context.fillStyle = "rgba(103,57,28,.3)";
      context.fillRect(Math.floor(random() * size), Math.floor(random() * size), 1, 9);
    }
  }, 2, 2);

  const floor = pixelTexture(64, (context, size) => {
    const random = seededRandom(2026);
    context.fillStyle = "#28170e";
    context.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 8) {
      context.fillStyle = "#100906";
      context.fillRect(0, y, size, 1);
      const offset = (Math.floor(y / 8) % 2) * 16;
      for (let x = -offset; x < size; x += 32) {
        context.fillStyle = "rgba(8,5,3,.82)";
        context.fillRect(x, y, 1, 8);
        context.fillStyle = random() > 0.5 ? "rgba(132,76,38,.22)" : "rgba(76,40,20,.22)";
        context.fillRect(x + 2, y + 2, 20, 1);
      }
    }
  }, 5, 4);

  const plaster = pixelTexture(32, (context, size) => {
    const random = seededRandom(404);
    context.fillStyle = "#17212c";
    context.fillRect(0, 0, size, size);
    for (let i = 0; i < 180; i += 1) {
      const shade = 18 + Math.floor(random() * 24);
      context.fillStyle = `rgba(${shade + 8},${shade + 15},${shade + 26},.32)`;
      context.fillRect(Math.floor(random() * size), Math.floor(random() * size), 1, 1);
    }
  }, 6, 3);

  const rug = pixelTexture(64, (context, size) => {
    context.fillStyle = "#061426";
    context.fillRect(0, 0, size, size);
    context.strokeStyle = "#956528";
    context.lineWidth = 3;
    context.strokeRect(3, 3, size - 6, size - 6);
    context.strokeStyle = "#d2a84c";
    context.lineWidth = 1;
    context.strokeRect(8, 8, size - 16, size - 16);
    for (let y = 12; y < size - 12; y += 10) {
      for (let x = 12; x < size - 12; x += 10) {
        context.fillStyle = (x + y) % 20 === 0 ? "#b47b30" : "#183149";
        context.fillRect(x, y, 3, 3);
      }
    }
  }, 4, 2);

  const leather = pixelTexture(32, (context, size) => {
    const random = seededRandom(718);
    context.fillStyle = "#101219";
    context.fillRect(0, 0, size, size);
    for (let i = 0; i < 90; i += 1) {
      const shade = 20 + Math.floor(random() * 18);
      context.fillStyle = `rgba(${shade},${shade},${shade + 6},.55)`;
      context.fillRect(Math.floor(random() * size), Math.floor(random() * size), 1, 1);
    }
  }, 2, 2);

  return {
    floor: material({ map: floor, roughness: 0.9 }),
    plaster: material({ map: plaster, roughness: 0.96 }),
    wood: material({ map: wood, roughness: 0.62 }),
    darkWood: material({ map: darkWood, roughness: 0.72 }),
    rug: material({ map: rug, roughness: 0.92 }),
    leather: material({ map: leather, roughness: 0.82 }),
    brass: material({ color: 0xb88735, roughness: 0.28, metalness: 0.78 }),
    brassDark: material({ color: 0x684019, roughness: 0.45, metalness: 0.58 }),
    navy: material({ color: 0x061426, roughness: 0.82 }),
    black: material({ color: 0x08090d, roughness: 0.8 })
  };
}

function addMesh(scene, geometry, meshMaterial, position, options = {}) {
  const mesh = new THREE.Mesh(geometry, meshMaterial);
  mesh.name = options.name || "retro-detail";
  mesh.position.set(...position);
  if (options.rotation) mesh.rotation.set(...options.rotation);
  mesh.castShadow = options.castShadow !== false;
  mesh.receiveShadow = options.receiveShadow !== false;
  (options.parent || scene).add(mesh);
  return mesh;
}

function box(scene, name, size, position, meshMaterial, options = {}) {
  return addMesh(scene, new THREE.BoxGeometry(...size), meshMaterial, position, { ...options, name });
}

function cylinder(scene, name, radii, height, segments, position, meshMaterial, options = {}) {
  return addMesh(scene, new THREE.CylinderGeometry(radii[0], radii[1], height, segments), meshMaterial, position, { ...options, name });
}

function hideOriginalRoom(scene) {
  const namedOriginals = ["left-wall", "right-wall", "ceiling"];
  namedOriginals.forEach((name) => {
    const object = scene.getObjectByName(name);
    if (object) object.visible = false;
  });

  for (const object of scene.children) {
    if (!object.isMesh || !object.geometry?.parameters) continue;
    const { width, height } = object.geometry.parameters;
    if ((width === 13.8 && height === 7.76) || (width === 18 && height === 14) || (width === 10.5 && height === 6.4)) {
      object.visible = false;
    }
  }
}

function buildRoomShell(scene, materials) {
  box(scene, "retro-floor", [14, 0.18, 12], [0, -0.09, 0.45], materials.floor, { castShadow: false });
  box(scene, "retro-back-wall", [14, 6.4, 0.28], [0, 3.1, -4.58], materials.plaster, { castShadow: false });
  box(scene, "retro-left-wall", [0.28, 6.4, 12], [-7, 3.1, 0.45], materials.plaster, { castShadow: false });
  box(scene, "retro-right-wall", [0.28, 6.4, 12], [7, 3.1, 0.45], materials.plaster, { castShadow: false });
  box(scene, "retro-ceiling", [14, 0.28, 12], [0, 6.22, 0.45], materials.black, { castShadow: false });

  const trims = [
    [[0, 0.52, -4.35], [13.7, 0.18, 0.16], materials.darkWood],
    [[0, 1.2, -4.35], [13.7, 0.12, 0.13], materials.brassDark],
    [[0, 5.77, -4.35], [13.7, 0.19, 0.16], materials.darkWood],
    [[-6.77, 0.52, 0.45], [0.16, 0.18, 11.6], materials.darkWood],
    [[6.77, 0.52, 0.45], [0.16, 0.18, 11.6], materials.darkWood]
  ];
  trims.forEach(([position, size, meshMaterial]) => box(scene, "retro-trim", size, position, meshMaterial, { castShadow: false }));

  for (let x = -5.6; x <= 5.6; x += 2.8) {
    box(scene, "retro-wall-panel", [0.1, 0.58, 0.12], [x, 0.85, -4.34], materials.brassDark, { castShadow: false });
  }
  [-4.6, 0, 4.6].forEach((x) => {
    box(scene, "retro-ceiling-beam", [0.18, 0.22, 11.5], [x, 5.92, 0.45], materials.darkWood, { castShadow: false });
  });
}

function buildRug(scene, materials) {
  addMesh(scene, new THREE.PlaneGeometry(10.7, 6.6), materials.rug, [0, 0.012, 1.4], {
    name: "retro-rug",
    rotation: [-Math.PI / 2, 0, 0],
    castShadow: false
  });
  box(scene, "retro-rug-edge", [10.8, 0.025, 0.08], [0, 0.025, 4.7], materials.brassDark, { castShadow: false });
  box(scene, "retro-rug-edge", [10.8, 0.025, 0.08], [0, 0.025, -1.9], materials.brassDark, { castShadow: false });
  box(scene, "retro-rug-edge", [0.08, 0.025, 6.6], [-5.4, 0.025, 1.4], materials.brassDark, { castShadow: false });
  box(scene, "retro-rug-edge", [0.08, 0.025, 6.6], [5.4, 0.025, 1.4], materials.brassDark, { castShadow: false });
}

function restyleOriginalFurniture(scene, materials) {
  const desk = scene.getObjectByName("desk");
  const deskTop = scene.getObjectByName("desk-top");
  const chairSeat = scene.getObjectByName("chair-seat");
  const chairBack = scene.getObjectByName("chair-back");
  const lampBase = scene.getObjectByName("lamp-base");

  if (desk) desk.material = materials.darkWood;
  if (deskTop) deskTop.material = materials.wood;
  if (chairSeat) chairSeat.material = materials.leather;
  if (chairBack) chairBack.material = materials.leather;
  if (lampBase) lampBase.material = materials.brass;
}

function buildDeskDetails(scene, materials) {
  const group = new THREE.Group();
  group.position.set(0, 0, -0.5);
  scene.add(group);

  box(scene, "retro-desk-front", [8.55, 0.24, 0.18], [0, 1.26, 1.05], materials.wood, { parent: group });
  box(scene, "retro-desk-modesty", [6.8, 0.76, 0.13], [0, 0.72, 0.99], materials.wood, { parent: group });
  box(scene, "retro-desk-foot", [1.15, 0.12, 2.18], [-3.78, 0.08, 0], materials.brassDark, { parent: group });
  box(scene, "retro-desk-foot", [1.15, 0.12, 2.18], [3.78, 0.08, 0], materials.brassDark, { parent: group });

  [-2.85, 0, 2.85].forEach((x) => {
    box(scene, "retro-desk-drawer", [2.25, 0.34, 0.11], [x, 1.08, 1.18], materials.wood, { parent: group });
    cylinder(scene, "retro-desk-knob", [0.055, 0.055], 0.09, 8, [x, 1.08, 1.26], materials.brass, {
      parent: group,
      rotation: [Math.PI / 2, 0, 0]
    });
  });

  [-4.32, 4.32].forEach((x) => {
    box(scene, "retro-desk-cap", [0.18, 1.5, 0.18], [x, 0.82, 1.05], materials.brassDark, { parent: group });
  });
}

function buildChairDetails(scene, materials) {
  const group = new THREE.Group();
  group.position.set(0, 0, -2.0);
  scene.add(group);

  box(scene, "retro-chair-head", [1.42, 0.5, 0.42], [0, 3.48, -0.45], materials.leather, { parent: group });
  box(scene, "retro-chair-arm", [0.22, 0.2, 1.35], [-1.03, 1.58, 0], materials.darkWood, { parent: group });
  box(scene, "retro-chair-arm", [0.22, 0.2, 1.35], [1.03, 1.58, 0], materials.darkWood, { parent: group });
  box(scene, "retro-chair-post", [0.18, 0.62, 0.18], [-1.03, 1.3, 0.28], materials.brassDark, { parent: group });
  box(scene, "retro-chair-post", [0.18, 0.62, 0.18], [1.03, 1.3, 0.28], materials.brassDark, { parent: group });
  cylinder(scene, "retro-chair-column", [0.18, 0.18], 0.82, 8, [0, 0.58, 0], materials.brassDark, { parent: group });

  for (let i = 0; i < 5; i += 1) {
    const angle = (Math.PI * 2 * i) / 5;
    const x = Math.cos(angle) * 0.72;
    const z = Math.sin(angle) * 0.72;
    const leg = box(scene, "retro-chair-leg", [0.9, 0.12, 0.16], [x * 0.55, 0.22, z * 0.55], materials.brassDark, { parent: group });
    leg.rotation.y = -angle;
    cylinder(scene, "retro-chair-wheel", [0.12, 0.12], 0.1, 8, [x, 0.12, z], materials.black, {
      parent: group,
      rotation: [Math.PI / 2, 0, 0]
    });
  }
}

function buildBookcase(scene, materials, x, seed) {
  const group = new THREE.Group();
  group.position.set(x, 0, -3.45);
  scene.add(group);

  box(scene, "retro-bookcase-back", [2.05, 4.6, 0.42], [0, 2.45, 0.25], materials.darkWood, { parent: group });
  box(scene, "retro-bookcase-top", [2.3, 0.22, 0.75], [0, 4.85, 0], materials.wood, { parent: group });
  box(scene, "retro-bookcase-side", [0.2, 4.7, 0.8], [-1.02, 2.42, 0], materials.wood, { parent: group });
  box(scene, "retro-bookcase-side", [0.2, 4.7, 0.8], [1.02, 2.42, 0], materials.wood, { parent: group });

  const bookMaterials = [0x7b2531, 0x1f4b65, 0x66511c, 0x3f2b58, 0x28503d, 0x8a5127].map((color) => material({ color, roughness: 0.84 }));
  const random = seededRandom(seed);

  for (let shelf = 0; shelf < 4; shelf += 1) {
    const shelfY = 0.72 + shelf * 1.04;
    box(scene, "retro-bookcase-shelf", [2.03, 0.13, 0.82], [0, shelfY, -0.02], materials.wood, { parent: group });
    let cursor = -0.84;
    while (cursor < 0.8) {
      const width = 0.14 + random() * 0.13;
      const height = 0.52 + random() * 0.28;
      const depth = 0.38 + random() * 0.18;
      box(scene, "retro-book", [width, height, depth], [cursor + width / 2, shelfY + 0.08 + height / 2, -0.18], bookMaterials[Math.floor(random() * bookMaterials.length)], {
        parent: group,
        castShadow: false
      });
      cursor += width + 0.035;
    }
  }
}

function buildSideTable(scene, materials, x) {
  const group = new THREE.Group();
  group.position.set(x, 0, -1.88);
  scene.add(group);
  box(scene, "retro-side-table-top", [1.82, 0.18, 1.3], [0, 1.16, 0], materials.wood, { parent: group });
  box(scene, "retro-side-table-body", [1.5, 0.88, 1.05], [0, 0.66, 0], materials.darkWood, { parent: group });
  box(scene, "retro-side-table-drawer", [1.26, 0.28, 0.08], [0, 0.88, 0.57], materials.wood, { parent: group });
  cylinder(scene, "retro-side-table-knob", [0.05, 0.05], 0.08, 8, [0, 0.88, 0.64], materials.brass, {
    parent: group,
    rotation: [Math.PI / 2, 0, 0]
  });
}

function buildDoor(scene, materials) {
  const group = new THREE.Group();
  group.position.set(-5.65, 0, 3.6);
  group.rotation.y = Math.PI / 2;
  scene.add(group);
  box(scene, "retro-office-door", [2.15, 4.25, 0.24], [0, 2.12, 0], materials.darkWood, { parent: group });
  box(scene, "retro-door-panel", [1.55, 1.45, 0.08], [0, 2.85, 0.16], materials.wood, { parent: group });
  box(scene, "retro-door-panel", [1.55, 1.35, 0.08], [0, 1.08, 0.16], materials.wood, { parent: group });
  cylinder(scene, "retro-door-knob", [0.1, 0.1], 0.12, 8, [0.72, 2.0, 0.2], materials.brass, {
    parent: group,
    rotation: [Math.PI / 2, 0, 0]
  });
}

function rebuildArtifactFrames(scene, materials) {
  const artifactMeshes = [];
  scene.traverse((object) => {
    if (object.isMesh && object.userData?.artifactId && object.userData.artifactId !== "chair") artifactMeshes.push(object);
  });

  for (const art of artifactMeshes) {
    const id = art.userData.artifactId;
    const oldFrame = scene.getObjectByName(`${id}-frame`);
    if (oldFrame) oldFrame.visible = false;

    const width = art.geometry?.parameters?.width;
    const height = art.geometry?.parameters?.height;
    if (!width || !height) continue;

    const worldPosition = art.getWorldPosition(new THREE.Vector3());
    const worldQuaternion = art.getWorldQuaternion(new THREE.Quaternion());
    const frame = new THREE.Group();
    frame.name = `retro-${id}-frame`;
    frame.position.copy(worldPosition);
    frame.quaternion.copy(worldQuaternion);
    scene.add(frame);

    const border = 0.09;
    const depth = 0.12;
    box(scene, "retro-frame-top", [width + border * 2, border, depth], [0, height / 2 + border / 2, -0.04], materials.brassDark, { parent: frame });
    box(scene, "retro-frame-bottom", [width + border * 2, border, depth], [0, -height / 2 - border / 2, -0.04], materials.brassDark, { parent: frame });
    box(scene, "retro-frame-left", [border, height, depth], [-width / 2 - border / 2, 0, -0.04], materials.brassDark, { parent: frame });
    box(scene, "retro-frame-right", [border, height, depth], [width / 2 + border / 2, 0, -0.04], materials.brassDark, { parent: frame });

    art.material.roughness = 0.62;
  }
}

function enhancePuzzleLamp(scene, materials) {
  const base = scene.getObjectByName("lamp-base");
  if (!base) return;
  const position = base.getWorldPosition(new THREE.Vector3());

  cylinder(scene, "retro-lamp-tier", [0.32, 0.44], 0.18, 10, [position.x, position.y + 0.15, position.z], materials.brassDark);
  lampBulbMaterial = material({
    color: 0x60411f,
    roughness: 0.28,
    emissive: 0xffc35a,
    emissiveIntensity: 0.08
  });
  addMesh(scene, new THREE.SphereGeometry(0.17, 10, 6), lampBulbMaterial, [position.x, position.y + 1.85, position.z], {
    name: "retro-lamp-bulb",
    castShadow: false
  });

  lampGlow = new THREE.PointLight(0xffc66d, 0, 8, 2);
  lampGlow.position.set(position.x, position.y + 1.84, position.z);
  lampGlow.castShadow = !conservativeGraphics;
  lampGlow.shadow.mapSize.set(256, 256);
  scene.add(lampGlow);
}

function addCeilingFixture(scene, materials, x, z) {
  cylinder(scene, "retro-ceiling-fixture", [0.46, 0.68], 0.38, 10, [x, 5.78, z], materials.brassDark);
  const glass = material({ color: 0xffd78b, roughness: 0.25, emissive: 0xffb949, emissiveIntensity: 0.85 });
  addMesh(scene, new THREE.SphereGeometry(0.31, 10, 6), glass, [x, 5.47, z], { name: "retro-ceiling-globe", castShadow: false });
  const light = new THREE.PointLight(0xffd6a1, mobileGraphics ? 1.15 : 1.65, 7.5, 2);
  light.position.set(x, 5.34, z);
  scene.add(light);
}

function addDust(scene) {
  if (conservativeGraphics) return null;
  const count = mobileGraphics ? 48 : 90;
  const positions = new Float32Array(count * 3);
  const random = seededRandom(9090);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (random() - 0.5) * 12;
    positions[i * 3 + 1] = 0.4 + random() * 5;
    positions[i * 3 + 2] = -3.8 + random() * 9;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const pointsMaterial = new THREE.PointsMaterial({
    color: 0xffe0a3,
    size: mobileGraphics ? 0.018 : 0.026,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
    sizeAttenuation: true
  });
  const motes = new THREE.Points(geometry, pointsMaterial);
  scene.add(motes);
  return motes;
}

function tuneLighting(scene, renderer) {
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.type = mobileGraphics ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;

  scene.add(new THREE.HemisphereLight(0x7892ad, 0x1a0f0a, mobileGraphics ? 0.28 : 0.36));
  const rim = new THREE.DirectionalLight(0x304e75, 0.68);
  rim.position.set(5, 4, -5);
  scene.add(rim);

  scene.traverse((object) => {
    if (object.isSpotLight && !puzzleSpotlight) {
      puzzleSpotlight = object;
      object.shadow.mapSize.set(mobileGraphics ? 512 : 1024, mobileGraphics ? 512 : 1024);
      object.shadow.bias = -0.0007;
      object.shadow.normalBias = 0.025;
    }
  });
}

function installRetroRoom(scene, renderer) {
  installed = true;
  const materials = buildMaterials();
  hideOriginalRoom(scene);
  buildRoomShell(scene, materials);
  buildRug(scene, materials);
  restyleOriginalFurniture(scene, materials);
  buildDeskDetails(scene, materials);
  buildChairDetails(scene, materials);
  buildBookcase(scene, materials, -5.55, 345);
  buildBookcase(scene, materials, 5.55, 789);
  buildSideTable(scene, materials, -3.35);
  buildSideTable(scene, materials, 3.35);
  buildDoor(scene, materials);
  rebuildArtifactFrames(scene, materials);
  enhancePuzzleLamp(scene, materials);
  addCeilingFixture(scene, materials, -4.6, 1.65);
  addCeilingFixture(scene, materials, 0, 1.65);
  addCeilingFixture(scene, materials, 4.6, 1.65);
  dustMotes = addDust(scene);
  tuneLighting(scene, renderer);

  document.documentElement.dataset.nblRoomStyle = "retro-3d";
}

function updateRetroRoom(scene) {
  if (!installed) return;
  if (!puzzleSpotlight) {
    scene.traverse((object) => {
      if (object.isSpotLight && !puzzleSpotlight) puzzleSpotlight = object;
    });
  }

  const intensity = puzzleSpotlight?.intensity || 0;
  if (lampGlow) lampGlow.intensity = intensity > 30 ? 8.4 : intensity > 0 ? 4.8 : 0;
  if (lampBulbMaterial) {
    lampBulbMaterial.emissiveIntensity = intensity > 30 ? 4.2 : intensity > 0 ? 2.1 : 0.08;
    lampBulbMaterial.color.setHex(intensity > 30 ? 0xffe1a1 : intensity > 0 ? 0xd39b45 : 0x60411f);
  }
  if (dustMotes && !reducedMotion) dustMotes.rotation.y += 0.0003;
}
