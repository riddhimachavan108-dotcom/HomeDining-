import Link from "next/link";
import type { Metadata } from "next";
import RoleLoginForm from "../RoleLoginForm";

export const metadata: Metadata = { title: "Manager sign in — Home Dining" };

export default async function ManagerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const { reset } = await searchParams;
  return (
    <div className="fd">
      <div className="fd-card">
        <div className="fd-brand-sm">🛎️ Home Dining</div>
        <h1 className="fd-title">Hotel Manager</h1>
        <p className="fd-sub-sm">
          Full access — edit your menu, prices, logo, UPI ID and settings.
        </p>
        {reset && (
          <div className="fd-ok">
            Your password was updated. Please sign in with your new password.
          </div>
        )}
        <RoleLoginForm role="manager" />
        <div className="fd-links">
          <Link href="/forgot">Forgot password?</Link>
          <Link href="/login">← Back</Link>
        </div>
        <div className="fd-legal">
          <Link href="/privacy">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
