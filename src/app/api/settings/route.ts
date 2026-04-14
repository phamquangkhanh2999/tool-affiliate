import { NextRequest } from "next/server";
import { getAppSettings, updateAppSetting } from "@/lib/settings";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * @swagger
 * /api/settings:
 *   get:
 *     tags:
 *       - Configuration
 *     summary: Lấy cấu hình API Keys
 *     responses:
 *       200:
 *         description: Trả về cấu hình hiện tại
 */
export async function GET() {
  try {
    const settings = await getAppSettings();
    return successResponse(settings);
  } catch (err) {
    console.error("[GET /api/settings]", err);
    return errorResponse("Lỗi khi lấy cấu hình", 500);
  }
}

/**
 * @swagger
 * /api/settings:
 *   post:
 *     tags:
 *       - Configuration
 *     summary: Cập nhật API Keys
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { geminiApiKey, geminiModel, shopeeAppId, shopeeSecretKey } = body;

    const promises = [];

    if (geminiApiKey || geminiModel) {
      promises.push(
        updateAppSetting("gemini", {
          secretKey: geminiApiKey,
          appId: geminiModel,
        })
      );
    }

    if (shopeeAppId || shopeeSecretKey) {
      promises.push(
        updateAppSetting("shopee", {
          appId: shopeeAppId,
          secretKey: shopeeSecretKey,
        })
      );
    }

    await Promise.all(promises);

    return successResponse({ message: "Đã cập nhật cấu hình vào database" });
  } catch (err) {
    console.error("[POST /api/settings]", err);
    return errorResponse("Lỗi khi lưu cấu hình", 500);
  }
}
