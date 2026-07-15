import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAuthedHotel } from "@/lib/auth";
import { getHotelBranding } from "@/lib/hotel";
import { formatPaise } from "@/lib/money";
import { updateOrderStatus } from "@/lib/admin-actions";
import { logoutAction } from "@/lib/admin-auth-actions";
import OrderAlarm from "@/components/OrderAlarm";

const NEXT_STATUS: Record<string, { label: string; value: string } | null> = {
  AWAITING_VERIFICATION: { label: "✓ Confirm payment", value: "CONFIRMED" },
  CONFIRMED: { label: "Start preparing", value: "PREPARING" },
  PREPARING: { label: "Mark delivered", value: "DELIVERED" },
  DELIVERED: null,
  CANCELLED: null,
};
const STATUS_LABEL: Record<string, string> = {
  AWAITING_VERIFICATION: "Payment to verify",
  CONFIRMED: "Paid",
  PREPARING: "Preparing",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

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
    // Only paid-confirmed orders reach staff — never "waiting for payment".
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
            {orders.map((o) => {
              const next = NEXT_STATUS[o.status];
              return (
                <div key={o.id} className="adm-card adm-order">
                  <div className="adm-order-head">
                    <div className="adm-order-room">
                      Room <strong>{o.roomNumber}</strong>
                    </div>
                    <span className={`adm-status adm-status-${o.status.toLowerCase()}`}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </div>
                  {o.status === "AWAITING_VERIFICATION" && (
                    <div className="adm-verify-note">
                      Check your UPI app for {formatPaise(o.totalInPaise)} from
                      Room {o.roomNumber}, then confirm.
                    </div>
                  )}
                  <div className="adm-order-items">
                    {o.items.map((it) => (
                      <div key={it.id} className="adm-order-item">
                        <span>
                          {it.quantity} × {it.nameSnapshot}
                        </span>
                        <span>{formatPaise(it.priceInPaise * it.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="adm-order-foot">
                    <span className="adm-order-total">
                      Total {formatPaise(o.totalInPaise)}
                    </span>
                    <div className="adm-order-actions">
                      {next && (
                        <form action={updateOrderStatus.bind(null, slug)}>
                          <input type="hidden" name="id" value={o.id} />
                          <input type="hidden" name="status" value={next.value} />
                          <button className="adm-btn adm-btn-primary adm-btn-sm">
                            {next.label}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
