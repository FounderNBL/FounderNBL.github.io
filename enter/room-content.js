import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();
const maxAnisotropy = 4;
let installed = false;
let exactLampLight = null;
let exactLampBulb = null;
let puzzleSpotlight = null;

const artifactLayout = {
  graduation: {
    asset: "../founder-graduation-remarks.png",
    position: [-5.05, 3.52, -4.34],
    rotationY: 0,
    scale: 0.92
  },
  banner: {
    asset: "../if-it-is-is-it-banner.png",
    position: [0, 4.26, -4.34],
    rotationY: 0,
    scale: 1.24
  },
  doctorate: {
    asset: "../founder-doctorate-degree.png",
    position: [4.62, 3.48, -4.34],
    rotationY: 0,
    scale: 0.9
  },
  masters: {
    asset: "../founder-masters-degree.png",
    position: [6.02, 3.48, -4.34],
    rotationY: 0,
    scale: 0.9
  },
  yolanda: {
    position: [-3.15, 2.08, -0.12],
    rotationY: 0.18,
    scale: 0.96
  },
  founder: {
    asset: "../founder-nameplate.png",
    position: [0, 1.78, 0.42],
    rotationY: 0,
    scale: 1.05
  },
  family: {
    asset: "../new-beansland-family-photo.png",
    position: [3.15, 2.08, -0.12],
    rotationY: -0.18,
    scale: 0.96
  },
  clue: {
    asset: "../desk-clue-plaque.png",
    position: [0, 0.84, 0.64],
    rotationY: 0,
    scale: 1
  }
};

const originalRender = THREE.WebGLRenderer.prototype.render;
THREE.WebGLRenderer.prototype.render = function renderExactFounderOffice(scene, camera) {
  if (installed) updateLamp(scene);
  const result = originalRender.call(this, scene, camera);

  if (!installed && document.documentElement.dataset.nblRoomStyle === "retro-3d") {
    installed = installExactFounderOffice(scene, this);
  }

  return result;
};

function loadTexture(path, renderer, onLoad) {
  textureLoader.load(path, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(maxAnisotropy, renderer.capabilities.getMaxAnisotropy());
    onLoad(texture);
  }, undefined, () => {
    console.warn(`Founder’s Office asset could not load: ${path}`);
  });
}

function findArtifact(scene, id) {
  let artifact = null;
  scene.traverse((object) => {
    if (!artifact && object.isMesh && object.userData?.artifactId === id) artifact = object;
  });
  return artifact;
}

function applyArtifactLayout(scene, renderer) {
  Object.entries(artifactLayout).forEach(([id, layout]) => {
    const artifact = findArtifact(scene, id);
    if (!artifact) return;

    artifact.position.set(...layout.position);
    artifact.rotation.set(0, layout.rotationY, 0);
    artifact.scale.setScalar(layout.scale);
    artifact.userData.originalScale = artifact.scale.clone();
    artifact.renderOrder = 3;

    if (layout.asset) {
      loadTexture(layout.asset, renderer, (texture) => {
        artifact.material.map = texture;
        artifact.material.color.setHex(0xffffff);
        artifact.material.needsUpdate = true;
      });
    }

    const frame = scene.getObjectByName(`retro-${id}-frame`);
    if (frame) {
      frame.position.copy(artifact.position);
      frame.rotation.copy(artifact.rotation);
      frame.scale.copy(artifact.scale);
      frame.renderOrder = 2;
    }
  });
}

function relocateBookcases(scene) {
  const groups = [];
  scene.traverse((object) => {
    if (object.name === "retro-bookcase-back" && object.parent && !groups.includes(object.parent)) {
      groups.push(object.parent);
    }
  });

  groups.sort((a, b) => a.position.x - b.position.x);
  if (groups[0]) {
    groups[0].position.set(-6.54, 0, -0.55);
    groups[0].rotation.y = Math.PI / 2;
  }
  if (groups[1]) {
    groups[1].position.set(6.54, 0, -0.55);
    groups[1].rotation.y = -Math.PI / 2;
  }
}

