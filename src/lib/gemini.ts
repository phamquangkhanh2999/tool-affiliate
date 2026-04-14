import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

import { getAppSettings } from "./settings";

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

/**
 * Láy model Gemini với Key mới nhất từ Database hoặc .env
 */
export async function getGeminiModel() {
  const settings = await getAppSettings();
  
  if (!settings.geminiApiKey) {
    throw new Error("GEMINI_API_KEY chưa được cấu hình. Vui lòng nhập Key trong phần Cài đặt.");
  }

  const genAI = new GoogleGenerativeAI(settings.geminiApiKey);
  
  return genAI.getGenerativeModel({
    model: settings.geminiModel || "gemini-1.5-flash",
    safetySettings,
    generationConfig: {
      temperature: 0.8,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
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
    commissionRate,
    platform,
    tone,
    affiliateLink,
    hashtags = true,
  } = options;

  const discount = price > 0 ? Math.round(((price - discountedPrice) / price) * 100) : 0;

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
4. ${hashtags ? "Thêm 10-15 hashtag phù hợp ở cuối" : "Không cần hashtag"}
5. Format JSON: { "content": "...", "hashtags": ["...", "..."] }

Chỉ trả về JSON, không giải thích thêm.`;

  const model = await getGeminiModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Parse JSON response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { content: text, hashtags: [] };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      content: parsed.content || text,
      hashtags: parsed.hashtags || [],
    };
  } catch {
    return { content: text, hashtags: [] };
  }
}

// ─── Product Affiliate Analysis ─────────────────────────────
// Prompt template theo yêu cầu user

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
  const discount =
    product.price > 0
      ? Math.round(
          ((product.price - product.discountedPrice) / product.price) * 100
        )
      : 0;

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

  const prompt = `Bạn là chuyên gia affiliate marketing Shopee Việt Nam với 10 năm kinh nghiệm.

Phân tích sản phẩm Shopee sau:

${product_info}

Trả về kết quả phân tích theo JSON format chính xác sau:
{
  "summary": "Tóm tắt ngắn gọn sản phẩm trong 2-3 câu",
  "targetAudience": "Mô tả khách hàng mục tiêu cụ thể (tuổi, giới tính, thu nhập, sở thích)",
  "painPoints": ["pain point 1", "pain point 2", "pain point 3"],
  "usp": ["USP/điểm bán hàng 1", "USP 2", "USP 3"],
  "scores": {
    "marketDemand": <0-100>,
    "viralPotential": <0-100>,
    "competition": <0-100>,
    "conversionRate": <0-100>,
    "overall": <0-100>
  },
  "conclusion": {
    "shouldAffiliate": <true|false>,
    "recommendation": "<STRONG_BUY|BUY|HOLD|SKIP>",
    "reasons": ["lý do 1", "lý do 2", "lý do 3"]
  }
}

Chú ý:
- marketDemand: Nhu cầu thị trường (100 = cực cao)
- viralPotential: Khả năng viral trên MXH (100 = dễ viral)
- competition: Mức cạnh tranh (100 = CẠnh tranh rất cao, khó làm)
- conversionRate: Khả năng chuyển đổi khi click link (100 = rất cao)
- STRONG_BUY: Nên làm ngay | BUY: Nên làm | HOLD: Cân nhắc | SKIP: Bỏ qua

Phân tích dựa trên thực tế thị trường VN. Chỉ trả về JSON, không giải thích thêm.`;

  const model = await getGeminiModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Gemini không trả về JSON hợp lệ");

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    // Ensure overall score
    if (!parsed.scores.overall) {
      const { marketDemand, viralPotential, conversionRate, competition } =
        parsed.scores;
      parsed.scores.overall = Math.round(
        marketDemand * 0.3 +
          viralPotential * 0.2 +
          conversionRate * 0.3 +
          (100 - competition) * 0.2
      );
    }
    return parsed as ProductAnalysisResult;
  } catch {
    throw new Error("Không thể parse kết quả phân tích từ AI");
  }
}

// ─── Content Strategy Generator ──────────────────────────────
// Tạo 10 content angle cho sản phẩm affiliate

export interface ContentAngle {
  id: number;
  title: string;
  type: "shock" | "curiosity" | "problem_solution" | "review";
  videoIdea: string;
  targetAudience: string;
  hook: string;
  viralScore: number;       // 0-100: khả năng viral
  easyScore: number;        // 0-100: dễ quay (100 = rất dễ)
  conversionScore: number;  // 0-100: tăng chuyển đổi
  platform: ("tiktok" | "facebook" | "instagram" | "youtube")[];
}

export interface ContentStrategyResult {
  productSummary: string;
  angles: ContentAngle[];
  topPicks: number[];       // id của 3 angle được recommend nhất
}

export interface ContentStrategyInput {
  name: string;
  description?: string;
  category?: string;
  price: number;
  discountedPrice: number;
  commissionRate: number;
  rating?: number;
  soldCount?: number;
}

export async function generateContentStrategy(
  product: ContentStrategyInput
): Promise<ContentStrategyResult> {
  const discount =
    product.price > 0
      ? Math.round(
          ((product.price - product.discountedPrice) / product.price) * 100
        )
      : 0;

  const product_info = `
Tên: ${product.name}
Mô tả: ${product.description || "Chưa có"}
Danh mục: ${product.category || "Chưa phân loại"}
Giá gốc: ${product.price.toLocaleString("vi-VN")}đ
Giá sale: ${product.discountedPrice.toLocaleString("vi-VN")}đ (giảm ${discount}%)
Hoa hồng: ${product.commissionRate}%
Rating: ${product.rating ?? "N/A"}/5
Đã bán: ${product.soldCount?.toLocaleString("vi-VN") ?? "N/A"}
  `.trim();

  const prompt = `Bạn là chuyên gia content marketing TikTok/Facebook tại Việt Nam, chuyên affiliate Shopee.

Dựa trên sản phẩm:

${product_info}

Tạo chiến lược nội dung gồm 10 content angle khác nhau, phân loại theo 4 dạng:
- shock: Gây shock, bất ngờ, khiến người xem phải dừng scroll
- curiosity: Kích thích tò mò, câu hỏi bí ẩn, tạo FOMO
- problem_solution: Xác định vấn đề của khách hàng và đưa ra giải pháp
- review: Đánh giá thực tế, so sánh, unboxing, trải nghiệm

Ưu tiên:
- Viral cao: Content dễ chia sẻ, gây cảm xúc mạnh
- Dễ quay: Không cần thiết bị phức tạp, quay được 1 mình
- Tăng chuyển đổi: Kèm call-to-action tự nhiên

Trả về JSON format chính xác:
{
  "productSummary": "Tóm tắt 1 câu về sản phẩm và đây tại sao nên làm affiliate",
  "angles": [
    {
      "id": 1,
      "title": "Tiêu đề ngắn gọn cho angle này",
      "type": "shock|curiosity|problem_solution|review",
      "videoIdea": "Mô tả chi tiết ý tưởng video 3-5 câu: cảnh quay, script ngắn, cách thực hiện",
      "targetAudience": "Đối tượng mục tiêu cụ thể: tuổi, giới tính, vấn đề, hành vi",
      "hook": "Câu mở đầu video (hook) thu hút trong 3 giây đầu",
      "viralScore": <0-100>,
      "easyScore": <0-100>,
      "conversionScore": <0-100>,
      "platform": ["tiktok", "facebook", "instagram", "youtube"]
    }
  ],
  "topPicks": [<id1>, <id2>, <id3>]
}

Yêu cầu:
- Đủ 10 angles đa dạng, không lặp ý tưởng
- Phân bổ: 3 shock, 3 curiosity, 2 problem_solution, 2 review
- Hook phải bằng tiếng Việt tự nhiên, cụ thể và mạnh
- topPicks chọn 3 angle có tổng điểm (viral+easy+conversion) cao nhất
- Chỉ trả về JSON, không giải thích thêm`;

  const model = await getGeminiModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Gemini không trả về JSON hợp lệ");

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed as ContentStrategyResult;
  } catch {
    throw new Error("Không thể parse kết quả từ AI");
  }
}

// ─── Bulk Product Parser ─────────────────────────────────────
// Bóc tách danh sách sản phẩm từ văn bản thô (Zalo, FB...)

export interface BulkProductItem {
  name: string;
  originalPrice: number;
  discountedPrice: number;
  category: string;
  description: string;
  unit?: string;
}

export async function parseBulkProductList(text: string): Promise<BulkProductItem[]> {
  const prompt = `Bạn là một trợ lý ảo quản lý kho hàng tại Việt Nam.
Nhiệm vụ: Phân tích đoạn văn bản thô sau đây và bóc tách thành danh sách sản phẩm có cấu trúc.

Văn bản thô:
"""
${text}
"""

Yêu cầu phân tích:
1. Tên sản phẩm: Tên chính xác (Ví dụ: Dưa vàng cát cháy)
2. Giá: Chuyển đổi các đơn vị "k" thành ngàn, "tr" thành triệu (Ví dụ: 45k -> 45000, 1.2tr -> 1200000).
3. Nếu có 2 mức giá (ví dụ: lẻ 60k, sỉ 45k), hãy để giá LẺ vào originalPrice và giá SỈ/SALE vào discountedPrice. Nếu chỉ có 1 giá, cho cả 2 trường bằng nhau.
4. Category: Tự đoán danh mục (Ví dụ: Trái cây, Gia dụng, Thời trang...)
5. Description: Mọi thông tin phụ như "cành 18kg", "mini túi", "thùng 10kg"...
6. Unit: Đơn vị tính nếu có (kg, thùng, túi, rành...)

Trả về JSON array chính xác theo format:
[
  {
    "name": "...",
    "originalPrice": <number>,
    "discountedPrice": <number>,
    "category": "...",
    "description": "...",
    "unit": "..."
  }
]

Chỉ trả về JSON, không giải thích thêm. Nếu không tìm thấy sản phẩm nào, trả về [].`;

  const model = await getGeminiModel();
  const result = await model.generateContent(prompt);
  const responseText = result.response.text().trim();

  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  try {
    return JSON.parse(jsonMatch[0]) as BulkProductItem[];
  } catch {
    console.error("Lỗi parse JSON từ Gemini Bulk Import");
    return [];
  }
}
