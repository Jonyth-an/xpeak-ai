"use client";

import React from 'react';
import Layout from '../../components/Layout';
import LoginForm from '@/app/components/molecules/LoginForm';
import { Text } from '@/app/components/ui';

export default function LoginPage() {
  const handleLogin = (data: { email: string; password: string }) => {
    console.log('login', data);
    // Here you would typically handle authentication
    alert(`Login attempt for: ${data.email}`);
  };

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
          <LoginForm onSubmit={handleLogin} />
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