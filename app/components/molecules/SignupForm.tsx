'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Card, Input, Button } from '../ui';
import { signInWithOAuthWithPKCE } from "@/lib/pkceUtils";

export interface SignupFormProps {
  onSubmit?: (data: { name: string; email: string; password: string }) => void;
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
}

export default function SignupForm({ onSubmit, onSuccess, onError }: SignupFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      console.log('🔐 Starting Google OAuth flow with PKCE...');
      console.log('📍 Current origin:', window.location.origin);
      console.log('📍 Redirect URL:', `${window.location.origin}/auth/callback`);
      
      // Try the built-in PKCE flow first, fallback to custom implementation
      let { data, error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          flow: 'pkce',
        } as any,
      });
      
      // If built-in PKCE fails, try custom implementation
      if (error || !data?.url) {
        console.log('🔄 Built-in PKCE failed, trying custom PKCE implementation...');
        const pkceResult = await signInWithOAuthWithPKCE(
          supabase,
          "google",
          `${window.location.origin}/auth/callback`
        );
        data = pkceResult.data;
        error = pkceResult.error;
      }
      
      console.log('🔐 OAuth response:', { data, error });
      
      if (error) {
        console.error('❌ OAuth error:', error);
        setError(error.message || 'Google sign-up failed');
        setIsGoogleLoading(false);
      } else {
        console.log('✅ OAuth initiated successfully');
        console.log('🔗 OAuth URL:', data?.url);
        console.log('📋 User should be redirected to Google');
        
        // Log the full OAuth URL for debugging
        if (data?.url) {
          console.log('🔍 Full OAuth URL:', data.url);
          const url = new URL(data.url);
          console.log('🔍 OAuth URL params:', {
            client_id: url.searchParams.get('client_id'),
            redirect_uri: url.searchParams.get('redirect_uri'),
            response_type: url.searchParams.get('response_type'),
            scope: url.searchParams.get('scope'),
            state: url.searchParams.get('state'),
            code_challenge: url.searchParams.get('code_challenge') ? 'present' : 'missing',
            code_challenge_method: url.searchParams.get('code_challenge_method'),
          });
        }
      }
      // Note: If successful, the user will be redirected to Google
      // and then back to /auth/callback, so we don't need to handle
      // the success case here
    } catch (err: any) {
      console.error('❌ OAuth exception:', err);
      setError(err.message || 'Google sign-up failed');
      setIsGoogleLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto rounded-token-lg shadow-token-lg">
      <form onSubmit={handleSubmit} className="space-y-token-lg">
        {/* Google Signup Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-token-sm"
          onClick={handleGoogleSignup}
          disabled={isGoogleLoading || isLoading}
        >
          {isGoogleLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-token-text-muted mr-token-sm"></div>
              Signing up with Google...
            </div>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 48 48" className="mr-token-sm" aria-hidden="true">
                <g>
                  <path fill="#4285F4" d="M43.611 20.083H42V20H24v8h11.303C33.972 32.833 29.418 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c2.803 0 5.377.99 7.409 2.626l6.591-6.591C34.583 5.14 29.617 3 24 3 12.954 3 4 11.954 4 23s8.954 20 20 20c11.045 0 19.799-7.954 19.799-19 0-1.27-.138-2.507-.377-3.717z"/>
                  <path fill="#34A853" d="M6.306 14.691l6.571 4.819C14.655 16.104 19.001 13 24 13c2.803 0 5.377.99 7.409 2.626l6.591-6.591C34.583 5.14 29.617 3 24 3c-7.732 0-14.41 4.41-17.694 10.691z"/>
                  <path fill="#FBBC05" d="M24 43c5.356 0 9.86-1.797 13.146-4.888l-6.066-4.966C29.418 36 24 36 24 36c-5.418 0-9.972-3.167-11.303-8.083l-6.591 6.591C9.59 40.59 16.268 45 24 45z"/>
                  <path fill="#EA4335" d="M43.611 20.083H42V20H24v8h11.303C34.418 32.833 29.418 36 24 36c-5.418 0-9.972-3.167-11.303-8.083l-6.591 6.591C9.59 40.59 16.268 45 24 45c7.732 0 14.41-4.41 17.694-10.691z"/>
                </g>
              </svg>
              Continue with Google
            </>
          )}
        </Button>
        {/* Divider */}
        <div className="flex items-center my-token-sm">
          <div className="flex-grow border-t border-token-border"></div>
          <span className="mx-token-sm text-token-text-muted text-token-xs">or</span>
          <div className="flex-grow border-t border-token-border"></div>
        </div>
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-token-sm font-token-medium text-token-text-secondary mb-token-xs">
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
          <label htmlFor="email" className="block text-token-sm font-token-medium text-token-text-secondary mb-token-xs">
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
        <div className="mb-token-lg">
          <label htmlFor="password" className="block text-token-sm font-token-medium text-token-text-secondary mb-token-xs">
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
          <p className="mt-token-xs text-token-xs text-token-text-muted">
            Password must be at least 6 characters long
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-token-error-surface border border-token-error rounded-token-lg p-token-md">
            <p className="text-token-error text-token-sm">{error}</p>
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
              <svg className="animate-spin -ml-1 mr-token-sm h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </div>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>
    </Card>
  );
}