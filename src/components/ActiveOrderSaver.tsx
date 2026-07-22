"use client";

import { useEffect } from "react";
import { FINAL_STATUSES } from "@/lib/order-stages";

// Remembers the guest's current order on their device so that, if they close
// the page and reopen the hotel menu, a small banner can offer to take them
// back to tracking. Clears itself once the order is delivered or cancelled.
// Does nothing while the order is still awaiting payment (nothing to track yet).
export default function ActiveOrderSaver({
  slug,
  orderId,
  status,
}: {
  slug: string;
  orderId: string;
  status: string;
}) {
  useEffect(() => {
    const key = `hd_active_order_${slug}`;
    try {
      if (FINAL_STATUSES.includes(status)) {
        localStorage.removeItem(key);
      } else if (status !== "PENDING_PAYMENT") {
        localStorage.setItem(key, orderId);
      }
    } catch {
      /* ignore */
    }
  }, [slug, orderId, status]);
  return null;
}
