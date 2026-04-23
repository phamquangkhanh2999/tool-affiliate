import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { callGeminiApi } from '@/lib/gemini';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const results = {
    database: { status: 'testing', message: '' },
    ai: { status: 'testing', message: '' },
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

  return successResponse(results);
}
