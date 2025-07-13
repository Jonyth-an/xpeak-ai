// Error handling utilities and constants

export interface ErrorInfo {
  message: string;
  code?: string;
  status?: number;
  type: 'network' | 'server' | 'auth' | 'validation' | 'permission' | 'not-found' | 'timeout' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
  userMessage: string;
  technicalDetails?: string;
  timestamp: string;
  url?: string;
  userAgent?: string;
}

export interface ErrorReport {
  errorId: string;
  error: ErrorInfo;
  stack?: string;
  componentStack?: string;
  userId?: string;
  sessionId?: string;
}

// Error classification
export function classifyError(error: any, context?: string): ErrorInfo {
  const timestamp = new Date().toISOString();
  const url = typeof window !== 'undefined' ? window.location.href : undefined;
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : undefined;

  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      message: error.message,
      type: 'network',
      severity: 'high',
      retryable: true,
      userMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
      technicalDetails: error.message,
      timestamp,
      url,
      userAgent
    };
  }

  // HTTP status errors
  if (error.status) {
    switch (error.status) {
      case 401:
        return {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
          status: 401,
          type: 'auth',
          severity: 'medium',
          retryable: false,
          userMessage: 'Please log in to access this resource.',
          technicalDetails: error.message,
          timestamp,
          url,
          userAgent
        };
      case 403:
        return {
          message: 'Forbidden',
          code: 'FORBIDDEN',
          status: 403,
          type: 'permission',
          severity: 'medium',
          retryable: false,
          userMessage: 'You don\'t have permission to access this resource.',
          technicalDetails: error.message,
          timestamp,
          url,
          userAgent
        };
      case 404:
        return {
          message: 'Not Found',
          code: 'NOT_FOUND',
          status: 404,
          type: 'not-found',
          severity: 'low',
          retryable: false,
          userMessage: 'The requested resource could not be found.',
          technicalDetails: error.message,
          timestamp,
          url,
          userAgent
        };
      case 422:
        return {
          message: 'Validation Error',
          code: 'VALIDATION_ERROR',
          status: 422,
          type: 'validation',
          severity: 'medium',
          retryable: true,
          userMessage: 'Please check your input and try again.',
          technicalDetails: error.message,
          timestamp,
          url,
          userAgent
        };
      case 429:
        return {
          message: 'Too Many Requests',
          code: 'RATE_LIMITED',
          status: 429,
          type: 'server',
          severity: 'medium',
          retryable: true,
          userMessage: 'Too many requests. Please wait a moment and try again.',
          technicalDetails: error.message,
          timestamp,
          url,
          userAgent
        };
      case 500:
        return {
          message: 'Internal Server Error',
          code: 'SERVER_ERROR',
          status: 500,
          type: 'server',
          severity: 'high',
          retryable: true,
          userMessage: 'The server encountered an error. Please try again later.',
          technicalDetails: error.message,
          timestamp,
          url,
          userAgent
        };
      case 502:
      case 503:
      case 504:
        return {
          message: 'Service Unavailable',
          code: 'SERVICE_UNAVAILABLE',
          status: error.status,
          type: 'server',
          severity: 'high',
          retryable: true,
          userMessage: 'The service is temporarily unavailable. Please try again later.',
          technicalDetails: error.message,
          timestamp,
          url,
          userAgent
        };
      default:
        return {
          message: `HTTP ${error.status} Error`,
          code: `HTTP_${error.status}`,
          status: error.status,
          type: 'server',
          severity: 'medium',
          retryable: error.status >= 500,
          userMessage: 'An error occurred while processing your request.',
          technicalDetails: error.message,
          timestamp,
          url,
          userAgent
        };
    }
  }

  // Timeout errors
  if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
    return {
      message: 'Request Timeout',
      code: 'TIMEOUT',
      type: 'timeout',
      severity: 'medium',
      retryable: true,
      userMessage: 'The request took too long to complete. Please try again.',
      technicalDetails: error.message,
      timestamp,
      url,
      userAgent
    };
  }

  // Validation errors
  if (error.name === 'ValidationError' || error.message.includes('validation')) {
    return {
      message: 'Validation Error',
      code: 'VALIDATION_ERROR',
      type: 'validation',
      severity: 'low',
      retryable: true,
      userMessage: 'Please check your input and try again.',
      technicalDetails: error.message,
      timestamp,
      url,
      userAgent
    };
  }

  // Authentication errors
  if (error.message.includes('auth') || error.message.includes('login') || error.message.includes('token')) {
    return {
      message: 'Authentication Error',
      code: 'AUTH_ERROR',
      type: 'auth',
      severity: 'medium',
      retryable: false,
      userMessage: 'Please log in again to continue.',
      technicalDetails: error.message,
      timestamp,
      url,
      userAgent
    };
  }

  // Default unknown error
  return {
    message: error.message || 'Unknown Error',
    code: 'UNKNOWN_ERROR',
    type: 'unknown',
    severity: 'high',
    retryable: false,
    userMessage: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    technicalDetails: error.message,
    timestamp,
    url,
    userAgent
  };
}

