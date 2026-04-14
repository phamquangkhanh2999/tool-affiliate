import { gemini } from "@/lib/gemini";

// ─── STEP 3: Hook + Script Generator ─────────────────────────
// 5 hooks ≤10 từ + 5 TikTok scripts 30s + video production guide

export interface TikTokHook {
  id: number;
  hook: string;          // ≤10 từ
  style: "question" | "statement" | "challenge" | "reveal" | "number";
  emotionTrigger: string;
}

export interface TikTokScript {
  id: number;
  hookLine: string;
  scenes: {
    second: string;      // "0-5s", "5-15s"...
    action: string;      // cảnh quay
    text: string;        // text overlay
    voice: string;       // thoại/voice
  }[];
  cta: string;
  music: string;         // loại nhạc gợi ý
  videoGuide: string;    // hướng dẫn dựng video ngắn
}

export interface HookScriptResult {
  hooks: TikTokHook[];
  scripts: TikTokScript[];
}

export interface HookScriptInput {
  productName: string;
  price: number;
  discountedPrice: number;
  commissionRate: number;
  category?: string;
}

export async function generateHookScript(
  input: HookScriptInput
): Promise<HookScriptResult> {
  const discount = input.price > 0
    ? Math.round(((input.price - input.discountedPrice) / input.price) * 100) : 0;

  const prompt = `Bạn là TikToker affiliate chuyên nghiệp VN, viral content expert.

Sản phẩm: ${input.productName}
Giá gốc: ${input.price.toLocaleString("vi-VN")}đ → Sale: ${input.discountedPrice.toLocaleString("vi-VN")}đ (-${discount}%)
Hoa hồng: ${input.commissionRate}%
Danh mục: ${input.category || "Chung"}

Tạo nội dung TikTok affiliate:

1. 5 HOOKS (≤10 từ, gây tò mò mạnh, phong cách viral tự nhiên)
2. 5 SCRIPT VIDEO 30 giây (chia cảnh chi tiết, tự nhiên, tập trung bán hàng)

Trả về JSON:
{
  "hooks": [
    {
      "id": 1,
      "hook": "Hook ≤10 từ bằng tiếng Việt",
      "style": "question|statement|challenge|reveal|number",
      "emotionTrigger": "cảm xúc chính: tò mò/shock/FOMO/..."
    }
  ],
  "scripts": [
    {
      "id": 1,
      "hookLine": "Câu hook mở đầu",
      "scenes": [
        { "second": "0-5s", "action": "Cảnh quay cụ thể", "text": "Text overlay hiện trên màn hình", "voice": "Thoại nói" },
        { "second": "5-15s", "action": "Cảnh quay", "text": "Text overlay", "voice": "Thoại" },
        { "second": "15-25s", "action": "Cảnh quay", "text": "Text overlay", "voice": "Thoại" },
        { "second": "25-30s", "action": "CTA cuối", "text": "Text overlay", "voice": "CTA" }
      ],
      "cta": "Call-to-action cuối video",
      "music": "Loại nhạc/vibe gợi ý",
      "videoGuide": "Hướng dẫn 1-2 câu: góc máy, ánh sáng, tip quay nhanh"
    }
  ]
}

Yêu cầu:
- Hooks phải gây tò mò mạnh, khiến người xem dừng scroll ngay
- Scripts tự nhiên như người thật đang review, không quảng cáo lộ liễu
- Mỗi script có phong cách khác nhau: unboxing, POV, duet, reaction, story
- Link affiliate đặt tự nhiên vào bio hoặc CTA
- Chỉ trả về JSON, không giải thích`;

  const result = await gemini.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Gemini không trả về JSON hợp lệ");
  return JSON.parse(jsonMatch[0]) as HookScriptResult;
}

// ─── STEP 4: Caption + Hashtag Generator ─────────────────────

export interface CaptionHashtagResult {
  captions: { id: number; caption: string; style: string }[];
  hashtags: string[];
  viralTips: string[];
}

