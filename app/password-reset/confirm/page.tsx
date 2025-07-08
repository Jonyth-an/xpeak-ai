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
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (!accessToken || !refreshToken) {
      setError('Invalid or missing reset link. Please request a new password reset.');
    }
  }, [searchParams]);

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
      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw updateError;
      }

      // Success!
      setSuccess(true);
      console.log('Password updated successfully');

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update password';
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
                <div className="bg-token-error-surface border border-token-error text-token-error px-4 py-2 rounded mb-4 text-sm">
                  {error}
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