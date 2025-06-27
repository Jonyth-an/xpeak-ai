'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Card, Button, Text } from './ui';

interface RequireEmailVerificationProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export default function RequireEmailVerification({ 
  children, 
  fallback,
  redirectTo = '/verify-email'
}: RequireEmailVerificationProps) {
  const { user, isEmailVerified, loading } = useAuth();
  const router = useRouter();

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If user is not logged in, redirect to login
  if (!user) {
    router.push('/login');
    return null;
  }

  // If email is not verified, show fallback or default message
  if (!isEmailVerified) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md mx-auto">
          <Card className="rounded-token-lg">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <Text variant="h3" as="h3" className="mb-2">Email Verification Required</Text>
              <Text variant="body" className="text-gray-600 mb-6">
                Please verify your email address to access this feature. 
                We sent a verification link to <strong>{user.email}</strong>.
              </Text>
              <div className="space-y-3">
                <Button 
                  variant="primary" 
                  onClick={() => router.push(redirectTo)}
                  className="w-full"
                >
                  Verify Email
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => router.push('/')}
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // If email is verified, render children
  return <>{children}</>;
} 