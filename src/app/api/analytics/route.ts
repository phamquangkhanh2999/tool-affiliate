import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '30d'; // 7d, 30d, all

    // Tính ngày bắt đầu
    const startDate = new Date();
    if (range === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (range === '30d') startDate.setDate(startDate.getDate() - 30);
    else startDate.setFullYear(2000); // All time

    // Tính tổng link, click, conversion
    const totalLinks = await prisma.affiliateLink.count();
    
    const clickStats = await prisma.clickEvent.aggregate({
      where: { createdAt: { gte: startDate } },
      _count: { id: true },
      _sum: {
        commission: true,
        orderValue: true
      }
    });

    const conversionsCount = await prisma.clickEvent.count({
      where: {
        createdAt: { gte: startDate },
        converted: true
      }
    });

    // Lấy top links
    const topLinks = await prisma.affiliateLink.findMany({
      orderBy: { clicks: 'desc' },
      take: 5,
      include: { product: true }
    });

    // Dữ liệu biểu đồ (mock theo ngày để dễ render)
    // Trong thực tế cần group by date sử dụng raw query hoặc Prisma groupby
    // Demo data for chart:
    const chartData = [];
    let current = new Date(startDate);
    const end = new Date();
    
    // Fallback if 'all', limit chart to last 30 days
    if (range === 'all') current.setDate(end.getDate() - 30);

    while (current <= end) {
      chartData.push({
        date: current.toISOString().split('T')[0],
        clicks: Math.floor(Math.random() * 50) + 10,
        revenue: Math.floor(Math.random() * 100000)
      });
      current.setDate(current.getDate() + 1);
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalLinks,
          totalClicks: clickStats._count.id || 0,
          conversions: conversionsCount,
          totalRevenue: clickStats._sum.commission || 0,
        },
        topLinks: topLinks.map(l => ({
          id: l.id,
          productName: l.product?.name || 'Sản phẩm không rõ',
          clicks: l.clicks,
          revenue: l.revenue,
          shortUrl: l.shortUrl || l.originalUrl
        })),
        chartData
      }
    });
  } catch (error: any) {
    console.error('Analytics Error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi server' }, { status: 500 });
  }
}
