import React from 'react';
import { Card, Input, Button } from '../ui';

export interface PasswordResetFormProps {
  onSubmit: (data: { email: string }) => void;
}

export default function PasswordResetForm({ onSubmit }: PasswordResetFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as any;
    onSubmit({ email: form.email.value });
  };

  return (
    <Card className="max-w-md mx-auto rounded-token-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
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
          />
        </div>
        {/* Submit */}
        <Button variant="primary" type="submit" className="w-full">
          Send Reset Link
        </Button>
      </form>
    </Card>
  );
} 