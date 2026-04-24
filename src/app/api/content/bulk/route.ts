import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { callGeminiApi } from '@/lib/gemini';
import { getExpertFacebookPrompt } from '@/lib/gemini';
import { getTikTokExpertPrompt } from '@/lib/tiktok-prompts';
import { getYouTubeExpertPrompt } from '@/lib/youtube-prompts';

interface BulkItem {
  productName: string;
  affiliateLink: string;
  additionalInfo?: string;
}

/**
 * POST /api/content/bulk — Tạo content hàng loạt cho nhiều sản phẩm & platforms
 */
export async function POST(req: NextRequest) {
  try {
    const { products, platforms } = await req.json() as {
      products: BulkItem[];
      platforms: string[]; // ['facebook', 'tiktok', 'youtube']
    };

    if (!products || products.length === 0) {
      return errorResponse('Thiếu danh sách sản phẩm', 400);
    }

    if (!platforms || platforms.length === 0) {
      return errorResponse('Thiếu danh sách nền tảng', 400);
    }

    // Giới hạn 10 sản phẩm / batch
    const batch = products.slice(0, 10);
    const userId = 'demo-user';

    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: 'demo@example.com', name: 'Demo User' },
    });

    const results: any[] = [];

    for (const product of batch) {
      const productResults: any = {
        productName: product.productName,
        affiliateLink: product.affiliateLink,
        platforms: {},
      };

      for (const platform of platforms) {
        try {
          let prompt = '';
          let contentType = '';

          switch (platform) {
            case 'facebook':
              prompt = getExpertFacebookPrompt(product.productName, product.affiliateLink, product.additionalInfo);
              contentType = 'FB_EXPERT';
              break;
            case 'tiktok':
              prompt = getTikTokExpertPrompt(product.productName, product.affiliateLink, product.additionalInfo);
              contentType = 'TIKTOK_EXPERT';
              break;
            case 'youtube':
              prompt = getYouTubeExpertPrompt(product.productName, product.affiliateLink, product.additionalInfo);
              contentType = 'YOUTUBE_EXPERT';
              break;
            default:
              continue;
          }

          const resultText = await callGeminiApi(prompt, { json: true });
          const cleaned = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);

          // Save to DB
          try {
            await prisma.generatedContent.create({
              data: {
                userId,
                contentType: contentType as any,
                platform,
                tone: 'expert',
                prompt,
                content: JSON.stringify(parsed).substring(0, 5000),
                hashtags: [],
                metadata: { ...parsed, productName: product.productName, affiliateLink: product.affiliateLink } as any,
              },
            });
          } catch (dbErr) {
            console.error('[Bulk DB Error]:', dbErr);
          }

          productResults.platforms[platform] = { success: true, data: parsed };
        } catch (err: any) {
          productResults.platforms[platform] = { success: false, error: err.message };
        }
      }

      results.push(productResults);
    }

    return successResponse({
      totalProducts: batch.length,
      totalPlatforms: platforms.length,
      results,
    });
  } catch (err) {
    return errorResponse('Lỗi bulk generate', 500);
  }
}
