import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
  children: React.ReactNode;
}

export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  asChild = false,
  className, 
  children, 
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-token-base focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-token-primary text-token-text-inverse hover:bg-token-primary-dark focus:ring-token-primary shadow-token-sm hover:shadow-token-md',
    secondary: 'bg-token-secondary text-token-text-inverse hover:bg-token-secondary-dark focus:ring-token-secondary shadow-token-sm hover:shadow-token-md',
    accent: 'bg-token-accent text-token-text-on-accent hover:bg-token-accent-dark focus:ring-token-accent shadow-token-sm hover:shadow-token-md',
    outline: 'border border-token-text-muted bg-transparent text-token-text hover:bg-token-surface-alt focus:ring-token-primary',
    ghost: 'bg-transparent text-token-text hover:bg-token-surface-alt focus:ring-token-primary'
  };
  
  const sizes = {
    sm: 'px-token-3 py-token-1.5 text-sm',
    md: 'px-token-4 py-token-2 text-base',
    lg: 'px-token-6 py-token-3 text-lg'
  };
  
  const classes = cn(
    baseClasses,
    variants[variant],
    sizes[size],
    className
  );
  
  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      className: cn(classes, (children as React.ReactElement).props.className),
      ...props
    });
  }
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
} 