import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { callGeminiApi } from '@/lib/gemini';
import { getYouTubeExpertPrompt } from '@/lib/youtube-prompts';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userId = 'demo-user';
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: 'demo@example.com', name: 'Demo User' },
    });

    const history = await prisma.generatedContent.findMany({
      where: { userId, platform: 'youtube' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return successResponse(history);
  } catch (err) {
    return errorResponse('Lỗi lấy lịch sử YouTube', 500);
  }
}

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
      create: { id: userId, email: 'demo@example.com', name: 'Demo User' },
    });

    const prompt = getYouTubeExpertPrompt(productName, affiliateLink, additionalInfo);

    try {
      const resultText = await callGeminiApi(prompt, { json: true });
      const cleaned = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(cleaned);

      let savedId: string | null = null;
      try {
        const saved = await prisma.generatedContent.create({
          data: {
            userId,
            contentType: 'YOUTUBE_EXPERT',
            platform: 'youtube',
            tone: 'professional',
            prompt,
            content: result.script?.body || result.description || '',
            hashtags: result.tags || [],
            metadata: {
              ...result,
              productName,
              affiliateLink,
            } as any,
          },
        });
        savedId = saved.id;
      } catch (dbErr) {
        console.error('[DB SAVE ERROR - YouTube]:', dbErr);
      }

      return successResponse({
        id: savedId,
        ...result,
        prompt,
        dbStatus: savedId ? 'success' : 'error',
      });
    } catch (aiErr: any) {
      return errorResponse(`Lỗi AI: ${aiErr.message}`, 500);
    }
  } catch (err) {
    return errorResponse('Lỗi server', 500);
  }
}