function hideOldLamp(scene) {
  scene.traverse((object) => {
    const nearOldLamp = object.isMesh
      && Math.abs(object.position.x - 2.1) < 0.08
      && Math.abs(object.position.z + 1.2) < 0.08;

    if (nearOldLamp && !object.userData?.action) object.visible = false;
    if (["retro-lamp-tier", "retro-lamp-bulb"].includes(object.name)) object.visible = false;

    if (object.userData?.action === "lamp" && object.material) {
      object.material = object.material.clone();
      object.material.transparent = true;
      object.material.opacity = 0.001;
      object.material.depthWrite = false;
      object.castShadow = false;
    }
  });

  const lampHitboxes = [];
  scene.traverse((object) => {
    if (object.userData?.action === "lamp") lampHitboxes.push(object);
  });

  if (lampHitboxes[0]) {
    lampHitboxes[0].position.set(-2.72, 1.62, -0.2);
    lampHitboxes[0].scale.set(1.4, 1.2, 1.4);
    lampHitboxes[0].userData.originalScale = lampHitboxes[0].scale.clone();
  }
  if (lampHitboxes[1]) {
    lampHitboxes[1].position.set(-2.05, 2.45, -0.2);
    lampHitboxes[1].scale.set(1.25, 1.25, 1.25);
    lampHitboxes[1].userData.originalScale = lampHitboxes[1].scale.clone();
  }
}

function standardMaterial(color, roughness = 0.62, metalness = 0.08, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    flatShading: true,
    emissive: options.emissive || 0x000000,
    emissiveIntensity: options.emissiveIntensity || 0
  });
}

function addMesh(parent, geometry, material, position, rotation = [0, 0, 0], name = "exact-room-detail") {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function buildExactLamp(scene, renderer) {
  const group = new THREE.Group();
  group.name = "exact-nbl-desk-lamp";
  group.position.set(-2.72, 0, -0.2);
  scene.add(group);

  const brass = standardMaterial(0xb88938, 0.28, 0.78);
  const darkBrass = standardMaterial(0x6f431c, 0.4, 0.58);
  const navy = standardMaterial(0x061426, 0.58, 0.16);

  addMesh(group, new THREE.CylinderGeometry(0.58, 0.64, 0.14, 14), darkBrass, [0, 1.58, 0], [0, 0, 0], "exact-lamp-base");
  addMesh(group, new THREE.CylinderGeometry(0.46, 0.55, 0.12, 14), brass, [0, 1.68, 0], [0, 0, 0], "exact-lamp-base-tier");
  addMesh(group, new THREE.CylinderGeometry(0.055, 0.065, 0.92, 10), brass, [-0.22, 2.13, 0], [0, 0, 0], "exact-lamp-stem");
  addMesh(group, new THREE.SphereGeometry(0.11, 10, 6), brass, [-0.22, 2.58, 0], [0, 0, 0], "exact-lamp-joint");
  addMesh(group, new THREE.CylinderGeometry(0.055, 0.055, 0.72, 10), brass, [0.12, 2.58, 0], [0, 0, Math.PI / 2], "exact-lamp-arm");
  addMesh(group, new THREE.SphereGeometry(0.12, 10, 6), darkBrass, [0.48, 2.58, 0], [0, 0, 0], "exact-lamp-head-joint");

  const shade = addMesh(
    group,
    new THREE.CylinderGeometry(0.33, 0.52, 0.62, 12, 1, true),
    navy,
    [0.48, 2.32, 0],
    [0, 0, 0],
    "exact-lamp-shade"
  );
  shade.castShadow = true;

  exactLampBulb = standardMaterial(0x6f4b24, 0.25, 0.08, { emissive: 0xffc45f, emissiveIntensity: 0.06 });
  addMesh(group, new THREE.SphereGeometry(0.18, 10, 6), exactLampBulb, [0.48, 2.08, 0], [0, 0, 0], "exact-lamp-bulb");

  loadTexture("../nbl-writing-mark.png", renderer, (texture) => {
    const decal = new THREE.Mesh(
      new THREE.PlaneGeometry(0.29, 0.29),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false, depthWrite: false })
    );
    decal.name = "exact-lamp-mark";
    decal.position.set(0.48, 2.36, 0.335);
    decal.renderOrder = 5;
    group.add(decal);
  });

  exactLampLight = new THREE.PointLight(0xffc66d, 0, 7.5, 2);
  exactLampLight.name = "exact-lamp-light";
  exactLampLight.position.set(-2.24, 2.08, -0.2);
  exactLampLight.castShadow = document.documentElement.dataset.nblGraphicsBudget === "full";
  exactLampLight.shadow.mapSize.set(256, 256);
  scene.add(exactLampLight);
}

