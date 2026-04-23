import { NextRequest } from 'next/server';
import { getExpertFacebookPrompt } from '@/lib/gemini';
import { successResponse, errorResponse } from '@/lib/api-response';
import { z } from 'zod';

const PreviewSchema = z.object({
  productName: z.string().min(1),
  affiliateLink: z.string().min(1),
  additionalInfo: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = PreviewSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const { productName, affiliateLink, additionalInfo } = parsed.data;
    const prompt = getExpertFacebookPrompt(productName, affiliateLink, additionalInfo);

    return successResponse({ prompt });
  } catch (err) {
    return errorResponse('Lỗi lấy bản xem trước prompt', 500);
  }
}
