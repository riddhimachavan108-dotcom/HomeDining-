import Link from "next/link";
import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Staff sign in — Home Dining" };

export default function LoginPage() {
  return (
    <div className="fd">
      <div className="fd-card">
        <div className="fd-brand-sm">🛎️ Home Dining</div>
        <h1 className="fd-title">Hotel Manager / Staff</h1>
        <p className="fd-sub-sm">
          Managers get the full dashboard; staff see incoming orders only.
        </p>
        <LoginForm />
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
