import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getHotelBranding } from "@/lib/hotel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hotel: string }>;
}): Promise<Metadata> {
  const { hotel: slug } = await params;
  const hotel = await getHotelBranding(slug);
  return {
    title: hotel ? `${hotel.name} — Room Dining` : "Home Dining",
    description: hotel?.tagline ?? undefined,
  };
}

export default async function HotelWelcomePage({
  params,
}: {
  params: Promise<{ hotel: string }>;
}) {
  const { hotel: slug } = await params;
  const hotel = await getHotelBranding(slug);
  if (!hotel) notFound();

  return (
    <div className="hd-welcome">
      <div className="hd-welcome-card">
        <div className="hd-welcome-logo">
          {hotel.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={hotel.logoUrl} alt={hotel.name} />
          ) : (
            (hotel.logoText ?? hotel.name.slice(0, 2)).toUpperCase()
          )}
        </div>
        <h1 className="hd-welcome-name">{hotel.name}</h1>
        <p className="hd-welcome-tagline">{hotel.tagline}</p>

        <Link href={`/${slug}/menu`} className="hd-welcome-cta">
          Click here to order
        </Link>

        <p className="hd-welcome-note">Fresh food, delivered to your room.</p>
      </div>

      <Link href={`/login`} className="hd-welcome-staff">
        Hotel staff? Sign in
      </Link>
    </div>
  );
}
