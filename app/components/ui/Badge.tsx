import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Badge({ 
  variant = 'default', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-all duration-token-base';
  
  const variants = {
    default: 'bg-token-surface-alt text-token-text-secondary border border-token-text-muted',
    primary: 'bg-token-primary text-token-text-inverse',
    secondary: 'bg-token-secondary text-token-text-inverse',
    accent: 'bg-token-accent text-token-text-on-accent',
    success: 'bg-token-success text-token-text-inverse',
    warning: 'bg-token-warning text-token-text-inverse',
    error: 'bg-token-error text-token-text-inverse',
    info: 'bg-token-info text-token-text-inverse'
  };
  
  const sizes = {
    sm: 'px-token-2 py-token-1 text-token-xs',
    md: 'px-token-3 py-token-1 text-token-sm',
    lg: 'px-token-4 py-token-2 text-token-base'
  };

  return (
    <span
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
} 