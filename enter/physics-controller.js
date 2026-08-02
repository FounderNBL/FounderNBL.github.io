import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import RAPIER from "https://cdn.skypack.dev/@dimforge/rapier3d-compat@0.19.3";

const originalMoveForward = PointerLockControls.prototype.moveForward;
const originalMoveRight = PointerLockControls.prototype.moveRight;

function reportPhysics(message, state) {
  document.documentElement.dataset.nblPhysics = state;
  const status = document.getElementById("status");
  if (status) status.textContent = message;
}

try {
  await RAPIER.init();

  const world = new RAPIER.World({ x: 0, y: 0, z: 0 });
  const controller = world.createCharacterController(0.035);
  controller.setUp({ x: 0, y: 1, z: 0 });
  controller.setMaxSlopeClimbAngle(Math.PI / 4);
  controller.setMinSlopeSlideAngle(Math.PI / 6);
  controller.enableAutostep(0.25, 0.15, true);
  controller.enableSnapToGround(0.2);

  const staticBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());

  function addWall(halfX, halfY, halfZ, x, y, z) {
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(halfX, halfY, halfZ).setTranslation(x, y, z),
      staticBody
    );
  }

  addWall(0.18, 2.8, 5.5, -6.15, 1.4, 0.8);
  addWall(0.18, 2.8, 5.5, 6.15, 1.4, 0.8);
  // Match the collision boundary to the visible retro back wall instead of
  // stopping the visitor in front of the Founder artifacts.
  addWall(6.15, 2.8, 0.18, 0, 1.4, -4.58);
  addWall(6.15, 2.8, 0.18, 0, 1.4, 5.75);
  addWall(4.62, 1.0, 1.33, 0, 1.0, -0.5);

  const states = new WeakMap();
  const right = new THREE.Vector3();
  const forward = new THREE.Vector3();

  function stateFor(camera) {
    let state = states.get(camera);
    if (state) return state;

    const collider = world.createCollider(
      RAPIER.ColliderDesc.capsule(0.5, 0.36).setTranslation(
        camera.position.x,
        0.88,
        camera.position.z
      )
    );
    state = { collider };
    states.set(camera, state);
    return state;
  }

  function moveCamera(camera, desired) {
    const { collider } = stateFor(camera);
    const current = collider.translation();

    if (Math.abs(current.x - camera.position.x) > 0.05 || Math.abs(current.z - camera.position.z) > 0.05) {
      collider.setTranslation({ x: camera.position.x, y: 0.88, z: camera.position.z });
    }

    controller.computeColliderMovement(collider, {
      x: desired.x,
      y: 0,
      z: desired.z
    });

    const corrected = controller.computedMovement();
    const position = collider.translation();
    const next = {
      x: position.x + corrected.x,
      y: 0.88,
      z: position.z + corrected.z
    };

    collider.setTranslation(next);
    camera.position.x = next.x;
    camera.position.z = next.z;
  }

  PointerLockControls.prototype.moveForward = function moveForwardWithPhysics(distance) {
    const camera = this.object;
    if (!camera || !Number.isFinite(distance)) {
      originalMoveForward.call(this, distance);
      return;
    }

    camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() === 0) return;
    forward.normalize().multiplyScalar(distance);
    moveCamera(camera, forward);
  };

  PointerLockControls.prototype.moveRight = function moveRightWithPhysics(distance) {
    const camera = this.object;
    if (!camera || !Number.isFinite(distance)) {
      originalMoveRight.call(this, distance);
      return;
    }

    camera.updateMatrixWorld();
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    right.y = 0;
    if (right.lengthSq() === 0) return;
    right.normalize().multiplyScalar(distance);
    moveCamera(camera, right);
  };

  reportPhysics("Physics ready. The room now has real boundaries.", "rapier-ready");
} catch (error) {
  console.error("Rapier physics failed to initialize.", error);
  reportPhysics("Physics failed to load. Using the original room controls.", "fallback");
}
