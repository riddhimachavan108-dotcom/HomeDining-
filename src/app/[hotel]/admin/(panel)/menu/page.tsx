import { prisma } from "@/lib/db";
import { getAuthedHotel } from "@/lib/auth";
import { notFound } from "next/navigation";
import MenuManager from "./MenuManager";

export default async function AdminMenuPage({
  params,
}: {
  params: Promise<{ hotel: string }>;
}) {
  const { hotel: slug } = await params;
  const authed = await getAuthedHotel(slug);
  if (!authed) notFound();

  const categories = await prisma.category.findMany({
    where: { hotelId: authed.hotel.id },
    orderBy: { sortOrder: "asc" },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  const data = categories.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    items: c.items.map((i) => ({
      id: i.id,
      name: i.name,
      description: i.description,
      priceRupees: (i.priceInPaise / 100).toString(),
      isVeg: i.isVeg,
      isAvailable: i.isAvailable,
      imageUrl: i.imageUrl,
    })),
  }));

  return (
    <div>
      <div className="adm-page-head">
        <div>
          <h1 className="adm-h1">Menu</h1>
          <p className="adm-page-sub">
            Add your categories and dishes. Changes appear on your guest site
            instantly.
          </p>
        </div>
      </div>
      <MenuManager slug={slug} categories={data} />
    </div>
  );
}
