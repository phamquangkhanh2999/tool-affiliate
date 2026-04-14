import { NextRequest } from "next/server";
import { generateHookScript } from "@/lib/gemini-steps";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

const Schema = z.object({
  productName: z.string().min(1),
  price: z.number().min(0),
  discountedPrice: z.number().min(0),
  commissionRate: z.number().min(0).max(100),
  category: z.string().optional(),
});

/**
 * @swagger
 * /api/content/hooks:
 *   post:
 *     summary: Tạo 5 hooks và 5 scripts video
 *     description: Dùng AI sinh ra hooks viral và nội dung kịch bản 30s
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *               price:
 *                 type: number
 *               discountedPrice:
 *                 type: number
 *               commissionRate:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trả về danh sách hooks và scripts
 *       500:
 *         description: Server error
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.issues[0].message);
    const result = await generateHookScript(parsed.data);
    return successResponse(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi tạo hook/script";
    return errorResponse(msg, 500);
  }
}
