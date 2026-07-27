export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface WorldUnlockRequest {
  travelerId: string;
  journeyId: string;
  paymentReference: string;
  paymentStatus: PaymentStatus;
}

export interface WorldUnlockDecision {
  unlocked: boolean;
  worldMayMove: boolean;
  reason: string;
}

export function decideWorldUnlock(request: WorldUnlockRequest): WorldUnlockDecision {
  if (request.paymentStatus !== "paid") {
    return {
      unlocked: false,
      worldMayMove: false,
      reason: "The journey remains still until payment is confirmed."
    };
  }

  return {
    unlocked: true,
    worldMayMove: true,
    reason: "Payment confirmed. The world may begin moving around the Traveler."
  };
}
