import fs from 'fs';
import path from 'path';
import { getAppSettings } from './settings';

export interface ExpertFacebookPostResult {
  hooks: string[];
  shortVersion: string;
  longVersion: string;
  variants: {
    short: string;
    long: string;
  }[];
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
  // First, remove markdown code blocks
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  
  // Find the first '{' and last '}' to extract only the JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  return cleaned;
}

/**
 * Tạo Prompt chuyên gia Facebook
 */
export function getExpertFacebookPrompt(productName: string, affiliateLink: string, additionalInfo?: string): string {
  return `[FB EXPERT] Master Copywriter VN.
Nhiệm vụ: Viết bài đăng Facebook cho "${productName}". Link: ${affiliateLink}. ${additionalInfo ? 'Info: ' + additionalInfo : ''}

YÊU CẦU:
1. Hook cực cháy, đánh vào nỗi đau, giải pháp & lợi ích.
2. Văn phong "người thật", dễ đọc, CTA mạnh.
3. Tạo 3 BIẾN THỂ khác nhau hoàn toàn để tránh spam.
4. Kèm kịch bản video Reels (15-30s), prompt ảnh/video AI tiếng Anh.
5. COMMENT SEEDING: Tạo 3-5 bình luận mồi (seeding) tự nhiên. Bình luận cuối cùng BẮT BUỘC phải dán nguyên văn link: ${affiliateLink}.

Output JSON:
{
  "hooks": ["3 câu mở đầu"],
  "shortVersion": "Bản ngắn mặc định",
  "longVersion": "Bản dài mặc định",
  "variants": [
    { "short": "Biến thể ngắn 1", "long": "Biến thể dài 1" },
    { "short": "Biến thể ngắn 2", "long": "Biến thể dài 2" },
    { "short": "Biến thể ngắn 3", "long": "Biến thể dài 3" }
  ],
  "imagePrompt": "English Image Prompt...",
  "videoPrompt": "English Video Prompt...",
  "videoScript": "Kịch bản Video tiếng Việt...",
  "commentSeedings": [
    "Bình luận 1: Hỏi về giá/chất lượng",
    "Bình luận 2: Review đã nhận hàng rất ưng",
    "Bình luận 3: Mọi người mua ở đây nhé: ${affiliateLink}"
  ]
}
Return ONLY JSON. No preamble.`;
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
