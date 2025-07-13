import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Global cache for data
const dataCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

interface UseOptimizedDataOptions {
  ttl?: number; // Time to live in milliseconds
  backgroundRefresh?: boolean; // Whether to refresh in background
  dependencies?: any[]; // Dependencies that trigger refetch
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
}

interface UseOptimizedDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isStale: boolean;
}

// Optimized data fetching hook with caching and background updates
export function useOptimizedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseOptimizedDataOptions = {}
): UseOptimizedDataReturn<T> {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    backgroundRefresh = true,
    dependencies = [],
    onError,
    onSuccess
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check if cached data is still valid
  const getCachedData = useCallback((): T | null => {
    const cached = dataCache.get(key);
    if (!cached) return null;

    const now = Date.now();
    const isExpired = now - cached.timestamp > cached.ttl;
    
    if (isExpired) {
      dataCache.delete(key);
      setIsStale(true);
      return null;
    }

    // Check if data is getting stale (within 1 minute of expiry)
    const isStaleData = now - cached.timestamp > (cached.ttl - 60 * 1000);
    setIsStale(isStaleData);
    
    return cached.data;
  }, [key]);

  // Fetch data with caching
  const fetchData = useCallback(async (background = false) => {
    if (background && loading) return; // Don't background fetch if already loading

    try {
      if (!background) {
        setLoading(true);
        setError(null);
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const result = await fetcher();
      
      if (abortControllerRef.current.signal.aborted) return;

      // Cache the result
      dataCache.set(key, {
        data: result,
        timestamp: Date.now(),
        ttl
      });

      setData(result);
      setIsStale(false);
      onSuccess?.(result);
    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) return;
      
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      onError?.(err as Error);
    } finally {
      if (!background) {
        setLoading(false);
      }
    }
  }, [key, fetcher, ttl, loading, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    const cachedData = getCachedData();
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      
      // Background refresh if data is stale
      if (backgroundRefresh && isStale) {
        fetchData(true);
      }
    } else {
      fetchData();
    }
  }, [key, ...dependencies]);

  // Background refresh for stale data
  useEffect(() => {
    if (!backgroundRefresh || !isStale) return;

    const interval = setInterval(() => {
      fetchData(true);
    }, 30 * 1000); // Refresh every 30 seconds if stale

    return () => clearInterval(interval);
  }, [backgroundRefresh, isStale, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const refetch = useCallback(() => fetchData(), [fetchData]);

  return { data, loading, error, refetch, isStale };
}

// Optimized API data fetching hook
export function useOptimizedAPI<T>(
  endpoint: string,
  options: UseOptimizedDataOptions & {
    headers?: Record<string, string>;
    params?: Record<string, string>;
  } = {}
): UseOptimizedDataReturn<T> {
  const { headers = {}, params = {}, ...hookOptions } = options;

  const fetcher = useCallback(async (): Promise<T> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    const url = new URL(endpoint, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        ...headers
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }, [endpoint, headers, params]);

  const cacheKey = useMemo(() => {
    const paramsString = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    return `${endpoint}?${paramsString}`;
  }, [endpoint, params]);

  return useOptimizedData(cacheKey, fetcher, hookOptions);
}

// Optimized dashboard data hook
export function useDashboardData<T = any>() {
  return useOptimizedAPI<T>('/api/tutor/dashboard', {
    ttl: 2 * 60 * 1000, // 2 minutes
    backgroundRefresh: true
  });
}

// Optimized lessons data hook
export function useLessonsData<T = any>(page = 1, limit = 10, filters: Record<string, any> = {}) {
  const params = useMemo(() => ({
    page: page.toString(),
    limit: limit.toString(),
    ...filters
  }), [page, limit, filters]);

  return useOptimizedAPI<T>('/api/tutor/lessons', {
    params,
    ttl: 5 * 60 * 1000, // 5 minutes
    backgroundRefresh: true
  });
}

// Optimized earnings data hook
export function useEarningsData(range = 'month', type = 'all', page = 1, limit = 20) {
  const params = useMemo(() => ({
    range,
    type,
    page: page.toString(),
    limit: limit.toString()
  }), [range, type, page, limit]);

  return useOptimizedAPI('/api/tutor/earnings', {
    params,
    ttl: 10 * 60 * 1000, // 10 minutes
    backgroundRefresh: true
  });
}

// Optimized profile data hook
export function useProfileData() {
  return useOptimizedAPI('/api/tutor/profile', {
    ttl: 30 * 60 * 1000, // 30 minutes
    backgroundRefresh: false // Profile doesn't change often
  });
}

// Clear cache utility
export function clearDataCache(pattern?: string) {
  if (pattern) {
    // Clear cache entries matching pattern
    const keys = Array.from(dataCache.keys());
    for (const key of keys) {
      if (key.includes(pattern)) {
        dataCache.delete(key);
      }
    }
  } else {
    // Clear all cache
    dataCache.clear();
  }
}

// Get cache statistics
export function getCacheStats() {
  const now = Date.now();
  let totalEntries = 0;
  let validEntries = 0;
  let staleEntries = 0;

  const entries = Array.from(dataCache.entries());
  for (const [key, entry] of entries) {
    totalEntries++;
    const isExpired = now - entry.timestamp > entry.ttl;
    if (isExpired) {
      staleEntries++;
    } else {
      validEntries++;
    }
  }

  return {
    totalEntries,
    validEntries,
    staleEntries,
    memoryUsage: dataCache.size * 100 // Rough estimate in bytes
  };
} 