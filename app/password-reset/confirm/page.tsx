"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Layout from '../../../components/Layout';
import { Card, Input, Button, Text } from '@/app/components/ui';

function PasswordResetConfirmPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Check if we have the necessary tokens in the URL
  useEffect(() => {
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    // Check for error parameters in the URL hash
    const hash = window.location.hash;
    if (hash) {
      const errorMatch = hash.match(/error=([^&]+)/);
      const errorCodeMatch = hash.match(/error_code=([^&]+)/);
      const errorDescMatch = hash.match(/error_description=([^&]+)/);
      
      if (errorMatch) {
        const error = decodeURIComponent(errorMatch[1]);
        const errorCode = errorCodeMatch ? decodeURIComponent(errorCodeMatch[1]) : '';
        const errorDesc = errorDescMatch ? decodeURIComponent(errorDescMatch[1]) : '';
        
        console.log('Error in URL hash:', { error, errorCode, errorDesc });
        
        if (error === 'access_denied' && errorCode === 'otp_expired') {
          setError('This password reset link has expired. Please request a new password reset.');
          return;
        } else if (error === 'access_denied') {
          setError('This password reset link is invalid. Please request a new password reset.');
          return;
        }
      }
    }
    
    console.log('Password reset URL parameters:', {
      token,
      type,
      accessToken,
      refreshToken,
      allParams: Object.fromEntries(searchParams.entries()),
      hash
    });
    
    // If we have access_token and refresh_token, we're already authenticated
    if (accessToken && refreshToken) {
      console.log('User is already authenticated with access_token/refresh_token');
      return;
    }
    
    // If we have a token and type=recovery, we need to verify it first
    if (token && type === 'recovery') {
      console.log('Verifying recovery token with Supabase');
      verifyRecoveryToken(token);
      return;
    }
    
    // If we have just a token (without type), that's also valid
    if (token) {
      console.log('Using token without type parameter');
      verifyRecoveryToken(token);
      return;
    }
    
    setError('Invalid or missing reset link. Please request a new password reset.');
  }, [searchParams]);

  const verifyRecoveryToken = async (token: string) => {
    try {
      console.log('Verifying token:', token);
      
      // Verify the recovery token with Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery'
      });
      
      if (error) {
        console.error('Token verification error:', error);
        setError('Invalid or expired reset link. Please request a new password reset.');
        return;
      }
      
      console.log('Token verified successfully:', data);
      // User is now authenticated and can update their password
      
    } catch (err) {
      console.error('Error verifying token:', err);
      setError('Failed to verify reset link. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      // Update the user's password using the recovery token
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw updateError;
      }

      // Success!
      setSuccess(true);
      console.log('Password updated successfully');

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update password';
      setError(errorMessage);
      console.error('Password update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Layout>
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-token-surface-accent-light via-token-surface to-token-surface-accent">
          <div className="max-w-7xl mx-auto">
            <Card className="max-w-md mx-auto rounded-token-lg">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-token-success-surface rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-token-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-text mb-2">Password Updated!</h3>
                  <p className="text-sm text-text-secondary">
                    Your password has been successfully updated. You can now sign in with your new password.
                  </p>
                </div>
                <div className="pt-4">
                  <Button 
                    variant="primary" 
                    onClick={() => router.push('/login')}
                    className="w-full"
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-token-surface-accent-light via-token-surface to-token-surface-accent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Text variant="h1" as="h1" className="mb-4">
              Set New Password
            </Text>
            <Text variant="lead" className="max-w-2xl mx-auto">
              Enter your new password below.
            </Text>
          </div>
          
          <Card className="max-w-md mx-auto rounded-token-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-token-error-surface border border-token-error text-token-error px-4 py-3 rounded mb-4 text-sm">
                  <div className="mb-2">{error}</div>
                  <a 
                    href="/password-reset" 
                    className="text-token-error underline hover:no-underline"
                  >
                    Request a new password reset
                  </a>
                </div>
              )}
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                  New Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary">
                  Confirm New Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                    Updating...
                  </div>
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>
          </Card>
        </div>
      </section>
    </Layout>
  );
}

export default function PasswordResetConfirmPage() {
  return (
    <Suspense>
      <PasswordResetConfirmPageInner />
    </Suspense>
  );
}