import { NextRequest } from "next/server";
import { generateContentStrategy } from "@/lib/gemini";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

const StrategySchema = z.object({
  name: z.string().min(1, "Cần có tên sản phẩm"),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.number().min(0),
  discountedPrice: z.number().min(0),
  commissionRate: z.number().min(0).max(100),
  rating: z.number().min(0).max(5).optional(),
  soldCount: z.number().min(0).optional(),
});

// POST /api/content/strategy
/**
 * @swagger
 * /api/content/strategy:
 *   post:
 *     tags:
 *       - AI Engine
 *     summary: [Step 2] 10 Content Angles
 *     description: Suy nghĩ 10 góc khai thác Content (Shock, Tò mò, Review) dựa vào USP.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Danh sách Content Angles
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = StrategySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const result = await generateContentStrategy(parsed.data);
    return successResponse(result);
  } catch (err) {
    console.error("[POST /api/content/strategy]", err);
    const message =
      err instanceof Error ? err.message : "Lỗi khi tạo chiến lược";
    if (message.includes("API key") || message.includes("GEMINI")) {
      return errorResponse(
        "Cần cấu hình GEMINI_API_KEY trong .env — Lấy miễn phí tại ai.google.dev",
        401
      );
    }
    return errorResponse(message, 500);
  }
}
