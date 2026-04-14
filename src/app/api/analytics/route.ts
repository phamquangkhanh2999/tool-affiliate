import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/analytics — Dashboard stats
export async function GET(req: NextRequest) {
  try {
    const userId = "demo-user"; // TODO: from session
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "30d"; // 7d | 30d | 90d

    const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
    const days = daysMap[period] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Parallel queries
    const [
      totalProducts,
      totalLinks,
      totalContents,
      totalCampaigns,
      recentClicks,
      topProducts,
    ] = await Promise.all([
      prisma.product.count({ where: { userId } }),
      prisma.affiliateLink.count({
        where: { product: { userId } },
      }),
      prisma.generatedContent.count({ where: { userId } }),
      prisma.campaign.count({ where: { userId } }),
      prisma.clickEvent.findMany({
        where: {
          createdAt: { gte: startDate },
          affiliateLink: { product: { userId } },
        },
        select: {
          createdAt: true,
          converted: true,
          commission: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.affiliateLink.findMany({
        where: { product: { userId } },
        orderBy: { clicks: "desc" },
        take: 5,
        include: {
          product: { select: { name: true, imageUrl: true, category: true } },
        },
      }),
    ]);

    // Aggregate click data by day
    const clicksByDay = recentClicks.reduce(
      (acc: Record<string, { clicks: number; revenue: number }>, event) => {
        const day = event.createdAt.toISOString().split("T")[0];
        if (!acc[day]) acc[day] = { clicks: 0, revenue: 0 };
        acc[day].clicks++;
        if (event.converted && event.commission) {
          acc[day].revenue += event.commission;
        }
        return acc;
      },
      {}
    );

    const totalRevenue = recentClicks.reduce(
      (sum, e) => sum + (e.commission || 0),
      0
    );
    const totalConversions = recentClicks.filter((e) => e.converted).length;

    return successResponse({
      overview: {
        totalProducts,
        totalLinks,
        totalContents,
        totalCampaigns,
        totalClicks: recentClicks.length,
        totalConversions,
        totalRevenue,
        conversionRate:
          recentClicks.length > 0
            ? ((totalConversions / recentClicks.length) * 100).toFixed(2)
            : "0",
      },
      chart: Object.entries(clicksByDay).map(([date, data]) => ({
        date,
        ...data,
      })),
      topProducts: topProducts.map((link) => ({
        productName: link.product.name,
        imageUrl: link.product.imageUrl,
        category: link.product.category,
        clicks: link.clicks,
        conversions: link.conversions,
        revenue: link.revenue,
        shortUrl: link.shortUrl,
      })),
    });
  } catch (err) {
    console.error("[GET /api/analytics]", err);
    return errorResponse("Lỗi khi lấy analytics", 500);
  }
}
