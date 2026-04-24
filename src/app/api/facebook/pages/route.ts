import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { validateFBToken } from '@/lib/facebook-api';

/**
 * GET /api/facebook/pages — Lấy danh sách Pages đã kết nối
 */
export async function GET() {
  try {
    const pages = await prisma.facebookPage.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        pageId: true,
        pageName: true,
        pageAvatar: true,
        isActive: true,
        tokenExpiresAt: true,
        createdAt: true,
      },
    });
    return successResponse(pages);
  } catch (err) {
    return errorResponse('Lỗi lấy danh sách pages', 500);
  }
}

/**
 * POST /api/facebook/pages — Kết nối Facebook Page mới
 */
export async function POST(req: NextRequest) {
  try {
    const { pageId, pageName, accessToken, pageAvatar } = await req.json();

    if (!pageId || !pageName || !accessToken) {
      return errorResponse('Thiếu thông tin bắt buộc', 400);
    }

    // Validate token trước
    const validation = await validateFBToken(accessToken);
    if (!validation.valid) {
      return errorResponse(`Token không hợp lệ: ${validation.error}`, 400);
    }

    // Upsert page
    const userId = 'demo-user';
    const page = await prisma.facebookPage.upsert({
      where: { pageId },
      update: {
        pageName,
        accessToken,
        pageAvatar: pageAvatar || null,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        userId,
        pageId,
        pageName,
        accessToken,
        pageAvatar: pageAvatar || null,
        isActive: true,
      },
    });

    return successResponse(page, undefined, 201);
  } catch (err: any) {
    console.error('[POST /api/facebook/pages]', err);
    return errorResponse('Lỗi kết nối page', 500);
  }
}

/**
 * DELETE /api/facebook/pages — Ngắt kết nối page
 */
export async function DELETE(req: NextRequest) {
  try {
    const { pageId } = await req.json();

    if (!pageId) {
      return errorResponse('Thiếu pageId', 400);
    }

    await prisma.facebookPage.update({
      where: { pageId },
      data: { isActive: false },
    });

    return successResponse({ message: 'Đã ngắt kết nối' });
  } catch (err) {
    return errorResponse('Lỗi ngắt kết nối', 500);
  }
}
