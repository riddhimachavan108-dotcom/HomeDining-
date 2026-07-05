import { notFound } from "next/navigation";
import { getHotelBySlug } from "@/lib/hotel";
import MenuOrder, { type HotelData } from "./MenuOrder";

export default async function HotelMenuPage({
  params,
}: {
  params: Promise<{ hotel: string }>;
}) {
  const { hotel: slug } = await params;
  const hotel = await getHotelBySlug(slug);
  if (!hotel) notFound();

  const data: HotelData = {
    slug: hotel.slug,
    name: hotel.name,
    tagline: hotel.tagline,
    logoText: hotel.logoText,
    logoUrl: hotel.logoUrl,
    themeColor: hotel.themeColor,
    etaMinutes: hotel.etaMinutes,
    gstPercent: hotel.gstPercent,
    categories: hotel.categories
      .filter((c) => c.items.length > 0)
      .map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        items: c.items.map((i) => ({
          id: i.id,
          name: i.name,
          desc: i.description,
          priceInPaise: i.priceInPaise,
          veg: i.isVeg,
          available: i.isAvailable,
          imageUrl: i.imageUrl,
        })),
      })),
  };

  return <MenuOrder hotel={data} />;
}
