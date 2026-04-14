import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * @swagger
 * /api/products/bulk/confirm:
 *   post:
 *     tags:
 *       - Products Database
 *     summary: Lưu hàng loạt sản phẩm vào DB
 *     description: Tiếp nhận mảng sản phẩm đã được confirm từ UI và lưu vào database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Đã lưu thành công
 */
export async function POST(req: NextRequest) {
  try {
    const { products } = await req.json();
    const userId = "demo-user"; // TODO: get from session

    if (!products || !Array.isArray(products) || products.length === 0) {
      return errorResponse("Danh sách sản phẩm trống", 400);
    }

    // Thực hiện lưu hàng loạt
    // Dùng createMany để tối ưu hiệu năng
    const saved = await prisma.product.createMany({
      data: products.map((p: any) => ({
        userId,
        name: p.name,
        description: p.description + (p.unit ? ` (${p.unit})` : ""),
        originalPrice: p.originalPrice || 0,
        discountedPrice: p.discountedPrice || 0,
        category: p.category || "Hàng hóa",
        status: "ACTIVE",
        // Các trường khác để null vì không có trong văn bản thô
        imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200", // Placeholder hoa quả chung
      })),
    });

    return successResponse(saved, undefined, 201);
  } catch (err) {
    console.error("[POST /api/products/bulk/confirm]", err);
    return errorResponse("Lỗi khi lưu dữ liệu hàng loạt", 500);
  }
}
