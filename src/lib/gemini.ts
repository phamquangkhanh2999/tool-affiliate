import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAppSettings } from "./settings";

/**
 * Lấy client Gemini mới nhất từ Database hoặc .env
 */
export async function getGeminiClient() {
  const settings = await getAppSettings();
  
  if (!settings.geminiApiKey) {
    throw new Error("GEMINI_API_KEY chưa được cấu hình. Vui lòng nhập Key trong phần Cài đặt.");
  }

  return new GoogleGenerativeAI(settings.geminiApiKey);
}

/**
 * Helper lấy Model Instance trực tiếp
 * @param config Cấu hình bổ sung (vd: jsonMode)
 */
export async function getGeminiModel(config?: { jsonMode?: boolean }) {
  const settings = await getAppSettings();
  const genAI = await getGeminiClient();
  return genAI.getGenerativeModel({ 
    model: settings.geminiModel || "gemini-1.5-flash",
    generationConfig: config?.jsonMode ? { responseMimeType: "application/json" } : undefined
  });
}

// ─── Content Generation ──────────────────────────────────────

export interface GenerateContentOptions {
  productName: string;
  productDescription?: string;
  price: number;
  discountedPrice: number;
  commissionRate: number;
  platform: "facebook" | "tiktok" | "zalo" | "instagram";
  tone: "engaging" | "professional" | "funny" | "urgency";
  affiliateLink: string;
  hashtags?: boolean;
}

const PLATFORM_STYLE: Record<string, string> = {
  facebook: "bài đăng Facebook dài 150-300 từ, có emoji, storytelling",
  tiktok: "script TikTok ngắn 50-100 từ, trendy, hook đầu mạnh",
  zalo: "tin nhắn Zalo ngắn gọn 50-100 từ, thân thiện, gần gũi",
  instagram: "caption Instagram 100-150 từ, aesthetic, hashtag nhiều",
};

const TONE_STYLE: Record<string, string> = {
  engaging: "hấp dẫn, kích thích tò mò, tạo cảm xúc",
  professional: "chuyên nghiệp, tin cậy, số liệu cụ thể",
  funny: "hài hước, vui nhộn, gần gũi như bạn bè",
  urgency: "tạo cấp bách, sắp hết hàng, giới hạn thời gian",
};

