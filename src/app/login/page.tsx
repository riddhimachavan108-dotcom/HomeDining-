import Link from "next/link";
import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Staff sign in — Home Dining" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const { reset } = await searchParams;

  return (
    <div className="fd">
      <div className="fd-card">
        <div className="fd-brand-sm">🛎️ Home Dining</div>
        <h1 className="fd-title">Hotel Manager / Staff</h1>
        <p className="fd-sub-sm">
          Managers get the full dashboard; staff see incoming orders only.
        </p>
        {reset && (
          <div className="fd-ok">
            Your password was updated. Please sign in with your new password.
          </div>
        )}
        <LoginForm />
        <div className="fd-links">
          <Link href="/forgot">Forgot password?</Link>
          <Link href="/">← Back</Link>
        </div>
        <div className="fd-legal">
          <Link href="/privacy">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
