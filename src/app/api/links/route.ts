import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const userId = 'demo-user'; 
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: 'demo@example.com',
        name: 'Demo User'
      }
    });

    // Lấy tất cả nội dung có chứa metadata (nơi lưu link)
    const contents = await prisma.generatedContent.findMany({
      where: {
        userId,
        NOT: {
          metadata: {
            equals: null as any
          }
        }
      },
      select: {
        metadata: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Trích xuất và lọc trùng lặp theo affiliateLink
    const linksMap = new Map();
    
    contents.forEach((item: any) => {
      const meta = item.metadata;
      if (meta && meta.affiliateLink && meta.productName) {
        if (!linksMap.has(meta.affiliateLink)) {
          linksMap.set(meta.affiliateLink, {
            productName: meta.productName,
            affiliateLink: meta.affiliateLink,
            lastUsed: item.createdAt
          });
        }
      }
    });

    const uniqueLinks = Array.from(linksMap.values());

    return successResponse(uniqueLinks);
  } catch (err) {
    console.error('Lỗi lấy danh sách link:', err);
    return errorResponse('Không thể tải danh sách liên kết', 500);
  }
}
