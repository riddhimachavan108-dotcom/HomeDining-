"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { claimPayment, payAtReception } from "@/lib/order-actions";

const NOT_CONFIRMED =
  "The payment has not been confirmed. Please pay using the QR code and enter the transaction ID shown in your UPI app.";

export default function PaymentClaim({
  slug,
  orderId,
}: {
  slug: string;
  orderId: string;
}) {
  const router = useRouter();
  const [txn, setTxn] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function confirm() {
    setError("");
    if (txn.trim().length < 8) {
      setError(NOT_CONFIRMED);
      return;
    }
    startTransition(async () => {
      const res = await claimPayment(slug, orderId, txn.trim());
      if (res.ok) router.refresh();
      else setError(res.error ?? NOT_CONFIRMED);
    });
  }

  function reception() {
    setError("");
    startTransition(async () => {
      const res = await payAtReception(slug, orderId);
      if (res.ok) router.refresh();
      else setError(res.error ?? "Please try again.");
    });
  }

  return (
    <div className="hd-claim">
      <label className="hd-claim-label" htmlFor="utr">
        After paying, enter your UPI transaction ID (UTR / reference number shown
        in your payment app)
      </label>
      <input
        id="utr"
        className="hd-claim-input"
        value={txn}
        onChange={(e) => setTxn(e.target.value)}
        placeholder="e.g. 419812345678"
        inputMode="text"
        autoComplete="off"
      />
      {error && <div className="hd-order-error">{error}</div>}
      <button className="hd-paid-btn" onClick={confirm} disabled={pending}>
        {pending ? "Please wait…" : "Confirm payment"}
      </button>

      <div className="hd-claim-or">or</div>
      <button
        className="hd-reception-btn"
        onClick={reception}
        disabled={pending}
      >
        Pay at reception (cash)
      </button>
    </div>
  );
}
