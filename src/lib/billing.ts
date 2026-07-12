// Pure subscription-billing math — safe to import anywhere.
// Trial is always (createdAt + 45 days). paidUntil (if set) extends access.

export const TRIAL_DAYS = 45;
export const MONTH_DAYS = 30;
export const OVERDUE_DAYS = 10;
const DAY = 86_400_000;

export type BillingStatus = "trial" | "active" | "due" | "overdue";

export type Billing = {
  status: BillingStatus;
  trialEndsAt: Date;
  accessUntil: Date; // end of the current trial or paid period
  daysRemaining: number; // for trial / active
  daysOverdue: number; // for due / overdue
};

export function computeBilling(
  createdAt: Date,
  paidUntil: Date | null,
  now: Date = new Date()
): Billing {
  const trialEndsAt = new Date(createdAt.getTime() + TRIAL_DAYS * DAY);
  const accessUntil =
    paidUntil && paidUntil.getTime() > trialEndsAt.getTime()
      ? paidUntil
      : trialEndsAt;

  if (now.getTime() <= accessUntil.getTime()) {
    const paidActive = Boolean(paidUntil && paidUntil.getTime() >= now.getTime());
    return {
      status: paidActive ? "active" : "trial",
      trialEndsAt,
      accessUntil,
      daysRemaining: Math.max(
        0,
        Math.ceil((accessUntil.getTime() - now.getTime()) / DAY)
      ),
      daysOverdue: 0,
    };
  }

  const daysOverdue = Math.floor((now.getTime() - accessUntil.getTime()) / DAY);
  return {
    status: daysOverdue > OVERDUE_DAYS ? "overdue" : "due",
    trialEndsAt,
    accessUntil,
    daysRemaining: 0,
    daysOverdue,
  };
}

/** Marking a payment extends access by one month from the later of now / current end. */
export function nextPaidUntil(accessUntil: Date, now: Date = new Date()): Date {
  const base = Math.max(now.getTime(), accessUntil.getTime());
  return new Date(base + MONTH_DAYS * DAY);
}

export function effectiveAmountPaise(
  override: number | null | undefined,
  defaultAmount: number
): number {
  return override != null ? override : defaultAmount;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
