"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { computeBilling, nextPaidUntil } from "./billing";
import {
  checkSuperPassword,
  createSuperToken,
  setSuperCookie,
  clearSuperCookie,
  isSuperAdmin,
} from "./superadmin";

async function requireSuper() {
  if (!(await isSuperAdmin())) throw new Error("Not authorized");
}

const rupeesToPaise = (v: FormDataEntryValue | null) =>
  Math.round(parseFloat(String(v || "0")) * 100);

export async function loginSuperAdmin(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const password = String(formData.get("password") || "");
  if (!checkSuperPassword(password)) {
    return { error: "Incorrect password." };
  }
  await setSuperCookie(createSuperToken());
  redirect("/superadmin");
}

export async function logoutSuperAdmin() {
  await clearSuperCookie();
  redirect("/superadmin/login");
}

export async function updatePlatformSettings(formData: FormData) {
  await requireSuper();
  const amount = rupeesToPaise(formData.get("defaultAmount"));
  const upi = String(formData.get("adminUpiId") || "").trim() || null;
  await prisma.platformSettings.upsert({
    where: { id: "platform" },
    update: { defaultAmountPaise: amount > 0 ? amount : 0, adminUpiId: upi },
    create: {
      id: "platform",
      defaultAmountPaise: amount > 0 ? amount : 50000,
      adminUpiId: upi,
    },
  });
  revalidatePath("/superadmin");
}

export async function setHotelOverride(formData: FormData) {
  await requireSuper();
  const id = String(formData.get("hotelId") || "");
  const raw = String(formData.get("amount") || "").trim();
  if (!id) return;
  // Empty clears the override (hotel falls back to the platform default).
  const override = raw === "" ? null : rupeesToPaise(raw);
  await prisma.hotel.update({
    where: { id },
    data: { subscriptionAmountPaise: override },
  });
  revalidatePath("/superadmin");
}

export async function markHotelPaid(formData: FormData) {
  await requireSuper();
  const id = String(formData.get("hotelId") || "");
  if (!id) return;
  const hotel = await prisma.hotel.findUnique({ where: { id } });
  if (!hotel) return;
  const billing = computeBilling(hotel.createdAt, hotel.paidUntil);
  await prisma.hotel.update({
    where: { id },
    data: { paidUntil: nextPaidUntil(billing.accessUntil) },
  });
  revalidatePath("/superadmin");
}
