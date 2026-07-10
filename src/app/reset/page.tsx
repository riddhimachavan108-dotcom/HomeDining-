import Link from "next/link";
import type { Metadata } from "next";
import ResetForm from "./ResetForm";

export const metadata: Metadata = { title: "Set new password — Home Dining" };

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="fd">
      <div className="fd-card">
        <div className="fd-brand-sm">🛎️ Home Dining</div>
        <h1 className="fd-title">Set a new password</h1>
        {token ? (
          <ResetForm token={token} />
        ) : (
          <div className="fd-error" style={{ marginTop: 12 }}>
            This reset link is invalid. Please request a new one.
          </div>
        )}
        <Link href="/login" className="fd-back">
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}
