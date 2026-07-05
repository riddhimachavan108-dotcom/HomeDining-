import { prisma } from "./db";

/**
 * Resolve a hotel (tenant) by its URL slug, with its full menu.
 * Returns null when the slug doesn't match an active hotel — callers
 * should render notFound() in that case.
 */
export async function getHotelBySlug(slug: string) {
  return prisma.hotel.findFirst({
    where: { slug, isActive: true },
    include: {
      categories: {
        orderBy: { sortOrder: "asc" },
        include: {
          items: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });
}

export type HotelWithMenu = NonNullable<
  Awaited<ReturnType<typeof getHotelBySlug>>
>;

/** Lightweight branding-only lookup (no menu) for headers/layouts. */
export async function getHotelBranding(slug: string) {
  return prisma.hotel.findFirst({
    where: { slug, isActive: true },
    select: {
      id: true,
      slug: true,
      name: true,
      tagline: true,
      logoText: true,
      logoUrl: true,
      themeColor: true,
      accentColor: true,
      etaMinutes: true,
      gstPercent: true,
    },
  });
}

export { formatPaise } from "./money";
