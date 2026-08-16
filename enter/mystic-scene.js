import * as THREE from "three";

function canvasTexture(draw, size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  draw(ctx, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

function stoneTexture() {
  return canvasTexture((ctx, size) => {
    ctx.fillStyle = "#343739";
    ctx.fillRect(0, 0, size, size);
    const rows = 5;
    const h = size / rows;
    for (let y = 0; y < rows; y++) {
      const offset = y % 2 ? -size / 8 : 0;
      for (let x = offset; x < size; x += size / 4) {
        const value = 42 + Math.floor(Math.random() * 28);
        ctx.fillStyle = `rgb(${value},${value + 2},${value + 1})`;
        ctx.fillRect(x + 2, y * h + 2, size / 4 - 4, h - 4);
        ctx.strokeStyle = "rgba(5,7,8,.55)";
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 2, y * h + 2, size / 4 - 4, h - 4);
      }
    }
    for (let i = 0; i < 900; i++) {
      const a = Math.random() * .11;
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
    }
  });
}

function woodTexture() {
  return canvasTexture((ctx, size) => {
    ctx.fillStyle = "#3a2315";
    ctx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 8) {
      ctx.strokeStyle = `rgba(204,143,73,${.06 + Math.random() * .08})`;
      ctx.beginPath();
      ctx.moveTo(0, y + Math.random() * 5);
      ctx.bezierCurveTo(size * .3, y - 4, size * .7, y + 7, size, y + Math.random() * 5);
      ctx.stroke();
    }
  });
}

function toon(color, map = null, emissive = 0x000000, emissiveIntensity = 0) {
  const material = new THREE.MeshToonMaterial({ color, map, emissive, emissiveIntensity });
  material.side = THREE.FrontSide;
  return material;
}

function mesh(geometry, material, position, name = "") {
  const object = new THREE.Mesh(geometry, material);
  object.name = name;
  object.position.set(...position);
  object.castShadow = true;
  object.receiveShadow = true;
  return object;
}

export function buildMysticStudy(scene) {
  const stone = stoneTexture();
  stone.repeat.set(5, 2.5);
  const floorStone = stone.clone();
  floorStone.needsUpdate = true;
  floorStone.repeat.set(5, 5);
  const wood = woodTexture();
  wood.repeat.set(4, 2);

  scene.background = new THREE.Color(0x05070a);
  scene.fog = new THREE.FogExp2(0x05070a, 0.035);

  const room = new THREE.Group();
  room.name = "MysticStudy";

  const floor = mesh(new THREE.PlaneGeometry(18, 18), toon(0x5a5b57, floorStone), [0, 0, 0], "stone-floor");
  floor.rotation.x = -Math.PI / 2;
  room.add(floor);

  const wallMaterial = toon(0x777873, stone);
  const back = mesh(new THREE.BoxGeometry(18, 7, .45), wallMaterial, [0, 3.5, -8.8], "back-wall");
  const front = mesh(new THREE.BoxGeometry(18, 7, .45), wallMaterial, [0, 3.5, 8.8], "front-wall");
  const left = mesh(new THREE.BoxGeometry(.45, 7, 18), wallMaterial, [-8.8, 3.5, 0], "left-wall");
  const right = mesh(new THREE.BoxGeometry(.45, 7, 18), wallMaterial, [8.8, 3.5, 0], "right-wall");
  room.add(back, front, left, right);

  const ceiling = mesh(new THREE.BoxGeometry(18, .4, 18), toon(0x202326), [0, 7, 0], "ceiling");
  ceiling.castShadow = false;
  room.add(ceiling);

  const archMat = toon(0x4e504d, stone);
  [-6.5, -3.25, 0, 3.25, 6.5].forEach((x) => {
    const pillar = mesh(new THREE.CylinderGeometry(.38, .52, 6.6, 8), archMat, [x, 3.3, -8.35]);
    room.add(pillar);
  });

  const tableTop = mesh(new THREE.BoxGeometry(6.6, .35, 3.1), toon(0x6a3a1f, wood), [0, 1.55, 0], "relic-table");
  room.add(tableTop);
  [[-2.5,-1.05],[2.5,-1.05],[-2.5,1.05],[2.5,1.05]].forEach(([x,z]) => {
    room.add(mesh(new THREE.BoxGeometry(.42, 1.55, .42), toon(0x4b2919, wood), [x, .78, z]));
  });

  const rug = mesh(new THREE.PlaneGeometry(9.2, 6.6), toon(0x182421), [0, .016, 0], "ritual-rug");
  rug.rotation.x = -Math.PI / 2;
  room.add(rug);

  const altar = mesh(new THREE.BoxGeometry(4.2, 1.25, 1.25), toon(0x3d403d, stone), [0, .65, -7.5], "sealed-gate-altar");
  room.add(altar);

  const door = mesh(new THREE.BoxGeometry(3.1, 5.2, .32), toon(0x1b1d1d), [0, 2.6, -8.45], "next-chamber-door");
  room.add(door);
  const rune = mesh(new THREE.TorusGeometry(.72, .08, 10, 32), toon(0xd6b35d, null, 0xd6b35d, .45), [0, 3, -8.25], "gate-rune");
  room.add(rune);

  const hemi = new THREE.HemisphereLight(0x89938d, 0x160f0a, .48);
  room.add(hemi);

  const moon = new THREE.DirectionalLight(0xa5b9c7, 2.7);
  moon.position.set(-5, 7, 4);
  moon.castShadow = true;
  moon.shadow.mapSize.set(1024, 1024);
  moon.shadow.camera.left = -10;
  moon.shadow.camera.right = 10;
  moon.shadow.camera.top = 10;
  moon.shadow.camera.bottom = -10;
  room.add(moon);

  const goldKey = new THREE.SpotLight(0xf1bd62, 13, 18, Math.PI / 5, .65, 1.6);
  goldKey.position.set(3.5, 6.3, 3.5);
  goldKey.target.position.set(0, 1.4, 0);
  goldKey.castShadow = true;
  room.add(goldKey, goldKey.target);

  const candlePositions = [[-5.8,1,-5.7],[5.8,1,-5.7],[-6.5,1,5.4],[6.5,1,5.4]];
  const candleLights = [];
  candlePositions.forEach(([x,y,z]) => {
    const stand = mesh(new THREE.CylinderGeometry(.12,.17,1.6,8), toon(0x59462d), [x,y,z]);
    const flame = mesh(new THREE.SphereGeometry(.09,8,8), toon(0xffd37a,null,0xff9c3c,1.8), [x,y+.9,z]);
    const light = new THREE.PointLight(0xffa447, 4.2, 6, 2);
    light.position.set(x,y+.9,z);
    candleLights.push(light);
    room.add(stand, flame, light);
  });

  scene.add(room);
  return {
    room,
    tableTop,
    door,
    rune,
    candleLights,
    bounds: { minX: -8.1, maxX: 8.1, minZ: -8.1, maxZ: 8.1 },
    tableBounds: { minX: -3.65, maxX: 3.65, minZ: -2.0, maxZ: 2.0 }
  };
}
