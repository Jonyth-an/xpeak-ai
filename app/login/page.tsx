"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import LoginForm from '@/app/components/molecules/LoginForm';
import Text from '@/app/components/ui/Text';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [pageError, setPageError] = useState<string | null>(null);

  // Check for error parameters from OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error === 'auth_callback_failed') {
      setPageError('Authentication failed. Please try again.');
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleLogin = (data: { email: string; password: string }) => {
    console.log('login attempt:', data);
  };

  const handleLoginSuccess = (user: { id: string; email: string; [key: string]: unknown }) => {
    console.log('login successful:', user);
    // The AuthContext will handle the state update and redirect
  };

  const handleLoginError = (error: string) => {
    console.error('login error:', error);
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
              Welcome Back
            </Text>
            <Text variant="lead" className="max-w-2xl mx-auto text-token-text-secondary">
              Sign in to continue your language learning journey with Xpeak AI.
            </Text>
          </div>
          
          {pageError && (
            <div className="bg-token-error-surface border border-token-error text-token-error px-token-md py-token-sm rounded-token-lg mb-token-md text-token-sm max-w-md mx-auto">
              {pageError}
            </div>
          )}
          
          <LoginForm 
            onSubmit={handleLogin}
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
          />
          
          <div className="text-center mt-token-xl">
            <Text variant="body" className="text-token-text-secondary">
              Don&apos;t have an account?{' '}
              <a href="/signup" className="text-token-primary hover:text-token-primary-dark font-token-semibold transition-colors">
                Sign up here
              </a>
            </Text>
          </div>
        </div>
      </main>
    </Layout>
  );
} 