import { formatPaise } from "@/lib/money";
import { updateOrderStatus } from "@/lib/admin-actions";

type OrderCardOrder = {
  id: string;
  roomNumber: string;
  status: string;
  paymentRef: string | null;
  totalInPaise: number;
  items: {
    id: string;
    quantity: number;
    nameSnapshot: string;
    priceInPaise: number;
  }[];
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  CLAIMED: { label: "Claimed · to verify", cls: "claimed" },
  PAY_AT_RECEPTION: { label: "Pay at reception", cls: "reception" },
  NOT_RECEIVED: { label: "Payment NOT received", cls: "notreceived" },
  CONFIRMED: { label: "Paid ✓", cls: "confirmed" },
  PREPARING: { label: "Preparing", cls: "preparing" },
  DELIVERED: { label: "Delivered", cls: "delivered" },
  CANCELLED: { label: "Cancelled", cls: "cancelled" },
};

function StatusButton({
  slug,
  orderId,
  status,
  label,
  variant,
}: {
  slug: string;
  orderId: string;
  status: string;
  label: string;
  variant: "primary" | "ghost" | "danger";
}) {
  const cls =
    variant === "primary"
      ? "adm-btn adm-btn-primary adm-btn-sm"
      : variant === "danger"
      ? "adm-btn adm-btn-danger adm-btn-sm"
      : "adm-btn adm-btn-ghost adm-btn-sm";
  return (
    <form action={updateOrderStatus.bind(null, slug)}>
      <input type="hidden" name="id" value={orderId} />
      <input type="hidden" name="status" value={status} />
      <button className={cls}>{label}</button>
    </form>
  );
}

export default function OrderCard({
  slug,
  order,
}: {
  slug: string;
  order: OrderCardOrder;
}) {
  const meta = STATUS_META[order.status] ?? {
    label: order.status,
    cls: "cancelled",
  };
  const s = order.status;
  const toVerify = s === "CLAIMED" || s === "PAY_AT_RECEPTION";

  return (
    <div className="adm-card adm-order">
      <div className="adm-order-head">
        <div className="adm-order-room">
          Room <strong>{order.roomNumber}</strong>
        </div>
        <span className={`adm-status adm-status-${meta.cls}`}>{meta.label}</span>
      </div>

      {s === "CLAIMED" && order.paymentRef && (
        <div className="adm-txn">
          Guest&rsquo;s UPI transaction ID: <strong>{order.paymentRef}</strong>
          <span className="adm-txn-note">
            — check your UPI app for this before verifying.
          </span>
        </div>
      )}
      {s === "PAY_AT_RECEPTION" && (
        <div className="adm-txn">
          Guest will <strong>pay cash at reception</strong>. Collect at checkout.
        </div>
      )}
      {s === "NOT_RECEIVED" && (
        <div className="adm-flag">
          ⚠ Payment not received — contact the room before preparing.
        </div>
      )}

      <div className="adm-order-items">
        {order.items.map((it) => (
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
          Total {formatPaise(order.totalInPaise)}
        </span>
        <div className="adm-order-actions">
          {toVerify && (
            <>
              <StatusButton
                slug={slug}
                orderId={order.id}
                status="CONFIRMED"
                label="✓ Payment verified"
                variant="primary"
              />
              <StatusButton
                slug={slug}
                orderId={order.id}
                status="NOT_RECEIVED"
                label="Payment not received"
                variant="danger"
              />
            </>
          )}
          {s === "NOT_RECEIVED" && (
            <>
              <StatusButton
                slug={slug}
                orderId={order.id}
                status="CONFIRMED"
                label="✓ Payment verified"
                variant="primary"
              />
              <StatusButton
                slug={slug}
                orderId={order.id}
                status="CANCELLED"
                label="Cancel order"
                variant="ghost"
              />
            </>
          )}
          {s === "CONFIRMED" && (
            <StatusButton
              slug={slug}
              orderId={order.id}
              status="PREPARING"
              label="Start preparing"
              variant="primary"
            />
          )}
          {s === "PREPARING" && (
            <StatusButton
              slug={slug}
              orderId={order.id}
              status="DELIVERED"
              label="Mark delivered"
              variant="primary"
            />
          )}
        </div>
      </div>
    </div>
  );
}
