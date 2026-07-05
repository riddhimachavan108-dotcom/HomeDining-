"use server";

import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { createSessionToken, setSessionCookie } from "./auth";
import { slugify } from "./slug";

export type WizardItem = {
  name: string;
  priceRupees: string;
  desc: string;
  veg: boolean;
  photoDataUrl: string | null;
};
export type WizardCategory = {
  name: string;
  icon: string;
  items: WizardItem[];
};
export type WizardPayload = {
  name: string;
  tagline: string;
  logoDataUrl: string | null;
  upiId: string;
  themeColor: string;
  accentColor: string;
  slug: string;
  password: string;
  categories: WizardCategory[];
};

const MAX_DATAURL_LEN = 2_000_000; // ~1.5 MB image
const rs = (v: string) => Math.round(parseFloat(v || "0") * 100);
const okImage = (s: string | null) =>
  s && s.startsWith("data:image/") && s.length <= MAX_DATAURL_LEN ? s : null;

/** Is this URL slug free to use? */
export async function checkSlugAvailable(
  raw: string
): Promise<{ slug: string; available: boolean }> {
  const slug = slugify(raw);
  if (!slug) return { slug, available: false };
  const existing = await prisma.hotel.findUnique({ where: { slug } });
  return { slug, available: !existing };
}

/**
 * Create a hotel from the onboarding wizard, then sign the manager in.
 * Returns { ok, slug } on success so the client can redirect to the dashboard.
 */
export async function createHotelFromWizard(
  payload: WizardPayload
): Promise<{ ok: true; slug: string } | { error: string }> {
  const name = payload.name?.trim();
  const slug = slugify(payload.slug || payload.name || "");
  const password = payload.password || "";

  if (!name) return { error: "Please enter your hotel name." };
  if (!slug) return { error: "Please choose a web address for your hotel." };
  if (password.length < 4) {
    return { error: "Your password must be at least 4 characters." };
  }

  const existing = await prisma.hotel.findUnique({ where: { slug } });
  if (existing) {
    return { error: `The address /${slug} is taken. Please choose another.` };
  }

  const monogram = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const hotel = await prisma.hotel.create({
    data: {
      slug,
      name,
      tagline: payload.tagline?.trim() || "Delivered to your door",
      logoText: monogram,
      logoUrl: okImage(payload.logoDataUrl),
      upiId: payload.upiId?.trim() || null,
      themeColor: payload.themeColor || "#B8860B",
      accentColor: payload.accentColor || "#1a1a2e",
      passwordHash: await bcrypt.hash(password, 10),
    },
  });

  // Categories + items
  for (let ci = 0; ci < payload.categories.length; ci++) {
    const cat = payload.categories[ci];
    if (!cat.name?.trim()) continue;
    const category = await prisma.category.create({
      data: {
        hotelId: hotel.id,
        name: cat.name.trim(),
        icon: cat.icon?.trim() || "🍽️",
        sortOrder: ci,
      },
    });
    const items = cat.items.filter((i) => i.name?.trim());
    for (let ii = 0; ii < items.length; ii++) {
      const it = items[ii];
      await prisma.menuItem.create({
        data: {
          hotelId: hotel.id,
          categoryId: category.id,
          name: it.name.trim(),
          description: it.desc?.trim() || "",
          priceInPaise: rs(it.priceRupees),
          isVeg: it.veg,
          imageUrl: okImage(it.photoDataUrl),
          sortOrder: ii,
        },
      });
    }
  }

  // Sign the manager in immediately.
  const token = createSessionToken({ hotelId: hotel.id, slug });
  await setSessionCookie(token);

  return { ok: true, slug };
}
