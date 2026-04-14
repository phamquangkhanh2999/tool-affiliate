import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAffiliateUrl } from "@/lib/shopee";
import { successResponse, errorResponse } from "@/lib/api-response";

// POST /api/affiliate/generate — Tạo affiliate link
/**
 * @swagger
 * /api/affiliate/generate:
 *   post:
 *     tags:
 *       - Affiliate System
 *     summary: Tạo Link Rút Gọn Tracking
 *     description: Gọi Shopee OpenAPI (hoặc GraphQL) để tạo Custom Short Link, đồng thời ghi nhận vào hệ thống nhằm check lượt Click.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               originalUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trả về Tracking Link dạng r/xxxx
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, productUrl } = body;

    if (!productId || !productUrl) {
      return errorResponse("Thiếu productId hoặc productUrl");
    }

    // Check product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) return errorResponse("Sản phẩm không tồn tại", 404);

    // Tạo affiliate link
    const affiliateLink = await prisma.affiliateLink.create({
      data: {
        productId,
        originalUrl: productUrl,
        platform: "shopee",
      },
    });

    // Generate rút gọn URL
    const shortUrl = generateAffiliateUrl(productUrl, affiliateLink.trackingCode);

    // Update với shortUrl
    const updated = await prisma.affiliateLink.update({
      where: { id: affiliateLink.id },
      data: { shortUrl },
    });

    return successResponse({
      id: updated.id,
      trackingCode: updated.trackingCode,
      shortUrl: updated.shortUrl,
      originalUrl: updated.originalUrl,
    }, undefined, 201);
  } catch (err) {
    console.error("[POST /api/affiliate/generate]", err);
    return errorResponse("Lỗi khi tạo affiliate link", 500);
  }
}

// GET /api/affiliate/generate — Lấy danh sách links
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where = productId ? { productId } : {};

    const [links, total] = await Promise.all([
      prisma.affiliateLink.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { name: true, imageUrl: true } },
        },
      }),
      prisma.affiliateLink.count({ where }),
    ]);

    return successResponse(links, { total, page, limit });
  } catch (err) {
    console.error("[GET /api/affiliate/generate]", err);
    return errorResponse("Lỗi khi lấy affiliate links", 500);
  }
}
