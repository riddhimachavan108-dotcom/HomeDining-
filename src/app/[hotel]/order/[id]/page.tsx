import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { formatPaise } from "@/lib/money";
import { buildUpiUri } from "@/lib/upi";
import StatusPoller from "./StatusPoller";
import PaymentClaim from "./PaymentClaim";
import PayOptions from "./PayOptions";

const STATUS_TEXT: Record<string, string> = {
  PENDING_PAYMENT:
    "Choose how to pay. Your order reaches the kitchen only after payment.",
  CLAIMED:
    "Your order has been received. Payment will be verified by the hotel.",
  PAY_AT_RECEPTION:
    "Your order has been received. Please pay at the reception when you check out.",
  CONFIRMED: "Payment verified! Your food is being prepared.",
  PREPARING: "Your food is being prepared.",
  DELIVERED: "Delivered. Enjoy your meal!",
  NOT_RECEIVED:
    "We couldn't confirm your payment yet. Please contact the reception.",
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
  const notReceived = order.status === "NOT_RECEIVED";
  const pendingPayment = order.status === "PENDING_PAYMENT";
  // Real payment gateway configured? Then "Pay Now" auto-confirms on a genuine
  // payment (no fake claims). Otherwise fall back to the manual UPI-QR flow.
  const hasGateway = Boolean(hotel.razorpayKeyId && hotel.razorpayKeySecret);

  // Generate a dynamic UPI QR with the exact amount pre-filled — only for the
  // manual fallback (no gateway).
  let qrDataUrl: string | null = null;
  let upiUri: string | null = null;
  if (hotel.upiId && pendingPayment && !hasGateway) {
    upiUri = buildUpiUri(
      hotel.upiId,
      hotel.name,
      order.totalInPaise,
      `Room ${order.roomNumber} order`
    );
    qrDataUrl = await QRCode.toDataURL(upiUri, { width: 260, margin: 1 });
  }

  const heroIcon = cancelled
    ? "✕"
    : notReceived
    ? "!"
    : pendingPayment
    ? "₹"
    : "✓";
  const heroTitle = cancelled
    ? "Order cancelled"
    : notReceived
    ? "Payment not confirmed"
    : pendingPayment
    ? "Pay to place your order"
    : "Thank you! Your order has been received";

  return (
    <div className="hd-order-page">
      <StatusPoller status={order.status} />
      <div className="hd-order-wrap">
        <div className="hd-order-hero">
          <div className="hd-order-check">{heroIcon}</div>
          <h1>{heroTitle}</h1>
          <p>{STATUS_TEXT[order.status] ?? ""}</p>
        </div>

        {/* Payment — shown only until the order is paid/placed */}
        {pendingPayment && (
          <div className="hd-order-card hd-pay-card">
            <div className="hd-pay-amount">Pay {formatPaise(order.totalInPaise)}</div>

            {hasGateway ? (
              // Real gateway: order confirms only on a genuine, verified payment.
              <>
                <p className="hd-pay-hint">
                  Pay securely by UPI. Your order is placed only after the payment
                  succeeds — no payment, no order.
                </p>
                <PayOptions
                  slug={slug}
                  orderId={order.id}
                  themeColor={hotel.themeColor}
                />
              </>
            ) : qrDataUrl ? (
              // Manual fallback (no gateway): UPI QR + transaction-ID claim.
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
                <PaymentClaim slug={slug} orderId={order.id} />
              </>
            ) : (
              <>
                <p className="hd-pay-hint">
                  Online payment isn&rsquo;t set up for this hotel yet. You can pay
                  at the counter instead.
                </p>
                <PaymentClaim slug={slug} orderId={order.id} />
              </>
            )}
          </div>
        )}

        <div className="hd-order-card">
          <div className="hd-order-meta">
            <span className="hd-order-room-lg">Room {order.roomNumber}</span>
            <span>Order #{order.id.slice(-6).toUpperCase()}</span>
          </div>

          {order.paymentRef && (
            <div className="hd-order-ref">
              Payment reference: <strong>{order.paymentRef}</strong>
            </div>
          )}

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
