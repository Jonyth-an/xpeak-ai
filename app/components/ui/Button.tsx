import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { AsChildProps } from '@/lib/types/asChild';

interface ButtonProps extends AsChildProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'feature' | 'tertiary' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  feature?: 'sagea' | 'word-maze' | 'topic-sparks' | 'learning-treks' | 'tutors-crew';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', feature, children, asChild = false, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center font-token-semibold rounded-token-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const sizeClasses = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base", 
      lg: "px-8 py-4 text-lg"
    };

    const variantClasses = {
      primary: "bg-[var(--color-primary)] hover:bg-[var(--color-primary-600)] text-white focus:ring-[var(--color-primary-300)] shadow-token-lg",
      secondary: "border-2 border-[var(--color-secondary)] text-[var(--color-secondary-700)] hover:bg-[var(--color-secondary-50)] focus:ring-[var(--color-secondary-300)]",
      outline: "border-2 border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-50)] hover:border-[var(--color-border-strong)] focus:ring-[var(--color-border-focus)]",
      tertiary: "text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-100)] focus:ring-[var(--color-gray-300)]",
      success: "bg-[var(--color-success)] hover:bg-[var(--color-success-600)] text-white focus:ring-[var(--color-success-300)] shadow-token-lg",
      warning: "bg-[var(--color-warning)] hover:bg-[var(--color-warning-600)] text-white focus:ring-[var(--color-warning-300)] shadow-token-lg",
      feature: ""
    };

    // Feature-specific gradients using design tokens
    const featureClasses = {
      'sagea': "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-400)] hover:from-[var(--color-primary-600)] hover:to-[var(--color-primary-500)] text-white shadow-token-lg",
      'word-maze': "bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-600)] hover:from-[var(--color-secondary-600)] hover:to-[var(--color-secondary-700)] text-white shadow-token-lg",
      'topic-sparks': "bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-600)] hover:from-[var(--color-accent-600)] hover:to-[var(--color-accent-700)] text-white shadow-token-lg",
      'learning-treks': "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] hover:from-[var(--color-primary-600)] hover:to-[var(--color-accent-600)] text-white shadow-token-lg",
      'tutors-crew': "bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] hover:from-[var(--color-secondary-600)] hover:to-[var(--color-primary-600)] text-white shadow-token-lg"
    };

    const classes = cn(
      baseClasses,
      sizeClasses[size],
      variant === 'feature' && feature ? featureClasses[feature] : variantClasses[variant],
      className
    );

    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={classes}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button }; 