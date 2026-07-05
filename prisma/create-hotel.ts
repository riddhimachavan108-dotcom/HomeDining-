/**
 * Onboard a new hotel (seller tool).
 *
 * Creates a hotel + its first manager login. The menu starts EMPTY —
 * the hotel's manager fills it in from the admin panel.
 *
 * Usage:
 *   npm run hotel:create -- \
 *     --name "The Oberoi Grand" \
 *     --slug oberoi-grand \
 *     --email manager@oberoigrand.com \
 *     --password "choose-a-strong-one"
 *
 * Optional flags:
 *   --tagline "Fine dining, delivered"
 *   --logo OG               (1–3 letter monogram; defaults from the name)
 *   --theme "#B8860B"       (brand colour)
 *   --accent "#1a1a2e"      (header colour)
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const name = arg("name");
  const password = arg("password");
  const slug = slugify(arg("slug") || name || "");

  if (!name || !password || !slug) {
    console.error(
      "\nMissing required fields.\n\n" +
        'Usage: npm run hotel:create -- --name "Hotel Name" --slug hotel-name --password "secret"\n'
    );
    process.exit(1);
  }

  const existing = await prisma.hotel.findUnique({ where: { slug } });
  if (existing) {
    console.error(`\nA hotel already uses the URL /${slug}. Pick another --slug.\n`);
    process.exit(1);
  }

  const monogram =
    arg("logo")?.toUpperCase() ||
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  await prisma.hotel.create({
    data: {
      slug,
      name,
      tagline: arg("tagline") || "Delivered to your door",
      logoText: monogram,
      themeColor: arg("theme") || "#B8860B",
      accentColor: arg("accent") || "#1a1a2e",
      upiId: arg("upi") || null,
      passwordHash: await bcrypt.hash(password, 10),
    },
  });

  console.log(`\n✅ Created "${name}"\n`);
  console.log(`   Guest site : /${slug}`);
  console.log(`   Admin login: /${slug}/admin/login  (password only)`);
  console.log(`\nHand the URL + password to the hotel manager. The menu is empty —`);
  console.log(`they add their categories and dishes from the admin panel.\n`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
