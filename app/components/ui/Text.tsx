import React from 'react';
import { cn } from '@/lib/utils';

type TextElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label' | 'legend';

interface TextProps<T extends TextElement = 'p'> extends Omit<React.HTMLAttributes<HTMLElementTagNameMap[T]>, 'as'> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'lead' | 'small' | 'muted' | 'caption' | 'overline' | 'display' | 'subtitle';
  as?: T;
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  align?: 'left' | 'center' | 'right' | 'justify';
  truncate?: boolean;
  children: React.ReactNode;
}

export default function Text<T extends TextElement = 'p'>({ 
  variant = 'body', 
  as = 'p' as T,
  weight,
  align,
  truncate = false,
  className, 
  children, 
  ...props 
}: TextProps<T>) {
  const Component = as as any;
  
  const variants = {
    display: 'text-token-5xl font-extrabold text-token-text leading-tight',
    h1: 'text-token-4xl font-bold text-token-text leading-tight',
    h2: 'text-token-3xl font-bold text-token-text leading-tight',
    h3: 'text-token-2xl font-semibold text-token-text leading-tight',
    h4: 'text-token-xl font-semibold text-token-text leading-tight',
    h5: 'text-token-lg font-medium text-token-text leading-tight',
    h6: 'text-token-base font-medium text-token-text leading-tight',
    subtitle: 'text-token-lg font-medium text-token-text-secondary leading-relaxed',
    body: 'text-token-base text-token-text leading-relaxed',
    lead: 'text-token-lg text-token-text-secondary leading-relaxed',
    small: 'text-token-sm text-token-text-secondary leading-relaxed',
    caption: 'text-token-xs text-token-text-muted leading-relaxed',
    overline: 'text-token-xs font-semibold text-token-text-muted uppercase tracking-wider leading-relaxed',
    muted: 'text-token-sm text-token-text-muted leading-relaxed'
  };

  const weights = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold'
  };

  const aligns = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  };

  return (
    <Component
      className={cn(
        variants[variant],
        weight && weights[weight],
        align && aligns[align],
        truncate && 'truncate',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
} 