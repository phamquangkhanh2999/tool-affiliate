import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      platform, 
      postType, 
      content, 
      scheduledAt, 
      metadata 
    } = body;

    // Get current user (mocked for now, should use session)
    const user = await prisma.user.findFirst();
    if (!user) return errorResponse('User not found', 404);

    const schedule = await prisma.postSchedule.create({
      data: {
        userId: user.id,
        platform: platform || 'facebook',
        postType: postType || 'FEED',
        content: content || '',
        scheduledAt: new Date(scheduledAt),
        status: 'PENDING',
        metadata: metadata || {}
      }
    });

    return successResponse({
      success: true,
      scheduleId: schedule.id,
      scheduledAt: schedule.scheduledAt
    });

  } catch (err: any) {
    console.error('[POST /api/schedule]', err);
    return errorResponse(err.message || 'Lỗi server', 500);
  }
}
