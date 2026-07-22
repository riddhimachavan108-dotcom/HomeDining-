"use server";

import crypto from "node:crypto";
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
 * Lightweight status lookup for the guest's "active order" banner on the menu.
 * Returns just the status string (or null if the order is gone), so the banner
 * can hide/clear itself once the order is delivered or cancelled.
 */
export async function getOrderStatusLite(
  slug: string,
  orderId: string
): Promise<{ status: string } | null> {
  if (!orderId) return null;
  const order = await prisma.order.findFirst({
    where: { id: orderId, hotel: { slug } },
    select: { status: true },
  });
  return order ? { status: order.status } : null;
}

function revalidateOrder(slug: string, orderId: string) {
  revalidatePath(`/${slug}/admin`);
  revalidatePath(`/${slug}/staff`);
  revalidatePath(`/${slug}/order/${orderId}`);
}

/**
 * The guest enters their UPI transaction ID (UTR) after paying. We store it
 * and mark the order "Claimed — to be verified". It is NOT treated as paid
 * until staff verify it against their UPI app.
 */
export async function claimPayment(
  slug: string,
  orderId: string,
  txnId: string
): Promise<{ ok?: boolean; error?: string }> {
  const ref = (txnId || "").trim();
  if (ref.length < 8) {
    return {
      error:
        "The payment has not been confirmed. Please pay using the QR code and enter the transaction ID shown in your UPI app.",
    };
  }
  const hotel = await prisma.hotel.findFirst({ where: { slug } });
  if (!hotel) return { error: "Hotel not found." };

  await prisma.order.updateMany({
    where: { id: orderId, hotelId: hotel.id, status: "PENDING_PAYMENT" },
    data: { status: "CLAIMED", paymentRef: ref },
  });
  revalidateOrder(slug, orderId);
  return { ok: true };
}

/** The guest chooses to pay cash at the reception; the hotel collects later. */
export async function payAtReception(
  slug: string,
  orderId: string
): Promise<{ ok?: boolean; error?: string }> {
  const hotel = await prisma.hotel.findFirst({ where: { slug } });
  if (!hotel) return { error: "Hotel not found." };

  await prisma.order.updateMany({
    where: { id: orderId, hotelId: hotel.id, status: "PENDING_PAYMENT" },
    data: { status: "PAY_AT_RECEPTION" },
  });
  revalidateOrder(slug, orderId);
  return { ok: true };
}

/* ── ONLINE PAYMENT (Razorpay gateway — true auto-confirm) ── */

type RzpCreate =
  | { error: string }
  | {
      ok: true;
      razorpayOrderId: string;
      keyId: string;
      amount: number;
      hotelName: string;
    };

/** Create a Razorpay order using the hotel's own keys. */
export async function createRazorpayOrder(
  slug: string,
  orderId: string
): Promise<RzpCreate> {
  const hotel = await prisma.hotel.findFirst({ where: { slug } });
  if (!hotel) return { error: "Hotel not found." };
  const keyId = hotel.razorpayKeyId;
  const keySecret = hotel.razorpayKeySecret;
  if (!keyId || !keySecret) {
    return { error: "Online payment is not set up for this hotel." };
  }
  const order = await prisma.order.findFirst({
    where: { id: orderId, hotelId: hotel.id },
  });
  if (!order) return { error: "Order not found." };

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
    },
    body: JSON.stringify({
      amount: order.totalInPaise,
      currency: "INR",
      receipt: order.id,
    }),
  });
  if (!res.ok) {
    return { error: "Couldn't start the payment. Please try again." };
  }
  const rzp = (await res.json()) as { id: string };
  return {
    ok: true,
    razorpayOrderId: rzp.id,
    keyId,
    amount: order.totalInPaise,
    hotelName: hotel.name,
  };
}

/**
 * Verify Razorpay's signature and mark the order CONFIRMED (paid) — ONLY if
 * the signature is genuine. A guest cannot fake this; the order reaches the
 * kitchen only after a real, verified payment.
 */
export async function verifyRazorpayPayment(
  slug: string,
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): Promise<{ ok?: boolean; error?: string }> {
  const hotel = await prisma.hotel.findFirst({ where: { slug } });
  if (!hotel?.razorpayKeySecret) return { error: "Payment not configured." };

  const expected = crypto
    .createHmac("sha256", hotel.razorpayKeySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { error: "Payment could not be verified." };
  }

  await prisma.order.updateMany({
    where: { id: orderId, hotelId: hotel.id, status: "PENDING_PAYMENT" },
    data: {
      status: "CONFIRMED",
      paymentRef: razorpayPaymentId,
      paymentVerifiedAt: new Date(),
    },
  });
  revalidateOrder(slug, orderId);
  return { ok: true };
}
