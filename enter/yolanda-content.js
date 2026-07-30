import * as THREE from "three";

const exactYolandaAsset = "../founders-office-yolanda.png";
const textureLoader = new THREE.TextureLoader();
let installed = false;

const originalRender = THREE.WebGLRenderer.prototype.render;
THREE.WebGLRenderer.prototype.render = function renderExactYolandaPiece(scene, camera) {
  const result = originalRender.call(this, scene, camera);

  if (!installed && document.documentElement.dataset.nblRoomContent === "exact-founder-layout") {
    const artifact = findYolandaArtifact(scene);
    if (artifact) {
      installed = true;
      applyExactYolandaTexture(artifact, this);
      installExactYolandaInspector();
      document.documentElement.dataset.nblYolandaAsset = "exact-upload";
    }
  }

  return result;
};

function findYolandaArtifact(scene) {
  let artifact = null;
  scene.traverse((object) => {
    if (!artifact && object.isMesh && object.userData?.artifactId === "yolanda") artifact = object;
  });
  return artifact;
}

function applyExactYolandaTexture(artifact, renderer) {
  textureLoader.load(exactYolandaAsset, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    artifact.material.map = texture;
    artifact.material.color.setHex(0xffffff);
    artifact.material.needsUpdate = true;
  }, undefined, () => {
    console.warn(`Founder’s Office asset could not load: ${exactYolandaAsset}`);
  });
}

function installExactYolandaInspector() {
  const inspector = document.getElementById("inspector");
  const title = document.getElementById("artifactTitle");
  const canvas = document.getElementById("artifactCanvas");
  const context = canvas?.getContext("2d");
  if (!inspector || !title || !canvas || !context) return;

  let renderVersion = 0;
  const drawExactImage = () => {
    if (inspector.hidden || title.textContent.trim() !== "For You, Mom — Yolanda") return;

    const version = ++renderVersion;
    const image = new Image();
    image.onload = () => {
      if (version !== renderVersion || inspector.hidden || title.textContent.trim() !== "For You, Mom — Yolanda") return;
      canvas.width = Math.max(900, image.naturalWidth || image.width);
      canvas.height = Math.max(650, image.naturalHeight || image.height);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.style.transform = "translate(0px, 0px) scale(1)";
    };
    image.src = exactYolandaAsset;
  };

  const scheduleDraw = () => {
    requestAnimationFrame(drawExactImage);
    setTimeout(drawExactImage, 120);
    setTimeout(drawExactImage, 360);
  };

  const observer = new MutationObserver(scheduleDraw);
  observer.observe(title, { childList: true, subtree: true, characterData: true });
  observer.observe(inspector, { attributes: true, attributeFilter: ["hidden"] });
}
