import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const logPath = path.join(process.cwd(), 'debug_api.log');
    
    if (!fs.existsSync(logPath)) {
      return successResponse({ logs: 'Chưa có dữ liệu log nào được ghi.' });
    }

    // Đọc 10000 bytes cuối cùng của file để đảm bảo hiệu suất
    const stats = fs.statSync(logPath);
    const bufferSize = Math.min(stats.size, 50000); // Đọc tối đa 50KB gần nhất
    const buffer = Buffer.alloc(bufferSize);
    
    const fd = fs.openSync(logPath, 'r');
    fs.readSync(fd, buffer, 0, bufferSize, stats.size - bufferSize);
    fs.closeSync(fd);

    const logs = buffer.toString('utf-8');

    return successResponse({ 
      logs,
      fileSize: stats.size,
      lastUpdated: stats.mtime
    });
  } catch (err) {
    console.error('Lỗi đọc file log:', err);
    return errorResponse('Không thể đọc file log hệ thống', 500);
  }
}
