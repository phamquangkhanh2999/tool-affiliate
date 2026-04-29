import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { generateExpertZaloPost } from '@/lib/zalo-prompts';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { productName, affiliateLink, additionalInfo } = await req.json();

    if (!productName || !affiliateLink) {
      return errorResponse('Thiếu thông tin sản phẩm hoặc link affiliate', 400);
    }

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
      const result = await generateExpertZaloPost(
        productName,
        affiliateLink,
        additionalInfo
      );
      
      currentPrompt = result.prompt || '';

      let savedId: string | null = null;
      try {
        const saved = await prisma.generatedContent.create({
          data: {
            userId,
            contentType: 'CAPTION', // Using CAPTION for now, or add ZALO_EXPERT to enum if schema is updated
            platform: 'zalo',
            tone: 'expert',
            prompt: currentPrompt,
            content: result.zaloMessage, // default to message
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
