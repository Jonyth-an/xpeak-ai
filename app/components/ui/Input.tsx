import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  success?: boolean;
}

export default function Input({ 
  variant = 'default', 
  size = 'md', 
  error = false,
  success = false,
  className, 
  ...props 
}: InputProps) {
  const baseClasses = 'w-full transition-all duration-token-base focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    default: 'border border-token-text-muted bg-token-surface text-token-text placeholder-token-text-muted focus:border-token-primary focus:ring-token-primary',
    outlined: 'border-2 border-token-text-muted bg-transparent text-token-text placeholder-token-text-muted focus:border-token-primary focus:ring-token-primary',
    filled: 'border border-transparent bg-token-surface-alt text-token-text placeholder-token-text-muted focus:bg-token-surface focus:border-token-primary focus:ring-token-primary'
  };
  
  const sizes = {
    sm: 'px-token-3 py-token-2 text-token-sm rounded-token-md',
    md: 'px-token-4 py-token-2 text-token-base rounded-token-lg',
    lg: 'px-token-4 py-token-3 text-token-lg rounded-token-xl'
  };

  const stateClasses = error 
    ? 'border-token-error focus:border-token-error focus:ring-token-error' 
    : success 
    ? 'border-token-success focus:border-token-success focus:ring-token-success'
    : '';

  return (
    <input
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        stateClasses,
        className
      )}
      {...props}
    />
  );
} 