'use client';

import React, { useState } from 'react';
import { useTheme } from '@/lib/ThemeContext';
import { Moon, Sun, Monitor } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown';
  className?: string;
}

export function ThemeToggle({ variant = 'button', className = '' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  const currentTheme = themes.find(t => t.value === theme);
  const CurrentIcon = currentTheme?.icon || Monitor;

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 text-token-text-secondary hover:text-token-text bg-token-surface hover:bg-token-surface-subtle border border-token-border rounded-token-md transition-colors"
          aria-label="Toggle theme"
        >
          <CurrentIcon className="w-4 h-4" />
          <span className="text-token-sm font-medium">{currentTheme?.label}</span>
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-1 w-48 bg-token-surface border border-token-border rounded-token-lg shadow-token-lg z-50 py-1">
              {themes.map((themeOption) => {
                const Icon = themeOption.icon;
                const isActive = theme === themeOption.value;
                
                return (
                  <button
                    key={themeOption.value}
                    onClick={() => {
                      setTheme(themeOption.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-token-surface-subtle transition-colors ${
                      isActive 
                        ? 'text-token-primary bg-token-surface-accent' 
                        : 'text-token-text-secondary'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-token-sm font-medium">{themeOption.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-token-primary rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  // Button variant (simple toggle between light/dark)
  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className={`flex items-center justify-center w-10 h-10 text-token-text-secondary hover:text-token-text bg-token-surface hover:bg-token-surface-subtle border border-token-border rounded-token-md transition-colors ${className}`}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}

// Compact theme toggle for mobile/compact spaces
export function CompactThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className={`p-2 text-token-text-secondary hover:text-token-text hover:bg-token-surface-subtle rounded-token-md transition-colors ${className}`}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
} 