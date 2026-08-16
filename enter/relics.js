import * as THREE from "three";

const relicDefinitions = [
  {
    id: "tome",
    title: "The Ancient Tome",
    kicker: "Relic I · Memory",
    clue: "A world is not built by answers alone. The first page asks whether the question was ever yours to begin with.",
    prompt: "Inspect the Ancient Tome",
    position: [-2.05, 1.93, 0]
  },
  {
    id: "seal",
    title: "The Glowing Seal",
    kicker: "Relic II · Authority",
    clue: "A seal can certify truth, power, ownership, or only the appearance of them. Look for what gives the mark its meaning.",
    prompt: "Inspect the Glowing Seal",
    position: [0, 1.92, 0]
  },
  {
    id: "scale",
    title: "The Antique Scale",
    kicker: "Relic III · Discernment",
    clue: "The scale does not decide what is true. It reveals what you chose to weigh — and what you left off the other side.",
    prompt: "Inspect the Antique Scale",
    position: [2.05, 1.93, 0]
  }
];

const toon = (color, emissive = 0x000000, intensity = 0) => new THREE.MeshToonMaterial({ color, emissive, emissiveIntensity: intensity });

function markInteractive(object, definition) {
  object.userData.relic = definition;
  object.traverse((child) => {
    if (child.isMesh) child.userData.relic = definition;
  });
}

function buildTome(def) {
  const group = new THREE.Group();
  group.position.set(...def.position);
  const pages = new THREE.Mesh(new THREE.BoxGeometry(1.35,.22,.92), toon(0xd2c49b));
  const cover = new THREE.Mesh(new THREE.BoxGeometry(1.48,.12,1.02), toon(0x4f1e19));
  cover.position.y = .16;
  const spine = new THREE.Mesh(new THREE.BoxGeometry(.12,.32,1.05), toon(0xb48a43));
  spine.position.set(-.7,.03,0);
  group.add(pages, cover, spine);
  group.rotation.y = -.12;
  markInteractive(group, def);
  return group;
}

function buildSeal(def) {
  const group = new THREE.Group();
  group.position.set(...def.position);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.58,.66,.18,24), toon(0x6c5836));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.36,.075,10,28), toon(0xe3bd5e,0xe3bd5e,.95));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = .18;
  const core = new THREE.Mesh(new THREE.CylinderGeometry(.29,.29,.07,24), toon(0x202b28,0xc4a552,.48));
  core.position.y = .18;
  group.add(base, ring, core);
  markInteractive(group, def);
  return group;
}

function buildScale(def) {
  const group = new THREE.Group();
  group.position.set(...def.position);
  const bronze = toon(0x9a783b);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.42,.55,.16,16), bronze);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.055,.075,1.2,12), bronze);
  stem.position.y = .65;
  const beam = new THREE.Mesh(new THREE.BoxGeometry(1.35,.08,.08), bronze);
  beam.position.y = 1.2;
  const leftChain = new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.72,6), bronze);
  leftChain.position.set(-.55,.82,0);
  const rightChain = leftChain.clone();
  rightChain.position.x = .55;
  const panGeo = new THREE.CylinderGeometry(.34,.22,.08,18);
  const leftPan = new THREE.Mesh(panGeo, toon(0x7a6234));
  leftPan.position.set(-.55,.46,0);
  const rightPan = leftPan.clone();
  rightPan.position.x = .55;
  group.add(base, stem, beam, leftChain, rightChain, leftPan, rightPan);
  group.scale.setScalar(.82);
  markInteractive(group, def);
  return group;
}

export function createRelics(scene) {
  const builders = { tome: buildTome, seal: buildSeal, scale: buildScale };
  const relics = relicDefinitions.map((definition) => {
    const group = builders[definition.id](definition);
    group.name = `relic-${definition.id}`;
    group.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(group);
    return group;
  });
  return { relics, definitions: relicDefinitions };
}

export function relicFromIntersection(intersection) {
  let current = intersection?.object || null;
  while (current) {
    if (current.userData?.relic) return current.userData.relic;
    current = current.parent;
  }
  return null;
}
