import { NextRequest } from "next/server";
import { parseBulkProductList } from "@/lib/gemini";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * @swagger
 * /api/products/bulk:
 *   post:
 *     tags:
 *       - AI Engine
 *     summary: Bóc tách danh sách sản phẩm hàng loạt
 *     description: Sử dụng Gemini AI để phân tích văn bản thô (Zalo/FB) thành danh sách sản phẩm.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trả về danh sách sản phẩm đã bóc tách
 */
export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || text.length < 10) {
      return errorResponse("Nội dung quá ngắn để phân tích", 400);
    }

    const products = await parseBulkProductList(text);

    return successResponse(products);
  } catch (err) {
    console.error("[POST /api/products/bulk]", err);
    return errorResponse("Lỗi khi bóc tách dữ liệu AI", 500);
  }
}
