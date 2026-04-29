import { callGeminiApi, cleanJsonResponse } from './gemini';

export interface ExpertZaloPostResult {
  zaloMessage: string;
  zaloArticle: string;
  imagePrompt?: string;
  videoPrompt?: string;
  videoScript?: string;
  prompt?: string;
  dbStatus?: 'success' | 'error';
}

export function getExpertZaloPrompt(productName: string, affiliateLink: string, additionalInfo?: string): string {
  return `[ZALO EXPERT] Master Zalo Marketing & Conversational Commerce.
Nhiệm vụ: Viết nội dung quảng bá cho sản phẩm "${productName}" trên Zalo OA hoặc cá nhân.

CHIẾN THUẬT NỘI DUNG ZALO (MANDATORY):
1. VĂN PHONG GẦN GŨI, TIN CẬY.
2. HAI PHIÊN BẢN: Tin nhắn & Bài viết.
3. PROMPT TẠO ẢNH: 1 câu lệnh tiếng Anh chi tiết cho Midjourney (1:1).
4. PROMPT TẠO VIDEO: 1 câu lệnh tiếng Anh cho AI Video (1:1).
5. KỊCH BẢN VIDEO: Kịch bản video giới thiệu ngắn (15s).
6. CTA: Rõ ràng qua link: ${affiliateLink}.

Thông tin bổ sung: ${additionalInfo || 'Không có'}

Output JSON schema:
{
  "zaloMessage": "Tin nhắn Zalo ngắn gọn...",
  "zaloArticle": "Bài viết nhật ký Zalo...",
  "imagePrompt": "English prompt for Image AI...",
  "videoPrompt": "English prompt for Video AI...",
  "videoScript": "Kịch bản video ngắn (Cảnh 1: ..., Lời thoại: ...)"
}
Return ONLY JSON.`;
}

export async function generateExpertZaloPost(productName: string, affiliateLink: string, additionalInfo?: string): Promise<ExpertZaloPostResult> {
  const prompt = getExpertZaloPrompt(productName, affiliateLink, additionalInfo);
  const resultText = await callGeminiApi(prompt, { json: true });
  const cleaned = cleanJsonResponse(resultText);
  return { ...JSON.parse(cleaned), prompt };
}
