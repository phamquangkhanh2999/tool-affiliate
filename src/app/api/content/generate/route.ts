import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAffiliateContent } from "@/lib/gemini";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

const GenerateSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(1),
  productDescription: z.string().optional(),
  price: z.number().min(0),
  discountedPrice: z.number().min(0),
  commissionRate: z.number().min(0),
  platform: z.enum(["facebook", "tiktok", "zalo", "instagram"]),
  tone: z.enum(["engaging", "professional", "funny", "urgency"]),
  affiliateLink: z.string(),
  count: z.number().min(1).max(5).default(1), // Tạo bao nhiêu versions
});

// POST /api/content/generate — Tạo nội dung AI
/**
 * @swagger
 * /api/content/generate:
 *   post:
 *     tags:
 *       - AI Engine
 *     summary: [Step 4] Viết Caption & Hashtag
 *     description: Tự động tổng hợp dữ liệu sản phẩm, tạo bài đăng và nhúng kèm Affiliate Link.
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
 *     responses:
 *       200:
 *         description: Trả về nội dung caption chuẩn SEO/MXH
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = GenerateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const data = parsed.data;
    const userId = "demo-user"; // TODO: from session

    // Generate multiple versions nếu count > 1
    const generatePromises = Array.from({ length: data.count }, () =>
      generateAffiliateContent({
        productName: data.productName,
        productDescription: data.productDescription,
        price: data.price,
        discountedPrice: data.discountedPrice,
        commissionRate: data.commissionRate,
        platform: data.platform,
        tone: data.tone,
        affiliateLink: data.affiliateLink,
        hashtags: true,
      })
    );

    const results = await Promise.all(generatePromises);

    // Save to DB
    const saved = await Promise.all(
      results.map((result) =>
        prisma.generatedContent.create({
          data: {
            userId,
            productId: data.productId,
            contentType: "CAPTION",
            platform: data.platform,
            tone: data.tone,
            prompt: `${data.productName} | ${data.platform} | ${data.tone}`,
            content: result.content,
            hashtags: result.hashtags,
          },
        })
      )
    );

    return successResponse(saved, undefined, 201);
  } catch (err) {
    console.error("[POST /api/content/generate]", err);
    const message = err instanceof Error ? err.message : "Lỗi AI generation";
    return errorResponse(message, 500);
  }
}

// GET /api/content/generate — Lấy lịch sử nội dung
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform");
    const productId = searchParams.get("productId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const userId = "demo-user"; // TODO: from session

    const where = {
      userId,
      ...(platform && { platform }),
      ...(productId && { productId }),
    };

    const [contents, total] = await Promise.all([
      prisma.generatedContent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          product: { select: { name: true, imageUrl: true } },
        },
      }),
      prisma.generatedContent.count({ where }),
    ]);

    return successResponse(contents, { total, page, limit });
  } catch (err) {
    console.error("[GET /api/content/generate]", err);
    return errorResponse("Lỗi khi lấy nội dung", 500);
  }
}
