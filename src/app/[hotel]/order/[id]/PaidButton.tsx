"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markOrderPaid } from "@/lib/order-actions";

export default function PaidButton({
  slug,
  orderId,
}: {
  slug: string;
  orderId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function confirm() {
    setError("");
    startTransition(async () => {
      const res = await markOrderPaid(slug, orderId);
      if (res.ok) router.refresh();
      else setError(res.error ?? "Something went wrong. Please try again.");
    });
  }

  return (
    <>
      <button className="hd-paid-btn" onClick={confirm} disabled={pending}>
        {pending ? "Placing your order…" : "✓ I have paid"}
      </button>
      {error && <div className="hd-order-error">{error}</div>}
      <p className="hd-pay-hint" style={{ marginTop: 10 }}>
        Tap this only after paying. Your order reaches the kitchen once you do.
      </p>
    </>
  );
}
