import React, { useState, useEffect, useRef, useCallback, useMemo, memo, Suspense } from 'react';
import { Card, Text, Button, Badge, LoadingState, ErrorState } from '@/app/components/ui';
import { 
  Star, 
  TrendingUp, 
  Award, 
  Target, 
  BarChart3, 
  Users, 
  Clock, 
  Calendar,
  Globe,
  MapPin,
  GraduationCap,
  BookOpen,
  MessageSquare,
  Video,
  Camera,
  Mic,
  Shield,
  Heart,
  Scale,
  Clock as ClockIcon,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Save,
  RefreshCw,
  UserPlus,
  UserMinus,
  Lock,
  Unlock,
  Key,
  Crown,
  Activity,
  Zap
} from 'lucide-react';
import Image from 'next/image';

// Memoized components to prevent unnecessary re-renders
export const MemoizedCard = memo(({ children, className, ...props }: any) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className || ''}`} {...props}>
    {children}
  </div>
));

export const MemoizedText = memo(({ children, className, ...props }: any) => (
  <span className={className} {...props}>
    {children}
  </span>
));

export const MemoizedButton = memo(({ children, className, onClick, ...props }: any) => (
  <button 
    className={`px-4 py-2 rounded-md font-medium transition-colors ${className || ''}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
));

// Virtualized list component for large datasets
interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
}

export function VirtualizedList<T>({ 
  items, 
  height, 
  itemHeight, 
  renderItem, 
  overscan = 5 
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(height / itemHeight) + overscan,
      items.length
    );
    return { start: Math.max(0, start - overscan), end };
  }, [scrollTop, itemHeight, height, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div 
      style={{ height, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={visibleRange.start + index} style={{ height: itemHeight }}>
              {renderItem(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Lazy loading wrapper with suspense
export function LazyWrapper({ 
  children, 
  fallback = <LoadingState message="Loading..." /> 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}

// Intersection observer wrapper for lazy loading
interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
}

export function LazyLoad({ 
  children, 
  fallback = <LoadingState message="Loading..." />,
  threshold = 0.1,
  rootMargin = '50px'
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={ref}>
      {hasLoaded ? children : fallback}
    </div>
  );
}

// Optimized image component with lazy loading
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage = React.memo(({ 
  src, 
  alt, 
  className, 
  placeholder,
  onLoad,
  onError
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const [imageSrc, setImageSrc] = React.useState(src);

  React.useEffect(() => {
    setImageSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    if (onLoad) onLoad();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    if (onError) onError();
  }, [onError]);

  return (
    <div className={`relative ${className || ''}`}>
      <Image
        src={imageSrc}
        alt={alt}
        width={400}
        height={300}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleLoad}
        onError={handleError}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Image unavailable</span>
        </div>
      )}
    </div>
  );
});

// Debounced input component
interface DebouncedInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  delay?: number;
}

export function DebouncedInput({ 
  value, 
  onChange, 
  placeholder, 
  className,
  delay = 300 
}: DebouncedInputProps) {
  const [inputValue, setInputValue] = React.useState(value);
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, delay);
  }, [onChange, delay]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <input
      type="text"
      value={inputValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className || ''}`}
    />
  );
}

// Optimized data table with virtualization
interface OptimizedDataTableProps<T> {
  data: T[];
  columns: Array<{
    key: string;
    header: string;
    render: (item: T) => React.ReactNode;
    width?: number;
  }>;
  height?: number;
  rowHeight?: number;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function OptimizedDataTable<T>({
  data,
  columns,
  height = 400,
  rowHeight = 50,
  loading,
  error,
  onRetry
}: OptimizedDataTableProps<T>) {
  if (loading) {
    return <LoadingState message="Loading data..." />;
  }

  if (error) {
    return <ErrorState title="Failed to load data" message={error} onRetry={onRetry} />;
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="flex">
          {columns.map((column) => (
            <div
              key={column.key}
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              style={{ width: column.width || 'auto', flex: column.width ? 'none' : 1 }}
            >
              {column.header}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <VirtualizedList
        items={data}
        height={height - 50} // Subtract header height
        itemHeight={rowHeight}
        renderItem={(item, index) => (
          <div className="flex border-b border-gray-100 hover:bg-gray-50">
            {columns.map((column) => (
              <div
                key={column.key}
                className="px-4 py-3 text-sm text-gray-900"
                style={{ width: column.width || 'auto', flex: column.width ? 'none' : 1 }}
              >
                {column.render(item)}
              </div>
            ))}
          </div>
        )}
      />
    </div>
  );
}

// Performance monitoring component
export function PerformanceMonitor({ children }: { children: React.ReactNode }) {
  const renderCount = React.useRef(0);
  const startTime = React.useRef(performance.now());

  React.useEffect(() => {
    renderCount.current++;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Component rendered ${renderCount.current} times in ${renderTime.toFixed(2)}ms`);
    }
    
    startTime.current = performance.now();
  });

  return <>{children}</>;
}

// Export all components
export {
  MemoizedCard as Card,
  MemoizedText as Text,
  MemoizedButton as Button,
  OptimizedImage as Image
}; 