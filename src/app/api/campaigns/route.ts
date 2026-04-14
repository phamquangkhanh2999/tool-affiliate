import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

const CampaignSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  platform: z.array(z.string()).min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  productIds: z.array(z.string()).optional(),
});

// GET /api/campaigns
/**
 * @swagger
 * /api/campaigns:
 *   get:
 *     tags:
 *       - Campaigns
 *     summary: Lấy danh sách Campaign
 *     description: Liệt kê các chiến dịch phân bổ Affiliate (Facebook, Tiktok)
 *     responses:
 *       200:
 *         description: Trả về Array of Campaigns
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const userId = "demo-user";

    const where = {
      userId,
      ...(status && { status: status as any }),
    };

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: {
            include: {
              product: { select: { name: true, imageUrl: true, commissionRate: true } },
            },
            orderBy: { order: "asc" },
          },
          _count: { select: { schedules: true } },
        },
      }),
      prisma.campaign.count({ where }),
    ]);

    return successResponse(campaigns, { total, page, limit });
  } catch (err) {
    console.error("[GET /api/campaigns]", err);
    return errorResponse("Lỗi khi lấy campaigns", 500);
  }
}

// POST /api/campaigns — Tạo chiến dịch mới
/**
 * @swagger
 * /api/campaigns:
 *   post:
 *     tags:
 *       - Campaigns
 *     summary: Tạo Campaign mới
 *     description: Tạo mới chiến dịch để nhóm URL affiliate
 *     responses:
 *       201:
 *         description: Đã tạo campaign
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CampaignSchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.issues[0].message);

    const userId = "demo-user";
    const data = parsed.data;

    const campaign = await prisma.campaign.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        platform: data.platform,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        items: data.productIds?.length
          ? {
              create: data.productIds.map((productId, order) => ({
                productId,
                order,
              })),
            }
          : undefined,
      },
      include: { items: true },
    });

    return successResponse(campaign, undefined, 201);
  } catch (err) {
    console.error("[POST /api/campaigns]", err);
    return errorResponse("Lỗi khi tạo campaign", 500);
  }
}
