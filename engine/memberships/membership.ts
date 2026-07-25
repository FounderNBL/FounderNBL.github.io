export const MEMBERSHIP_TIERS = [
  "explorer",
  "traveler",
  "still-walking",
  "founder-circle"
] as const;

export type MembershipTier = (typeof MEMBERSHIP_TIERS)[number];

export interface MembershipEntitlements {
  tier: MembershipTier;
  privateAreas: string[];
  earlyBookAccess: boolean;
  exclusiveStories: boolean;
  cinematicJourneysPerMonth: number;
  aiJourneyAccess: boolean;
}

export interface MembershipRecord {
  travelerId: string;
  tier: MembershipTier;
  status: "trialing" | "active" | "past-due" | "cancelled" | "paused";
  billingProvider: "stripe" | "payhip" | "manual" | "none";
  providerCustomerId: string | null;
  providerSubscriptionId: string | null;
  currentPeriodEndsAt: string | null;
  updatedAt: string;
}

export interface IMembershipProvider {
  readonly name: string;
  getMembership(travelerId: string): Promise<MembershipRecord | null>;
  handleWebhook(payload: string, signature: string): Promise<void>;
}
