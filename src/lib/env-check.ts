import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL').optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().optional(),
  SHOPEE_APP_ID: z.string().optional(),
  SHOPEE_SECRET_KEY: z.string().optional(),
});

export function validateEnv() {
  if (process.env.SKIP_ENV_VALIDATION === '1') {
    return;
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Lỗi cấu hình môi trường (.env):');
    parsed.error.issues.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    
    // Chỉ crash trong môi trường build hoặc production nếu thiếu biến bắt buộc
    if (process.env.NODE_ENV === 'production' || process.env.npm_lifecycle_event === 'build') {
      process.exit(1);
    }
  }
}
