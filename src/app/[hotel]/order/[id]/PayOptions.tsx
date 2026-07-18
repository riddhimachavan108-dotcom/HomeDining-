"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  payAtReception,
} from "@/lib/order-actions";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function PayOptions({
  slug,
  orderId,
  themeColor,
}: {
  slug: string;
  orderId: string;
  themeColor: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function payNow() {
    if (busy) return;
    setError("");
    setBusy(true);

    const created = await createRazorpayOrder(slug, orderId);
    if ("error" in created) {
      setError(created.error);
      setBusy(false);
      return;
    }
    const loaded = await loadRazorpay();
    if (!loaded || !window.Razorpay) {
      setError("Couldn't open the payment window. Please try again.");
      setBusy(false);
      return;
    }
    const rzp = new window.Razorpay({
      key: created.keyId,
      amount: created.amount,
      currency: "INR",
      name: created.hotelName,
      description: "Room service order",
      order_id: created.razorpayOrderId,
      theme: { color: themeColor },
      handler: async (r: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        const v = await verifyRazorpayPayment(
          slug,
          orderId,
          r.razorpay_order_id,
          r.razorpay_payment_id,
          r.razorpay_signature
        );
        if (v.ok) router.refresh();
        else {
          setError(v.error ?? "Payment could not be verified.");
          setBusy(false);
        }
      },
      modal: { ondismiss: () => setBusy(false) },
    } as Record<string, unknown>);
    rzp.open();
  }

  async function counter() {
    if (busy) return;
    setError("");
    setBusy(true);
    const res = await payAtReception(slug, orderId);
    if (res.ok) router.refresh();
    else {
      setError(res.error ?? "Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="hd-payopts">
      <button className="hd-paynow-btn" onClick={payNow} disabled={busy}>
        {busy ? "Please wait…" : "Pay Now — UPI (GPay / PhonePe / Paytm)"}
      </button>
      <div className="hd-claim-or">or</div>
      <button className="hd-reception-btn" onClick={counter} disabled={busy}>
        Pay at Counter (cash)
      </button>
      {error && (
        <div className="hd-order-error" style={{ marginTop: 12 }}>
          {error}
        </div>
      )}
    </div>
  );
}
