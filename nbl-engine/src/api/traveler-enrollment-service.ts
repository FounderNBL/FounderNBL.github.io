import { randomUUID } from "node:crypto";
import { createJourney, startJourney, type JourneyStep } from "../journey/journey.js";
import type { EngineRepositories } from "../storage/repositories.js";
import {
  createTraveler,
  markArrivalExperienceSeen,
  shouldShowArrivalExperience,
  type MembershipTier,
  type TravelerProfile
} from "../traveler/traveler.js";
import { createArrivalExperience, type ArrivalExperience } from "../engine/arrival-experience.js";

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
        arrival: shouldShowArrivalExperience(existing)
          ? createArrivalExperience(existing)
          : null
      };
    }

    const travelerId = randomUUID();
    const journeyId = randomUUID();
    const now = new Date().toISOString();

    const traveler = createTraveler({
      id: travelerId,
      displayName: input.displayName,
      email: input.email,
      membershipTier: input.membershipTier,
      profileImage: input.profileImage,
      currentJourney: journeyId,
      createdAt: now
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

    return {
      traveler,
      arrival: createArrivalExperience(traveler)
    };
  }

  async acknowledgeArrival(travelerId: string): Promise<TravelerProfile> {
    const traveler = await this.repositories.travelers.findById(travelerId);
    if (!traveler) throw new Error("Traveler not found.");

    const updated = markArrivalExperienceSeen(traveler);
    await this.repositories.travelers.save(updated);
    return updated;
  }
}
