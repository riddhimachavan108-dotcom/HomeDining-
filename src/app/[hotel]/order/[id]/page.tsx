import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { formatPaise } from "@/lib/money";
import { buildUpiUri } from "@/lib/upi";
import StatusPoller from "./StatusPoller";
import PaidButton from "./PaidButton";

const STATUS_TEXT: Record<string, string> = {
  PENDING_PAYMENT:
    "Scan the QR and pay. Your order is sent to the kitchen only after you pay.",
  AWAITING_VERIFICATION:
    "Payment done — thank you! Our staff will verify it and start your order shortly.",
  CONFIRMED: "Payment confirmed! Your food is being prepared.",
  PREPARING: "Your food is being prepared.",
  DELIVERED: "Delivered. Enjoy your meal!",
  CANCELLED: "This order was cancelled. Please contact the front desk.",
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ hotel: string; id: string }>;
}) {
  const { hotel: slug, id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, hotel: { slug } },
    include: { items: true, hotel: true },
  });
  if (!order) notFound();

  const hotel = order.hotel;
  const cancelled = order.status === "CANCELLED";
  const pendingPayment = order.status === "PENDING_PAYMENT";

  // Generate a dynamic UPI QR with the exact amount pre-filled — only while
  // the guest still needs to pay.
  let qrDataUrl: string | null = null;
  let upiUri: string | null = null;
  if (hotel.upiId && pendingPayment) {
    upiUri = buildUpiUri(
      hotel.upiId,
      hotel.name,
      order.totalInPaise,
      `Room ${order.roomNumber} order`
    );
    qrDataUrl = await QRCode.toDataURL(upiUri, { width: 260, margin: 1 });
  }

  return (
    <div className="hd-order-page">
      <StatusPoller status={order.status} />
      <div className="hd-order-wrap">
        <div className="hd-order-hero">
          <div className="hd-order-check">
            {cancelled ? "✕" : pendingPayment ? "₹" : "✓"}
          </div>
          <h1>
            {cancelled
              ? "Order cancelled"
              : pendingPayment
              ? "Pay to place your order"
              : "Thank you! Your order has been received"}
          </h1>
          <p>{STATUS_TEXT[order.status] ?? ""}</p>
        </div>

        {/* UPI payment — shown only until the guest confirms payment */}
        {pendingPayment && (
          <div className="hd-order-card hd-pay-card">
            <div className="hd-pay-amount">Pay {formatPaise(order.totalInPaise)}</div>
            {qrDataUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="hd-pay-qr" src={qrDataUrl} alt="UPI payment QR code" />
                <p className="hd-pay-hint">
                  Scan with any UPI app (GPay, PhonePe, Paytm) to pay{" "}
                  <strong>{hotel.name}</strong>. The amount is locked to your bill —
                  you can&rsquo;t pay less or more.
                </p>
                <div className="hd-pay-vpa">UPI ID: {hotel.upiId}</div>
                {upiUri && (
                  <a className="hd-pay-open" href={upiUri}>
                    Open UPI app on this phone
                  </a>
                )}
                <PaidButton slug={slug} orderId={order.id} />
              </>
            ) : (
              <>
                <p className="hd-pay-hint">
                  Online payment isn&rsquo;t set up for this hotel yet. Please pay
                  at the front desk, then tap below.
                </p>
                <PaidButton slug={slug} orderId={order.id} />
              </>
            )}
          </div>
        )}

        <div className="hd-order-card">
          <div className="hd-order-meta">
            <span className="hd-order-room-lg">Room {order.roomNumber}</span>
            <span>Order #{order.id.slice(-6).toUpperCase()}</span>
          </div>

          <div style={{ marginTop: 8 }}>
            {order.items.map((it) => (
              <div key={it.id} className="hd-order-line">
                <span>
                  {it.quantity} × {it.nameSnapshot}
                </span>
                <span>{formatPaise(it.priceInPaise * it.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="hd-order-totals">
            <div className="hd-order-line">
              <span>Subtotal</span>
              <span>{formatPaise(order.subtotalInPaise)}</span>
            </div>
            <div className="hd-order-line">
              <span>GST</span>
              <span>{formatPaise(order.taxInPaise)}</span>
            </div>
            <div className="hd-order-line" style={{ fontWeight: 700 }}>
              <span>Total</span>
              <span>{formatPaise(order.totalInPaise)}</span>
            </div>
          </div>

          <Link href={`/${slug}/menu`} className="hd-order-back">
            ← Back to menu
          </Link>
        </div>
      </div>
    </div>
  );
}
