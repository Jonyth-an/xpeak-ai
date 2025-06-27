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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
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
            <div className="max-w-md mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {pageError}
            </div>
          )}
          
          <LoginForm 
            onSubmit={handleLogin}
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
          />
          
          <div className="text-center mt-8">
            <Text variant="body" className="text-gray-600">
              Don&apos;t have an account?{' '}
              <a href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign up here
              </a>
            </Text>
          </div>
        </div>
      </section>
    </Layout>
  );
} 