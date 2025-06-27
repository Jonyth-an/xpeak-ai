'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, Input, Button } from '../ui';

export interface LoginFormProps {
  onSubmit?: (data: { email: string; password: string }) => void;
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
}

export default function LoginForm({ onSubmit, onSuccess, onError }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const form = e.currentTarget as HTMLFormElement;
    const email = form.email.value;
    const password = form.password.value;

    try {
      // Call the original onSubmit if provided (for backward compatibility)
      if (onSubmit) {
        onSubmit({ email, password });
      }

      // Sign in with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      // Success!
      if (onSuccess) {
        onSuccess(data.user);
      }

      // You could redirect here or let the parent handle it
      console.log('Login successful:', data.user);

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign in';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto rounded-token-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
            Email
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
          />
        </div>
        
        <Button 
          variant="primary" 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Signing In...
            </div>
          ) : (
            'Log In'
          )}
        </Button>
        
        <div className="text-center mt-2">
          <a href="/password-reset" className="text-sm text-text-secondary hover:text-primary-600 underline transition-colors">
            Forgot your password?
          </a>
        </div>
      </form>
    </Card>
  );
} 