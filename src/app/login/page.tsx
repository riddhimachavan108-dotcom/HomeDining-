import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign in — Home Dining" };

// Step 1 of staff/manager entry: choose which role you're signing in as.
// Each role has its own password (set by the manager). Keeping them on
// separate screens makes it obvious which password does what.
export default function LoginChooser() {
  return (
    <div className="fd">
      <div className="fd-card">
        <div className="fd-brand-sm">🛎️ Home Dining</div>
        <h1 className="fd-title">Who&rsquo;s signing in?</h1>
        <p className="fd-sub-sm">
          Choose your role. Each has its own password.
        </p>

        <div className="fd-buttons" style={{ marginTop: 8 }}>
          <Link href="/login/manager" className="fd-btn fd-btn-dark">
            Hotel Manager
          </Link>
          <Link href="/login/staff" className="fd-btn fd-btn-primary">
            Staff
          </Link>
        </div>

        <div className="fd-role-note">
          Manager = edit menu, prices, logo &amp; settings. Staff = view and
          update orders only.
        </div>

        <div className="fd-links">
          <Link href="/">← Back</Link>
        </div>
        <div className="fd-legal">
          <Link href="/privacy">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
