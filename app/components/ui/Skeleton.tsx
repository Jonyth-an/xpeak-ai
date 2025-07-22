'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export default function Skeleton({ 
  className, 
  width, 
  height, 
  rounded = 'md' 
}: SkeletonProps) {
  const roundedClasses = {
    none: '',
    sm: 'rounded-token-sm',
    md: 'rounded-token-md',
    lg: 'rounded-token-lg',
    full: 'rounded-full'
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-token-surface-accent',
        roundedClasses[rounded],
        className
      )}
      style={{
        width: width,
        height: height
      }}
    />
  );
}

// Predefined skeleton components for common use cases
export function SkeletonText({ 
  lines = 1, 
  className 
}: { 
  lines?: number; 
  className?: string; 
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="1rem"
          width={i === lines - 1 ? '60%' : '100%'}
          className="h-4"
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-4 space-y-3', className)}>
      <div className="flex items-center space-x-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton height="1rem" width="70%" />
          <Skeleton height="0.75rem" width="40%" />
        </div>
      </div>
      <SkeletonText lines={2} />
      <div className="flex space-x-2">
        <Skeleton height="1.5rem" width="4rem" rounded="full" />
        <Skeleton height="1.5rem" width="3rem" rounded="full" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ 
  items = 6, 
  className 
}: { 
  items?: number; 
  className?: string; 
}) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
} 