/**
 * In-memory Cache Helper
 * Dùng để cache các request bên ngoài (Shopee, Gemini) nhằm giảm cost và tăng tốc độ phản hồi.
 * Trong production scale lớn, có thể thay bằng Redis.
 */

interface CacheEntry<T> {
  value: T;
  expiry: number;
}

class InMemoryCache {
  private cache = new Map<string, CacheEntry<any>>();

  /**
   * Set a value in the cache with a Time-To-Live (TTL)
   * @param key Cache key
   * @param value Value to store
   * @param ttlSeconds Time to live in seconds
   */
  set<T>(key: string, value: T, ttlSeconds: number): void {
    const expiry = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiry });
  }

  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns The value if it exists and hasn't expired, otherwise null
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Delete a value from the cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all expired entries (can be called periodically)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Wrapper to automatically cache an async function's result
   */
  async fetchOrCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;

    const result = await fetchFn();
    this.set(key, result, ttlSeconds);
    return result;
  }
}

// Global instance to persist across API route reloads in dev mode
const globalForCache = global as unknown as { cacheInstance: InMemoryCache };
export const cache = globalForCache.cacheInstance || new InMemoryCache();

if (process.env.NODE_ENV !== 'production') {
  globalForCache.cacheInstance = cache;
}

// Cleanup interval (every 10 mins)
setInterval(() => cache.cleanup(), 10 * 60 * 1000);
