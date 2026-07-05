import { notFound } from "next/navigation";
import { getAuthedHotel } from "@/lib/auth";
import SettingsForm from "./SettingsForm";

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ hotel: string }>;
}) {
  const { hotel: slug } = await params;
  const hotel = await getAuthedHotel(slug);
  if (!hotel) notFound();

  return (
    <div>
      <div className="adm-page-head">
        <div>
          <h1 className="adm-h1">Branding</h1>
          <p className="adm-page-sub">
            Your hotel name, logo and colours. This is what guests see at{" "}
            <strong>/{hotel.slug}</strong>.
          </p>
        </div>
      </div>

      <SettingsForm
        hotel={{
          slug: hotel.slug,
          name: hotel.name,
          tagline: hotel.tagline,
          logoText: hotel.logoText,
          logoUrl: hotel.logoUrl,
          upiId: hotel.upiId,
          themeColor: hotel.themeColor,
          accentColor: hotel.accentColor,
          etaMinutes: hotel.etaMinutes,
          gstPercent: hotel.gstPercent,
        }}
      />
    </div>
  );
}
