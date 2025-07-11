import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

export default function CustomSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  triggerClassName = '',
  contentClassName = '',
}: CustomSelectProps) {
  // Filter out options with empty string values to prevent Radix UI errors
  const validOptions = options.filter(option => option.value !== '');
  
  // Log warning if empty string options were filtered out
  React.useEffect(() => {
    const emptyOptions = options.filter(option => option.value === '');
    if (emptyOptions.length > 0) {
      console.warn('CustomSelect: Filtered out options with empty string values:', emptyOptions);
    }
  }, [options]);

  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        className={cn(
          'inline-flex items-center justify-between w-full px-token-4 py-token-3 rounded-token-lg border border-token-text-muted bg-white text-token-text text-base focus:outline-none focus:ring-2 focus:ring-token-primary transition-all',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          triggerClassName
        )}
        aria-label={placeholder}
      >
        <SelectPrimitive.Value placeholder={
          <span className="text-token-text-secondary">{placeholder}</span>
        } />
        <SelectPrimitive.Icon className="ml-2 text-token-text-secondary">
          <ChevronDown className="w-5 h-5" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(
            'z-50 min-w-[var(--radix-select-trigger-width)] bg-white border border-token-border rounded-token-lg shadow-token-lg overflow-hidden',
            contentClassName
          )}
        >
          <SelectPrimitive.Viewport className="py-2">
            {validOptions.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={cn(
                  'flex items-center px-4 py-2 text-base cursor-pointer select-none text-token-text hover:bg-token-surface focus:bg-token-surface transition-colors',
                  'data-[state=checked]:font-semibold',
                  'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed'
                )}
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="ml-auto text-token-primary">
                  <Check className="w-4 h-4" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
} 