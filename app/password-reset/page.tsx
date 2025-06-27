"use client";

import React, { useState } from 'react';
import Layout from '../../components/Layout';
import PasswordResetForm from '@/app/components/molecules/PasswordResetForm';
import { Text } from '@/app/components/ui';

export default function PasswordResetPage() {
  const [pageError, setPageError] = useState<string | null>(null);

  const handlePasswordReset = (data: { email: string }) => {
    console.log('password reset attempt for:', data.email);
  };

  const handlePasswordResetSuccess = (email: string) => {
    console.log('password reset email sent to:', email);
    // The form component will show the success message
  };

  const handlePasswordResetError = (error: string) => {
    console.error('password reset error:', error);
    setPageError(error);
  };

  return (
    <Layout>
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Text variant="h1" as="h1" className="mb-4">
              Reset Your Password
            </Text>
            <Text variant="lead" className="max-w-2xl mx-auto">
              Enter your email address and we'll send you a link to reset your password.
            </Text>
          </div>
          
          {pageError && (
            <div className="max-w-md mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {pageError}
            </div>
          )}
          
          <PasswordResetForm 
            onSubmit={handlePasswordReset}
            onSuccess={handlePasswordResetSuccess}
            onError={handlePasswordResetError}
          />
        </div>
      </section>
    </Layout>
  );
} 