function addChairEmblem(scene, renderer) {
  const chair = scene.getObjectByName("chair-back");
  if (!chair || chair.getObjectByName("exact-chair-emblem")) return;

  loadTexture("../official-nbl-emblem.png", renderer, (texture) => {
    const emblem = new THREE.Mesh(
      new THREE.PlaneGeometry(0.82, 0.82),
      new THREE.MeshStandardMaterial({
        map: texture,
        transparent: false,
        roughness: 0.6,
        metalness: 0.04,
        emissive: 0x2b1706,
        emissiveIntensity: 0.08
      })
    );
    emblem.name = "exact-chair-emblem";
    emblem.position.set(0, 0.28, 0.181);
    emblem.renderOrder = 4;
    chair.add(emblem);
  });
}

function retargetPuzzleLight(scene) {
  scene.traverse((object) => {
    if (!puzzleSpotlight && object.isSpotLight) puzzleSpotlight = object;
  });

  if (puzzleSpotlight) {
    puzzleSpotlight.position.set(-2.18, 3.02, -0.18);
    puzzleSpotlight.target.position.set(0, 1.38, -1.25);
    puzzleSpotlight.target.updateMatrixWorld();
  }

  scene.traverse((object) => {
    if (!object.isPointLight || object === exactLampLight) return;
    const oldLampDistance = object.position.distanceTo(new THREE.Vector3(2.1, 3.45, -1.2));
    if (oldLampDistance < 1.2) object.position.set(-2.24, 2.08, -0.2);
  });
}

function updateLamp(scene) {
  if (!puzzleSpotlight) retargetPuzzleLight(scene);
  const intensity = puzzleSpotlight?.intensity || 0;

  if (exactLampLight) exactLampLight.intensity = intensity > 30 ? 7.2 : intensity > 0 ? 3.8 : 0;
  if (exactLampBulb) {
    exactLampBulb.emissiveIntensity = intensity > 30 ? 4 : intensity > 0 ? 2 : 0.06;
    exactLampBulb.color.setHex(intensity > 30 ? 0xffe4a8 : intensity > 0 ? 0xd79c43 : 0x6f4b24);
  }
}

const exactInspectionAssets = new Map([
  ["The Desk Clue", "../desk-clue-plaque.png"],
  ["The Empty Chair", "../official-nbl-emblem.png"]
]);

function installExactInspectorOverrides() {
  const inspector = document.getElementById("inspector");
  const title = document.getElementById("artifactTitle");
  const canvas = document.getElementById("artifactCanvas");
  const context = canvas?.getContext("2d");
  if (!inspector || !title || !canvas || !context) return;

  let renderVersion = 0;
  const drawExactInspection = () => {
    const expectedTitle = title.textContent.trim();
    const path = exactInspectionAssets.get(expectedTitle);
    if (!path || inspector.hidden) return;

    const version = ++renderVersion;
    const image = new Image();
    image.onload = () => {
      if (version !== renderVersion || inspector.hidden || title.textContent.trim() !== expectedTitle) return;
      canvas.width = Math.max(900, image.naturalWidth || image.width);
      canvas.height = Math.max(650, image.naturalHeight || image.height);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.style.transform = "translate(0px, 0px) scale(1)";
    };
    image.src = path;
  };

  const scheduleExactInspection = () => {
    requestAnimationFrame(drawExactInspection);
    setTimeout(drawExactInspection, 120);
    setTimeout(drawExactInspection, 360);
  };

  const observer = new MutationObserver(scheduleExactInspection);
  observer.observe(title, { childList: true, subtree: true, characterData: true });
  observer.observe(inspector, { attributes: true, attributeFilter: ["hidden"] });
}

function installExactFounderOffice(scene, renderer) {
  const required = ["banner", "graduation", "doctorate", "masters", "family", "founder", "yolanda", "clue", "chair"];
  if (!required.every((id) => findArtifact(scene, id))) return false;

  applyArtifactLayout(scene, renderer);
  relocateBookcases(scene);
  hideOldLamp(scene);
  buildExactLamp(scene, renderer);
  addChairEmblem(scene, renderer);
  retargetPuzzleLight(scene);
  installExactInspectorOverrides();

  document.documentElement.dataset.nblRoomContent = "exact-founder-layout";
  return true;
}
