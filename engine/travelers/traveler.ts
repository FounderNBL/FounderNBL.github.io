import type { MembershipTier } from "../memberships/membership.js";

export const TRAVELER_STATUSES = [
  "invited",
  "arriving",
  "active",
  "paused",
  "completed"
] as const;

export type TravelerStatus = (typeof TRAVELER_STATUSES)[number];

export interface TravelerProfile {
  id: string;
  displayName: string;
  email: string;
  membershipTier: MembershipTier;
  createdAt: string;
  lastLogin: string | null;
  currentWorld: string;
  currentScene: string;
  profileImage: string | null;
  travelerStatus: TravelerStatus;
  completedScenes: string[];
  currentJourney: string;
  arrivalExperienceSeenAt: string | null;
  metadata: Record<string, unknown>;
}

export interface CreateTravelerInput {
  id: string;
  displayName: string;
  email: string;
  membershipTier?: MembershipTier;
  profileImage?: string | null;
  currentWorld?: string;
  currentScene?: string;
  currentJourney?: string;
  createdAt?: string;
}

export function createTraveler(input: CreateTravelerInput): TravelerProfile {
  const createdAt = input.createdAt ?? new Date().toISOString();

  if (!input.id.trim()) throw new Error("Traveler id is required.");
  if (!input.displayName.trim()) throw new Error("Traveler display name is required.");
  if (!input.email.includes("@")) throw new Error("Traveler email must be valid.");

  return {
    id: input.id,
    displayName: input.displayName.trim(),
    email: input.email.trim().toLowerCase(),
    membershipTier: input.membershipTier ?? "explorer",
    createdAt,
    lastLogin: null,
    currentWorld: input.currentWorld ?? "new-beansland",
    currentScene: input.currentScene ?? "arrival",
    profileImage: input.profileImage ?? null,
    travelerStatus: "arriving",
    completedScenes: [],
    currentJourney: input.currentJourney ?? "first-walk",
    arrivalExperienceSeenAt: null,
    metadata: {}
  };
}

export function markArrivalExperienceSeen(
  traveler: TravelerProfile,
  seenAt = new Date().toISOString()
): TravelerProfile {
  return {
    ...traveler,
    travelerStatus: "active",
    arrivalExperienceSeenAt: traveler.arrivalExperienceSeenAt ?? seenAt
  };
}

export function shouldShowArrivalExperience(traveler: TravelerProfile): boolean {
  return traveler.arrivalExperienceSeenAt === null;
}
