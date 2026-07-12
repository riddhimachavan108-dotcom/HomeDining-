"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { createSessionToken, setSessionCookie, type Role } from "./auth";

// Deliberately generic so we never reveal whether a hotel/code exists.
const NOT_FOUND = "Not found — please check and try again.";

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

/**
 * Guest enters their hotel's guest code → go straight to that hotel's menu.
 * Wrong code returns the same generic error (no hotel names leaked).
 */
export async function resolveGuestCode(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const code = normalizeCode(String(formData.get("code") || ""));
  if (!code) return { error: NOT_FOUND };

  const hotel = await prisma.hotel.findFirst({
    where: { guestCode: code, isActive: true },
    select: { slug: true },
  });
  if (!hotel) return { error: NOT_FOUND };

  redirect(`/${hotel.slug}/menu`);
}

/**
 * Manager/Staff login by hotel name (or web address) + password. The password
 * decides the role: manager password → full dashboard, staff password →
 * orders-only view. Any mismatch returns the same generic error.
 */
export async function roleLogin(
  role: Role,
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const nameInput = String(formData.get("hotelName") || "").trim();
  const password = String(formData.get("password") || "");
  if (!nameInput || !password) return { error: NOT_FOUND };

  // Candidates by display name OR web-address slug (case-insensitive).
  const candidates = await prisma.hotel.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { equals: nameInput, mode: "insensitive" } },
        { slug: nameInput.toLowerCase() },
      ],
    },
    select: {
      id: true,
      slug: true,
      passwordHash: true,
      staffPasswordHash: true,
    },
  });

  // Check the password ONLY against the chosen role's hash — so the staff
  // password never works on the manager screen, and vice versa.
  const matches: { slug: string; hotelId: string }[] = [];
  for (const h of candidates) {
    const hash = role === "manager" ? h.passwordHash : h.staffPasswordHash;
    if (hash && (await bcrypt.compare(password, hash))) {
      matches.push({ slug: h.slug, hotelId: h.id });
    }
  }

  // Exactly one match logs in; zero or ambiguous → generic error.
  if (matches.length !== 1) return { error: NOT_FOUND };
  const m = matches[0];

  const token = createSessionToken({ hotelId: m.hotelId, slug: m.slug, role });
  await setSessionCookie(token);
  redirect(role === "manager" ? `/${m.slug}/admin` : `/${m.slug}/staff`);
}