export async function generateCaptionHashtag(input: {
  productName: string;
  platform: string;
  tone?: string;
  affiliateLink?: string;
}): Promise<CaptionHashtagResult> {
  const prompt = `Bạn là social media expert chuyên TikTok affiliate VN.

Sản phẩm: ${input.productName}
Nền tảng: ${input.platform}
Tone: ${input.tone || "viral, tự nhiên"}

Tạo:
1. 3 caption ngắn (gây tò mò, có CTA, phù hợp ${input.platform})
2. 15 hashtag trending liên quan (mix: viral, niche, product, vi)

Trả về JSON:
{
  "captions": [
    { "id": 1, "caption": "Caption đầy đủ với CTA${input.affiliateLink ? ' và link: ' + input.affiliateLink : ''}", "style": "curiosity|urgency|story" }
  ],
  "hashtags": ["hashtag1", "hashtag2", ...],
  "viralTips": ["tip 1 để caption viral hơn", "tip 2"]
}

- Caption ngắn ≤150 ký tự, emoji phù hợp, CTA rõ ràng
- Hashtag không có dấu #, trả về text thuần
- Chỉ trả về JSON`;

  const result = await gemini.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Gemini không trả về JSON hợp lệ");
  return JSON.parse(jsonMatch[0]) as CaptionHashtagResult;
}

// ─── STEP 5: 7-Day Content Plan ──────────────────────────────

export interface DayPlan {
  day: number;
  dayLabel: string;  // "Ngày 1 - Thứ Hai"
  videos: {
    slot: 1 | 2;
    time: string;    // "9:00 AM" 
    type: "shock" | "curiosity" | "problem_solution" | "review" | "unboxing" | "story";
    hook: string;
    idea: string;
    goal: string;    // "Test hook" | "Build trust" | "Drive conversion"
    platform: string[];
  }[];
  dailyGoal: string;
  tip: string;
}

export interface ContentPlanResult {
  summary: string;
  strategy: string;
  days: DayPlan[];
  weekGoals: string[];
}

export async function generateContentPlan(input: {
  productName: string;
  price: number;
  discountedPrice: number;
  commissionRate: number;
  category?: string;
  startDate?: string;
}): Promise<ContentPlanResult> {
  const discount = input.price > 0
    ? Math.round(((input.price - input.discountedPrice) / input.price) * 100) : 0;

  const prompt = `Bạn là content strategist affiliate TikTok/Facebook VN chuyên nghiệp.

Sản phẩm: ${input.productName}
Giá: ${input.price.toLocaleString("vi-VN")}đ → Sale: ${input.discountedPrice.toLocaleString("vi-VN")}đ (-${discount}%)
Hoa hồng: ${input.commissionRate}%
Danh mục: ${input.category || "Chung"}

Tạo kế hoạch đăng content 7 NGÀY (2 video/ngày = 14 video tổng):

Mục tiêu:
- Test nhiều angle khác nhau
- Tìm video viral
- Tăng chuyển đổi dần mỗi ngày
- Scale nội dung thành công

Trả về JSON:
{
  "summary": "Tóm tắt chiến lược 7 ngày",
  "strategy": "Logic: ngày 1-3 test, ngày 4-5 double down, ngày 6-7 scale",
  "days": [
    {
      "day": 1,
      "dayLabel": "Ngày 1 — Thứ Hai",
      "videos": [
        {
          "slot": 1,
          "time": "9:00 AM",
          "type": "shock|curiosity|problem_solution|review|unboxing|story",
          "hook": "Hook cụ thể cho video này",
          "idea": "Mô tả ý tưởng video 2-3 câu",
          "goal": "Test hook|Build awareness|Drive conversion|Viral push",
          "platform": ["tiktok", "facebook"]
        },
        {
          "slot": 2,
          "time": "7:00 PM",
          "type": "...",
          "hook": "...",
          "idea": "...",
          "goal": "...",
          "platform": ["tiktok"]
        }
      ],
      "dailyGoal": "Mục tiêu ngày hôm đó",
      "tip": "Tip thực tế để thực hiện tốt ngày này"
    }
  ],
  "weekGoals": ["Mục tiêu tuần 1", "Mục tiêu tuần 2", "KPI cần đạt"]
}

Yêu cầu:
- 7 ngày đầy đủ, 2 video/ngày
- Ngày 1-2: Test nhiều angle (shock, curiosity, review)
- Ngày 3-4: Double down angle có nhiều view nhất
- Ngày 5-6: Thêm problem-solution và story
- Ngày 7: Conversion push mạnh nhất
- Giờ đăng thực tế theo giờ vàng VN
- Chỉ trả về JSON`;

  const result = await gemini.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Gemini không trả về JSON hợp lệ");
  return JSON.parse(jsonMatch[0]) as ContentPlanResult;
}

