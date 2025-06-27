'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { rateLimiter, RATE_LIMIT_CONFIGS } from '@/lib/rateLimiter';
import { Button, Text } from './ui';

export default function EmailVerificationBanner() {
  const { user, isEmailVerified } = useAuth();
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitStatus, setRateLimitStatus] = useState<{
    remaining: number;
    resetTime: Date;
    isBlocked: boolean;
    retryAfter?: number;
  } | null>(null);

  // Don't show banner if user is not logged in or email is verified
  if (!user || isEmailVerified) {
    return null;
  }

  useEffect(() => {
    // Load initial rate limit status
    loadRateLimitStatus();
  }, [user?.email]);

  const loadRateLimitStatus = async () => {
    if (!user?.email) return;

    try {
      const status = await rateLimiter.getRateLimitStatus(
        user.email,
        'email_resend',
        RATE_LIMIT_CONFIGS.emailResend
      );
      setRateLimitStatus(status);
    } catch (error) {
      console.error('Error loading rate limit status:', error);
    }
  };

  const handleResendEmail = async () => {
    if (!user?.email) return;

    setIsResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      // Check rate limit before sending
      const rateLimitResult = await rateLimiter.checkRateLimit(
        user.email,
        'email_resend',
        RATE_LIMIT_CONFIGS.emailResend
      );

      if (!rateLimitResult.allowed) {
        setError(rateLimitResult.message || 'Rate limit exceeded. Please try again later.');
        setRateLimitStatus({
          remaining: 0,
          resetTime: rateLimitResult.resetTime,
          isBlocked: true,
          retryAfter: rateLimitResult.retryAfter,
        });
        return;
      }

      // Also check per-minute limit
      const minuteLimitResult = await rateLimiter.checkRateLimit(
        user.email,
        'email_resend_per_minute',
        RATE_LIMIT_CONFIGS.emailResendPerMinute
      );

      if (!minuteLimitResult.allowed) {
        setError('Please wait 1 minute before requesting another email.');
        return;
      }

      // Send the email
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (resendError) {
        throw resendError;
      }

      // Record successful attempt
      await rateLimiter.recordAttempt(user.email, 'email_resend');
      await rateLimiter.recordAttempt(user.email, 'email_resend_per_minute');

      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);

      // Update rate limit status
      await loadRateLimitStatus();

    } catch (err: any) {
      console.error('Resend error:', err);
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToVerification = () => {
    router.push('/verify-email');
  };

  const getRateLimitMessage = () => {
    if (!rateLimitStatus) return null;

    if (rateLimitStatus.isBlocked) {
      const minutes = rateLimitStatus.retryAfter 
        ? Math.ceil(rateLimitStatus.retryAfter / 60)
        : 15;
      return `Rate limit exceeded. Try again in ${minutes} minutes.`;
    }

    if (rateLimitStatus.remaining <= 2) {
      return `${rateLimitStatus.remaining} resend${rateLimitStatus.remaining === 1 ? '' : 's'} remaining this hour.`;
    }

    return null;
  };

  const isResendDisabled = () => {
    return isResending || (rateLimitStatus?.isBlocked ?? false);
  };

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <Text variant="body" className="text-yellow-800 font-medium">
              Please verify your email address
            </Text>
            <Text variant="small" className="text-yellow-700">
              We sent a verification link to <strong>{user.email}</strong>
            </Text>
            {getRateLimitMessage() && (
              <Text variant="small" className="text-yellow-600 mt-1">
                {getRateLimitMessage()}
              </Text>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {resendSuccess && (
            <Text variant="small" className="text-green-700 font-medium">
              Email sent!
            </Text>
          )}
          
          {error && (
            <Text variant="small" className="text-red-700">
              {error}
            </Text>
          )}
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleResendEmail}
            disabled={isResendDisabled()}
          >
            {isResending ? 'Sending...' : 'Resend'}
          </Button>
          
          <Button
            variant="primary"
            size="sm"
            onClick={handleGoToVerification}
          >
            Verify Email
          </Button>
        </div>
      </div>
    </div>
  );
} 