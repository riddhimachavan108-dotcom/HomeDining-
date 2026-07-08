import { notFound } from "next/navigation";
import { getAuthedHotel } from "@/lib/auth";
import SettingsForm from "./SettingsForm";
import CredentialsForm from "./CredentialsForm";

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ hotel: string }>;
}) {
  const { hotel: slug } = await params;
  const authed = await getAuthedHotel(slug);
  if (!authed) notFound();
  const hotel = authed.hotel;

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

      <div className="adm-page-head" style={{ marginTop: 32 }}>
        <div>
          <h1 className="adm-h1">Access codes &amp; passwords</h1>
          <p className="adm-page-sub">
            The guest code guests type to reach your menu, and the passwords for
            the manager and staff logins.
          </p>
        </div>
      </div>

      <CredentialsForm slug={hotel.slug} guestCode={hotel.guestCode ?? ""} />
    </div>
  );
}
