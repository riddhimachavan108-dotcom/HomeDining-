"use client";

import { useState } from "react";

type Props = {
  status: "trial" | "due" | "overdue";
  daysRemaining: number;
  amountLabel: string;
  adminUpi: string | null;
  qrDataUrl: string | null;
};

export default function BillingBanner({
  status,
  daysRemaining,
  amountLabel,
  adminUpi,
  qrDataUrl,
}: Props) {
  const [showQr, setShowQr] = useState(false);

  let message: React.ReactNode;
  if (status === "trial") {
    message = (
      <>
        Your free trial ends in{" "}
        <strong>
          {daysRemaining} day{daysRemaining === 1 ? "" : "s"}
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
        {adminUpi && qrDataUrl && (
          <button className="bill-btn" onClick={() => setShowQr((v) => !v)}>
            {showQr ? "Hide QR" : "Show payment QR"}
          </button>
        )}
      </div>
      {showQr && adminUpi && qrDataUrl && (
        <div className="bill-qr">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="Subscription payment QR" />
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
