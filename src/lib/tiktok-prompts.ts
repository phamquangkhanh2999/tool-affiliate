export interface TikTokExpertResult {
  hooks: string[];
  script15s: string;
  script30s: string;
  script60s: string;
  caption: string;
  trendingSounds: string[];
  commentSeedings: string[];
  cta: string;
  prompt?: string;
  dbStatus?: 'success' | 'error';
}

/**
 * Tạo Prompt chuyên gia TikTok Affiliate
 */
export function getTikTokExpertPrompt(
  productName: string,
  affiliateLink: string,
  additionalInfo?: string
): string {
  return `[TIKTOK EXPERT] Master TikTok Affiliate & Viral Content Creator VN.
Nhiệm vụ: Tạo nội dung TikTok viral cho sản phẩm "${productName}" để tối ưu lượt xem, tương tác và chốt đơn qua link bio.

THÔNG TIN BỔ SUNG: ${additionalInfo || 'Không có'}
LINK AFFILIATE: ${affiliateLink}

CHIẾN THUẬT NỘI DUNG TIKTOK (MANDATORY):
1. HOOK 3 GIÂY ĐẦU: Dòng/hình ảnh đầu tiên phải giữ chân ngay lập tức. Sử dụng yếu tố bất ngờ, tò mò, hoặc trending.
2. KỊCH BẢN NGẮN GỌN: Viết dạng bullet points, mỗi shot 2-3 giây. Không viết dài dòng.
3. STORYTELLING: Kể câu chuyện cá nhân, before/after, phát hiện sản phẩm hay.
4. TRENDING FORMAT: Sử dụng các format đang viral (POV, Day in my life, Things I wish I knew, etc.)
5. CTA CHO BIO LINK: Hướng người xem vào bio vì TikTok không cho link trong caption.
6. HASHTAG STRATEGY: Kết hợp hashtag lớn (#fyp #viral #tiktokmademebuyit) + hashtag niche.
7. COMMENT SEEDING: Tạo 3-5 bình luận kích tương tác (dạng hỏi đáp, review ngắn).

Output JSON schema:
{
  "hooks": ["3 câu hook mở đầu video khác nhau, mỗi câu dưới 10 từ"],
  "script15s": "Kịch bản video 15 giây, format: [Shot 1] ... [Shot 2] ... [Shot 3] ...",
  "script30s": "Kịch bản video 30 giây, chi tiết hơn với transitions",
  "script60s": "Kịch bản video 60 giây, full storytelling arc",
  "caption": "Caption cho video kèm hashtags (tối đa 150 ký tự caption + hashtags)",
  "trendingSounds": ["3-5 gợi ý bài nhạc/sound trending phù hợp"],
  "commentSeedings": ["3-5 bình luận seeding kích tương tác, có thể nhắc link bio"],
  "cta": "Câu CTA cuối video hướng tới bio link"
}
Return ONLY valid JSON.`;
}
