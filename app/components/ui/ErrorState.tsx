import React from 'react';
import { cn } from '@/lib/utils';
import Text from './Text';
import { Button } from './Button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
  className?: string;
  fullScreen?: boolean;
  showDetails?: boolean;
}

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error while loading your data.',
  error,
  onRetry,
  className,
  fullScreen = false,
  showDetails = false
}: ErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      fullScreen ? 'min-h-screen' : 'py-12',
      className
    )}>
      <div className="mb-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <Text variant="h2" as="h2" className="text-token-error mb-2">
          {title}
        </Text>
        <Text variant="body" className="text-token-text-secondary mb-6 max-w-md">
          {message}
        </Text>
      </div>

      {showDetails && errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md">
          <Text variant="small" className="text-red-800 font-mono text-left">
            {errorMessage}
          </Text>
        </div>
      )}

      {onRetry && (
        <Button 
          variant="primary" 
          onClick={onRetry}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </div>
  );
} 