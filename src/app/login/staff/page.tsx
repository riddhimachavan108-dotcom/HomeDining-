import Link from "next/link";
import type { Metadata } from "next";
import RoleLoginForm from "../RoleLoginForm";

export const metadata: Metadata = { title: "Staff sign in — Home Dining" };

export default function StaffLoginPage() {
  return (
    <div className="fd">
      <div className="fd-card">
        <div className="fd-brand-sm">🛎️ Home Dining</div>
        <h1 className="fd-title">Staff</h1>
        <p className="fd-sub-sm">
          View incoming orders and update their status.
        </p>
        <RoleLoginForm role="staff" />
        <div className="fd-links">
          <Link href="/login">← Back</Link>
        </div>
        <div className="fd-legal">
          <Link href="/privacy">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
