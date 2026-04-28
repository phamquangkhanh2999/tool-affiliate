import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { callGeminiApi } from '@/lib/gemini';
import { successResponse, errorResponse } from '@/lib/api-response';
import { validateFBToken } from '@/lib/facebook-api';

export async function GET(req: NextRequest) {
  const results = {
    database: { status: 'testing', message: '' },
    ai: { status: 'testing', message: '' },
    facebook: { status: 'testing', message: '' },
    timestamp: new Date().toISOString()
  };

  try {
    // 1. Kiểm tra Database (Neon)
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    results.database = { 
      status: 'success', 
      message: `Kết nối thành công (Phản hồi: ${Date.now() - dbStart}ms)` 
    };
  } catch (err: any) {
    results.database = { 
      status: 'error', 
      message: `Lỗi kết nối DB: ${err.message || 'Không xác định'}` 
    };
  }

  try {
    // 2. Kiểm tra AI (Gemini)
    const aiStart = Date.now();
    await callGeminiApi('Say "Hello System Test"', { json: false });
    results.ai = { 
      status: 'success', 
      message: `AI hoạt động tốt (Phản hồi: ${Date.now() - aiStart}ms)` 
    };
  } catch (err: any) {
    results.ai = { 
      status: 'error', 
      message: `Lỗi AI: ${err.message || 'Kiểm tra API Key'}` 
    };
  }

  try {
    // 3. Kiểm tra Facebook API
    const fbKey = await prisma.apiKey.findFirst({
      where: { platform: 'facebook', isActive: true }
    });

    if (!fbKey || !fbKey.accessToken) {
      results.facebook = {
        status: 'warning',
        message: 'Chưa có Token Facebook nào được cấu hình trong hệ thống.'
      };
    } else {
      const fbStart = Date.now();
      const fbStatus = await validateFBToken(fbKey.accessToken);
      if (fbStatus.valid) {
        results.facebook = {
          status: 'success',
          message: `Graph API hoạt động tốt. Đã kết nối: ${fbStatus.name} (${Date.now() - fbStart}ms)`
        };
      } else {
        results.facebook = {
          status: 'error',
          message: `Token Facebook không hợp lệ hoặc đã hết hạn: ${fbStatus.error}`
        };
      }
    }
  } catch (err: any) {
    results.facebook = {
      status: 'error',
      message: `Lỗi kiểm tra Facebook: ${err.message || 'Lỗi không xác định'}`
    };
  }

  return successResponse(results);
}
