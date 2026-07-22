// Shared order-tracking stage logic (used by the guest timeline, the
// "track your order" button and the active-order banner).

// The five stages the guest sees, in order.
export const TRACK_STAGES = [
  "placed",
  "confirmed",
  "preparing",
  "ontheway",
  "delivered",
] as const;

export type TrackStageKey = (typeof TRACK_STAGES)[number];

export const TRACK_STAGE_LABELS: Record<TrackStageKey, string> = {
  placed: "Order placed",
  confirmed: "Order confirmed by kitchen",
  preparing: "Preparing your food",
  ontheway: "On the way to your room",
  delivered: "Delivered",
};

// Orders that are finished — no longer "active" for the banner/tracking.
export const FINAL_STATUSES = ["DELIVERED", "CANCELLED"];

// How far along the timeline a given order status is (0-based index into
// TRACK_STAGES). Payment-phase statuses (claimed / pay-at-reception / not
// received) count as "placed" — the order exists but the kitchen hasn't
// confirmed it yet.
export function stageIndexForStatus(status: string): number {
  switch (status) {
    case "CONFIRMED":
      return 1;
    case "PREPARING":
      return 2;
    case "OUT_FOR_DELIVERY":
      return 3;
    case "DELIVERED":
      return 4;
    default:
      // PENDING_PAYMENT, CLAIMED, PAY_AT_RECEPTION, NOT_RECEIVED
      return 0;
  }
}
