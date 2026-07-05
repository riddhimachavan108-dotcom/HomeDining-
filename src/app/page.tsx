import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const hotels = await prisma.hotel.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: { slug: true, name: true, logoText: true, logoUrl: true, themeColor: true },
  });

  return (
    <div className="lp">
      <header className="lp-hero">
        <div className="lp-badge">🛎️ Home Dining</div>
        <h1>Room-service ordering for hotels</h1>
        <p>
          Set up your hotel in minutes: add your name, logo, UPI ID and menu.
          You get your own link to put in every room, and guests order &amp; pay
          from their phone — no phone calls, no waiting.
        </p>
        <Link href="/setup" className="lp-cta">
          Set up your hotel →
        </Link>
      </header>

      <main className="lp-main">
        <div className="lp-steps">
          <div className="lp-step">
            <span>1</span> Enter your hotel name, logo, UPI ID &amp; build your menu
          </div>
          <div className="lp-step">
            <span>2</span> Get your unique link and put it in every room
          </div>
          <div className="lp-step">
            <span>3</span> Guests order &amp; pay by UPI; you see orders instantly
          </div>
        </div>

        {hotels.length > 0 && (
          <div className="lp-existing">
            <h2 className="lp-section-title">Hotels already set up</h2>
            <div className="lp-hotels">
              {hotels.map((h) => (
                <div
                  key={h.slug}
                  className="lp-card"
                  style={{ ["--card-primary" as string]: h.themeColor }}
                >
                  <div className="lp-card-head">
                    <div className="lp-card-logo">
                      {h.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={h.logoUrl} alt={h.name} />
                      ) : (
                        (h.logoText ?? h.name.slice(0, 2)).toUpperCase()
                      )}
                    </div>
                    <div className="lp-card-name">{h.name}</div>
                  </div>
                  <div className="lp-card-actions">
                    <Link href={`/${h.slug}`} className="lp-btn lp-btn-primary">
                      Guest site →
                    </Link>
                    <Link
                      href={`/${h.slug}/admin/login`}
                      className="lp-btn lp-btn-ghost"
                    >
                      Manager login
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="lp-footer">
        Home Dining · multi-tenant room service
      </footer>
    </div>
  );
}
