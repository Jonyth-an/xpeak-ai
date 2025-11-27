import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  interactive?: boolean;
  disabled?: boolean;
}

export default function Card({ 
  variant = 'default', 
  padding = 'md', 
  className, 
  children,
  interactive = false,
  disabled = false,
  ...props 
}: CardProps) {
  const baseClasses = cn(
    'bg-token-surface border border-token-surface-alt transition-all duration-token-base rounded-lg',
    interactive && !disabled && 'cursor-pointer hover:shadow-md focus:outline-none focus:ring-2 focus:ring-token-primary focus:ring-offset-2',
    disabled && 'opacity-50 cursor-not-allowed'
  );
  
  const variants = {
    default: 'shadow-token-sm hover:shadow-token-md',
    elevated: 'shadow-token-lg hover:shadow-token-xl',
    outlined: 'border-token-text-muted shadow-none',
    flat: 'shadow-none border-transparent'
  };
  
  const paddings = {
    none: '',
    sm: 'p-token-3',
    md: 'p-token-4',
    lg: 'p-token-6'
  };

  return (
    <div
      className={cn(
        baseClasses,
        variants[variant],
        paddings[padding],
        className
      )}
      tabIndex={interactive && !disabled ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </div>
  );
} 