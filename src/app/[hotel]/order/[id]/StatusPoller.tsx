"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Refresh the order page periodically so the guest sees the manager's
// status updates (Preparing → Delivered) without reloading. Stops once
// the order reaches a final state.
export default function StatusPoller({ status }: { status: string }) {
  const router = useRouter();
  useEffect(() => {
    if (status === "DELIVERED" || status === "CANCELLED") return;
    const t = setInterval(() => router.refresh(), 12000);
    return () => clearInterval(t);
  }, [status, router]);
  return null;
}
