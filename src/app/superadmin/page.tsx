import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { isSuperAdmin, getPlatformSettings } from "@/lib/superadmin";
import {
  updatePlatformSettings,
  setHotelOverride,
  markHotelPaid,
  logoutSuperAdmin,
} from "@/lib/superadmin-actions";
import {
  computeBilling,
  effectiveAmountPaise,
  formatDate,
  type BillingStatus,
} from "@/lib/billing";
import { formatPaise } from "@/lib/money";

export const metadata: Metadata = { title: "Super Admin — Home Dining" };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<BillingStatus, string> = {
  trial: "Trial",
  active: "Active",
  due: "Payment due",
  overdue: "Overdue",
};

export default async function SuperAdminPage() {
  if (!(await isSuperAdmin())) redirect("/superadmin/login");

  const settings = await getPlatformSettings();
  const hotels = await prisma.hotel.findMany({ orderBy: { createdAt: "asc" } });
  const rs = (p: number) => (p / 100).toString();

  return (
    <div className="adm-shell">
      <header className="adm-topbar">
        <div className="adm-topbar-left">
          <div className="adm-topbar-logo">HD</div>
          <div>
            <div className="adm-topbar-name">Super Admin</div>
            <div className="adm-topbar-sub">Home Dining · billing</div>
          </div>
        </div>
        <form action={logoutSuperAdmin}>
          <button className="adm-btn adm-btn-ghost" type="submit">
            Log out
          </button>
        </form>
      </header>

      <main className="adm-main">
        {/* Platform settings */}
        <div className="adm-page-head">
          <h1 className="adm-h1">Subscription settings</h1>
          <p className="adm-page-sub">
            The default price and the UPI ID hotels pay you at.
          </p>
        </div>
        <form action={updatePlatformSettings} className="adm-card adm-settings">
          <div className="adm-grid-2">
            <div className="adm-field">
              <label className="adm-label">Default monthly price (₹)</label>
              <input
                name="defaultAmount"
                type="number"
                min="0"
                step="1"
                className="adm-input"
                defaultValue={rs(settings.defaultAmountPaise)}
              />
              <span className="adm-hint">Applies to every hotel without an override.</span>
            </div>
            <div className="adm-field">
              <label className="adm-label">Your UPI ID (for subscription payments)</label>
              <input
                name="adminUpiId"
                className="adm-input"
                defaultValue={settings.adminUpiId ?? ""}
                placeholder="e.g. silverbest@okhdfcbank"
              />
              <span className="adm-hint">Shown to hotels in their payment banner &amp; QR.</span>
            </div>
          </div>
          <button className="adm-btn adm-btn-primary">Save settings</button>
        </form>

        {/* Hotels */}
        <div className="adm-page-head" style={{ marginTop: 28 }}>
          <h1 className="adm-h1">Hotels ({hotels.length})</h1>
          <p className="adm-page-sub">
            Trial is 45 days from sign-up. Marking a payment adds one month. Nothing is ever deleted.
          </p>
        </div>

        {hotels.length === 0 ? (
          <div className="adm-empty">No hotels yet.</div>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Hotel</th>
                  <th>Status</th>
                  <th>Ends / due</th>
                  <th>Price /mo</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((h) => {
                  const b = computeBilling(h.createdAt, h.paidUntil);
                  const amount = effectiveAmountPaise(
                    h.subscriptionAmountPaise,
                    settings.defaultAmountPaise
                  );
                  const when =
                    b.status === "trial" || b.status === "active"
                      ? `${formatDate(b.accessUntil)} · ${b.daysRemaining}d left`
                      : `${formatDate(b.accessUntil)} · ${b.daysOverdue}d over`;
                  return (
                    <tr key={h.id}>
                      <td>
                        <div className="sa-hotel">{h.name}</div>
                        <div className="sa-slug">/{h.slug}</div>
                      </td>
                      <td>
                        <span className={`sa-pill sa-${b.status}`}>
                          {STATUS_LABEL[b.status]}
                        </span>
                      </td>
                      <td className="sa-nums">{when}</td>
                      <td>
                        <form action={setHotelOverride} className="sa-inline">
                          <input type="hidden" name="hotelId" value={h.id} />
                          <input
                            name="amount"
                            type="number"
                            min="0"
                            className="adm-input sa-amount"
                            defaultValue={
                              h.subscriptionAmountPaise != null
                                ? rs(h.subscriptionAmountPaise)
                                : ""
                            }
                            placeholder={rs(settings.defaultAmountPaise)}
                          />
                          <button className="adm-btn adm-btn-ghost adm-btn-sm">Set</button>
                        </form>
                        <div className="sa-eff">now {formatPaise(amount)}</div>
                      </td>
                      <td>
                        <form action={markHotelPaid}>
                          <input type="hidden" name="hotelId" value={h.id} />
                          <button className="adm-btn adm-btn-primary adm-btn-sm">
                            ✓ Mark paid (+1 month)
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
