import { serverSupabase } from '@/lib/serverSupabaseClient';

interface CacheEntry<T> {
  data: T;
  expires: number;
  etag: string;
  lastModified: string;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  staleWhileRevalidate?: number; // Time to serve stale data while revalidating
  tags?: string[]; // Cache tags for invalidation
}

class CacheService {
  protected memoryCache = new Map<string, CacheEntry<any>>();
  protected readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  protected readonly DEFAULT_STALE_WHILE_REVALIDATE = 60 * 1000; // 1 minute

  // Generate cache key from request parameters
  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${prefix}:${sortedParams}`;
  }

  // Get cached data
  async get<T>(key: string): Promise<T | null> {
    const entry = this.memoryCache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    
    // Check if cache is expired
    if (now > entry.expires) {
      // Remove expired entry
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Set cached data
  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const ttl = options.ttl || this.DEFAULT_TTL;
    const etag = this.generateETag(data);
    const lastModified = new Date().toISOString();

    this.memoryCache.set(key, {
      data,
      expires: Date.now() + ttl,
      etag,
      lastModified
    });
  }

  // Invalidate cache by key or tags
  async invalidate(keyOrTags: string | string[]): Promise<void> {
    if (Array.isArray(keyOrTags)) {
      // Invalidate by tags
      const entries = Array.from(this.memoryCache.entries());
      for (const [key, entry] of entries) {
        if (entry.data.tags && keyOrTags.some(tag => entry.data.tags.includes(tag))) {
          this.memoryCache.delete(key);
        }
      }
    } else {
      // Invalidate by key
      this.memoryCache.delete(keyOrTags);
    }
  }

  // Clear all cache
  async clear(): Promise<void> {
    this.memoryCache.clear();
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.memoryCache.size,
      keys: Array.from(this.memoryCache.keys())
    };
  }

  // Generate ETag for data
  private generateETag(data: any): string {
    const dataString = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `"${hash.toString(16)}"`;
  }

  // Check if data has changed using ETag
  hasChanged(key: string, etag: string): boolean {
    const entry = this.memoryCache.get(key);
    return !entry || entry.etag !== etag;
  }

  // Get memory cache for subclasses
  protected getMemoryCache(): Map<string, CacheEntry<any>> {
    return this.memoryCache;
  }
}

// Database query caching with automatic invalidation
class DatabaseCacheService extends CacheService {
  private queryCache = new Map<string, { query: string; params: any[]; result: any; expires: number }>();

  // Cache database query results
  async cacheQuery<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(queryKey);
    
    if (cached) {
      return cached;
    }

    const result = await queryFn();
    await this.set(queryKey, result, options);
    
    return result;
  }

  // Invalidate cache when data changes
  async invalidateOnChange(table: string, operation: 'INSERT' | 'UPDATE' | 'DELETE'): Promise<void> {
    const tags = [`table:${table}`, `operation:${operation}`];
    await this.invalidate(tags);
  }

  // Cache with automatic revalidation
  async cacheWithRevalidation<T>(
    key: string,
    queryFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    const now = Date.now();
    
    if (cached) {
      // Check if we should revalidate in background
      const entry = this.memoryCache.get(key);
      if (entry && now > entry.expires - (options.staleWhileRevalidate || this.DEFAULT_STALE_WHILE_REVALIDATE)) {
        // Revalidate in background
        this.revalidateInBackground(key, queryFn, options);
      }
      return cached;
    }

    const result = await queryFn();
    await this.set(key, result, options);
    return result;
  }

  private async revalidateInBackground<T>(
    key: string,
    queryFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const result = await queryFn();
      await this.set(key, result, options);
    } catch (error) {
      console.error('Background revalidation failed:', error);
    }
  }
}

// API Response caching with ETag support
class APICacheService extends DatabaseCacheService {
  // Cache API response with ETag
  async cacheAPIResponse<T>(
    key: string,
    responseFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<{ data: T; etag: string; lastModified: string }> {
    const cached = await this.get<T>(key);
    
    if (cached) {
      const entry = this.memoryCache.get(key);
      return {
        data: cached,
        etag: entry!.etag,
        lastModified: entry!.lastModified
      };
    }

    const data = await responseFn();
    await this.set(key, data, options);
    
    const entry = this.memoryCache.get(key);
    return {
      data,
      etag: entry!.etag,
      lastModified: entry!.lastModified
    };
  }

  // Check if client has latest version
  isNotModified(clientETag: string, key: string): boolean {
    const entry = this.memoryCache.get(key);
    return !!(entry && entry.etag === clientETag);
  }
}

// Export singleton instances
export const cacheService = new CacheService();
export const dbCacheService = new DatabaseCacheService();
export const apiCacheService = new APICacheService();

// Cache decorator for API routes
export function withCache(options: CacheOptions = {}) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      async getCachedData<T>(key: string, queryFn: () => Promise<T>): Promise<T> {
        return await dbCacheService.cacheQuery(key, queryFn, options);
      }
    };
  };
}

// Cache middleware for Next.js API routes
export function createCacheMiddleware(options: CacheOptions = {}) {
  return async function cacheMiddleware(
    request: Request,
    handler: (request: Request) => Promise<Response>
  ): Promise<Response> {
    const url = new URL(request.url);
    const cacheKey = `${request.method}:${url.pathname}:${url.search}`;
    
    // Check if client has latest version
    const clientETag = request.headers.get('if-none-match');
    if (clientETag && apiCacheService.isNotModified(clientETag, cacheKey)) {
      return new Response(null, { status: 304 });
    }

    // Get cached response or generate new one
    const { data, etag, lastModified } = await apiCacheService.cacheAPIResponse(
      cacheKey,
      () => handler(request),
      options
    );

    // Return response with cache headers
    const response = Response.json(data);
    response.headers.set('ETag', etag);
    response.headers.set('Last-Modified', lastModified);
    response.headers.set('Cache-Control', `public, max-age=${Math.floor((options.ttl || 300000) / 1000)}`);
    
    return response;
  };
} 