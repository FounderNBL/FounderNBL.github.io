export const JOURNEY_STATUSES = ["not-started", "active", "paused", "completed"] as const;
export type JourneyStatus = (typeof JOURNEY_STATUSES)[number];

export interface JourneyStep {
  sceneId: string;
  title: string;
  worldId: string;
  requiredMembershipTier?: string;
}

export interface JourneyProgress {
  id: string;
  travelerId: string;
  status: JourneyStatus;
  steps: JourneyStep[];
  currentStepIndex: number;
  completedSceneIds: string[];
  startedAt: string | null;
  updatedAt: string;
  completedAt: string | null;
}

export interface CreateJourneyInput {
  id: string;
  travelerId: string;
  steps: JourneyStep[];
  createdAt?: string;
}

export function createJourney(input: CreateJourneyInput): JourneyProgress {
  if (!input.id.trim()) throw new Error("Journey id is required.");
  if (!input.travelerId.trim()) throw new Error("Traveler id is required.");
  if (input.steps.length === 0) throw new Error("A journey requires at least one scene.");

  const createdAt = input.createdAt ?? new Date().toISOString();
  return {
    id: input.id,
    travelerId: input.travelerId,
    status: "not-started",
    steps: [...input.steps],
    currentStepIndex: 0,
    completedSceneIds: [],
    startedAt: null,
    updatedAt: createdAt,
    completedAt: null
  };
}

export function getCurrentStep(journey: JourneyProgress): JourneyStep | null {
  return journey.steps[journey.currentStepIndex] ?? null;
}

export function getNextStep(journey: JourneyProgress): JourneyStep | null {
  return journey.steps[journey.currentStepIndex + 1] ?? null;
}

export function startJourney(
  journey: JourneyProgress,
  now = new Date().toISOString()
): JourneyProgress {
  return {
    ...journey,
    status: "active",
    startedAt: journey.startedAt ?? now,
    updatedAt: now
  };
}

export function completeCurrentScene(
  journey: JourneyProgress,
  now = new Date().toISOString()
): JourneyProgress {
  const current = getCurrentStep(journey);
  if (!current) return journey;

  const completedSceneIds = journey.completedSceneIds.includes(current.sceneId)
    ? journey.completedSceneIds
    : [...journey.completedSceneIds, current.sceneId];
  const isLastStep = journey.currentStepIndex >= journey.steps.length - 1;

  return {
    ...journey,
    status: isLastStep ? "completed" : "active",
    currentStepIndex: isLastStep ? journey.currentStepIndex : journey.currentStepIndex + 1,
    completedSceneIds,
    updatedAt: now,
    completedAt: isLastStep ? now : null
  };
}
