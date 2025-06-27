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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Text variant="h1" as="h1" className="mb-4">
              Join Xpeak AI
            </Text>
            <Text variant="lead" className="max-w-2xl mx-auto">
              Start your language learning journey with AI-powered personalized coaching.
            </Text>
          </div>
          
          {/* Page-level error message */}
          {pageError && (
            <div className="max-w-md mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {pageError}
            </div>
          )}
          
          <SignupForm 
            onSubmit={handleSignup}
            onSuccess={handleSignupSuccess}
            onError={handleSignupError}
          />
          
          <div className="text-center mt-8">
            <Text variant="body" className="text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in here
              </a>
            </Text>
          </div>
        </div>
      </section>
    </Layout>
  );
} 