export async function generateAffiliateContent(
  options: GenerateContentOptions
): Promise<{ content: string; hashtags: string[] }> {
  const {
    productName,
    productDescription,
    price,
    discountedPrice,
    platform,
    tone,
    affiliateLink,
    hashtags = true,
  } = options;

  const discount = price > 0 ? Math.round(((price - discountedPrice) / price) * 100) : 0;
  const model = await getGeminiModel();

  const prompt = `Bạn là chuyên gia marketing affiliate Shopee Việt Nam.
Hãy viết ${PLATFORM_STYLE[platform]} với tone ${TONE_STYLE[tone]}.

Thông tin sản phẩm:
- Tên: ${productName}
- Mô tả: ${productDescription || "Sản phẩm chất lượng cao"}
- Giá gốc: ${price.toLocaleString("vi-VN")}đ
- Giá sale: ${discountedPrice.toLocaleString("vi-VN")}đ (giảm ${discount}%)
- Link affiliate: ${affiliateLink}

Yêu cầu:
1. Viết bằng tiếng Việt tự nhiên, đúng ngữ pháp
2. Nhấn mạnh giá giảm và cơ hội tiết kiệm
3. Bao gồm call-to-action rõ ràng với link affiliate
4. ${hashtags ? "Thêm 10-15 hashtag phù hợp ở cuối" : "Không cần hashtag"}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract hashtags if any
    const hashtagMatches = text.match(/#[\w\d_]+/g) || [];
    
    return {
      content: text,
      hashtags: hashtagMatches,
    };
  } catch (err) {
    console.error("Lỗi generateAffiliateContent:", err);
    return { content: "Lỗi tạo nội dung từ AI", hashtags: [] };
  }
}

// ─── Product Affiliate Analysis ─────────────────────────────

export interface ProductAnalysisInput {
  name: string;
  description?: string;
  category?: string;
  price: number;
  discountedPrice: number;
  commissionRate: number;
  rating?: number;
  soldCount?: number;
  shopName?: string;
}

export interface ProductAnalysisResult {
  summary: string;
  targetAudience: string;
  painPoints: string[];
  usp: string[];
  scores: {
    marketDemand: number;
    viralPotential: number;
    competition: number;
    conversionRate: number;
    overall: number;
  };
  conclusion: {
    shouldAffiliate: boolean;
    recommendation: "STRONG_BUY" | "BUY" | "HOLD" | "SKIP";
    reasons: string[];
  };
}

export async function analyzeProductAffiliate(
  product: ProductAnalysisInput
): Promise<ProductAnalysisResult> {
  const discount = product.price > 0 ? Math.round(((product.price - product.discountedPrice) / product.price) * 100) : 0;
  
  const model = await getGeminiModel({ jsonMode: true });

  const product_info = `
Tên sản phẩm: ${product.name}
Mô tả: ${product.description || "Không có mô tả"}
Danh mục: ${product.category || "Chưa phân loại"}
Giá gốc: ${product.price.toLocaleString("vi-VN")}đ
Giá sale: ${product.discountedPrice.toLocaleString("vi-VN")}đ (giảm ${discount}%)
Hoa hồng affiliate: ${product.commissionRate}%
Rating: ${product.rating ?? "N/A"}/5
Đã bán: ${product.soldCount?.toLocaleString("vi-VN") ?? "N/A"} sản phẩm
Shop: ${product.shopName || "N/A"}
  `.trim();

  const prompt = `Bạn là chuyên gia affiliate marketing Shopee Việt Nam với 10 năm kinh nghiệm. Phân tích sản phẩm Shopee sau: ${product_info}
Trả về kết quả định dạng JSON khớp với schema: ProductAnalysisResult`;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text()) as ProductAnalysisResult;
  } catch (err) {
    console.error("Lỗi analyzeProductAffiliate:", err);
    throw new Error("Không thể phân tích sản phẩm từ AI");
  }
}

// ─── Content Strategy Generator ──────────────────────────────

export interface ContentAngle {
  id: number;
  title: string;
  type: "shock" | "curiosity" | "problem_solution" | "review";
  videoIdea: string;
  targetAudience: string;
  hook: string;
  viralScore: number;
  easyScore: number;
  conversionScore: number;
  platform: ("tiktok" | "facebook" | "instagram" | "youtube")[];
}

export interface ContentStrategyResult {
  productSummary: string;
  angles: ContentAngle[];
  topPicks: number[];
}

export async function generateContentStrategy(
  product: ProductAnalysisInput
): Promise<ContentStrategyResult> {
  const model = await getGeminiModel({ jsonMode: true });

  const prompt = `Hãy tạo chiến lược gồm 10 content angle cho sản phẩm: ${product.name}. Phân bổ: 3 shock, 3 curiosity, 2 problem_solution, 2 review. Trả về JSON.`;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text()) as ContentStrategyResult;
  } catch (err) {
    console.error("Lỗi generateContentStrategy:", err);
    throw new Error("Không thể tạo chiến lược nội dung từ AI");
  }
}

// ─── Bulk Product Parser ─────────────────────────────────────

export interface BulkProductItem {
  name: string;
  originalPrice: number;
  discountedPrice: number;
  category: string;
  description: string;
  unit?: string;
}

export async function parseBulkProductList(text: string): Promise<BulkProductItem[]> {
  const model = await getGeminiModel({ jsonMode: true });

  try {
    const result = await model.generateContent(`Bóc tách danh sách sản phẩm từ văn bản: ${text}. Trả về JSON array.`);
    return JSON.parse(result.response.text()) as BulkProductItem[];
  } catch (err) {
    console.error("Lỗi parseBulkProductList:", err);
    return [];
  }
}

// ─── Expert Facebook Post Generator ───────────────────────────

export interface ExpertFacebookPostResult {
  hooks: string[];
  shortVersion: string;
  longVersion: string;
}

/**
 * Viết bài đăng Facebook phong cách chuyên gia AI (High-Conversion)
 */
export async function generateExpertFacebookPost(
  productName: string,
  affiliateLink: string,
  additionalInfo?: string
): Promise<ExpertFacebookPostResult> {
  const model = await getGeminiModel({ jsonMode: true });

  const prompt = `Bạn là chuyên gia affiliate marketing Shopee Việt Nam với 10 năm kinh nghiệm.

Tạo 1 bài đăng Facebook bán hàng hoàn chỉnh cho sản phẩm:
Tên sản phẩm: ${productName}
Link affiliate: ${affiliateLink}
${additionalInfo ? `Thông tin thêm: ${additionalInfo}` : ""}

Yêu cầu:
- Viết bằng tiếng Việt tự nhiên như người thật, không dùng từ ngữ quá hàn lâm.
- Tập trung vào việc giải quyết nỗi đau của khách hàng và thúc đẩy chuyển đổi.
- Phong cách: Viral, gây tò mò, không quá "bán hàng" lộ liễu.

Cấu trúc JSON bắt buộc:
{
  "hooks": ["3 tiêu đề viral gây tò mò"],
  "shortVersion": "Bản ngắn dưới 100 chữ",
  "longVersion": "Bản storytelling 200-300 chữ (Hook -> Pain -> Solution -> CTA)"
}

Chỉ trả về JSON.`;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text()) as ExpertFacebookPostResult;
  } catch (err) {
    console.error("Lỗi generateExpertFacebookPost:", err);
    throw new Error("Lỗi khi tạo bài đăng chuyên gia từ AI");
  }
}