// ─── STEP 6+7: Performance Analysis + Optimization ───────────

export interface VideoMetric {
  title: string;
  type: string;
  hook: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  conversions: number;
}

export interface PerformanceAnalysis {
  overview: string;
  diagnosis: {
    primary: string;   // Vấn đề chính
    issues: string[];  // Điểm yếu
  };
  improvements: string[];
  rewrittenScript: string;
  patterns: {
    viral: string[];   // Pattern video làm tốt
    weak: string[];    // Pattern video kém
  };
  nextActions: {
    hook: string;
    format: string;
    cta: string;
  };
  conversionForecast: string;
}

export async function analyzePerformance(
  metrics: VideoMetric[]
): Promise<PerformanceAnalysis> {
  const metricsText = metrics.map((m, i) =>
    `Video ${i + 1}: "${m.title}"
Type: ${m.type} | Hook: "${m.hook}"
Views: ${m.views.toLocaleString()} | Likes: ${m.likes} | Comments: ${m.comments} | Shares: ${m.shares}
Clicks: ${m.clicks} | Conversions: ${m.conversions}
CTR: ${m.views > 0 ? ((m.clicks / m.views) * 100).toFixed(2) : 0}% | CR: ${m.clicks > 0 ? ((m.conversions / m.clicks) * 100).toFixed(2) : 0}%`
  ).join("\n\n");

  const prompt = `Bạn là Growth Hacker và Data Analyst chuyên TikTok affiliate VN.

Phân tích dữ liệu ${metrics.length} video sau:

${metricsText}

Nhiệm vụ:
1. DIAGNOSIS: Vì sao video không ra đơn? Điểm yếu cụ thể (hook, nội dung, CTA)?
2. PATTERNS: Tìm pattern video làm tốt vs kém (STEP 7 - Optimization Engine)
3. IMPROVEMENTS: Cách cải thiện cụ thể
4. REWRITE: Viết lại script tốt nhất dựa trên dữ liệu
5. NEXT ACTIONS: Hook mới, format mới, CTA mới

Trả về JSON:
{
  "overview": "Tổng quan hiệu suất 1-2 câu",
  "diagnosis": {
    "primary": "Vấn đề chính khiến không ra đơn",
    "issues": ["Điểm yếu 1", "Điểm yếu 2", "Điểm yếu 3"]
  },
  "improvements": ["Cải thiện cụ thể 1", "2", "3", "4"],
  "rewrittenScript": "Script viết lại hoàn chỉnh 30s dựa trên data tốt nhất",
  "patterns": {
    "viral": ["Pattern của video làm tốt 1", "2"],
    "weak": ["Pattern của video kém 1", "2"]
  },
  "nextActions": {
    "hook": "Hook mới cần thử dựa trên data",
    "format": "Format/style video mới đề xuất",
    "cta": "CTA mới hiệu quả hơn"
  },
  "conversionForecast": "Dự đoán nếu áp dụng cải tiến: X% tăng conversion"
}

Phân tích dựa trên số liệu thực, không chung chung. Chỉ trả về JSON.`;

  const result = await gemini.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Gemini không trả về JSON hợp lệ");
  return JSON.parse(jsonMatch[0]) as PerformanceAnalysis;
}
