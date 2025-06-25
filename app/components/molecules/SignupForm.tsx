import React from 'react';
import { Card, Input, Button } from '../ui';

export interface SignupFormProps {
  onSubmit: (data: { name: string; email: string; password: string }) => void;
}

export default function SignupForm({ onSubmit }: SignupFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as any;
    onSubmit({
      name: form.name.value,
      email: form.email.value,
      password: form.password.value,
    });
  };

  return (
    <Card className="max-w-md mx-auto">
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
          />
        </div>

        {/* Submit */}
        <Button variant="primary" type="submit" className="w-full">
          Sign Up
        </Button>
      </form>
    </Card>
  );
} 