// Error reporting
export async function reportError(error: any, context?: string): Promise<string> {
  const errorInfo = classifyError(error, context);
  const errorId = generateErrorId();
  
  const errorReport: ErrorReport = {
    errorId,
    error: errorInfo,
    stack: error.stack,
    userId: getCurrentUserId(),
    sessionId: getSessionId()
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Report:', errorReport);
  }

  // Send to error reporting service (if configured)
  try {
    await sendErrorReport(errorReport);
  } catch (reportError) {
    console.error('Failed to send error report:', reportError);
  }

  return errorId;
}

// Generate unique error ID
function generateErrorId(): string {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get current user ID (if available)
function getCurrentUserId(): string | undefined {
  // This would typically come from your auth context
  if (typeof window !== 'undefined') {
    // Check localStorage, sessionStorage, or auth context
    return localStorage.getItem('userId') || undefined;
  }
  return undefined;
}

// Get session ID
function getSessionId(): string | undefined {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('sessionId') || undefined;
  }
  return undefined;
}

// Send error report to backend
async function sendErrorReport(report: ErrorReport): Promise<void> {
  // In a real app, you would send this to your error reporting endpoint
  // For now, we'll just log it
  console.log('Sending error report:', report);
  
  // Example implementation:
  // await fetch('/api/errors', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(report)
  // });
}

// Async error wrapper
export function withAsyncErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const errorId = await reportError(error, context);
      throw new Error(`Operation failed (Error ID: ${errorId})`);
    }
  };
}

// Error message templates
export const ERROR_MESSAGES = {
  NETWORK: {
    title: 'Connection Error',
    message: 'Unable to connect to the server. Please check your internet connection.',
    action: 'Try Again'
  },
  SERVER: {
    title: 'Server Error',
    message: 'The server encountered an error. Please try again later.',
    action: 'Try Again'
  },
  AUTH: {
    title: 'Authentication Required',
    message: 'Please log in to access this resource.',
    action: 'Log In'
  },
  PERMISSION: {
    title: 'Access Denied',
    message: 'You don\'t have permission to access this resource.',
    action: 'Go Back'
  },
  NOT_FOUND: {
    title: 'Not Found',
    message: 'The requested resource could not be found.',
    action: 'Go Home'
  },
  TIMEOUT: {
    title: 'Request Timeout',
    message: 'The request took too long to complete. Please try again.',
    action: 'Try Again'
  },
  VALIDATION: {
    title: 'Validation Error',
    message: 'Please check your input and try again.',
    action: 'Fix Input'
  },
  GENERIC: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again.',
    action: 'Try Again'
  }
} as const;

// Error recovery strategies
export const ERROR_RECOVERY_STRATEGIES = {
  network: {
    retry: true,
    retryDelay: 1000,
    maxRetries: 3,
    backoff: 'exponential'
  },
  server: {
    retry: true,
    retryDelay: 2000,
    maxRetries: 2,
    backoff: 'linear'
  },
  auth: {
    retry: false,
    redirect: '/login'
  },
  permission: {
    retry: false,
    redirect: '/'
  },
  'not-found': {
    retry: false,
    redirect: '/'
  },
  timeout: {
    retry: true,
    retryDelay: 1000,
    maxRetries: 2,
    backoff: 'linear'
  },
  validation: {
    retry: true,
    retryDelay: 0,
    maxRetries: 1,
    backoff: 'none'
  },
  unknown: {
    retry: false,
    redirect: '/'
  }
} as const; 