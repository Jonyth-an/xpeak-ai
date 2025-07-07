import React from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  success?: boolean;
}

export default function Select({ 
  variant = 'default', 
  size = 'md', 
  error = false,
  success = false,
  className, 
  children,
  ...props 
}: SelectProps) {
  const baseClasses = 'w-full transition-all duration-token-base focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-no-repeat';
  
  const variants = {
    default: 'border border-token-text-muted bg-token-surface text-token-text focus:border-token-primary focus:ring-token-primary',
    outlined: 'border-2 border-token-text-muted bg-transparent text-token-text focus:border-token-primary focus:ring-token-primary',
    filled: 'border border-transparent bg-token-surface-alt text-token-text focus:bg-token-surface focus:border-token-primary focus:ring-token-primary'
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
    : ''

  return (
    <select
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        stateClasses,
        'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E")] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] pr-10',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
} 