import { callGeminiApi, cleanJsonResponse } from './gemini';

export interface ExpertInstagramPostResult {
  imageConcepts: string[];
  caption: string;
  hashtags: string[];
  prompt?: string;
  dbStatus?: 'success' | 'error';
}

export function getExpertInstagramPrompt(productName: string, affiliateLink: string, additionalInfo?: string): string {
  return `[INSTAGRAM EXPERT] Master Visual Content & Lifestyle Copywriter.
Nhiệm vụ: Viết bài đăng Instagram chuyên nghiệp cho sản phẩm "${productName}" để tối ưu tương tác và click bio link.

CHIẾN THUẬT NỘI DUNG (MANDATORY):
1. IMAGE CONCEPTS: Đề xuất 3 ý tưởng hình ảnh/carousel mang tính lifestyle, thẩm mỹ cao (Aesthetic).
2. HOOK: Dòng đầu cực cuốn, dùng biểu tượng (emoji) tinh tế.
3. STORYTELLING: Mô tả ngắn gọn, tập trung vào phong cách sống và cảm xúc mang lại.
4. CTA RÕ RÀNG: Kêu gọi người dùng click link trên Bio hoặc comment để nhận link trực tiếp (${affiliateLink}).
5. HASHTAGS TỐI ƯU: 10-15 hashtags phù hợp ngách và thịnh hành.

Thông tin bổ sung: ${additionalInfo || 'Không có'}

Output JSON schema:
{
  "imageConcepts": ["Ý tưởng ảnh 1...", "Ý tưởng ảnh 2...", "Ý tưởng ảnh 3..."],
  "caption": "Nội dung caption hoàn chỉnh, chia đoạn dễ nhìn...",
  "hashtags": ["#hashtag1", "#hashtag2"]
}
Return ONLY JSON.`;
}

export async function generateExpertInstagramPost(productName: string, affiliateLink: string, additionalInfo?: string): Promise<ExpertInstagramPostResult> {
  const prompt = getExpertInstagramPrompt(productName, affiliateLink, additionalInfo);
  const resultText = await callGeminiApi(prompt, { json: true });
  const cleaned = cleanJsonResponse(resultText);
  return { ...JSON.parse(cleaned), prompt };
}
