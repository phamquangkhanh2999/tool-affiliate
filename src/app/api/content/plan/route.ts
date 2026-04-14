import { NextRequest } from "next/server";
import { generateContentPlan } from "@/lib/gemini-steps";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

const Schema = z.object({
  productName: z.string().min(1),
  price: z.number().min(0),
  discountedPrice: z.number().min(0),
  commissionRate: z.number().min(0).max(100),
  category: z.string().optional(),
  startDate: z.string().optional(),
});

/**
 * @swagger
 * /api/content/plan:
 *   post:
 *     tags:
 *       - AI Engine
 *     summary: [Step 5] Lập Kế Hoạch 7 Ngày
 *     description: Lên lịch trình đăng bài tuần cho sản phẩm (2 post / ngày).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *     responses:
 *       200:
 *         description: JSON Array kế hoạch đăng
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.issues[0].message);
    const result = await generateContentPlan(parsed.data);
    return successResponse(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi tạo content plan";
    return errorResponse(msg, 500);
  }
}
