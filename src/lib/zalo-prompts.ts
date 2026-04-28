import { callGeminiApi, cleanJsonResponse } from './gemini';

export interface ExpertZaloPostResult {
  zaloMessage: string;
  zaloArticle: string;
  prompt?: string;
  dbStatus?: 'success' | 'error';
}

export function getExpertZaloPrompt(productName: string, affiliateLink: string, additionalInfo?: string): string {
  return `[ZALO EXPERT] Master Zalo Marketing & Conversational Commerce.
Nhiệm vụ: Viết nội dung quảng bá cho sản phẩm "${productName}" trên nền tảng Zalo OA (Zalo Official Account) hoặc Zalo cá nhân, nhằm mục đích chốt sale và tăng tỉ lệ click vào link Affiliate.

CHIẾN THUẬT NỘI DUNG ZALO (MANDATORY):
1. VĂN PHONG GẦN GŨI, TIN CẬY: Người dùng Zalo thích sự tư vấn, trò chuyện thân mật (như bạn bè hoặc chuyên viên tư vấn).
2. HAI PHIÊN BẢN:
   - Bản tin nhắn (Zalo Message/Broadcast): Ngắn gọn (dưới 150 chữ), hook mạnh, nhấn mạnh khuyến mãi/lợi ích ngay lập tức, kèm link trực tiếp. Phù hợp gửi hàng loạt hoặc nhắn tin 1-1.
   - Bản bài viết (Zalo Article/Nhật ký): Dài hơn một chút, format dễ nhìn, có review/chia sẻ cá nhân, kêu gọi inbox hoặc click link để mua.
3. KẾU GỌI HÀNH ĐỘNG (CTA): Rõ ràng, thúc đẩy mua ngay qua link: ${affiliateLink}.

Thông tin bổ sung: ${additionalInfo || 'Không có'}

Output JSON schema:
{
  "zaloMessage": "Tin nhắn Zalo ngắn gọn, kèm link...",
  "zaloArticle": "Bài viết nhật ký Zalo, chia sẻ review, kèm link..."
}
Return ONLY JSON.`;
}

export async function generateExpertZaloPost(productName: string, affiliateLink: string, additionalInfo?: string): Promise<ExpertZaloPostResult> {
  const prompt = getExpertZaloPrompt(productName, affiliateLink, additionalInfo);
  const resultText = await callGeminiApi(prompt, { json: true });
  const cleaned = cleanJsonResponse(resultText);
  return { ...JSON.parse(cleaned), prompt };
}
