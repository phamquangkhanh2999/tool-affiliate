/**
 * Centralized Input Validators (Zod)
 * Dùng cho tất cả API routes để đảm bảo data integrity và ngăn injection.
 */
import { z } from 'zod';

// ─── Common Primitives ─────────────────────────────────────────────────────

/** Sanitize text — strip HTML tags và script injection */
const safeText = (maxLen = 2000, minLen = 0, customMessage?: string) =>
  z
    .string()
    .trim()
    .min(minLen, customMessage || `Tối thiểu ${minLen} ký tự`)
    .max(maxLen, `Tối đa ${maxLen} ký tự`)
    .transform((v) => v.replace(/<[^>]*>/g, '').replace(/javascript:/gi, ''));

const affiliateUrl = z
  .string()
  .trim()
  .url('URL không hợp lệ')
  .refine(
    (url) => {
      try {
        const u = new URL(url);
        // Only allow known affiliate domains
        const allowed = ['shopee.vn', 'lazada.vn', 'tiki.vn', 'sendo.vn', 'shope.ee'];
        return allowed.some((d) => u.hostname.endsWith(d));
      } catch {
        return false;
      }
    },
    { message: 'Chỉ hỗ trợ link Shopee, Lazada, Tiki, Sendo' }
  );

// ─── Content Generation ───────────────────────────────────────────────────

export const GenerateContentSchema = z.object({
  productName: safeText(200, 2, 'Tên sản phẩm phải có ít nhất 2 ký tự'),
  affiliateLink: z.string().url('Link affiliate không hợp lệ').optional().or(z.literal('')),
  platform: z.enum(['facebook', 'tiktok', 'youtube', 'instagram', 'zalo']).default('facebook'),
  tone: z.enum(['engaging', 'professional', 'funny', 'urgency', 'emotional']).default('engaging'),
  additionalInfo: safeText(500).optional(),
});

export const BulkGenerateSchema = z.object({
  products: z
    .array(
      z.object({
        name: safeText(200),
        link: z.string().url().optional(),
      })
    )
    .min(1, 'Cần ít nhất 1 sản phẩm')
    .max(20, 'Tối đa 20 sản phẩm mỗi lần'),
  platform: z.enum(['facebook', 'tiktok', 'youtube']).default('facebook'),
  tone: z.enum(['engaging', 'professional', 'funny', 'urgency']).default('engaging'),
});

// ─── Affiliate Links ──────────────────────────────────────────────────────

export const CreateLinkSchema = z.object({
  originalUrl: affiliateUrl,
  productId: z.string().cuid('ID sản phẩm không hợp lệ').optional(),
  platform: z.enum(['shopee', 'lazada', 'tiki']).default('shopee'),
  customCode: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Chỉ dùng chữ thường, số, và dấu gạch ngang')
    .min(3)
    .max(50)
    .optional(),
});

export const TrackClickSchema = z.object({
  code: z.string().min(1).max(100),
});

// ─── UTM Builder ──────────────────────────────────────────────────────────

export const UTMSchema = z.object({
  url: z.string().url('URL cơ sở không hợp lệ').trim(),
  source: safeText(100, 1, 'utm_source là bắt buộc'),
  medium: safeText(100, 1, 'utm_medium là bắt buộc'),
  campaign: safeText(100, 1, 'utm_campaign là bắt buộc'),
  term: safeText(100).optional(),
  content: safeText(100).optional(),
});

// ─── Scraper ─────────────────────────────────────────────────────────────

export const ScrapeSchema = z.object({
  url: z
    .string()
    .url()
    .trim()
    .refine((url) => {
      try {
        const u = new URL(url);
        return ['shopee.vn', 'lazada.vn', 'tiki.vn'].some((d) => u.hostname.endsWith(d));
      } catch {
        return false;
      }
    }, 'Chỉ hỗ trợ scrape từ Shopee, Lazada, Tiki'),
});

// ─── Settings ─────────────────────────────────────────────────────────────

export const UpdateSettingsSchema = z.object({
  geminiModel: z
    .string()
    .regex(/^gemini-[\w.-]+$/, 'Model name không hợp lệ')
    .optional(),
});

// ─── Facebook / Social ────────────────────────────────────────────────────

export const FacebookPostSchema = z.object({
  pageId: z.string().min(1),
  content: safeText(63206), // FB max post length
  imageUrls: z.array(z.string().url()).max(10).optional(),
  scheduledAt: z.string().datetime().optional(),
});

// ─── Schedule ─────────────────────────────────────────────────────────────

export const CreateScheduleSchema = z.object({
  platform: z.enum(['facebook', 'tiktok', 'zalo']),
  content: safeText(10000),
  scheduledAt: z.string().datetime('Thời gian không hợp lệ'),
  campaignId: z.string().cuid().optional(),
  imageUrls: z.array(z.string().url()).max(10).optional(),
});

// ─── Helper ───────────────────────────────────────────────────────────────

/** Parse and validate request body. Returns { data } or throws 400 error. */
export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError('Request body phải là JSON hợp lệ');
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    const messages = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
    throw new ValidationError(messages.join('; '));
  }
  return result.data;
}

export class ValidationError extends Error {
  readonly statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
