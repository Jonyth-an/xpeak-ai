import { supabase } from './supabaseClient';

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
  message?: string;
}

export class RateLimiter {
  private static instance: RateLimiter;

  private constructor() {}

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  /**
   * Check if an action is allowed based on rate limiting rules
   */
  async checkRateLimit(
    identifier: string, // email or user_id
    action: string, // 'email_resend', 'login_attempt', etc.
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    try {
      const now = new Date();
      const windowStart = new Date(now.getTime() - config.windowMs);

      // Get recent attempts for this identifier and action
      const { data: attempts, error } = await supabase
        .from('rate_limit_attempts')
        .select('*')
        .eq('identifier', identifier)
        .eq('action', action)
        .gte('timestamp', windowStart.toISOString())
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error checking rate limit:', error);
        // If we can't check rate limit, allow the action (fail open)
        return {
          allowed: true,
          remaining: config.maxAttempts,
          resetTime: new Date(now.getTime() + config.windowMs),
        };
      }

      const recentAttempts = attempts || [];
      const attemptCount = recentAttempts.length;

      // Check if user is currently blocked
      const blockedAttempt = recentAttempts.find(attempt => 
        attempt.blocked_until && new Date(attempt.blocked_until) > now
      );

      if (blockedAttempt) {
        const retryAfter = Math.ceil((new Date(blockedAttempt.blocked_until).getTime() - now.getTime()) / 1000);
        return {
          allowed: false,
          remaining: 0,
          resetTime: new Date(blockedAttempt.blocked_until),
          retryAfter,
          message: `Too many attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`,
        };
      }

      // Check if limit exceeded
      if (attemptCount >= config.maxAttempts) {
        // Block the user if block duration is specified
        const blockedUntil = config.blockDurationMs 
          ? new Date(now.getTime() + config.blockDurationMs)
          : null;

        // Record the blocking attempt
        await this.recordAttempt(identifier, action, blockedUntil);

        const retryAfter = config.blockDurationMs 
          ? Math.ceil(config.blockDurationMs / 1000)
          : Math.ceil(config.windowMs / 1000);

        return {
          allowed: false,
          remaining: 0,
          resetTime: blockedUntil || new Date(now.getTime() + config.windowMs),
          retryAfter,
          message: `Rate limit exceeded. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`,
        };
      }

      // Action is allowed
      return {
        allowed: true,
        remaining: config.maxAttempts - attemptCount,
        resetTime: new Date(now.getTime() + config.windowMs),
      };
    } catch (error) {
      console.error('Error in rate limit check:', error);
      // Fail open - allow action if rate limiting fails
      return {
        allowed: true,
        remaining: config.maxAttempts,
        resetTime: new Date(Date.now() + config.windowMs),
      };
    }
  }

  /**
   * Record an attempt (successful or blocked)
   */
  async recordAttempt(
    identifier: string,
    action: string,
    blockedUntil?: Date | null
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('rate_limit_attempts')
        .insert({
          identifier,
          action,
          timestamp: new Date().toISOString(),
          blocked_until: blockedUntil?.toISOString() || null,
        });

      if (error) {
        console.error('Error recording rate limit attempt:', error);
      }
    } catch (error) {
      console.error('Error recording attempt:', error);
    }
  }

  /**
   * Get rate limit status for display to user
   */
  async getRateLimitStatus(
    identifier: string,
    action: string,
    config: RateLimitConfig
  ): Promise<{
    remaining: number;
    resetTime: Date;
    isBlocked: boolean;
    retryAfter?: number;
  }> {
    const result = await this.checkRateLimit(identifier, action, config);
    
    return {
      remaining: result.remaining,
      resetTime: result.resetTime,
      isBlocked: !result.allowed,
      retryAfter: result.retryAfter,
    };
  }

  /**
   * Clear rate limit attempts for an identifier (useful for testing or admin actions)
   */
  async clearRateLimit(identifier: string, action: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('rate_limit_attempts')
        .delete()
        .eq('identifier', identifier)
        .eq('action', action);

      if (error) {
        console.error('Error clearing rate limit:', error);
      }
    } catch (error) {
      console.error('Error clearing rate limit:', error);
    }
  }
}

// Predefined rate limit configurations
export const RATE_LIMIT_CONFIGS = {
  emailResend: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 15 * 60 * 1000, // 15 minutes block after limit exceeded
  },
  emailResendPerMinute: {
    maxAttempts: 1,
    windowMs: 60 * 1000, // 1 minute
  },
  loginAttempts: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes block
  },
  signupAttempts: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // 1 hour block
  },
} as const;

export const rateLimiter = RateLimiter.getInstance(); 