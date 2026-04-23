import fs from 'fs';
import path from 'path';
import { getAppSettings } from './settings';

export interface ExpertFacebookPostResult {
  hooks: string[];
  shortVersion: string;
  longVersion: string;
  commentSeedings: string[];
  prompt?: string;
  dbStatus?: 'success' | 'error';
}

/**
 * Ghi log vào file debug_api.log
 */
function logToFile(type: 'REQUEST' | 'RESPONSE' | 'ERROR', data: any) {
  const logPath = path.join(process.cwd(), 'debug_api.log');
  const timestamp = new Date().toLocaleString('vi-VN');
  const content = `\n[${timestamp}] [${type}]\n${JSON.stringify(data, null, 2)}\n${'-'.repeat(50)}\n`;

  try {
    fs.appendFileSync(logPath, content);
  } catch (err) {}
}

/**
 * Hàm gọi API Gemini gốc (Direct Fetch) - Đã tích hợp LOG & RETRY
 */
export async function callGeminiApi(prompt: string, options: { json?: boolean } = {}) {
  const settings = await getAppSettings();
  const apiKey = settings.geminiApiKey;
  const model = settings.geminiModel || 'gemini-1.5-flash';
  
  const maxRetries = 1;
  let attempt = 0;
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  while (attempt <= maxRetries) {
    try {
      if (!apiKey) throw new Error('Cấu hình API Key bị thiếu.');
      const cleanModelName = model.includes('/') ? model.split('/').pop() : model;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModelName}:generateContent?key=${apiKey}`;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: options.json ? { responseMimeType: "application/json" } : undefined
      };

      logToFile('REQUEST', { attempt: attempt + 1, model: cleanModelName, payload });

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || `Lỗi API (${response.status})`);

      const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!resultText) throw new Error('AI không trả về nội dung.');

      logToFile('RESPONSE', { status: response.status, data });
      return resultText;
    } catch (err: any) {
      attempt++;
      logToFile('ERROR', { attempt, message: err.message, willRetry: attempt <= maxRetries });
      if (attempt <= maxRetries) {
        await delay(3000);
        continue;
      }
      throw err;
    }
  }
  throw new Error('Lỗi không xác định sau khi thử lại.');
}

function cleanJsonResponse(text: string) {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
}

/**
 * Tạo Prompt chuyên gia Facebook
 */
export function getExpertFacebookPrompt(productName: string, affiliateLink: string, additionalInfo?: string): string {
  return `[FB EXPERT] Master Affiliate & Social Media Copywriter VN.
Nhiệm vụ: Viết bài đăng Facebook chuyên gia cho sản phẩm "${productName}" để tối ưu tỉ lệ click và chốt đơn.

CHIẾN THUẬT NỘI DUNG (MANDATORY):
1. HOOK MẠNH: Dòng đầu tiên phải cực cháy.
2. ĐÁNH VÀO NỖI ĐAU (PAIN POINTS).
3. GIẢI PHÁP & LỢI ÍCH (NOT FEATURES).
4. VĂN PHONG "NGƯỜI THẬT": Dùng từ ngữ đời thường, tránh robot.
5. CẤU TRÚC DỄ ĐỌC.
6. CTA THÔI THÚC: Kèm link affiliate ${affiliateLink}.
7. HASHTAGS: 5-10 trending.
8. COMMENT SEEDING: Tạo 3-5 bình luận ngắn kèm link affiliate ${affiliateLink}.

Output JSON schema:
{
  "hooks": ["3 câu mở đầu gây tò mò nhất"],
  "shortVersion": "Bản ngắn: Bao gồm nội dung + Hashtags",
  "longVersion": "Bản dài: Bao gồm nội dung + Hashtags",
  "commentSeedings": ["Bình luận 1 kèm link", "Bình luận 2...", "Bình luận 3..."]
}
Return ONLY JSON.`;
}

/**
 * Chức năng chính: Tạo bài đăng chuyên gia Facebook
 */
export async function generateExpertFacebookPost(productName: string, affiliateLink: string, additionalInfo?: string): Promise<ExpertFacebookPostResult> {
  const prompt = getExpertFacebookPrompt(productName, affiliateLink, additionalInfo);
  const resultText = await callGeminiApi(prompt, { json: true });
  const cleaned = cleanJsonResponse(resultText);
  return { ...JSON.parse(cleaned), prompt };
}
