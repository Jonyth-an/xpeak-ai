"use client";

import React from 'react';
import Layout from '../../components/Layout';
import PasswordResetForm from '@/app/components/molecules/PasswordResetForm';
import { Text } from '@/app/components/ui';

export default function PasswordResetPage() {
  const handlePasswordReset = (data: { email: string }) => {
    console.log('reset link for', data.email);
    // Here you would typically trigger a password reset email
    alert(`Password reset link sent to: ${data.email}`);
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
          <PasswordResetForm onSubmit={handlePasswordReset} />
        </div>
      </section>
    </Layout>
  );
} 