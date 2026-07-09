import Link from "next/link";
import type { Metadata } from "next";
import GuestCodeForm from "./GuestCodeForm";

export const metadata: Metadata = { title: "Order — Home Dining" };

export default function GuestEntryPage() {
  return (
    <div className="fd">
      <div className="fd-card">
        <div className="fd-brand-sm">🛎️ Home Dining</div>
        <h1 className="fd-title">Guest ordering</h1>
        <GuestCodeForm />
        <Link href="/" className="fd-back">
          ← Back
        </Link>
        <div className="fd-legal">
          <Link href="/privacy">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
