import React from 'react';
import { Card, Input, Button } from '../ui';

export interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => void;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as any;
    onSubmit({ email: form.email.value, password: form.password.value });
  };

  return (
    <Card className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
            Email
          </label>
          <Input id="email" name="email" type="email" required placeholder="you@example.com" />
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
          />
        </div>
        <Button variant="primary" type="submit" className="w-full">
          Log In
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