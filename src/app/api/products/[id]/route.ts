import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

const UpdateProductSchema = z.object({
  name: z.string().min(1, "Tên không được để trống").optional(),
  originalPrice: z.number().min(0).optional(),
  discountedPrice: z.number().min(0).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  category: z.string().optional(),
  status: z.enum(["ACTIVE", "PAUSED", "ARCHIVED"]).optional(),
});

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     tags:
 *       - Products Database
 *     summary: Cập nhật thông tin sản phẩm
 *   delete:
 *     tags:
 *       - Products Database
 *     summary: Xóa sản phẩm
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = UpdateProductSchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.issues[0].message);

    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
    });

    return successResponse(product);
  } catch (err) {
    console.error("[PATCH /api/products/[id]]", err);
    return errorResponse("Lỗi khi cập nhật sản phẩm", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (err) {
    console.error("[DELETE /api/products/[id]]", err);
    return errorResponse("Lỗi khi xóa sản phẩm", 500);
  }
}
