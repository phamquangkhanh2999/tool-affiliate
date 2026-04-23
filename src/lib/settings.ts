/**
 * Hệ thống Cấu hình Tập trung (Strict ENV Only)
 * Dùng để quản lý các Key và Model thông qua tệp .env
 */

export interface AppSettings {
  geminiApiKey: string | null;
  geminiModel: string;
  shopeeAppId: string | null;
  shopeeSecretKey: string | null;
}

/**
 * Lấy cấu hình trực tiếp từ Environment Variables
 */
export async function getAppSettings(): Promise<AppSettings> {
  return {
    geminiApiKey: process.env.GEMINI_API_KEY || null,
    geminiModel: process.env.GEMINI_MODEL || 'gemini-3-flash-preview',
    shopeeAppId: process.env.SHOPEE_APP_ID || null,
    shopeeSecretKey: process.env.SHOPEE_SECRET_KEY || null,
  };
}

/**
 * Lưu ý: Các hàm updateAppSetting đã bị xóa bỏ để đảm bảo tính nhất quán
 * và bảo mật thông qua file .env hệ thống.
 */
