import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { buildUTMUrl, buildMultiPlatformUTM } from '@/lib/utm-builder';

/**
 * POST /api/utm — Tạo UTM link mới
 */
export async function POST(req: NextRequest) {
  try {
    const { url, source, medium, campaign, content, term, multiPlatform } = await req.json();

    if (!url || !campaign) {
      return errorResponse('Thiếu URL hoặc tên chiến dịch', 400);
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return errorResponse('URL không hợp lệ', 400);
    }

    if (multiPlatform) {
      // Tạo UTM cho tất cả platforms cùng lúc
      const result = buildMultiPlatformUTM(url, campaign);
      return successResponse(result);
    }

    if (!source || !medium) {
      return errorResponse('Thiếu source hoặc medium', 400);
    }

    const result = buildUTMUrl({ url, source, medium, campaign, content, term });
    return successResponse(result);
  } catch (err) {
    return errorResponse('Lỗi tạo UTM link', 500);
  }
}
