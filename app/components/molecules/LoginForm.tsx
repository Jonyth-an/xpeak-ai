'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { rateLimiter, RATE_LIMIT_CONFIGS } from '@/lib/rateLimiter';
import { Card, Input, Button, Text } from '../ui';

export interface LoginFormProps {
  onSubmit?: (data: { email: string; password: string }) => void;
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
}

export default function LoginForm({ onSubmit, onSuccess, onError }: LoginFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [rateLimitStatus, setRateLimitStatus] = useState<{
    remaining: number;
    resetTime: Date;
    isBlocked: boolean;
    retryAfter?: number;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setUnverifiedEmail(null);
    setRateLimitStatus(null);

    const form = e.currentTarget as HTMLFormElement;
    const email = form.email.value;
    const password = form.password.value;

    try {
      // Call the original onSubmit if provided (for backward compatibility)
      if (onSubmit) {
        onSubmit({ email, password });
      }

      // Sign in with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Check if the error is due to unverified email
        if (signInError.message.includes('Email not confirmed') || 
            signInError.message.includes('Email not verified')) {
          setUnverifiedEmail(email);
          setError('Please verify your email address before signing in.');
          // Load rate limit status for this email
          await loadRateLimitStatus(email);
        } else {
          throw signInError;
        }
        return;
      }

      // Check if user's email is verified
      if (data.user && !data.user.email_confirmed_at) {
        setUnverifiedEmail(email);
        setError('Please verify your email address before signing in.');
        // Load rate limit status for this email
        await loadRateLimitStatus(email);
        return;
      }

      // Success!
      if (onSuccess) {
        onSuccess(data.user);
      }

      // Redirect to home page
      router.push('/');
      console.log('Login successful:', data.user);

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign in';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRateLimitStatus = async (email: string) => {
    try {
      const status = await rateLimiter.getRateLimitStatus(
        email,
        'email_resend',
        RATE_LIMIT_CONFIGS.emailResend
      );
      setRateLimitStatus(status);
    } catch (error) {
      console.error('Error loading rate limit status:', error);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check rate limit before sending
      const rateLimitResult = await rateLimiter.checkRateLimit(
        unverifiedEmail,
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
        unverifiedEmail,
        'email_resend_per_minute',
        RATE_LIMIT_CONFIGS.emailResendPerMinute
      );

      if (!minuteLimitResult.allowed) {
        setError('Please wait 1 minute before requesting another email.');
        return;
      }

      // Send the email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: unverifiedEmail,
      });

      if (error) {
        throw error;
      }

      // Record successful attempt
      await rateLimiter.recordAttempt(unverifiedEmail, 'email_resend');
      await rateLimiter.recordAttempt(unverifiedEmail, 'email_resend_per_minute');

      setError('Verification email sent! Please check your inbox.');
      setUnverifiedEmail(null);
      setRateLimitStatus(null);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setIsLoading(false);
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
    return isLoading || (rateLimitStatus?.isBlocked ?? false);
  };

  return (
    <Card className="max-w-md mx-auto rounded-token-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
            Email
          </label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            required 
            placeholder="you@example.com"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            disabled={isLoading}
          />
        </div>
        
        <Button 
          variant="primary" 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Signing In...
            </div>
          ) : (
            'Log In'
          )}
        </Button>
        
        {/* Unverified email actions */}
        {unverifiedEmail && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
            <Text variant="small" className="text-yellow-800 font-medium">
              Email verification required
            </Text>
            
            {getRateLimitMessage() && (
              <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-2 rounded text-sm">
                {getRateLimitMessage()}
              </div>
            )}
            
            <div className="flex flex-col space-y-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleResendVerification}
                disabled={isResendDisabled()}
                className="w-full"
              >
                {isLoading ? 'Sending...' : 'Resend Verification Email'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleGoToVerification}
                className="w-full"
              >
                Go to Verification Page
              </Button>
            </div>
          </div>
        )}
        
        <div className="text-center mt-2">
          <a href="/password-reset" className="text-sm text-text-secondary hover:text-primary-600 underline transition-colors">
            Forgot your password?
          </a>
        </div>
      </form>
    </Card>
  );
} 