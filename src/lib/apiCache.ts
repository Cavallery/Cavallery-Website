// ============================================================
// CAVALLERY IN-MEMORY API CACHE & CONCURRENCY GUARD
// Prevents 504 Bad Gateway from external API timeouts and traffic spikes
// ============================================================

export const API_CACHE_HEADERS: Record<string, string> = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
};

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  timestamp: number;
}

// Global in-memory cache map
const memoryCache = new Map<string, CacheEntry<any>>();

// Global in-flight promise map for request coalescing (prevents thundering herd)
const inFlightRequests = new Map<string, Promise<any>>();

// Minimum throttle interval between requests to the same external group (ms)
const lastRequestTime = new Map<string, number>();
const MIN_REQUEST_INTERVAL_MS = 200;

/**
 * Executes an external fetch with in-memory caching, in-flight coalescing, and stale-while-error fallback.
 */
export async function fetchWithCacheAndFallback<T>({
  key,
  ttlSeconds = 60,
  fetcher,
  fallbackData,
}: {
  key: string;
  ttlSeconds?: number;
  fetcher: () => Promise<T>;
  fallbackData?: T;
}): Promise<T> {
  const now = Date.now();
  const cached = memoryCache.get(key);

  // 1. If we have fresh cached data, return it immediately
  if (cached && cached.expiresAt > now) {
    return cached.data as T;
  }

  // 2. If a request for this exact key is already in flight, reuse that existing Promise
  if (inFlightRequests.has(key)) {
    try {
      return (await inFlightRequests.get(key)) as T;
    } catch {
      if (cached) return cached.data as T;
      if (fallbackData !== undefined) return fallbackData;
    }
  }

  // 3. Initiate the request with deduplication
  const fetchPromise = (async () => {
    try {
      const lastTime = lastRequestTime.get(key) || 0;
      const elapsed = Date.now() - lastTime;
      if (elapsed < MIN_REQUEST_INTERVAL_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - elapsed));
      }
      lastRequestTime.set(key, Date.now());

      const data = await fetcher();

      if (data !== undefined && data !== null) {
        // If data is array and empty, don't overwrite non-empty stale cache
        if (Array.isArray(data) && data.length === 0 && cached && Array.isArray(cached.data) && cached.data.length > 0) {
          return cached.data as T;
        }

        memoryCache.set(key, {
          data,
          expiresAt: Date.now() + ttlSeconds * 1000,
          timestamp: Date.now(),
        });
      }
      return data;
    } catch (err: any) {
      console.warn(`[API Cache] Fetch failed for "${key}":`, err?.message || err);
      // Fallback: If network failed or timed out, return stale cache if available!
      if (cached) {
        console.log(`[API Cache] Returning STALE cache for "${key}"`);
        return cached.data as T;
      }
      if (fallbackData !== undefined) {
        return fallbackData;
      }
      throw err;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, fetchPromise);
  return fetchPromise;
}

/**
 * Manually set or update cache entry
 */
export function setApiCache<T>(key: string, data: T, ttlSeconds = 60): void {
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
    timestamp: Date.now(),
  });
}

/**
 * Read cache entry directly (fresh or stale)
 */
export function getApiCache<T>(key: string): T | null {
  const cached = memoryCache.get(key);
  return cached ? (cached.data as T) : null;
}
