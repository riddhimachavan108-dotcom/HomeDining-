"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Refresh the order page periodically so the guest sees the manager's
// status updates (Preparing → Delivered) without reloading. Stops once
// the order reaches a final state.
export default function StatusPoller({
  status,
  intervalMs = 12000,
}: {
  status: string;
  intervalMs?: number;
}) {
  const router = useRouter();
  useEffect(() => {
    if (status === "DELIVERED" || status === "CANCELLED") return;
    const t = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(t);
  }, [status, router, intervalMs]);
  return null;
}
