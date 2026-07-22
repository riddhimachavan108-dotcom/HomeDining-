"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOrderStatusLite } from "@/lib/order-actions";
import { FINAL_STATUSES } from "@/lib/order-stages";

// Shown on the hotel menu when the guest has an order in progress (remembered
// in localStorage by ActiveOrderSaver). Verifies the order is still active and
// hides + clears itself once it's delivered or cancelled. Kept tiny and
// dependency-free so it's fast on slow connections.
export default function ActiveOrderBanner({ slug }: { slug: string }) {
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const key = `hd_active_order_${slug}`;
    let cancelled = false;
    let id: string | null = null;
    try {
      id = localStorage.getItem(key);
    } catch {
      /* ignore */
    }
    if (!id) return;

    // Confirm it's still active; drop the banner if it's gone or finished.
    getOrderStatusLite(slug, id)
      .then((res) => {
        if (cancelled) return;
        if (!res || FINAL_STATUSES.includes(res.status)) {
          try {
            localStorage.removeItem(key);
          } catch {
            /* ignore */
          }
          return;
        }
        setOrderId(id);
      })
      .catch(() => {
        /* offline: keep it hidden rather than guess */
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!orderId) return null;

  return (
    <Link href={`/${slug}/order/${orderId}/track`} className="hd-active-banner">
      <span className="hd-active-dot" aria-hidden />
      <span className="hd-active-text">You have an active order</span>
      <span className="hd-active-cta">Track it →</span>
    </Link>
  );
}
