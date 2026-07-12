"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./db";

export type CartLineInput = { id: string; qty: number };

type CreateResult = { error: string } | { ok: true; orderId: string };

/**
 * Create an order from the guest's cart. Prices are re-read from the
 * database — never trust the amounts the client sends. The order is saved
 * as AWAITING_VERIFICATION: the guest pays by UPI QR, and staff confirm the
 * payment from their UPI app in the dashboard.
 */
export async function createOrder(
  slug: string,
  room: string,
  items: CartLineInput[],
  note?: string
): Promise<CreateResult> {
  const hotel = await prisma.hotel.findFirst({
    where: { slug, isActive: true },
  });
  if (!hotel) return { error: "Hotel not found." };
  if (!room?.trim()) return { error: "Please enter your room number." };
  if (!items?.length) return { error: "Your cart is empty." };

  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: items.map((i) => i.id) },
      hotelId: hotel.id,
      isAvailable: true,
    },
  });
  const byId = new Map(menuItems.map((m) => [m.id, m]));

  let subtotal = 0;
  const lineData = [];
  for (const it of items) {
    const m = byId.get(it.id);
    if (!m) continue; // silently drop unknown / unavailable items
    const qty = Math.max(1, Math.min(99, Math.floor(it.qty)));
    subtotal += m.priceInPaise * qty;
    lineData.push({
      menuItemId: m.id,
      nameSnapshot: m.name,
      priceInPaise: m.priceInPaise,
      quantity: qty,
    });
  }
  if (!lineData.length) {
    return { error: "None of your items are available right now." };
  }

  const tax = Math.round((subtotal * hotel.gstPercent) / 100);
  const total = subtotal + tax;

  const order = await prisma.order.create({
    data: {
      hotelId: hotel.id,
      roomNumber: room.trim(),
      note: note?.trim() || null,
      // Hidden from staff until the guest confirms payment.
      status: "PENDING_PAYMENT",
      subtotalInPaise: subtotal,
      taxInPaise: tax,
      totalInPaise: total,
      items: { create: lineData },
    },
  });

  return { ok: true, orderId: order.id };
}

/**
 * The guest taps "I have paid" after scanning the UPI QR. Only then does the
 * order become visible to staff (as "payment to verify"). Nothing is shown to
 * staff before this — an unpaid/abandoned order never reaches them.
 */
export async function markOrderPaid(
  slug: string,
  orderId: string
): Promise<{ ok?: boolean; error?: string }> {
  const hotel = await prisma.hotel.findFirst({ where: { slug } });
  if (!hotel) return { error: "Hotel not found." };

  await prisma.order.updateMany({
    where: { id: orderId, hotelId: hotel.id, status: "PENDING_PAYMENT" },
    data: { status: "AWAITING_VERIFICATION" },
  });

  revalidatePath(`/${slug}/admin`);
  revalidatePath(`/${slug}/staff`);
  revalidatePath(`/${slug}/order/${orderId}`);
  return { ok: true };
}
