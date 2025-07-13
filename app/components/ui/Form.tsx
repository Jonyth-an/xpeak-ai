import React from 'react';
import { cn } from '@/lib/utils';
import Text from './Text';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

export function FormField({ 
  label, 
  children, 
  error, 
  hint, 
  required = false, 
  className 
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="block">
        <Text variant="small" className="font-medium text-token-text-primary mb-1">
          {label}
          {required && <span className="text-token-error ml-1">*</span>}
        </Text>
      </label>
      {children}
      {error && (
        <div className="flex items-center gap-2 text-token-error">
          <AlertCircle className="w-4 h-4" />
          <Text variant="small">{error}</Text>
        </div>
      )}
      {hint && !error && (
        <Text variant="small" className="text-token-text-muted">
          {hint}
        </Text>
      )}
    </div>
  );
}

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', size = 'md', leftIcon, rightIcon, ...props }, ref) => {
    const variants = {
      default: 'border-token-surface-alt focus:border-token-primary focus:ring-token-primary',
      error: 'border-token-error focus:border-token-error focus:ring-token-error',
      success: 'border-token-success focus:border-token-success focus:ring-token-success'
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-6 py-4 text-lg'
    };

    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-token-text-muted">
            {leftIcon}
          </div>
        )}
        <input
          className={cn(
            'w-full rounded-md border bg-token-surface transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
            variants[variant],
            sizes[size],
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-token-text-muted">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variants = {
      default: 'border-token-surface-alt focus:border-token-primary focus:ring-token-primary',
      error: 'border-token-error focus:border-token-error focus:ring-token-error',
      success: 'border-token-success focus:border-token-success focus:ring-token-success'
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-6 py-4 text-lg'
    };

    return (
      <textarea
        className={cn(
          'w-full rounded-md border bg-token-surface transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 resize-vertical',
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

TextArea.displayName = 'TextArea';

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant = 'default', size = 'md', options, ...props }, ref) => {
    const variants = {
      default: 'border-token-surface-alt focus:border-token-primary focus:ring-token-primary',
      error: 'border-token-error focus:border-token-error focus:ring-token-error',
      success: 'border-token-success focus:border-token-success focus:ring-token-success'
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-6 py-4 text-lg'
    };

    return (
      <select
        className={cn(
          'w-full rounded-md border bg-token-surface transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 appearance-none bg-no-repeat',
          variants[variant],
          sizes[size],
          'bg-[url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] pr-10',
          className
        )}
        ref={ref}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = 'Select';

interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showPassword = false, onTogglePassword, ...props }, ref) => {
    return (
      <Input
        type={showPassword ? 'text' : 'password'}
        rightIcon={
          <button
            type="button"
            onClick={onTogglePassword}
            className="text-token-text-muted hover:text-token-text-primary transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
        ref={ref}
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  variant?: 'default' | 'error' | 'success';
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'border-token-surface-alt text-token-primary focus:ring-token-primary',
      error: 'border-token-error text-token-error focus:ring-token-error',
      success: 'border-token-success text-token-success focus:ring-token-success'
    };

    return (
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          className={cn(
            'w-4 h-4 rounded border focus:ring-2 focus:ring-offset-2',
            variants[variant],
            className
          )}
          ref={ref}
          {...props}
        />
        {label && (
          <Text variant="body" className="text-token-text-primary">
            {label}
          </Text>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

interface RadioGroupProps {
  label?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  onChange?: (value: string) => void;
  variant?: 'default' | 'error' | 'success';
  className?: string;
}

export function RadioGroup({ 
  label, 
  options, 
  value, 
  onChange, 
  variant = 'default',
  className 
}: RadioGroupProps) {
  const variants = {
    default: 'border-token-surface-alt text-token-primary focus:ring-token-primary',
    error: 'border-token-error text-token-error focus:ring-token-error',
    success: 'border-token-success text-token-success focus:ring-token-success'
  };

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <Text variant="small" className="font-medium text-token-text-primary">
          {label}
        </Text>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={option.disabled}
              className={cn(
                'w-4 h-4 border focus:ring-2 focus:ring-offset-2',
                variants[variant]
              )}
            />
            <Text variant="body" className="text-token-text-primary">
              {option.label}
            </Text>
          </label>
        ))}
      </div>
    </div>
  );
}

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <Text variant="h3" className="text-token-text-primary">
              {title}
            </Text>
          )}
          {description && (
            <Text variant="body" className="text-token-text-secondary">
              {description}
            </Text>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function FormActions({ children, className }: FormActionsProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row gap-3 pt-6 border-t border-token-surface-alt', className)}>
      {children}
    </div>
  );
} 