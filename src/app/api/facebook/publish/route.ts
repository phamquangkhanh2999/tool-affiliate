/* eslint-disable @typescript-eslint/no-explicit-any */
import { errorResponse, successResponse } from '@/lib/api-response';
import { publishToPage, publishWithSeedings, validateFBToken } from '@/lib/facebook-api';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

/**
 * POST /api/facebook/publish
 * Đăng bài lên Facebook Page + auto comment seeding
 */
export async function POST(req: NextRequest) {
  try {
    const { pageId, content, commentSeedings, commentDelay, contentId } = await req.json();

    if (!pageId || !content) {
      return errorResponse('Thiếu pageId hoặc content', 400);
    }

    // Lấy thông tin page từ DB
    const fbPage = await prisma.facebookPage.findUnique({
      where: { pageId },
    });

    if (!fbPage || !fbPage.isActive) {
      return errorResponse('Facebook Page chưa được kết nối hoặc đã bị vô hiệu hóa', 404);
    }

    // ═══ VALIDATE TOKEN TRƯỚC KHI ĐĂNG ═══
    const tokenCheck = await validateFBToken(fbPage.accessToken);
    if (!tokenCheck.valid) {
      // Đánh dấu page inactive nếu token hết hạn
      await prisma.facebookPage.update({
        where: { pageId },
        data: { isActive: false },
      });

      const isExpired =
        tokenCheck.error?.includes('session') ||
        tokenCheck.error?.includes('expired') ||
        tokenCheck.error?.includes('logged out') ||
        tokenCheck.error?.includes('invalid');
      const hint = isExpired
        ? 'Token đã hết hạn hoặc bị thu hồi. Vui lòng vào trang "Kết nối Facebook" để tạo token mới.'
        : `Token không hợp lệ: ${tokenCheck.error}`;

      return new Response(
        JSON.stringify({
          success: false,
          error: hint,
          errorCode: 'TOKEN_EXPIRED',
          reconnectUrl: '/dashboard/facebook-connect',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Tạo log entry với trạng thái PUBLISHING
    const log = await prisma.facebookPublishLog.create({
      data: {
        facebookPageId: fbPage.id,
        contentId: contentId || null,
        fbPostId: '',
        status: 'PUBLISHING',
      },
    });

    try {
      if (commentSeedings && commentSeedings.length > 0) {
        // Đăng bài + auto comment
        const result = await publishWithSeedings(
          pageId,
          fbPage.accessToken,
          content,
          commentSeedings,
          commentDelay || 45000,
        );

        // Cập nhật log
        await prisma.facebookPublishLog.update({
          where: { id: log.id },
          data: {
            fbPostId: result.postId,
            fbPostUrl: result.postUrl,
            commentsPosted: result.commentsPosted,
            status: result.errors.length > 0 ? 'POSTED' : 'COMPLETED',
            errorLog: result.errors.length > 0 ? result.errors.join('\n') : null,
          },
        });

        return successResponse({
          postId: result.postId,
          postUrl: result.postUrl,
          commentsPosted: result.commentsPosted,
          totalComments: result.totalComments,
          errors: result.errors,
          logId: log.id,
        });
      } else {
        // Chỉ đăng bài, không comment
        const result = await publishToPage(pageId, fbPage.accessToken, content);

        await prisma.facebookPublishLog.update({
          where: { id: log.id },
          data: {
            fbPostId: result.postId,
            fbPostUrl: result.postUrl,
            status: 'COMPLETED',
          },
        });

        return successResponse({
          postId: result.postId,
          postUrl: result.postUrl,
          commentsPosted: 0,
          totalComments: 0,
          errors: [],
          logId: log.id,
        });
      }
    } catch (publishErr: any) {
      // Cập nhật log với lỗi
      await prisma.facebookPublishLog.update({
        where: { id: log.id },
        data: {
          status: 'FAILED',
          errorLog: publishErr.message,
        },
      });

      // Detect token errors from FB API during publish
      const msg = publishErr.message || '';
      if (
        msg.includes('session') ||
        msg.includes('access token') ||
        msg.includes('OAuthException')
      ) {
        await prisma.facebookPage.update({ where: { pageId }, data: { isActive: false } });
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Token Facebook đã hết hạn. Vui lòng kết nối lại.',
            errorCode: 'TOKEN_EXPIRED',
            reconnectUrl: '/dashboard/facebook-connect',
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } },
        );
      }

      return errorResponse(`Lỗi đăng bài: ${publishErr.message}`, 500);
    }
  } catch (err: any) {
    console.error('[POST /api/facebook/publish]', err);
    return errorResponse('Lỗi server', 500);
  }
}

/**
 * GET /api/facebook/publish — Lấy lịch sử đăng bài
 */
export async function GET() {
  try {
    const logs = await prisma.facebookPublishLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        facebookPage: {
          select: { pageName: true, pageAvatar: true },
        },
      },
    });
    return successResponse(logs);
  } catch (err) {
    return errorResponse('Lỗi lấy lịch sử', 500);
  }
}
