import { notFound, redirect } from "next/navigation";
import { getHotelBranding } from "@/lib/hotel";
import { getAuthedHotel } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ hotel: string }>;
}) {
  const { hotel: slug } = await params;
  const hotel = await getHotelBranding(slug);
  if (!hotel) notFound();

  // Already logged in for this hotel → go to the dashboard.
  const authed = await getAuthedHotel(slug);
  if (authed) redirect(`/${slug}/admin`);

  return (
    <div className="adm-auth-wrap">
      <div className="adm-auth-card">
        <div className="adm-auth-logo">
          {hotel.logoUrl ? (
            <img src={hotel.logoUrl} alt={hotel.name} />
          ) : (
            (hotel.logoText ?? hotel.name.slice(0, 2)).toUpperCase()
          )}
        </div>
        <h1 className="adm-auth-title">{hotel.name}</h1>
        <p className="adm-auth-sub">Manager sign in</p>
        <LoginForm slug={slug} />
      </div>
    </div>
  );
}
