import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Helper: rupees -> paise (integer money).
const rs = (rupees: number) => Math.round(rupees * 100);

type SeedItem = {
  name: string;
  price: number;
  desc: string;
  veg: boolean;
};
type SeedCategory = { name: string; icon: string; items: SeedItem[] };
type SeedHotel = {
  slug: string;
  name: string;
  tagline: string;
  logoText: string;
  themeColor: string;
  accentColor: string;
  upiId: string;
  adminEmail: string;
  adminPassword: string;
  menu: SeedCategory[];
};

const HOTELS: SeedHotel[] = [
  {
    slug: "grand-majestic",
    name: "The Grand Majestic",
    tagline: "Fine Dining, Delivered to Your Door",
    logoText: "GM",
    themeColor: "#B8860B", // gold
    accentColor: "#1a1a2e", // navy
    upiId: "grandmajestic@okhdfcbank",
    adminEmail: "manager@grandmajestic.com",
    adminPassword: "majestic123",
    menu: [
      {
        name: "Breakfast",
        icon: "🍳",
        items: [
          { name: "Continental Breakfast", price: 349, desc: "Croissant, butter, jam, orange juice, tea or coffee", veg: true },
          { name: "Full English Breakfast", price: 449, desc: "Eggs, toast, beans, sausage, grilled tomato", veg: false },
          { name: "Masala Omelette", price: 249, desc: "Spiced eggs with onion, tomato, green chilli", veg: true },
          { name: "Fresh Fruit Bowl", price: 199, desc: "Seasonal fruits with honey and yogurt", veg: true },
        ],
      },
      {
        name: "Main Course",
        icon: "🍽️",
        items: [
          { name: "Dal Makhani", price: 299, desc: "Slow-cooked black lentils in rich tomato cream", veg: true },
          { name: "Butter Chicken", price: 399, desc: "Tender chicken in creamy tomato gravy, served with naan", veg: false },
          { name: "Paneer Tikka Masala", price: 349, desc: "Grilled cottage cheese in spiced masala sauce", veg: true },
          { name: "Veg Biryani", price: 299, desc: "Fragrant basmati rice with saffron and vegetables", veg: true },
          { name: "Chicken Biryani", price: 379, desc: "Fragrant basmati rice with tender chicken pieces", veg: false },
        ],
      },
      {
        name: "Snacks",
        icon: "🧆",
        items: [
          { name: "Samosa (2 pcs)", price: 99, desc: "Crispy pastry filled with spiced potato and peas", veg: true },
          { name: "Club Sandwich", price: 249, desc: "Triple-layered with chicken, lettuce, tomato, mayo", veg: false },
          { name: "Veg Sandwich", price: 179, desc: "Grilled with cheese, cucumber, pepper chutney", veg: true },
          { name: "French Fries", price: 149, desc: "Crispy golden fries with ketchup and seasoning", veg: true },
        ],
      },
      {
        name: "Beverages",
        icon: "☕",
        items: [
          { name: "Masala Chai", price: 79, desc: "Spiced Indian tea with ginger and cardamom", veg: true },
          { name: "Fresh Lime Soda", price: 99, desc: "Sweet or salted, with crushed ice", veg: true },
          { name: "Mango Lassi", price: 129, desc: "Chilled yogurt drink with Alphonso mango", veg: true },
          { name: "Cold Coffee", price: 149, desc: "Blended coffee with milk and ice cream", veg: true },
        ],
      },
      {
        name: "Desserts",
        icon: "🍮",
        items: [
          { name: "Gulab Jamun (2 pcs)", price: 129, desc: "Soft milk dumplings in rose sugar syrup", veg: true },
          { name: "Ice Cream (2 scoops)", price: 149, desc: "Choice of vanilla, chocolate, or strawberry", veg: true },
          { name: "Chocolate Brownie", price: 179, desc: "Warm brownie with vanilla ice cream", veg: true },
        ],
      },
    ],
  },
  {
    // Second tenant proves the app is multi-tenant: different name, logo,
    // theme (teal/charcoal), and its own menu on its own URL.
    slug: "seaside-retreat",
    name: "Seaside Retreat",
    tagline: "Coastal flavours, room delivered",
    logoText: "SR",
    themeColor: "#0d9488", // teal
    accentColor: "#0f172a", // slate
    upiId: "seasideretreat@okaxis",
    adminEmail: "manager@seasideretreat.com",
    adminPassword: "seaside123",
    menu: [
      {
        name: "Starters",
        icon: "🦐",
        items: [
          { name: "Prawn Koliwada", price: 429, desc: "Crispy fried prawns with coastal spices", veg: false },
          { name: "Crispy Corn", price: 219, desc: "Golden fried corn tossed with pepper and herbs", veg: true },
          { name: "Fish Fingers", price: 359, desc: "Panko-crumbed fish with tartare dip", veg: false },
        ],
      },
      {
        name: "Mains",
        icon: "🍛",
        items: [
          { name: "Goan Fish Curry", price: 449, desc: "Coconut and kokum curry with steamed rice", veg: false },
          { name: "Prawn Masala", price: 499, desc: "Prawns simmered in onion-tomato masala", veg: false },
          { name: "Veg Coconut Curry", price: 329, desc: "Mixed vegetables in a mild coconut gravy", veg: true },
          { name: "Neer Dosa (3 pcs)", price: 199, desc: "Soft rice crepes with chutney", veg: true },
        ],
      },
      {
        name: "Drinks",
        icon: "🥥",
        items: [
          { name: "Tender Coconut Water", price: 119, desc: "Fresh, chilled, served in the shell", veg: true },
          { name: "Solkadhi", price: 99, desc: "Kokum and coconut cooler", veg: true },
          { name: "Filter Coffee", price: 89, desc: "South Indian style, strong and frothy", veg: true },
        ],
      },
      {
        name: "Desserts",
        icon: "🍧",
        items: [
          { name: "Coconut Ladoo (2 pcs)", price: 109, desc: "Soft coconut and jaggery sweets", veg: true },
          { name: "Bebinca", price: 189, desc: "Layered Goan coconut dessert", veg: true },
        ],
      },
    ],
  },
];

async function main() {
  for (const h of HOTELS) {
    // Idempotent: wipe and recreate this hotel so re-running the seed is safe.
    await prisma.hotel.deleteMany({ where: { slug: h.slug } });

    const hotel = await prisma.hotel.create({
      data: {
        slug: h.slug,
        name: h.name,
        tagline: h.tagline,
        logoText: h.logoText,
        themeColor: h.themeColor,
        accentColor: h.accentColor,
        upiId: h.upiId,
        passwordHash: await bcrypt.hash(h.adminPassword, 10),
      },
    });

    for (let ci = 0; ci < h.menu.length; ci++) {
      const cat = h.menu[ci];
      const category = await prisma.category.create({
        data: {
          hotelId: hotel.id,
          name: cat.name,
          icon: cat.icon,
          sortOrder: ci,
        },
      });

      for (let ii = 0; ii < cat.items.length; ii++) {
        const item = cat.items[ii];
        await prisma.menuItem.create({
          data: {
            hotelId: hotel.id,
            categoryId: category.id,
            name: item.name,
            description: item.desc,
            priceInPaise: rs(item.price),
            isVeg: item.veg,
            sortOrder: ii,
          },
        });
      }
    }

    console.log(`Seeded ${h.name} at /${h.slug} (password: ${h.adminPassword})`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
