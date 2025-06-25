"use client"

import React from 'react';
import Layout from '../../components/Layout';
import SignupForm from '@/app/components/molecules/SignupForm';
import { Text } from '@/app/components/ui';

export default function SignupPage() {
  const handleSignup = (data: { name: string; email: string; password: string }) => {
    console.log('signup', data);
    // Here you would typically handle user registration
    alert(`Signup attempt for: ${data.name} (${data.email})`);
  };

  return (
    <Layout>
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Text variant="h1" as="h1" className="mb-4">
              Join Xpeak AI
            </Text>
            <Text variant="lead" className="max-w-2xl mx-auto">
              Start your language learning journey with AI-powered tutors and personalized learning paths.
            </Text>
          </div>
          
          <SignupForm onSubmit={handleSignup} />
          
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