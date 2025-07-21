'use client';

import React, { forwardRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  success?: boolean;
  showCharacterCount?: boolean;
  maxLength?: number;
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ 
  variant = 'default', 
  size = 'md', 
  error = false,
  success = false,
  showCharacterCount = false,
  maxLength,
  autoResize = false,
  minRows = 3,
  maxRows = 10,
  className,
  value,
  onChange,
  ...props 
}, ref) => {
  const [characterCount, setCharacterCount] = useState(0);
  const [textareaHeight, setTextareaHeight] = useState('auto');

  // Calculate character count
  useEffect(() => {
    if (value) {
      setCharacterCount(String(value).length);
    } else {
      setCharacterCount(0);
    }
  }, [value]);

  // Auto-resize functionality
  useEffect(() => {
    if (autoResize && ref && typeof ref === 'object' && ref.current) {
      const textarea = ref.current;
      const resizeTextarea = () => {
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
        const minHeight = lineHeight * minRows;
        const maxHeight = lineHeight * maxRows;
        
        const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
        setTextareaHeight(`${newHeight}px`);
      };

      resizeTextarea();
      
      // Add event listener for input changes
      const handleInput = () => resizeTextarea();
      textarea.addEventListener('input', handleInput);
      
      return () => textarea.removeEventListener('input', handleInput);
    }
  }, [autoResize, minRows, maxRows, ref, value]);

  const baseClasses = 'w-full transition-all duration-token-base focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed resize-vertical';
  
  const variants = {
    default: 'border border-token-text-muted bg-token-surface text-token-text placeholder-token-text-muted focus:border-token-primary focus:ring-token-primary',
    outlined: 'border-2 border-token-text-muted bg-transparent text-token-text placeholder-token-text-muted focus:border-token-primary focus:ring-token-primary',
    filled: 'border border-transparent bg-token-surface-alt text-token-text placeholder-token-text-muted focus:bg-token-surface focus:border-token-primary focus:ring-token-primary'
  };
  
  const sizes = {
    sm: 'px-token-3 py-token-2 text-token-sm rounded-token-md',
    md: 'px-token-4 py-token-3 text-token-base rounded-token-lg',
    lg: 'px-token-4 py-token-4 text-token-lg rounded-token-xl'
  };

  const stateClasses = error 
    ? 'border-token-error focus:border-token-error focus:ring-token-error' 
    : success 
    ? 'border-token-success focus:border-token-success focus:ring-token-success'
    : '';

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          stateClasses,
          autoResize && 'resize-none',
          className
        )}
        style={autoResize ? { height: textareaHeight } : undefined}
        value={value || ''}
        onChange={handleChange}
        maxLength={maxLength}
        {...props}
      />
      
      {/* Character Count */}
      {showCharacterCount && (
        <div className={cn(
          "absolute bottom-2 right-2 text-xs",
          characterCount > (maxLength || 0) * 0.9 
            ? "text-token-error" 
            : characterCount > (maxLength || 0) * 0.7 
            ? "text-token-warning" 
            : "text-token-text-muted"
        )}>
          {characterCount}
          {maxLength && `/${maxLength}`}
        </div>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea; 