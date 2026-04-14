import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchShopeeProducts } from "@/lib/shopee";
import { successResponse, errorResponse, paginationMeta } from "@/lib/api-response";

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags:
 *       - Products Database
 *     summary: Lấy danh sách sản phẩm
 *     description: Lấy danh sách sản phẩm từ cơ sở dữ liệu hoặc Shopee API.
 *     parameters:
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [db, shopee]
 *         description: Nguồn lấy dữ liệu
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const source = searchParams.get("source") || "db"; // "db" | "shopee"
    const keyword = searchParams.get("keyword") || "";
    const category = searchParams.get("category") || "";
    const minCommission = parseFloat(searchParams.get("minCommission") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "999999999");
    const sortBy = (searchParams.get("sortBy") || "commission") as "commission" | "sold" | "price" | "rating";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (source === "shopee") {
      // Lấy từ Shopee API (hoặc mock)
      const products = await fetchShopeeProducts({
        keyword,
        category,
        minCommission,
        maxPrice,
        sortBy,
        page,
        limit,
      });
      return successResponse(products, { page, limit });
    }

    // Lấy từ DB (products user đã save)
    const userId = "demo-user"; // TODO: get from session

    const where = {
      userId,
      ...(keyword && {
        OR: [
          { name: { contains: keyword, mode: "insensitive" as const } },
          { category: { contains: keyword, mode: "insensitive" as const } },
        ],
      }),
      ...(category && {
        category: { contains: category, mode: "insensitive" as const },
      }),
      ...(minCommission && { commissionRate: { gte: minCommission } }),
      ...(maxPrice && { discountedPrice: { lte: maxPrice } }),
      status: "ACTIVE" as const,
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy:
          sortBy === "commission"
            ? { commissionRate: "desc" }
            : sortBy === "sold"
            ? { soldCount: "desc" }
            : sortBy === "price"
            ? { discountedPrice: "asc" }
            : { rating: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: { select: { affiliateLinks: true, contents: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return successResponse(products, paginationMeta(total, page, limit));
  } catch (err) {
    console.error("[GET /api/products]", err);
    return errorResponse("Lỗi khi lấy danh sách sản phẩm", 500);
  }
}

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags:
 *       - Products Database
 *     summary: Lưu sản phẩm vào DB
 *     description: Lưu một sản phẩm lấy từ Shopee vào Database để dùng về sau
 *     responses:
 *       201:
 *         description: Đã lưu thành công
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = "demo-user"; // TODO: get from session

    const product = await prisma.product.create({
      data: {
        userId,
        shopeeItemId: body.shopeeItemId,
        shopeeShopId: body.shopeeShopId,
        name: body.name,
        description: body.description,
        imageUrl: body.imageUrl,
        originalPrice: body.originalPrice || 0,
        discountedPrice: body.discountedPrice || 0,
        commissionRate: body.commissionRate || 0,
        category: body.category,
        shopName: body.shopName,
        rating: body.rating,
        soldCount: body.soldCount || 0,
      },
    });

    return successResponse(product, undefined, 201);
  } catch (err) {
    console.error("[POST /api/products]", err);
    return errorResponse("Lỗi khi lưu sản phẩm", 500);
  }
}
