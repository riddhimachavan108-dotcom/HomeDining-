import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  TRACK_STAGES,
  TRACK_STAGE_LABELS,
  stageIndexForStatus,
} from "@/lib/order-stages";
import StatusPoller from "../StatusPoller";
import ActiveOrderSaver from "@/components/ActiveOrderSaver";

// Show the local time (India) a milestone was reached, e.g. "2:45 PM".
function fmtTime(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ hotel: string; id: string }>;
}) {
  const { hotel: slug, id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, hotel: { slug } },
    include: { hotel: true },
  });
  if (!order) notFound();

  const hotel = order.hotel;
  const cancelled = order.status === "CANCELLED";
  const delivered = order.status === "DELIVERED";
  const currentIndex = stageIndexForStatus(order.status);
  const etaMins = order.etaOverrideMinutes ?? hotel.prepMinutes ?? 30;

  const stageTimes: Record<string, Date | null> = {
    placed: order.createdAt,
    confirmed: order.paymentVerifiedAt,
    preparing: order.preparingAt,
    ontheway: order.outForDeliveryAt,
    delivered: order.deliveredAt,
  };

  const logo = hotel.logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={hotel.logoUrl} alt={hotel.name} />
  ) : (
    (hotel.logoText ?? hotel.name.slice(0, 2)).toUpperCase()
  );

  return (
    <div className="hd-track-page">
      {/* Auto-refresh so status changes appear without the guest reloading. */}
      <StatusPoller status={order.status} intervalMs={20000} />
      <ActiveOrderSaver slug={slug} orderId={order.id} status={order.status} />

      <div className="hd-track-wrap">
        <header className="hd-track-head" style={{ background: hotel.accentColor }}>
          <div className="hd-track-logo" style={{ background: hotel.themeColor }}>
            {logo}
          </div>
          <div className="hd-track-head-info">
            <span className="hd-track-hotel">{hotel.name}</span>
            <span className="hd-track-sub">
              Room {order.roomNumber} · Order #{order.id.slice(-6).toUpperCase()}
            </span>
          </div>
        </header>

        <div className="hd-track-card">
          {cancelled ? (
            <div className="hd-track-cancelled">
              <div className="hd-track-cancelled-icon">✕</div>
              <h2>Order cancelled</h2>
              <p>
                This order was cancelled. If this is unexpected, please contact
                the reception.
              </p>
            </div>
          ) : (
            <>
              <h1 className="hd-track-title">
                {delivered ? "Delivered — enjoy your meal!" : "Tracking your order"}
              </h1>

              <ol className="hd-track-timeline">
                {TRACK_STAGES.map((key, i) => {
                  const isCompleted =
                    i < currentIndex || (i === currentIndex && delivered);
                  const isCurrent = i === currentIndex && !delivered;
                  const state = isCompleted
                    ? "done"
                    : isCurrent
                    ? "current"
                    : "upcoming";
                  const time = fmtTime(stageTimes[key]);
                  return (
                    <li key={key} className={`hd-track-step ${state}`}>
                      <span className="hd-track-marker">
                        <span className="hd-track-dot">
                          {isCompleted ? "✓" : ""}
                        </span>
                      </span>
                      <span className="hd-track-body">
                        <span className="hd-track-label">
                          {TRACK_STAGE_LABELS[key]}
                        </span>
                        {time && (i <= currentIndex) && (
                          <span className="hd-track-time">{time}</span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ol>

              {!delivered && (
                <div className="hd-track-eta">
                  {order.status === "OUT_FOR_DELIVERY"
                    ? "On its way — arriving shortly"
                    : `Estimated time: approximately ${etaMins} minutes`}
                </div>
              )}

              <p className="hd-track-note">
                Our team is preparing your order with care. During busy hours or
                unforeseen circumstances, delivery may take slightly longer than
                estimated. We appreciate your patience and are doing our best to
                serve you soon. For any assistance, please contact the reception.
              </p>
            </>
          )}

          <div className="hd-track-links">
            <Link href={`/${slug}/order/${order.id}`} className="hd-track-back">
              View order details
            </Link>
            <Link href={`/${slug}/menu`} className="hd-track-back">
              Back to menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
