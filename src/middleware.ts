import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── In-Memory Rate Limiter ────────────────────────────────────────────────
// Key: `${ip}:${window}`, Value: { count, resetAt }
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Cleanup expired entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) rateLimitStore.delete(key);
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  limit: number;       // max requests
  windowMs: number;    // time window in ms
}

const RATE_LIMIT_RULES: Record<string, RateLimitConfig> = {
  // Auth routes — strict (brute-force protection)
  '/api/auth': { limit: 10, windowMs: 15 * 60 * 1000 },  // 10/15min
  // AI generation — expensive, limit tightly
  '/api/content': { limit: 30, windowMs: 60 * 1000 },     // 30/min
  '/api/affiliate': { limit: 30, windowMs: 60 * 1000 },   // 30/min
  // General API — more permissive
  '/api': { limit: 60, windowMs: 60 * 1000 },              // 60/min
};

function getRateLimitConfig(pathname: string): RateLimitConfig {
  // Match most specific route first
  const sortedKeys = Object.keys(RATE_LIMIT_RULES).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (pathname.startsWith(key)) return RATE_LIMIT_RULES[key];
  }
  return { limit: 100, windowMs: 60 * 1000 };
}

function getClientIP(request: NextRequest): string {
  // Support common proxy headers (Vercel, Cloudflare, nginx)
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1'
  );
}

function rateLimit(ip: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = `${ip}:${Math.floor(now / config.windowMs)}`;

  const record = rateLimitStore.get(key);

  if (!record || record.resetAt < now) {
    // New window
    const resetAt = now + config.windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.limit - 1, resetAt };
  }

  if (record.count >= config.limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, remaining: config.limit - record.count, resetAt: record.resetAt };
}

// ─── Middleware Entry ──────────────────────────────────────────────────────
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply rate limiting to API routes
  if (!pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Skip rate limiting for internal Next.js routes
  if (pathname.startsWith('/api/_next')) {
    return NextResponse.next();
  }

  const ip = getClientIP(request);
  const config = getRateLimitConfig(pathname);
  const result = rateLimit(ip, config);

  const response = result.allowed
    ? NextResponse.next()
    : NextResponse.json(
        {
          success: false,
          error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
          retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
        },
        { status: 429 }
      );

  // Add rate limit headers to all API responses
  response.headers.set('X-RateLimit-Limit', config.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(result.resetAt).toISOString());

  if (!result.allowed) {
    response.headers.set(
      'Retry-After',
      Math.ceil((result.resetAt - Date.now()) / 1000).toString()
    );
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
