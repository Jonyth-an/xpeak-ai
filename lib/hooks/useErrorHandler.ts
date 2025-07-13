'use client';

import { useState, useCallback, useRef } from 'react';
import { classifyError, reportError, ErrorInfo } from '@/lib/utils/errorHandling';

interface UseErrorHandlerOptions {
  onError?: (error: ErrorInfo) => void;
  autoReport?: boolean;
  context?: string;
  retryable?: boolean;
}

interface UseErrorHandlerReturn {
  error: ErrorInfo | null;
  hasError: boolean;
  isLoading: boolean;
  retryCount: number;
  handleError: (error: any) => Promise<string>;
  clearError: () => void;
  retry: () => void;
  executeWithErrorHandling: <T extends any[], R>(
    fn: (...args: T) => Promise<R>
  ) => (...args: T) => Promise<R | null>;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn {
  const {
    onError,
    autoReport = true,
    context,
    retryable = true
  } = options;

  const [error, setError] = useState<ErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const lastErrorRef = useRef<any>(null);

  const handleError = useCallback(async (error: any): Promise<string> => {
    const errorInfo = classifyError(error, context);
    lastErrorRef.current = error;

    setError(errorInfo);
    setRetryCount(0);

    if (autoReport) {
      const errorId = await reportError(error, context);
      return errorId;
    }

    onError?.(errorInfo);
    return '';
  }, [autoReport, context, onError]);

  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
    lastErrorRef.current = null;
  }, []);

  const retry = useCallback(() => {
    if (lastErrorRef.current && retryable) {
      setRetryCount(prev => prev + 1);
      setError(null);
      setIsLoading(true);
      
      // Re-throw the last error to trigger retry logic
      setTimeout(() => {
        setIsLoading(false);
        handleError(lastErrorRef.current);
      }, 100);
    }
  }, [retryable, handleError]);

  const executeWithErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>
  ) => {
    return async (...args: T): Promise<R | null> => {
      try {
        setIsLoading(true);
        clearError();
        const result = await fn(...args);
        setIsLoading(false);
        return result;
      } catch (error) {
        setIsLoading(false);
        await handleError(error);
        return null;
      }
    };
  }, [handleError, clearError]);

  return {
    error,
    hasError: !!error,
    isLoading,
    retryCount,
    handleError,
    clearError,
    retry,
    executeWithErrorHandling
  };
}

// Specialized error handlers for common scenarios
export function useNetworkErrorHandler(context?: string) {
  return useErrorHandler({
    context,
    autoReport: true,
    retryable: true
  });
}

export function useAuthErrorHandler(context?: string) {
  return useErrorHandler({
    context,
    autoReport: true,
    retryable: false
  });
}

export function useValidationErrorHandler(context?: string) {
  return useErrorHandler({
    context,
    autoReport: false,
    retryable: true
  });
}

export function useServerErrorHandler(context?: string) {
  return useErrorHandler({
    context,
    autoReport: true,
    retryable: true
  });
}

// Error boundary hook for functional components
export function useErrorBoundary() {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = useState<React.ErrorInfo | null>(null);

  const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    setHasError(true);
    setError(error);
    setErrorInfo(errorInfo);
  }, []);

  const resetError = useCallback(() => {
    setHasError(false);
    setError(null);
    setErrorInfo(null);
  }, []);

  return {
    hasError,
    error,
    errorInfo,
    handleError,
    resetError
  };
}

// Error recovery hook
export function useErrorRecovery(
  error: ErrorInfo | null,
  onRetry?: () => void,
  onBack?: () => void,
  onHome?: () => void
) {
  const handleRetry = useCallback(() => {
    if (error?.retryable && onRetry) {
      onRetry();
    }
  }, [error?.retryable, onRetry]);

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  }, [onBack]);

  const handleHome = useCallback(() => {
    if (onHome) {
      onHome();
    } else {
      window.location.href = '/';
    }
  }, [onHome]);

  const canRetry = error?.retryable ?? false;
  const shouldShowBack = !canRetry || error?.type === 'permission' || error?.type === 'not-found';
  const shouldShowHome = !canRetry || error?.type === 'auth' || error?.type === 'permission';

  return {
    handleRetry,
    handleBack,
    handleHome,
    canRetry,
    shouldShowBack,
    shouldShowHome
  };
} 