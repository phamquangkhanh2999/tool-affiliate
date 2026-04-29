import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { generateExpertFacebookPost } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

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

    const history = await prisma.generatedContent.findMany({
      where: { userId, platform: 'facebook' },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    return successResponse(history);
  } catch (err) {
    return errorResponse('Lỗi lấy lịch sử', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { productName, affiliateLink, additionalInfo } = await req.json();

    if (!productName || !affiliateLink) {
      return errorResponse('Thiếu thông tin sản phẩm hoặc link affiliate', 400);
    }

    // Đảm bảo userId tồn tại trong Database (Upsert để không lỗi nếu đã có)
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

    let currentPrompt = '';
    try {
      // 1. Gọi AI tạo nội dung
      const result = await generateExpertFacebookPost(
        productName,
        affiliateLink,
        additionalInfo
      );
      
      currentPrompt = result.prompt || '';

      // 2. Lưu vào Database (Bọc trong try-catch để không làm chết quy trình nếu DB lỗi)
      let savedId: string | null = null;
      try {
        const saved = await prisma.generatedContent.create({
          data: {
            userId,
            contentType: 'CAPTION',
            platform: 'facebook',
            tone: 'expert',
            prompt: currentPrompt,
            content: result.longVersion || result.shortVersion,
            hashtags: [],
            metadata: {
              ...result,
              productName,
              affiliateLink
            } as any
          }
        });
        savedId = saved.id;
      } catch (dbErr) {
        console.error('!!! [DATABASE SAVE ERROR]:', dbErr);
        // Không return lỗi ở đây, để người dùng vẫn thấy kết quả AI
      }

      return successResponse({
        id: savedId,
        ...result,
        dbStatus: savedId ? 'success' : 'error'
      });
    } catch (aiErr) {
      console.error('!!! [AI ERROR]:', aiErr);
      return errorResponse(`Lỗi AI: ${aiErr instanceof Error ? aiErr.message : String(aiErr)}`, 500);
    }
  } catch (err) {
    console.error('!!! [SERVER ERROR]:', err);
    return errorResponse('Lỗi máy chủ hệ thống', 500);
  }
}
