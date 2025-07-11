import React from 'react';
import { cn } from '@/lib/utils';
import Text from './Text';

interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  success?: string;
  helpText?: string;
  className?: string;
  children: React.ReactNode;
  labelClassName?: string;
  errorClassName?: string;
  helpTextClassName?: string;
}

export default function FormField({
  label,
  required = false,
  error,
  success,
  helpText,
  className,
  children,
  labelClassName,
  errorClassName,
  helpTextClassName
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className={cn(
          'block text-sm font-medium text-token-text',
          required && 'after:content-["*"] after:ml-1 after:text-token-error',
          labelClassName
        )}>
          {label}
        </label>
      )}
      
      {children}
      
      {helpText && !error && !success && (
        <Text 
          variant="small" 
          className={cn('text-token-text-muted', helpTextClassName)}
        >
          {helpText}
        </Text>
      )}
      
      {error && (
        <Text 
          variant="small" 
          className={cn('text-token-error flex items-center gap-1', errorClassName)}
        >
          <span className="w-1 h-1 bg-token-error rounded-full"></span>
          {error}
        </Text>
      )}
      
      {success && !error && (
        <Text 
          variant="small" 
          className={cn('text-token-success flex items-center gap-1', errorClassName)}
        >
          <span className="w-1 h-1 bg-token-success rounded-full"></span>
          {success}
        </Text>
      )}
    </div>
  );
} 