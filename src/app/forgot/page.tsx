import Link from "next/link";
import type { Metadata } from "next";
import ForgotForm from "./ForgotForm";

export const metadata: Metadata = { title: "Reset password — Home Dining" };

export default function ForgotPage() {
  return (
    <div className="fd">
      <div className="fd-card">
        <div className="fd-brand-sm">🛎️ Home Dining</div>
        <h1 className="fd-title">Forgot password</h1>
        <p className="fd-sub-sm">
          Enter the email you used when setting up your hotel and we&rsquo;ll
          send a link to reset your manager password.
        </p>
        <ForgotForm />
        <Link href="/login" className="fd-back">
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}
