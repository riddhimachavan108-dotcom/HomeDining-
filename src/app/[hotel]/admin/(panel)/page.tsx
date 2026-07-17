import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAuthedHotel } from "@/lib/auth";
import OrderAlarm from "@/components/OrderAlarm";
import OrderCard from "@/components/OrderCard";

export default async function AdminOrdersPage({
  params,
}: {
  params: Promise<{ hotel: string }>;
}) {
  const { hotel: slug } = await params;
  const authed = await getAuthedHotel(slug);
  if (!authed) notFound();

  const orders = await prisma.order.findMany({
    // Only orders where the guest has chosen a payment path reach staff —
    // never "waiting for payment".
    where: { hotelId: authed.hotel.id, status: { not: "PENDING_PAYMENT" } },
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: 100,
  });

  const active = orders.filter(
    (o) => !["DELIVERED", "CANCELLED"].includes(o.status)
  ).length;

  return (
    <div>
      <OrderAlarm slug={slug} />
      <div className="adm-page-head">
        <div>
          <h1 className="adm-h1">Orders</h1>
          <p className="adm-page-sub">
            {active > 0
              ? `${active} active order${active === 1 ? "" : "s"} to fulfil.`
              : "New orders from guests will appear here."}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="adm-empty">
          No orders yet. When a guest places an order it shows up here with their
          room number.
        </div>
      ) : (
        <div className="adm-orders">
          {orders.map((o) => (
            <OrderCard key={o.id} slug={slug} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}
