import { callGeminiApi, cleanJsonResponse } from './gemini';

export interface ExpertEmailPostResult {
  subject: string;
  previewText: string;
  bodyHtml: string;
  prompt?: string;
  dbStatus?: 'success' | 'error';
}

export function getExpertEmailPrompt(productName: string, affiliateLink: string, additionalInfo?: string): string {
  return `[EMAIL EXPERT] Master Email Marketing & Direct Response Copywriter.
Nhiệm vụ: Viết một email marketing để quảng bá sản phẩm "${productName}" nhằm mục đích tối đa hoá tỉ lệ mở (Open Rate) và click-through rate (CTR) vào affiliate link.

CHIẾN THUẬT NỘI DUNG EMAIL (MANDATORY):
1. TIÊU ĐỀ (SUBJECT LINE): Ngắn gọn, gây tò mò, tạo cảm giác cấp bách hoặc mang lại giá trị rõ ràng. Đề xuất 1 tiêu đề tốt nhất.
2. PREVIEW TEXT: Câu text hiển thị ngay sau tiêu đề trong hộp thư, hỗ trợ tiêu đề để tăng tỉ lệ mở.
3. NỘI DUNG (BODY):
   - Hook đầu tiên.
   - Trình bày vấn đề và giải pháp (Sản phẩm).
   - Social proof hoặc USP (Unique Selling Proposition).
   - Call to Action (CTA) rõ ràng, lặp lại ít nhất 2 lần. Link chèn vào CTA: ${affiliateLink}.
4. ĐỊNH DẠNG (HTML): Format nội dung email bằng mã HTML đơn giản (sử dụng <b>, <i>, <p>, <a>, <br>...) để dễ dàng nhúng vào các công cụ gửi email. Dùng màu sắc và style inline nhẹ nhàng nếu cần, nhưng ưu tiên text-based email để tăng deliverability.

Thông tin bổ sung: ${additionalInfo || 'Không có'}

Output JSON schema:
{
  "subject": "Tiêu đề email hấp dẫn...",
  "previewText": "Đoạn preview text...",
  "bodyHtml": "Nội dung email bằng HTML..."
}
Return ONLY JSON.`;
}

export async function generateExpertEmailPost(productName: string, affiliateLink: string, additionalInfo?: string): Promise<ExpertEmailPostResult> {
  const prompt = getExpertEmailPrompt(productName, affiliateLink, additionalInfo);
  const resultText = await callGeminiApi(prompt, { json: true });
  const cleaned = cleanJsonResponse(resultText);
  return { ...JSON.parse(cleaned), prompt };
}
