import test from "node:test";
import assert from "node:assert/strict";
import { interactWithRoomObject } from "../interactions/room-interaction.js";
import { decideWorldUnlock } from "../payments/world-unlock.js";

const baseState = {
  travelerId: "traveler-1",
  lookedAtObjectIds: [],
  pickedObjectIds: []
};

test("looking at an object records it and returns its description", () => {
  const result = interactWithRoomObject(
    {
      id: "road-token",
      sceneId: "lantern-road",
      name: "Road Token",
      description: "A small dark coin.",
      canPickUp: true,
      tags: ["token"]
    },
    "look",
    baseState
  );

  assert.equal(result.message, "A small dark coin.");
  assert.deepEqual(result.state.lookedAtObjectIds, ["road-token"]);
});

test("a pickable object enters the Traveler state", () => {
  const result = interactWithRoomObject(
    {
      id: "road-token",
      sceneId: "lantern-road",
      name: "Road Token",
      description: "A small dark coin.",
      canPickUp: true,
      pickupMessage: "The token warms in your hand.",
      tags: ["token"]
    },
    "pick",
    baseState
  );

  assert.equal(result.message, "The token warms in your hand.");
  assert.deepEqual(result.state.pickedObjectIds, ["road-token"]);
});

test("the world remains still until payment is confirmed", () => {
  assert.equal(
    decideWorldUnlock({
      travelerId: "traveler-1",
      journeyId: "journey-1",
      paymentReference: "pending-order",
      paymentStatus: "pending"
    }).worldMayMove,
    false
  );

  assert.equal(
    decideWorldUnlock({
      travelerId: "traveler-1",
      journeyId: "journey-1",
      paymentReference: "paid-order",
      paymentStatus: "paid"
    }).worldMayMove,
    true
  );
});
