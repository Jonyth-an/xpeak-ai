"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import LoginForm from '@/app/components/molecules/LoginForm';
import { Text } from '@/app/components/ui';
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

  const handleLoginSuccess = (user: any) => {
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
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Text variant="h1" as="h1" className="mb-4">
              Welcome Back
            </Text>
            <Text variant="lead" className="max-w-2xl mx-auto">
              Sign in to continue your language learning journey with Xpeak AI.
            </Text>
          </div>
          
          {pageError && (
            <div className="bg-token-error-surface border border-token-error text-token-error px-4 py-2 rounded mb-4 text-sm">
              {pageError}
            </div>
          )}
          
          <LoginForm 
            onSubmit={handleLogin}
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
          />
          
          <div className="text-center mt-8">
            <Text variant="body" className="text-text">
              Don&apos;t have an account?{' '}
              <a href="/signup" className="text-token-primary hover:text-token-primary-dark font-medium">
                Sign up here
              </a>
            </Text>
          </div>
        </div>
      </main>
    </Layout>
  );
} 