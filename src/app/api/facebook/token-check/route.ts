import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { validateFBToken, getFBPages } from '@/lib/facebook-api';

/**
 * POST /api/facebook/token-check — Validate token và lấy thông tin pages
 */
export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return errorResponse('Thiếu accessToken', 400);
    }

    // Step 1: Validate token
    const tokenInfo = await validateFBToken(accessToken);
    if (!tokenInfo.valid) {
      return errorResponse(`Token không hợp lệ: ${tokenInfo.error}`, 400);
    }

    // Step 2: Lấy danh sách pages
    let pages: any[] = [];
    try {
      pages = await getFBPages(accessToken);
    } catch (err: any) {
      // Token có thể là Page token (không lấy được pages list)
      // Vẫn trả về thành công nhưng không có pages
    }

    return successResponse({
      valid: true,
      user: { id: tokenInfo.id, name: tokenInfo.name },
      pages: pages.map(p => ({
        id: p.id,
        name: p.name,
        accessToken: p.access_token,
        avatar: p.picture?.data?.url || null,
      })),
    });
  } catch (err: any) {
    console.error('[POST /api/facebook/token-check]', err);
    return errorResponse('Lỗi kiểm tra token', 500);
  }
}
