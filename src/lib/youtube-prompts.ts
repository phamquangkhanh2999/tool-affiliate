export interface YouTubeExpertResult {
  titles: string[];
  thumbnailTexts: string[];
  script: {
    hook: string;
    body: string;
    cta: string;
  };
  description: string;
  tags: string[];
  pinnedComment: string;
  communityPost: string;
  imagePrompt?: string;
  videoPrompt?: string;
  prompt?: string;
  dbStatus?: 'success' | 'error';
}

/**
 * Tạo Prompt chuyên gia YouTube Affiliate
 */
export function getYouTubeExpertPrompt(
  productName: string,
  affiliateLink: string,
  additionalInfo?: string
): string {
  return `[YOUTUBE EXPERT] Master YouTube SEO & Affiliate Content Creator VN.
Nhiệm vụ: Tạo nội dung YouTube chuyên nghiệp cho sản phẩm "${productName}" để tối ưu CTR, watch time và affiliate conversions.

THÔNG TIN BỔ SUNG: ${additionalInfo || 'Không có'}
LINK AFFILIATE: ${affiliateLink}

CHIẾN THUẬT NỘI DUNG YOUTUBE (MANDATORY):
1. TITLE SEO: Viết 3-5 tiêu đề tối ưu CTR (click-through rate). Dùng số, Power words, và tạo tò mò. Dưới 60 ký tự.
2. THUMBNAIL TEXT: Gợi ý 2-3 dòng text ngắn gọn cho thumbnail (max 5-6 từ/dòng).
3. SCRIPT VIDEO:
   - HOOK (30 giây đầu): Phải giữ chân viewer ngay lập tức.
   - BODY: Nội dung chính theo format Problem → Solution → Demo → Benefits.
   - CTA: Kêu gọi click link affiliate trong description + subscribe.
4. DESCRIPTION SEO: Bao gồm:
   - 2-3 dòng tóm tắt hấp dẫn
   - Link affiliate ở vị trí nổi bật nhất (trước "Show More")
   - Timestamps (00:00 format)
   - Hashtags
   - Keywords tự nhiên
5. TAGS: 15-20 tags liên quan, mix giữa broad + specific keywords.
6. PINNED COMMENT: Comment ghim ở đầu kèm link affiliate và câu kêu gọi.
7. COMMUNITY POST: Bài đăng Community tab để promote video.
8. PROMPT TẠO ẢNH (IMAGE PROMPT): Cung cấp 1 câu lệnh tiếng Anh cực kỳ chi tiết để tạo ảnh Thumbnail (16:9).
9. PROMPT TẠO VIDEO (VIDEO PROMPT): Cung cấp 1 câu lệnh tiếng Anh để tạo chuyển động Video intro (16:9).

Output JSON schema:
{
  "titles": ["3-5 tiêu đề tối ưu CTR"],
  "thumbnailTexts": ["2-3 dòng text cho thumbnail"],
  "script": {
    "hook": "30 giây đầu giữ chân viewer",
    "body": "Nội dung chính (Problem → Solution → Demo → Benefits)",
    "cta": "Kêu gọi hành động cuối video"
  },
  "description": "Mô tả SEO đầy đủ với link, timestamps, hashtags",
  "tags": ["15-20 tags tối ưu SEO"],
  "pinnedComment": "Comment ghim kèm link affiliate ${affiliateLink}",
  "communityPost": "Bài đăng Community tab",
  "imagePrompt": "Detailed English prompt for AI Thumbnail Image (16:9)",
  "videoPrompt": "Detailed English prompt for AI Video generation (16:9)"
}
Return ONLY valid JSON.`;
}
