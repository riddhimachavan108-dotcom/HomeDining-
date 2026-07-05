"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { getAuthedHotel } from "./auth";

// Every action re-verifies the session and returns the hotelId, so all
// writes are scoped to the logged-in hotel — a hotel can never touch
// another tenant's data even if it forges an id.
async function requireHotel(slug: string): Promise<string> {
  const hotel = await getAuthedHotel(slug);
  if (!hotel) throw new Error("Not authorized");
  return hotel.id;
}

const rupeesToPaise = (v: FormDataEntryValue | null) =>
  Math.round(parseFloat(String(v || "0")) * 100);

const MAX_IMAGE_BYTES = 1_200_000; // ~1.2 MB per photo

// Read an uploaded image into a data URL (works on any host, no file storage).
// Returns undefined when no valid image was provided.
async function readImageDataUrl(
  file: FormDataEntryValue | null
): Promise<string | undefined> {
  if (!(file instanceof File) || file.size === 0) return undefined;
  if (!file.type.startsWith("image/")) return undefined;
  if (file.size > MAX_IMAGE_BYTES) return undefined;
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

function refresh(slug: string) {
  revalidatePath(`/${slug}/admin/menu`);
  revalidatePath(`/${slug}/admin`);
  revalidatePath(`/${slug}`); // guest menu reflects changes immediately
}

/* ── CATEGORIES ─────────────────────────────────────────── */

export async function addCategory(slug: string, formData: FormData) {
  const hotelId = await requireHotel(slug);
  const name = String(formData.get("name") || "").trim();
  const icon = String(formData.get("icon") || "🍽️").trim() || "🍽️";
  if (!name) return;
  const count = await prisma.category.count({ where: { hotelId } });
  await prisma.category.create({
    data: { hotelId, name, icon, sortOrder: count },
  });
  refresh(slug);
}

export async function updateCategory(slug: string, formData: FormData) {
  const hotelId = await requireHotel(slug);
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const icon = String(formData.get("icon") || "🍽️").trim() || "🍽️";
  if (!id || !name) return;
  await prisma.category.updateMany({
    where: { id, hotelId },
    data: { name, icon },
  });
  refresh(slug);
}

export async function deleteCategory(slug: string, formData: FormData) {
  const hotelId = await requireHotel(slug);
  const id = String(formData.get("id") || "");
  if (!id) return;
  // Cascade removes the category's items too (see schema onDelete).
  await prisma.category.deleteMany({ where: { id, hotelId } });
  refresh(slug);
}

/* ── MENU ITEMS ─────────────────────────────────────────── */

export async function addItem(slug: string, formData: FormData) {
  const hotelId = await requireHotel(slug);
  const categoryId = String(formData.get("categoryId") || "");
  const name = String(formData.get("name") || "").trim();
  if (!categoryId || !name) return;

  // Ensure the category belongs to this hotel.
  const category = await prisma.category.findFirst({
    where: { id: categoryId, hotelId },
  });
  if (!category) return;

  const count = await prisma.menuItem.count({ where: { categoryId } });
  const imageUrl = await readImageDataUrl(formData.get("photo"));
  await prisma.menuItem.create({
    data: {
      hotelId,
      categoryId,
      name,
      description: String(formData.get("description") || "").trim(),
      priceInPaise: rupeesToPaise(formData.get("price")),
      isVeg: formData.get("isVeg") === "on",
      imageUrl: imageUrl ?? null,
      isAvailable: true,
      sortOrder: count,
    },
  });
  refresh(slug);
}

export async function updateItem(slug: string, formData: FormData) {
  const hotelId = await requireHotel(slug);
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  if (!id || !name) return;
  const newImage = await readImageDataUrl(formData.get("photo"));
  const removePhoto = formData.get("removePhoto") === "on";
  await prisma.menuItem.updateMany({
    where: { id, hotelId },
    data: {
      name,
      description: String(formData.get("description") || "").trim(),
      priceInPaise: rupeesToPaise(formData.get("price")),
      isVeg: formData.get("isVeg") === "on",
      // Replace the photo only when a new one is uploaded, or clear it if asked.
      ...(removePhoto ? { imageUrl: null } : newImage ? { imageUrl: newImage } : {}),
    },
  });
  refresh(slug);
}

export async function toggleItemAvailable(slug: string, formData: FormData) {
  const hotelId = await requireHotel(slug);
  const id = String(formData.get("id") || "");
  const available = formData.get("available") === "true";
  if (!id) return;
  await prisma.menuItem.updateMany({
    where: { id, hotelId },
    data: { isAvailable: available },
  });
  refresh(slug);
}

export async function deleteItem(slug: string, formData: FormData) {
  const hotelId = await requireHotel(slug);
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.menuItem.deleteMany({ where: { id, hotelId } });
  refresh(slug);
}

/* ── ORDERS ─────────────────────────────────────────────── */

export async function updateOrderStatus(slug: string, formData: FormData) {
  const hotelId = await requireHotel(slug);
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const allowed = [
    "AWAITING_VERIFICATION",
    "CONFIRMED",
    "PREPARING",
    "DELIVERED",
    "CANCELLED",
  ];
  if (!id || !allowed.includes(status)) return;
  await prisma.order.updateMany({
    where: { id, hotelId },
    data: {
      status,
      // Record when staff confirm the UPI payment.
      ...(status === "CONFIRMED" ? { paymentVerifiedAt: new Date() } : {}),
    },
  });
  revalidatePath(`/${slug}/admin`);
}

/* ── BRANDING ───────────────────────────────────────────── */

const MAX_LOGO_BYTES = 1_000_000; // 1 MB

export async function updateBranding(
  slug: string,
  _prev: { ok?: boolean; error?: string } | undefined,
  formData: FormData
): Promise<{ ok?: boolean; error?: string }> {
  const hotelId = await requireHotel(slug);
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Hotel name is required." };
  const gstRaw = parseInt(String(formData.get("gstPercent") || "5"), 10);

  // Logo resolution:
  //   - "Remove logo" checked        -> clear it (fall back to monogram)
  //   - an image file was uploaded   -> store it (as a data URL, so it works
  //                                     in any hosting without a filesystem)
  //   - otherwise                    -> leave the existing logo unchanged
  let logoUrl: string | null | undefined = undefined;
  const removeLogo = formData.get("removeLogo") === "on";
  const file = formData.get("logoFile");

  if (removeLogo) {
    logoUrl = null;
  } else if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) {
      return { error: "The logo must be an image file (PNG, JPG, SVG…)." };
    }
    if (file.size > MAX_LOGO_BYTES) {
      return { error: "Logo image must be under 1 MB. Try a smaller file." };
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    logoUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
  }

  await prisma.hotel.update({
    where: { id: hotelId },
    data: {
      name,
      tagline: String(formData.get("tagline") || "").trim(),
      logoText: String(formData.get("logoText") || "").trim() || null,
      upiId: String(formData.get("upiId") || "").trim() || null,
      ...(logoUrl !== undefined ? { logoUrl } : {}),
      themeColor: String(formData.get("themeColor") || "#B8860B"),
      accentColor: String(formData.get("accentColor") || "#1a1a2e"),
      etaMinutes: String(formData.get("etaMinutes") || "20–35").trim(),
      gstPercent: Number.isFinite(gstRaw) ? gstRaw : 5,
    },
  });
  revalidatePath(`/${slug}/admin/settings`);
  revalidatePath(`/${slug}`);
  return { ok: true };
}
