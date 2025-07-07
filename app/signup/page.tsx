"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import SignupForm from '@/app/components/molecules/SignupForm';
import { Text } from '@/app/components/ui';
import { useAuth } from '@/lib/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [pageError, setPageError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSignup = (data: { name: string; email: string; password: string }) => {
    console.log('signup attempt:', data);
  };

  const handleSignupSuccess = (user: any) => {
    console.log('signup successful:', user);
    // The form component will show the success message
    // You could also redirect here if needed
  };

  const handleSignupError = (error: string) => {
    console.error('signup error:', error);
    setPageError(error);
  };

  // Show loading or redirect if user is already logged in
  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <Layout>
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-token-surface-accent-light via-token-surface to-token-surface-accent">
        <div className="max-w-7xl mx-auto px-token-md">
          <div className="text-center mb-token-2xl">
            <Text variant="h1" as="h1" className="mb-token-md">
              Join Xpeak AI
            </Text>
            <Text variant="lead" className="max-w-2xl mx-auto text-token-text-secondary">
              Start your language learning journey with AI-powered personalized coaching.
            </Text>
          </div>
          
          {/* Page-level error message */}
          {pageError && (
            <div className="bg-token-error-surface border border-token-error text-token-error px-token-md py-token-sm rounded-token-lg mb-token-md text-token-sm max-w-md mx-auto">
              {pageError}
            </div>
          )}
          
          <SignupForm 
            onSubmit={handleSignup}
            onSuccess={handleSignupSuccess}
            onError={handleSignupError}
          />
          
          <div className="text-center mt-token-xl">
            <Text variant="body" className="text-token-text-secondary">
              Already have an account?{' '}
              <a href="/login" className="text-token-primary hover:text-token-primary-dark font-token-semibold transition-colors">
                Sign in here
              </a>
            </Text>
          </div>
        </div>
      </main>
    </Layout>
  );
} 