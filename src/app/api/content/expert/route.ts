import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateExpertFacebookPost } from "@/lib/gemini";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

const ExpertSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(1),
  affiliateLink: z.string().min(1), // Không ép kiểu URL vì có thể là link nội bộ
  additionalInfo: z.string().optional(),
});

/**
 * @swagger
 * /api/content/expert:
 *   post:
 *     tags:
 *       - AI Engine
 *     summary: Tạo bài đăng Facebook phong cách chuyên gia
 *     description: Trả về 3 biến thể hook, 1 bản ngắn (<100 từ) và 1 bản dài (200-300 từ).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *               affiliateLink:
 *                 type: string
 *               additionalInfo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo nội dung thành công
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ExpertSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const { productId, productName, affiliateLink, additionalInfo } = parsed.data;
    const userId = "demo-user"; // TODO: get from session

    const result = await generateExpertFacebookPost(
      productName,
      affiliateLink,
      additionalInfo
    );

    // Lưu vào DB
    // Vì bảng GeneratedContent.content là kiểu String, ta sẽ lưu JSON stringify
    const saved = await prisma.generatedContent.create({
      data: {
        userId,
        productId,
        contentType: "CAPTION",
        platform: "facebook",
        tone: "engaging",
        prompt: `EXPERT_FACEBOOK: ${productName}`,
        content: JSON.stringify(result),
        hashtags: [],
      },
    });

    return successResponse({
      id: saved.id,
      ...result
    }, undefined, 201);
  } catch (err) {
    console.error("[POST /api/content/expert]", err);
    const message = err instanceof Error ? err.message : "Lỗi AI Expert generation";
    return errorResponse(message, 500);
  }
}
