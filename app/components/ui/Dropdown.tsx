'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import Card from './Card';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onSelect: (option: DropdownOption) => void;
  placeholder?: string;
  trigger?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
  placement?: 'bottom' | 'top' | 'left' | 'right';
  width?: 'auto' | 'sm' | 'md' | 'lg' | 'xl';
  maxHeight?: string;
}

export default function Dropdown({
  options,
  value,
  onSelect,
  placeholder = 'Select an option',
  trigger,
  className,
  disabled = false,
  size = 'md',
  variant = 'default',
  placement = 'bottom',
  width = 'auto',
  maxHeight = '200px'
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find(option => option.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else if (focusedIndex >= 0) {
          const option = options[focusedIndex];
          if (!option.disabled) {
            onSelect(option);
            setIsOpen(false);
            setFocusedIndex(-1);
          }
        }
        break;

      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        triggerRef.current?.focus();
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          const nextIndex = Math.min(focusedIndex + 1, options.length - 1);
          setFocusedIndex(nextIndex);
          scrollToOption(nextIndex);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(options.length - 1);
        } else {
          const prevIndex = Math.max(focusedIndex - 1, 0);
          setFocusedIndex(prevIndex);
          scrollToOption(prevIndex);
        }
        break;

      case 'Tab':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  }, [isOpen, focusedIndex, options, disabled, onSelect]);

  const scrollToOption = (index: number) => {
    if (listRef.current) {
      const items = listRef.current.children;
      if (items[index]) {
        (items[index] as HTMLElement).scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  };

  const handleSelect = (option: DropdownOption) => {
    if (!option.disabled) {
      onSelect(option);
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  const handleTriggerClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setFocusedIndex(0);
      }
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  };

  // Variant classes
  const variantClasses = {
    default: 'border border-token-text-muted bg-token-surface text-token-text hover:border-token-primary focus:border-token-primary',
    outlined: 'border-2 border-token-text-muted bg-transparent text-token-text hover:border-token-primary focus:border-token-primary',
    filled: 'border border-transparent bg-token-surface-alt text-token-text hover:bg-token-surface focus:bg-token-surface focus:border-token-primary'
  };

  // Width classes
  const widthClasses = {
    auto: 'w-auto',
    sm: 'w-32',
    md: 'w-48',
    lg: 'w-64',
    xl: 'w-80'
  };

  // Placement classes
  const placementClasses = {
    bottom: 'top-full mt-1',
    top: 'bottom-full mb-1',
    left: 'right-full mr-1',
    right: 'left-full ml-1'
  };

  const defaultTrigger = (
    <button
      ref={triggerRef}
      type="button"
      onClick={handleTriggerClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={cn(
        'flex items-center justify-between w-full transition-all duration-token-base focus:outline-none focus:ring-2 focus:ring-token-primary focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed rounded-token-lg',
        sizeClasses[size],
        variantClasses[variant],
        widthClasses[width],
        className
      )}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-labelledby="dropdown-label"
    >
      <span className="flex items-center gap-2 truncate">
        {selectedOption?.icon && <span className="flex-shrink-0">{selectedOption.icon}</span>}
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
      </span>
      <span className={cn(
        'ml-2 flex-shrink-0 transition-transform duration-200',
        isOpen && 'rotate-180'
      )}>
        ▾
      </span>
    </button>
  );

  return (
    <div ref={dropdownRef} className="relative">
      {trigger || defaultTrigger}

      {isOpen && (
        <Card
          variant="elevated"
          padding="none"
          className={cn(
            'absolute z-50 min-w-full shadow-token-lg border border-token-border rounded-token-lg overflow-hidden',
            placementClasses[placement],
            widthClasses[width]
          )}
        >
          <ul
            ref={listRef}
            role="listbox"
            aria-label="Dropdown options"
            className="max-h-[var(--max-height)] overflow-y-auto"
            style={{ '--max-height': maxHeight } as React.CSSProperties}
          >
            {options.map((option, index) => (
              <li key={option.value} role="option" aria-selected={focusedIndex === index}>
                <button
                  type="button"
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  onFocus={() => setFocusedIndex(index)}
                  disabled={option.disabled}
                  className={cn(
                    'w-full flex items-center gap-2 px-4 py-2 text-left transition-colors duration-150 focus:outline-none',
                    'hover:bg-token-surface-alt focus:bg-token-surface-alt',
                    focusedIndex === index && 'bg-token-surface-alt',
                    option.disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent',
                    !option.disabled && 'cursor-pointer'
                  )}
                >
                  {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                  <span className="truncate">{option.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
} 