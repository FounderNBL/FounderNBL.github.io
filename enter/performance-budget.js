import * as THREE from "three";

const coarsePointer = matchMedia("(pointer: coarse)").matches;
const narrowScreen = Math.min(innerWidth, innerHeight) < 900;
const reportedMemory = Number(navigator.deviceMemory || 8);
const lowMemory = reportedMemory <= 4;
const maximumPixelRatio = lowMemory ? 1 : (coarsePointer || narrowScreen ? 1.25 : 1.75);

const rendererPrototype = THREE.WebGLRenderer.prototype;

if (!rendererPrototype.__nblPerformanceBudgetInstalled) {
  const originalSetPixelRatio = rendererPrototype.setPixelRatio;
  const originalRender = rendererPrototype.render;

  rendererPrototype.setPixelRatio = function setBudgetedPixelRatio(value) {
    return originalSetPixelRatio.call(this, Math.min(value, maximumPixelRatio));
  };

  rendererPrototype.render = function renderWhenVisible(...args) {
    if (document.hidden) return undefined;
    return originalRender.apply(this, args);
  };

  Object.defineProperty(rendererPrototype, "__nblPerformanceBudgetInstalled", {
    value: true,
    configurable: false,
    enumerable: false,
    writable: false
  });
}

document.documentElement.dataset.nblGraphicsBudget = lowMemory
  ? "conservative"
  : (coarsePointer || narrowScreen ? "mobile" : "full");
