/**
 * Postgres seed — populates default coupons + inventory.
 *
 * Run with: `npm run db:seed`
 *
 * Idempotent: safe to run repeatedly. Existing rows aren't overwritten.
 *
 * What it does NOT do:
 *   - Create user accounts. Users sign up through /signup which writes
 *     real bcrypt-hashed passwords.
 *   - Seed orders/reviews/cart. Those flow from real user activity.
 *   - Touch the books catalog. Books live in `data/books.json` and are
 *     bundled into the app; only inventory counts mirror in Postgres.
 */

import { PrismaClient } from "@prisma/client";
import booksData from "../data/books.json";
import { DEFAULT_COUPONS } from "../lib/coupons";

interface BookShape {
  slug: string;
  stock: "in-stock" | "preorder" | "out-of-stock";
}

const INITIAL_UNITS = 25;
const books = booksData as BookShape[];

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log("→ seeding inventory");
    const inventoryOps = books.map((b) => {
      const units = b.stock === "in-stock" ? INITIAL_UNITS : 0;
      return prisma.inventory.upsert({
        where: { slug: b.slug },
        create: { slug: b.slug, units },
        update: {}, // never overwrite an existing units value
      });
    });
    await prisma.$transaction(inventoryOps);
    console.log(`  seeded ${inventoryOps.length} inventory rows`);

    console.log("→ seeding coupons");
    const couponCreated = await prisma.coupon.createMany({
      data: DEFAULT_COUPONS.map((c) => ({
        code: c.code,
        kind: c.kind,
        value: c.value,
        minSubtotal: c.minSubtotal ?? null,
        maxDiscount: c.maxDiscount ?? null,
        description: c.description,
        successLabel: c.successLabel,
      })),
      skipDuplicates: true,
    });
    console.log(`  seeded ${couponCreated.count} new coupons (existing skipped)`);

    console.log("✓ seed complete");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("seed failed:", err);
  process.exit(1);
});
