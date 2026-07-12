import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { getAuthedHotel } from "@/lib/auth";
import { getHotelBranding } from "@/lib/hotel";
import { logoutAction } from "@/lib/admin-auth-actions";
import { getPlatformSettings } from "@/lib/superadmin";
import { computeBilling, effectiveAmountPaise, formatDate } from "@/lib/billing";
import { formatPaise } from "@/lib/money";
import { buildUpiUri } from "@/lib/upi";
import AdminNav from "./AdminNav";
import BillingBanner from "./BillingBanner";

export default async function AdminPanelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ hotel: string }>;
}) {
  const { hotel: slug } = await params;
  const hotel = await getHotelBranding(slug);
  if (!hotel) notFound();

  // Auth guard: the full dashboard is manager-only. Not signed in → login;
  // signed in as staff → send them to the limited orders view.
  const authed = await getAuthedHotel(slug);
  if (!authed) redirect(`/login`);
  if (authed.role !== "manager") redirect(`/${slug}/staff`);

  const logout = logoutAction.bind(null, slug);

  // Subscription banner — MANAGER dashboard only (never guests/staff).
  const settings = await getPlatformSettings();
  const billing = computeBilling(authed.hotel.createdAt, authed.hotel.paidUntil);
  const amountPaise = effectiveAmountPaise(
    authed.hotel.subscriptionAmountPaise,
    settings.defaultAmountPaise
  );
  // Show a banner for the whole trial (gentle early, nudge in last 7 days),
  // plus due/overdue. "active" (paid) shows nothing.
  const showBanner = billing.status !== "active";
  let bannerStatus: "trial-early" | "trial-ending" | "due" | "overdue" = "due";
  if (billing.status === "trial") {
    bannerStatus = billing.daysRemaining <= 7 ? "trial-ending" : "trial-early";
  } else if (billing.status === "overdue") {
    bannerStatus = "overdue";
  } // "due" and "active"(unused) fall through to the "due" default

  // A payment QR is only relevant once payment matters (not early trial).
  let subQr: string | null = null;
  if (
    showBanner &&
    bannerStatus !== "trial-early" &&
    settings.adminUpiId &&
    amountPaise > 0
  ) {
    subQr = await QRCode.toDataURL(
      buildUpiUri(
        settings.adminUpiId,
        "Home Dining",
        amountPaise,
        `Home Dining subscription — ${authed.hotel.name}`
      ),
      { width: 220, margin: 1 }
    );
  }

  return (
    <div className="adm-shell">
      <header className="adm-topbar">
        <div className="adm-topbar-left">
          <div className="adm-topbar-logo">
            {hotel.logoUrl ? (
              <img src={hotel.logoUrl} alt={hotel.name} />
            ) : (
              (hotel.logoText ?? hotel.name.slice(0, 2)).toUpperCase()
            )}
          </div>
          <div>
            <div className="adm-topbar-name">{hotel.name}</div>
            <div className="adm-topbar-sub">Manager dashboard</div>
          </div>
        </div>
        <div className="adm-topbar-right">
          <Link
            href={`/${slug}`}
            target="_blank"
            className="adm-btn adm-btn-ghost"
          >
            View guest site ↗
          </Link>
          <form action={logout}>
            <button className="adm-btn adm-btn-ghost" type="submit">
              Log out
            </button>
          </form>
        </div>
      </header>

      <AdminNav slug={slug} />

      {showBanner && (
        <div className="adm-main" style={{ paddingBottom: 0 }}>
          <BillingBanner
            status={bannerStatus}
            daysRemaining={billing.daysRemaining}
            amountLabel={formatPaise(amountPaise)}
            trialEndLabel={formatDate(billing.trialEndsAt)}
            adminUpi={settings.adminUpiId}
            qrDataUrl={subQr}
          />
        </div>
      )}

      <main className="adm-main">{children}</main>
    </div>
  );
}
