import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home Dining",
  description: "Order food to your hotel room — no phone calls needed.",
};

// The front door. Deliberately shows nothing but the app name and two
// choices — no hotel names or lists, so no hotel can discover another.
export default function FrontDoor() {
  return (
    <div className="fd">
      <div className="fd-card">
        <div className="fd-brand">🛎️ Home Dining</div>
        <p className="fd-sub">Order food to your hotel room.</p>

        <div className="fd-buttons">
          <Link href="/login" className="fd-btn fd-btn-dark">
            Hotel Manager / Staff
          </Link>
          <Link href="/order" className="fd-btn fd-btn-primary">
            Guest
          </Link>
        </div>
      </div>
    </div>
  );
}
