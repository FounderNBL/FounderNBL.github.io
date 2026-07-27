import { randomUUID } from "node:crypto";
import { createJourney, startJourney, type JourneyStep } from "../journeys/journey.js";
import type { EngineRepositories } from "../database/repositories.js";
import {
  createTraveler,
  markArrivalExperienceSeen,
  shouldShowArrivalExperience,
  type TravelerProfile
} from "../travelers/traveler.js";
import type { MembershipTier } from "../memberships/membership.js";
import {
  FIRST_ARRIVAL_EXPERIENCE,
  type ArrivalExperience
} from "../scenes/arrival-experience.js";

export const FIRST_WALK_STEPS: JourneyStep[] = [
  { sceneId: "arrival", title: "Arrival", worldId: "new-beansland" },
  { sceneId: "lantern-road", title: "Lantern Road", worldId: "new-beansland" },
  { sceneId: "bridge", title: "The Bridge", worldId: "new-beansland" },
  { sceneId: "founders-office", title: "Founder's Office", worldId: "new-beansland" },
  { sceneId: "library", title: "The Library", worldId: "new-beansland" },
  { sceneId: "people-zoo", title: "The People Zoo", worldId: "new-beansland" }
];

export interface EnrollTravelerInput {
  displayName: string;
  email: string;
  membershipTier?: MembershipTier;
  profileImage?: string | null;
}

export interface EnrollmentResult {
  traveler: TravelerProfile;
  arrival: ArrivalExperience | null;
}

export class TravelerEnrollmentService {
  constructor(private readonly repositories: EngineRepositories) {}

  async enroll(input: EnrollTravelerInput): Promise<EnrollmentResult> {
    const existing = await this.repositories.travelers.findByEmail(input.email);
    if (existing) {
      return {
        traveler: existing,
        arrival: shouldShowArrivalExperience(existing) ? FIRST_ARRIVAL_EXPERIENCE : null
      };
    }

    const travelerId = randomUUID();
    const journeyId = randomUUID();
    const now = new Date().toISOString();
    const optionalTravelerFields = {
      ...(input.membershipTier !== undefined ? { membershipTier: input.membershipTier } : {}),
      ...(input.profileImage !== undefined ? { profileImage: input.profileImage } : {})
    };

    const traveler = createTraveler({
      id: travelerId,
      displayName: input.displayName,
      email: input.email,
      currentJourney: journeyId,
      createdAt: now,
      ...optionalTravelerFields
    });

    const journey = startJourney(
      createJourney({
        id: journeyId,
        travelerId,
        steps: FIRST_WALK_STEPS,
        createdAt: now
      }),
      now
    );

    await this.repositories.travelers.save(traveler);
    await this.repositories.journeys.save(journey);

    return { traveler, arrival: FIRST_ARRIVAL_EXPERIENCE };
  }

  async acknowledgeArrival(travelerId: string): Promise<TravelerProfile> {
    const traveler = await this.repositories.travelers.findById(travelerId);
    if (!traveler) throw new Error("Traveler not found.");

    const updated = markArrivalExperienceSeen(traveler);
    await this.repositories.travelers.save(updated);
    return updated;
  }
}
