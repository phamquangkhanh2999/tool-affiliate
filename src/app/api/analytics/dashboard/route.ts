import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Lấy dữ liệu thống kê Dashboard
 *     description: Cung cấp tổng doanh thu, lượt click và top sản phẩm của User
 *     responses:
 *       200:
 *         description: Trả về Overview Statistics
 */
export async function GET() {
  try {
    const userId = "demo-user"; // TODO: get from session

    // Count metrics
    const [
      totalClicksResult,
      totalRevenueResult,
      campaignsCount,
      productsCount,
      topLinks
    ] = await Promise.all([
      prisma.affiliateLink.aggregate({ _sum: { clicks: true } }),
      prisma.affiliateLink.aggregate({ _sum: { revenue: true } }),
      prisma.campaign.count({ where: { userId, status: 'ACTIVE' } }),
      prisma.product.count({ where: { userId } }),
      prisma.affiliateLink.findMany({
        where: { product: { userId } },
        include: { product: true },
        orderBy: { revenue: 'desc' },
        take: 3
      })
    ]);

    const data = {
      overview: {
        totalRevenue: totalRevenueResult._sum.revenue || 0,
        totalClicks: totalClicksResult._sum.clicks || 0,
        activeCampaigns: campaignsCount,
        savedProducts: productsCount,
      },
      topProducts: topLinks.map(link => ({
        id: link.productId,
        productName: link.product.name,
        category: link.product.category || 'Khác',
        clicks: link.clicks,
        revenue: link.revenue,
        conversionRate: link.clicks > 0 ? (link.conversions / link.clicks) * 100 : 0
      }))
    };

    return successResponse(data);
  } catch (err) {
    console.error('[GET /api/analytics/dashboard]', err);
    return errorResponse("Lỗi khi tải dữ liệu dashboard", 500);
  }
}
