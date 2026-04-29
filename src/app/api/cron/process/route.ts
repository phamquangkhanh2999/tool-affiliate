import { NextRequest } from 'next/server';
import { validateFBToken, autoSeedComments, publishToPage } from '@/lib/facebook-api';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Security check: Verify a secret key to prevent unauthorized cron triggering
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return errorResponse('Unauthorized', 401);
  }

  const now = new Date();
  const pending = await prisma.postSchedule.findMany({
    where: {
      status: 'PENDING',
      scheduledAt: { lte: now }
    },
    take: 5 
  });

  const results: any[] = [];

  for (const post of pending) {
    try {
      await prisma.postSchedule.update({
        where: { id: post.id },
        data: { status: 'PROCESSING' }
      });

      const metadata = post.metadata as any;
      const pageId = metadata.pageId;
      
      const fbPage = await prisma.facebookPage.findUnique({
        where: { pageId }
      });

      if (!fbPage) throw new Error('Page not found in database');

      let publishResult;
      if (post.postType === 'REELS') {
          // Reels scheduling often requires cloud storage for the video file.
          // For now, we support Feed scheduling primarily.
          throw new Error('Reels scheduling requires persistent video storage (S3/Cloudinary)');
      } else {
        // Standard Feed Post
        publishResult = await publishToPage(
          pageId, 
          fbPage.accessToken, 
          post.content
        );

        // Seeding
        if (metadata.commentSeedings?.length > 0) {
          await new Promise(r => setTimeout(r, 5000));
          await autoSeedComments(
            publishResult.postId, 
            fbPage.accessToken, 
            metadata.commentSeedings, 
            metadata.commentDelay || 45000
          );
        }
      }

      await prisma.postSchedule.update({
        where: { id: post.id },
        data: { 
          status: 'POSTED', 
          postedAt: new Date(),
          errorLog: `Successfully posted to FB: ${publishResult.postId}`
        }
      });

      results.push({ id: post.id, status: 'SUCCESS' });

    } catch (err: any) {
      console.error(`[CRON ERROR] Post ${post.id}:`, err);
      await prisma.postSchedule.update({
        where: { id: post.id },
        data: { 
          status: 'FAILED', 
          errorLog: err.message 
        }
      });
      results.push({ id: post.id, status: 'FAILED', error: err.message });
    }
  }

  return successResponse({ processed: results.length, results });
}
