import { NextRequest } from "next/server";
import { analyzeProductAffiliate } from "@/lib/gemini";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

const AnalyzeSchema = z.object({
  name: z.string().min(1, "Cần có tên sản phẩm"),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.number().min(0),
  discountedPrice: z.number().min(0),
  commissionRate: z.number().min(0).max(100),
  rating: z.number().min(0).max(5).optional(),
  soldCount: z.number().min(0).optional(),
  shopName: z.string().optional(),
});

// POST /api/products/analyze — Phân tích sản phẩm affiliate bằng AI
/**
 * @swagger
 * /api/products/analyze:
 *   post:
 *     tags:
 *       - AI Engine
 *     summary: [Step 1] Phân tích sản phẩm
 *     description: Trí tuệ nhân tạo (Gemini) phân tích USP, nhu cầu thị trường và Pain Points của sản phẩm để đưa ra quyết định Affiliate.
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
 *         description: JSON Schema phân tích và lời khuyên USP
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = AnalyzeSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const result = await analyzeProductAffiliate(parsed.data);
    return successResponse(result);
  } catch (err) {
    console.error("[POST /api/products/analyze]", err);
    const message =
      err instanceof Error ? err.message : "Lỗi khi phân tích sản phẩm";

    // Nếu lỗi Gemini API key
    if (message.includes("API key") || message.includes("GEMINI")) {
      return errorResponse(
        "Cần cấu hình GEMINI_API_KEY trong .env — Lấy miễn phí tại ai.google.dev",
        401
      );
    }

    return errorResponse(message, 500);
  }
}
