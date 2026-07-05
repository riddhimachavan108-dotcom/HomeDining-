import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { getHotelBranding } from "@/lib/hotel";

/**
 * Tenant layout: resolves the hotel and injects its brand colours as CSS
 * variables, so every descendant (gate, menu, cart) renders in the hotel's
 * brand using the shared design system in globals.css.
 */
export default async function HotelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ hotel: string }>;
}) {
  const { hotel: slug } = await params;
  const hotel = await getHotelBranding(slug);
  if (!hotel) notFound();

  const themeStyle = {
    "--primary": hotel.themeColor,
    "--primary-dark": `color-mix(in srgb, ${hotel.themeColor} 78%, black)`,
    "--accent": hotel.accentColor,
  } as CSSProperties;

  return <div style={themeStyle}>{children}</div>;
}
