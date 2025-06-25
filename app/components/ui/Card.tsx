import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Card({ 
  variant = 'default', 
  padding = 'md', 
  className, 
  children, 
  ...props 
}: CardProps) {
  const baseClasses = 'bg-token-surface border border-token-surface-alt transition-all duration-token-base';
  
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
      {...props}
    >
      {children}
    </div>
  );
} 