import { NextRequest } from "next/server";
import { analyzePerformance } from "@/lib/gemini-steps";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

const VideoMetricSchema = z.object({
  title: z.string(),
  type: z.string(),
  hook: z.string(),
  views: z.number().min(0),
  likes: z.number().min(0),
  comments: z.number().min(0),
  shares: z.number().min(0),
  clicks: z.number().min(0),
  conversions: z.number().min(0),
});

const Schema = z.object({
  metrics: z.array(VideoMetricSchema).min(1).max(10),
});

/**
 * @swagger
 * /api/analytics/performance:
 *   post:
 *     tags:
 *       - Analytics
 *     summary: [Step 6+7] Tối ưu hóa hiệu suất (AI)
 *     description: Đưa metrics video vào để chẩn đoán nguyên nhân FLOP và tự viết lại kịch bản tối ưu hơn.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               metrics:
 *                 type: array
 *     responses:
 *       200:
 *         description: JSON Array chẩn đoán lỗi và suggested script
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.issues[0].message);
    const result = await analyzePerformance(parsed.data.metrics);
    return successResponse(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi phân tích performance";
    return errorResponse(msg, 500);
  }
}
