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
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-token-surface-accent-light via-token-surface to-token-surface-accent">
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
            <div className="bg-token-error-surface border border-token-error text-token-error px-4 py-2 rounded mb-4 text-sm">
              {pageError}
            </div>
          )}
          
          <PasswordResetForm 
            onSubmit={handlePasswordReset}
            onSuccess={handlePasswordResetSuccess}
            onError={handlePasswordResetError}
          />
        </div>
      </main>
    </Layout>
  );
} 