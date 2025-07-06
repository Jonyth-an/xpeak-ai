"use client"

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '../../components/Layout';
import { Card, Button, Text } from '@/app/components/ui';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { rateLimiter, RATE_LIMIT_CONFIGS } from '@/lib/rateLimiter';

function VerifyEmailPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending');
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [rateLimitStatus, setRateLimitStatus] = useState<{
    remaining: number;
    resetTime: Date;
    isBlocked: boolean;
    retryAfter?: number;
  } | null>(null);

  // Check for verification token in URL
  useEffect(() => {
    const token = searchParams.get('token');
    const type = searchParams.get('type');

    if (token && type === 'signup') {
      handleEmailVerification(token);
    }
  }, [searchParams]);

  // Redirect if user is already verified and logged in
  useEffect(() => {
    if (user?.email_confirmed_at) {
      router.push('/');
    }
  }, [user, router]);

  // Load rate limit status when user email changes
  useEffect(() => {
    if (user?.email) {
      loadRateLimitStatus();
    }
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

  const handleEmailVerification = async (token: string) => {
    setVerificationStatus('verifying');
    setError(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup',
      });

      if (error) {
        throw error;
      }

      setVerificationStatus('success');
      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to verify email');
      setVerificationStatus('error');
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

  const getContent = () => {
    switch (verificationStatus) {
      case 'verifying':
        return (
          <div className="text-center">
            <div className="w-12 h-12 bg-token-primary-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="animate-spin w-6 h-6 text-token-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <Text variant="h3" as="h3" className="mb-2">Verifying your email...</Text>
            <Text variant="body" className="text-text-secondary">Please wait while we verify your email address.</Text>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="w-12 h-12 bg-token-success-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-token-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <Text variant="h3" as="h3" className="mb-2">Email verified successfully!</Text>
            <Text variant="body" className="text-text-secondary mb-6">
              Your email has been verified. You'll be redirected to the home page shortly.
            </Text>
            <Button 
              variant="primary" 
              onClick={() => router.push('/')}
              className="w-full"
            >
              Go to Home Page
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="w-12 h-12 bg-token-error-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-token-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <Text variant="h3" as="h3" className="mb-2">Verification failed</Text>
            <Text variant="body" className="text-text-secondary mb-4">
              {error || 'There was an error verifying your email address.'}
            </Text>
            <div className="space-y-3">
              <Button 
                variant="primary" 
                onClick={handleResendEmail}
                disabled={isResendDisabled()}
                className="w-full"
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <div className="w-12 h-12 bg-token-primary-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-token-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <Text variant="h3" as="h3" className="mb-2">Check your email</Text>
            <Text variant="body" className="text-text-secondary mb-6">
              We've sent a verification link to <strong>{user?.email}</strong>. 
              Please check your email and click the link to verify your account.
            </Text>
            
            {resendSuccess && (
              <div className="bg-token-success-surface border border-token-success text-token-success px-4 py-3 rounded-lg text-sm mb-4">
                Verification email sent successfully!
              </div>
            )}
            
            {error && (
              <div className="bg-token-error-surface border border-token-error text-token-error px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            {getRateLimitMessage() && (
              <div className="bg-token-warning-surface border border-token-warning text-token-warning px-4 py-3 rounded-lg text-sm mb-4">
                {getRateLimitMessage()}
              </div>
            )}
            
            <div className="space-y-3">
              <Button 
                variant="primary" 
                onClick={handleResendEmail}
                disabled={isResendDisabled()}
                className="w-full"
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-token-surface-accent rounded-lg">
              <Text variant="small" className="text-text-secondary">
                <strong>Didn't receive the email?</strong>
                <br />
                • Check your spam folder
                <br />
                • Make sure you entered the correct email address
                <br />
                • Wait a few minutes before requesting a new email
              </Text>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout>
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-token-surface-accent">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Text variant="h1" as="h1" className="mb-2">
              Email Verification
            </Text>
            <Text variant="lead" className="text-text-secondary">
              Complete your account setup
            </Text>
          </div>
          
          <Card className="rounded-token-lg">
            <div className="p-6">
              {getContent()}
            </div>
          </Card>
        </div>
      </section>
    </Layout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailPageInner />
    </Suspense>
  );
} 