'use client';

import React, { useState } from 'react';
import { useTheme } from '@/lib/ThemeContext';
import { Moon, Sun, Monitor, Palette } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown';
  className?: string;
}

export function ThemeToggle({ variant = 'button', className = '' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme, customTheme } = useTheme();
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
          className="flex items-center gap-2 px-3 py-2 text-token-text-secondary hover:text-token-text bg-token-surface hover:bg-token-surface-subtle border border-token-border rounded-token-md transition-colors relative"
          aria-label="Toggle theme"
          title={customTheme ? `Custom theme: ${customTheme.name}` : 'Toggle theme'}
        >
          <CurrentIcon className="w-4 h-4" />
          <span className="text-token-sm font-medium">{currentTheme?.label}</span>
          
          {/* Custom theme indicator */}
          {customTheme && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-token-primary rounded-full flex items-center justify-center">
              <Palette className="w-2 h-2 text-white" />
            </div>
          )}
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
              {/* Custom theme info */}
              {customTheme && (
                <div className="px-4 py-2 border-b border-token-border">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-token-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-token-sm font-medium text-token-text-primary truncate">
                        {customTheme.name}
                      </p>
                      <p className="text-token-xs text-token-text-secondary">
                        {customTheme.isOfficial ? 'Full theming' : 'Backgrounds only'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
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
      className={`flex items-center justify-center w-10 h-10 text-token-text-secondary hover:text-token-text bg-token-surface hover:bg-token-surface-subtle border border-token-border rounded-token-md transition-colors relative ${className}`}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      title={customTheme ? `Custom theme: ${customTheme.name}` : `Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
      
      {/* Custom theme indicator */}
      {customTheme && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-token-primary rounded-full flex items-center justify-center">
          <Palette className="w-2 h-2 text-white" />
        </div>
      )}
    </button>
  );
}

// Compact theme toggle for mobile/compact spaces
export function CompactThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme, customTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className={`p-2 text-token-text-secondary hover:text-token-text hover:bg-token-surface-subtle rounded-token-md transition-colors relative ${className}`}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      title={customTheme ? `Custom theme: ${customTheme.name}` : `Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
      
      {/* Custom theme indicator */}
      {customTheme && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-token-primary rounded-full" />
      )}
    </button>
  );
} 