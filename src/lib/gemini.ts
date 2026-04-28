import fs from 'fs';
import path from 'path';
import { getAppSettings } from './settings';

export interface ExpertFacebookPostResult {
  hooks: string[];
  shortVersion: string;
  longVersion: string;
  imagePrompt?: string;
  videoPrompt?: string;
  videoScript?: string;
  commentSeedings: string[];
  prompt?: string;
  dbStatus?: 'success' | 'error';
}

// ─── Secure Structured Logger ─────────────────────────────────────────────
const LOG_FILE = path.join(process.cwd(), 'debug_api.log');
const MAX_LOG_SIZE_BYTES = 2 * 1024 * 1024; // 2MB auto-rotate

/** Mask sensitive values — never log API keys or secrets */
function maskSensitive(obj: unknown): unknown {
  if (typeof obj === 'string') {
    // Mask anything that looks like an API key (long alphanumeric strings)
    return obj.replace(/([A-Za-z0-9_-]{20,})/g, (match) =>
      match.length > 8 ? `${match.slice(0, 4)}****${match.slice(-4)}` : match
    );
  }
  if (Array.isArray(obj)) return obj.map(maskSensitive);
  if (obj && typeof obj === 'object') {
    const masked: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      const lk = k.toLowerCase();
      // Redact known sensitive field names entirely
      if (
        lk.includes('key') || lk.includes('secret') || lk.includes('token') ||
        lk.includes('password') || lk.includes('auth') || lk.includes('api')
      ) {
        masked[k] = '[REDACTED]';
      } else {
        masked[k] = maskSensitive(v);
      }
    }
    return masked;
  }
  return obj;
}

function rotateLogs() {
  try {
    if (fs.existsSync(LOG_FILE) && fs.statSync(LOG_FILE).size > MAX_LOG_SIZE_BYTES) {
      const archived = LOG_FILE.replace('.log', `.${Date.now()}.bak.log`);
      fs.renameSync(LOG_FILE, archived);
    }
  } catch { /* ignore rotation errors */ }
}

function logToFile(type: 'REQUEST' | 'RESPONSE' | 'ERROR', data: unknown) {
  try {
    rotateLogs();
    const timestamp = new Date().toISOString();
    // Only log safe, non-sensitive summary fields
    const safeData = maskSensitive(data);
    const content = `\n[${timestamp}] [${type}]\n${JSON.stringify(safeData, null, 2)}\n${'-'.repeat(50)}\n`;
    fs.appendFileSync(LOG_FILE, content);
  } catch { /* logging must never crash the app */ }
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

export function cleanJsonResponse(text: string) {
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
8. PROMPT TẠO ẢNH (IMAGE PROMPT): Cung cấp 1 câu lệnh tiếng Anh cực kỳ chi tiết để tạo ảnh dọc (9:16) dùng cho Midjourney/Imagen. Cấu trúc chuẩn: [Chủ đề/Nhân vật chi tiết] + [Hành động] + [Bối cảnh xung quanh] + [Ánh sáng/Phong cách điện ảnh] + --ar 9:16. (Ví dụ: "A photorealistic portrait of an elegant Vietnamese woman wearing an apron, using the product in a modern, bright kitchen, smiling, cinematic lighting, 8k, --ar 9:16")
9. PROMPT TẠO VIDEO (GOOGLE LABS VEO/GEN-3): Cung cấp 1 câu lệnh tiếng Anh để tạo chuyển động từ bức ảnh trên. Cấu trúc chuẩn: [Chuyển động của camera/nhân vật] + [Môi trường/Ánh sáng/Hiệu ứng] + [Chất lượng]. (Ví dụ: "A cinematic shot of a Vietnamese woman in an apron, smoothly stirring a pot, steam rising beautifully, natural lighting, smooth motion, photorealistic")
10. KỊCH BẢN VIDEO (VIDEO SCRIPT): Soạn kịch bản Video Reels cực kỳ chi tiết theo từng giây (tổng 15-30s). Phải chia rõ: [Thời gian cụ thể] - [Mô tả hình ảnh/chuyển động trên màn hình] - [Lời thoại/Voice-over].
11. COMMENT SEEDING: Tạo 3-5 bình luận ngắn kèm link affiliate ${affiliateLink}.

Output JSON schema:
{
  "hooks": ["3 câu mở đầu gây tò mò nhất"],
  "shortVersion": "Bản ngắn: Bao gồm nội dung + Hashtags",
  "longVersion": "Bản dài: Bao gồm nội dung + Hashtags",
  "imagePrompt": "English prompt for Text-to-Image AI...",
  "videoPrompt": "English prompt for Text-to-Video AI (e.g. Veo, Gen-3)...",
  "videoScript": "Kịch bản quay Video Reels/TikTok bằng tiếng Việt (Cảnh 1: ... Lời thoại: ...)",
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
