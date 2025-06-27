'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Card, Input, Button } from '../ui';

export interface SignupFormProps {
  onSubmit?: (data: { name: string; email: string; password: string }) => void;
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
}

export default function SignupForm({ onSubmit, onSuccess, onError }: SignupFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // Call the original onSubmit if provided (for backward compatibility)
      if (onSubmit) {
        onSubmit({ name, email, password });
      }

      // Sign up with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user) {
        if (onSuccess) {
          onSuccess(data.user);
        }
        // Redirect to email verification page
        router.push('/verify-email');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during sign up';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto rounded-token-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-secondary">
            Full Name
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Jane Doe"
            disabled={isLoading}
          />
        </div>

        {/* Email */}
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

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            disabled={isLoading}
            minLength={6}
          />
          <p className="mt-1 text-xs text-gray-500">
            Password must be at least 6 characters long
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Submit */}
        <Button 
          variant="primary" 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </div>
          ) : (
            'Sign Up'
          )}
        </Button>
      </form>
    </Card>
  );
} 