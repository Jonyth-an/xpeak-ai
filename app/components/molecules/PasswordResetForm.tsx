'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, Input, Button } from '../ui';

export interface PasswordResetFormProps {
  onSubmit?: (data: { email: string }) => void;
  onSuccess?: (email: string) => void;
  onError?: (error: string) => void;
}

export default function PasswordResetForm({ onSubmit, onSuccess, onError }: PasswordResetFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const form = e.currentTarget as HTMLFormElement;
    const email = form.email.value;

    try {
      // Call the original onSubmit if provided (for backward compatibility)
      if (onSubmit) {
        onSubmit({ email });
      }

      // Send password reset email with Supabase
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/password-reset/confirm`,
      });

      if (resetError) {
        throw resetError;
      }

      // Success!
      setSuccess(true);
      if (onSuccess) {
        onSuccess(email);
      }

      console.log('Password reset email sent to:', email);

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send reset email';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      console.error('Password reset error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="max-w-md mx-auto rounded-token-lg">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-token-success-surface rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-token-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-text mb-2">Check Your Email</h3>
            <p className="text-sm text-text-secondary">
              We've sent a password reset link to your email address. 
              Click the link in the email to reset your password.
            </p>
          </div>
          <div className="pt-4">
            <a 
              href="/login" 
              className="text-sm text-token-primary hover:text-token-primary-dark font-medium"
            >
              Back to Login
            </a>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto rounded-token-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-token-error-surface border border-token-error text-token-error px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {/* Email Address */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
            Email Address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            disabled={isLoading}
          />
        </div>
        
        {/* Submit */}
        <Button 
          variant="primary" 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending...
            </div>
          ) : (
            'Send Reset Link'
          )}
        </Button>
        
        <div className="text-center">
          <a 
            href="/login" 
            className="text-sm text-text-secondary hover:text-token-primary underline transition-colors"
          >
            Back to Login
          </a>
        </div>
      </form>
    </Card>
  );
} 