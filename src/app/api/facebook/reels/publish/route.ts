/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-response';
import { validateFBToken, initReelUpload, uploadReelVideo, finishReelUpload, autoSeedComments } from '@/lib/facebook-api';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const pageId = formData.get('pageId') as string;
    const description = formData.get('description') as string;
    const videoFile = formData.get('video') as File;
    const commentSeedingsStr = formData.get('commentSeedings') as string || '';
    const commentDelay = Number(formData.get('commentDelay')) || 45000;

    const commentSeedings = commentSeedingsStr.split('\n').filter(c => c.trim());

    if (!pageId || !videoFile) {
      return errorResponse('Thiếu pageId hoặc video file', 400);
    }

    // 1. Lấy thông tin page từ DB
    const fbPage = await prisma.facebookPage.findUnique({
      where: { pageId },
    });

    if (!fbPage || !fbPage.isActive) {
      return errorResponse('Facebook Page chưa được kết nối hoặc đã bị vô hiệu hóa', 404);
    }

    // 2. Validate Token
    const tokenCheck = await validateFBToken(fbPage.accessToken);
    if (!tokenCheck.valid) {
      await prisma.facebookPage.update({ where: { pageId }, data: { isActive: false } });
      return errorResponse('Token đã hết hạn. Vui lòng kết nối lại.', 401);
    }

    // 3. Quy trình upload Reels (3 bước)
    try {
      // BƯỚC 1: Khởi tạo upload session
      const { video_id, upload_url } = await initReelUpload(pageId, fbPage.accessToken);

      // BƯỚC 2: Upload Video Binary
      const arrayBuffer = await videoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await uploadReelVideo(upload_url, fbPage.accessToken, buffer);

      // BƯỚC 3: Hoàn tất và Publish
      const publishResult = await finishReelUpload(pageId, fbPage.accessToken, video_id, description);

      // BƯỚC 4: Seeding Comments (nếu có)
      let commentsPosted = 0;
      let seedErrors: string[] = [];
      if (commentSeedings.length > 0) {
        // Đợi 5s cho video xử lý sơ bộ
        await new Promise(r => setTimeout(r, 5000));
        const seedResult = await autoSeedComments(video_id, fbPage.accessToken, commentSeedings, commentDelay);
        commentsPosted = seedResult.posted;
        seedErrors = seedResult.errors;
      }

      // Ghi log
      await prisma.facebookPublishLog.create({
        data: {
          facebookPageId: fbPage.id,
          fbPostId: video_id,
          fbPostUrl: `https://www.facebook.com/reels/${video_id}`,
          status: seedErrors.length > 0 ? 'POSTED' : 'COMPLETED',
          commentsPosted: commentsPosted,
          errorLog: seedErrors.length > 0 ? seedErrors.join('\n') : 'Facebook Reel Published'
        }
      });

      return successResponse({
        success: true,
        reelId: video_id,
        reelUrl: `https://www.facebook.com/reels/${video_id}`,
        commentsPosted
      });

    } catch (publishErr: any) {
      console.error('[REELS PUBLISH ERR]', publishErr);
      return errorResponse(`Lỗi upload Reels: ${publishErr.message}`, 500);
    }

  } catch (err: any) {
    console.error('[POST /api/facebook/reels/publish]', err);
    return errorResponse('Lỗi server', 500);
  }
}
