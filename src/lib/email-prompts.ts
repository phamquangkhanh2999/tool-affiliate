import { callGeminiApi, cleanJsonResponse } from './gemini';

export interface ExpertEmailPostResult {
  subject: string;
  previewText: string;
  bodyHtml: string;
  imagePrompt?: string;
  videoPrompt?: string;
  videoScript?: string;
  prompt?: string;
  dbStatus?: 'success' | 'error';
}

export function getExpertEmailPrompt(productName: string, affiliateLink: string, additionalInfo?: string): string {
  return `[EMAIL EXPERT] Master Email Marketing & Direct Response Copywriter.
Nhiệm vụ: Viết email marketing cho sản phẩm "${productName}".

CHIẾN THUẬT NỘI DUNG EMAIL (MANDATORY):
1. TIÊU ĐỀ & PREVIEW TEXT.
2. NỘI DUNG (BODY HTML).
3. PROMPT TẠO ẢNH: 1 câu lệnh tiếng Anh chi tiết cho banner email (16:9).
4. PROMPT TẠO VIDEO: 1 câu lệnh tiếng Anh cho video nhúng email.
5. KỊCH BẢN VIDEO: Kịch bản video giới thiệu ngắn để đính kèm.
6. CTA: Rõ ràng qua link: ${affiliateLink}.

Thông tin bổ sung: ${additionalInfo || 'Không có'}

Output JSON schema:
{
  "subject": "Tiêu đề...",
  "previewText": "Preview...",
  "bodyHtml": "HTML content...",
  "imagePrompt": "English prompt for Banner...",
  "videoPrompt": "English prompt for Video...",
  "videoScript": "Kịch bản video ngắn (Cảnh 1: ..., Lời thoại: ...)"
}
Return ONLY JSON.`;
}

export async function generateExpertEmailPost(productName: string, affiliateLink: string, additionalInfo?: string): Promise<ExpertEmailPostResult> {
  const prompt = getExpertEmailPrompt(productName, affiliateLink, additionalInfo);
  const resultText = await callGeminiApi(prompt, { json: true });
  const cleaned = cleanJsonResponse(resultText);
  return { ...JSON.parse(cleaned), prompt };
}
