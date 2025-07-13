import React from 'react';
import { cn } from '@/lib/utils';
import Text from './Text';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'skeleton' | 'dots';
  className?: string;
  fullScreen?: boolean;
}

export default function LoadingState({
  message = 'Loading...',
  size = 'md',
  variant = 'spinner',
  className,
  fullScreen = false
}: LoadingStateProps) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const spinner = (
    <div className={cn(
      'animate-spin rounded-full border-2 border-token-surface-subtle border-t-token-primary',
      sizes[size]
    )} />
  );

  const dots = (
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-token-primary rounded-full animate-bounce" />
      <div className="w-2 h-2 bg-token-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
      <div className="w-2 h-2 bg-token-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
    </div>
  );

  const skeleton = (
    <div className="space-y-3">
      <div className="h-4 bg-token-surface-subtle rounded animate-pulse" />
      <div className="h-4 bg-token-surface-subtle rounded animate-pulse w-3/4" />
      <div className="h-4 bg-token-surface-subtle rounded animate-pulse w-1/2" />
    </div>
  );

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      fullScreen ? 'min-h-screen' : 'py-12',
      className
    )}>
      <div className="mb-4">
        {variant === 'spinner' && spinner}
        {variant === 'dots' && dots}
        {variant === 'skeleton' && skeleton}
      </div>
      {message && (
        <Text variant="body" className="text-token-text-secondary">
          {message}
        </Text>
      )}
    </div>
  );

  return content;
} 