import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAuthedHotel } from "@/lib/auth";
import { getHotelBranding } from "@/lib/hotel";
import { logoutAction } from "@/lib/admin-auth-actions";
import OrderAlarm from "@/components/OrderAlarm";
import OrderCard from "@/components/OrderCard";

export default async function StaffOrdersPage({
  params,
}: {
  params: Promise<{ hotel: string }>;
}) {
  const { hotel: slug } = await params;

  const authed = await getAuthedHotel(slug);
  if (!authed) redirect(`/login`);

  const hotel = await getHotelBranding(slug);
  if (!hotel) redirect(`/login`);

  const orders = await prisma.order.findMany({
    where: { hotelId: authed.hotel.id, status: { not: "PENDING_PAYMENT" } },
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: 100,
  });
  const active = orders.filter(
    (o) => !["DELIVERED", "CANCELLED"].includes(o.status)
  ).length;

  const logout = logoutAction.bind(null, slug);

  return (
    <div className="adm-shell">
      <header className="adm-topbar">
        <div className="adm-topbar-left">
          <div className="adm-topbar-logo">
            {hotel.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={hotel.logoUrl} alt={hotel.name} />
            ) : (
              (hotel.logoText ?? hotel.name.slice(0, 2)).toUpperCase()
            )}
          </div>
          <div>
            <div className="adm-topbar-name">{hotel.name}</div>
            <div className="adm-topbar-sub">Staff — orders</div>
          </div>
        </div>
        <form action={logout}>
          <button className="adm-btn adm-btn-ghost" type="submit">
            Log out
          </button>
        </form>
      </header>

      <main className="adm-main">
        <OrderAlarm slug={slug} />
        <div className="adm-page-head">
          <div>
            <h1 className="adm-h1">Incoming orders</h1>
            <p className="adm-page-sub">
              {active > 0
                ? `${active} active order${active === 1 ? "" : "s"} to fulfil.`
                : "New orders from guests will appear here."}
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="adm-empty">
            No orders yet. When a guest places an order it shows up here with
            their room number.
          </div>
        ) : (
          <div className="adm-orders">
            {orders.map((o) => (
              <OrderCard key={o.id} slug={slug} order={o} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
