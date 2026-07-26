import assert from "node:assert/strict";
import test from "node:test";
import { TravelerEnrollmentService } from "../api/traveler-enrollment-service.js";
import {
  InMemoryJourneyRepository,
  InMemorySceneRepository,
  InMemoryTravelerRepository
} from "../database/in-memory-repositories.js";

test("a new traveler receives the arrival experience once", async () => {
  const travelers = new InMemoryTravelerRepository();
  const journeys = new InMemoryJourneyRepository();
  const service = new TravelerEnrollmentService({
    travelers,
    journeys,
    scenes: new InMemorySceneRepository()
  });

  const firstEnrollment = await service.enroll({
    displayName: "Jamel",
    email: "traveler@example.com"
  });

  assert.equal(firstEnrollment.arrival?.headline, "Welcome, Traveler.");
  assert.equal(firstEnrollment.arrival?.message, "The road has been waiting for you.");

  const journey = await journeys.findActiveByTravelerId(firstEnrollment.traveler.id);
  assert.equal(journey?.steps[1]?.sceneId, "lantern-road");

  await service.acknowledgeArrival(firstEnrollment.traveler.id);

  const returningEnrollment = await service.enroll({
    displayName: "Jamel",
    email: "traveler@example.com"
  });

  assert.equal(returningEnrollment.traveler.id, firstEnrollment.traveler.id);
  assert.equal(returningEnrollment.arrival, null);
});
