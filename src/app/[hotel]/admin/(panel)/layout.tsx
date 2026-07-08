import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getAuthedHotel } from "@/lib/auth";
import { getHotelBranding } from "@/lib/hotel";
import { logoutAction } from "@/lib/admin-auth-actions";
import AdminNav from "./AdminNav";

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

      <main className="adm-main">{children}</main>
    </div>
  );
}
