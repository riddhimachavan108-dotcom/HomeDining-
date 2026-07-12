"use client";

import { useState } from "react";

type Props = {
  status: "trial-early" | "trial-ending" | "due" | "overdue";
  daysRemaining: number;
  amountLabel: string;
  trialEndLabel: string;
  adminUpi: string | null;
  qrDataUrl: string | null;
};

export default function BillingBanner({
  status,
  daysRemaining,
  amountLabel,
  trialEndLabel,
  adminUpi,
  qrDataUrl,
}: Props) {
  const [showQr, setShowQr] = useState(false);
  const dayWord = daysRemaining === 1 ? "day" : "days";
  const canPay = status !== "trial-early" && adminUpi && qrDataUrl;

  let message: React.ReactNode;
  if (status === "trial-early") {
    message = (
      <>
        🎁 You&rsquo;re on a <strong>free trial</strong> —{" "}
        <strong>
          {daysRemaining} {dayWord} left
        </strong>
        . Everything is free until <strong>{trialEndLabel}</strong>. After that,
        Home Dining is <strong>{amountLabel}/month</strong>.
      </>
    );
  } else if (status === "trial-ending") {
    message = (
      <>
        Your free trial ends in{" "}
        <strong>
          {daysRemaining} {dayWord}
        </strong>
        . Continue Home Dining for <strong>{amountLabel}/month</strong>.
      </>
    );
  } else if (status === "due") {
    message = (
      <>
        Your subscription payment is due — <strong>{amountLabel}</strong> for this
        month.{" "}
        {adminUpi
          ? `Pay via UPI to ${adminUpi} and it will be confirmed within 24 hours.`
          : "Please renew to keep your service running."}
      </>
    );
  } else {
    message = (
      <>
        Payment overdue — your account will be paused soon. Pay{" "}
        <strong>{amountLabel}</strong> to continue using Home Dining.
      </>
    );
  }

  return (
    <div className={`bill-banner bill-${status}`}>
      <div className="bill-row">
        <span className="bill-msg">{message}</span>
        {canPay && (
          <button className="bill-btn" onClick={() => setShowQr((v) => !v)}>
            {showQr ? "Hide QR" : "Show payment QR"}
          </button>
        )}
      </div>
      {showQr && canPay && (
        <div className="bill-qr">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl!} alt="Subscription payment QR" />
          <div className="bill-qr-info">
            <div className="bill-qr-amt">{amountLabel}</div>
            <div className="bill-qr-vpa">Pay to {adminUpi}</div>
            <div className="bill-qr-note">
              Scan with any UPI app. Confirmed within 24 hours of payment.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
