import { prisma } from "./prisma";

export interface AppSettings {
  geminiApiKey: string | null;
  geminiModel: string | null;
  shopeeAppId: string | null;
  shopeeSecretKey: string | null;
}

/**
 * Lấy cấu hình từ Database, nếu không có thì fallback sang .env
 */
export async function getAppSettings(userId: string = "demo-user"): Promise<AppSettings> {
  const apiKeys = await prisma.apiKey.findMany({
    where: { userId },
  });

  const gemini = apiKeys.find((k) => k.platform === "gemini");
  const shopee = apiKeys.find((k) => k.platform === "shopee");

  return {
    geminiApiKey: gemini?.secretKey || process.env.GEMINI_API_KEY || null,
    geminiModel: gemini?.appId || process.env.GEMINI_MODEL || "gemini-1.5-flash",
    shopeeAppId: shopee?.appId || process.env.SHOPEE_APP_ID || null,
    shopeeSecretKey: shopee?.secretKey || process.env.SHOPEE_SECRET_KEY || null,
  };
}

/**
 * Lưu hoặc cập nhật cấu hình vào Database
 */
export async function updateAppSetting(
  platform: string,
  data: { appId?: string; secretKey?: string },
  userId: string = "demo-user"
) {
  return prisma.apiKey.upsert({
    where: {
      userId_platform: { userId, platform },
    },
    update: {
      ...data,
      updatedAt: new Date(),
    },
    create: {
      userId,
      platform,
      ...data,
      isActive: true,
    },
  });
}
