import { PrismaClient } from "@prisma/client";
import { MOCK_PRODUCTS } from "../src/data/mock-products";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@affiliate.local" },
    update: {},
    create: {
      id: "demo-user",
      email: "demo@affiliate.local",
      name: "Demo User",
      plan: "PRO",
    },
  });
  console.log("✅ User created:", user.email);

  // Create sample products from mock-products
  const productsData = MOCK_PRODUCTS.map(p => ({
    shopeeItemId: p.itemId,
    shopeeShopId: p.shopId,
    name: p.name,
    description: p.description,
    imageUrl: p.imageUrl,
    originalPrice: p.originalPrice,
    discountedPrice: p.discountedPrice,
    commissionRate: p.commissionRate,
    category: p.category,
    shopName: p.shopName,
    rating: p.rating,
    soldCount: p.soldCount,
  }));

  for (const productData of productsData) {
    const product = await prisma.product.upsert({
      where: {
        id: `prod-${productData.shopeeItemId}`,
      },
      update: {},
      create: {
        id: `prod-${productData.shopeeItemId}`,
        userId: user.id,
        ...productData,
      },
    });

    // Create affiliate link for each product
    await prisma.affiliateLink.upsert({
      where: { trackingCode: `track-${productData.shopeeItemId}` },
      update: {},
      create: {
        productId: product.id,
        trackingCode: `track-${productData.shopeeItemId}`,
        originalUrl: `https://shopee.vn/product/${productData.shopeeShopId}/${productData.shopeeItemId}`,
        shortUrl: `https://shope.ee/seed-${productData.shopeeItemId}`,
        clicks: Math.floor(Math.random() * 500) + 50,
        conversions: Math.floor(Math.random() * 30) + 5,
        revenue: Math.floor(Math.random() * 500000) + 50000,
      },
    });
  }
  console.log("✅ Products seeded:", productsData.length);

  // Create sample campaign
  const campaign = await prisma.campaign.upsert({
    where: { id: "campaign-demo-1" },
    update: {},
    create: {
      id: "campaign-demo-1",
      userId: user.id,
      name: "Tech Sale Tháng 4",
      description: "Chiến dịch quảng cáo sản phẩm tech tháng 4",
      platform: ["facebook", "tiktok"],
      status: "ACTIVE",
      totalClicks: 1240,
      totalConversions: 87,
      totalRevenue: 2340000,
    },
  });
  console.log("✅ Campaign seeded:", campaign.name);

  // Fake click events for analytics
  const link = await prisma.affiliateLink.findFirst({
    where: { trackingCode: "track-1002" },
  });

  if (link) {
    const events = Array.from({ length: 50 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      const converted = Math.random() > 0.85;
      return {
        affiliateLinkId: link.id,
        createdAt: date,
        converted,
        commission: converted ? Math.random() * 50000 + 10000 : null,
      };
    });

    await prisma.clickEvent.createMany({ data: events, skipDuplicates: true });
    console.log("✅ Click events seeded: 50");
  }

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
