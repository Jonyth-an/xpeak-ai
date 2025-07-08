'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeDatabaseService } from './services/themeDatabaseService';

export type Theme = 'light' | 'dark' | 'system';

// Custom theme interface
export interface CustomTheme {
  name: string;
  category: string;
  isOfficial: boolean;
  variables: Record<string, string>;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  isDark: boolean;
  // Custom theme functionality
  customTheme: CustomTheme | null;
  setCustomTheme: (customTheme: CustomTheme | null) => void;
  applyCustomTheme: (themeVars: Record<string, string> | null | undefined, isOfficial: boolean) => void;
  clearCustomTheme: () => void;
  // Database sync status
  isSyncing: boolean;
  lastSyncError: string | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [customTheme, setCustomThemeState] = useState<CustomTheme | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);

  // Get system preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Apply base theme to document (light/dark/system)
  const applyBaseTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    const resolved = newTheme === 'system' ? getSystemTheme() : newTheme;
    
    // Remove existing theme attributes
    root.removeAttribute('data-theme');
    root.classList.remove('light', 'dark');
    
    // Apply new theme
    if (newTheme !== 'system') {
      root.setAttribute('data-theme', newTheme);
      root.classList.add(newTheme);
    } else {
      root.setAttribute('data-theme', resolved);
      root.classList.add(resolved);
    }
    
    setResolvedTheme(resolved);
  };

  // Apply custom theme variables
  const applyCustomTheme = (themeVars: Record<string, string> | null | undefined, isOfficial: boolean) => {
    if (typeof window === 'undefined') return;
    if (!themeVars || typeof themeVars !== 'object') {
      console.warn('applyCustomTheme called with invalid themeVars:', themeVars);
      return;
    }
    
    const root = document.documentElement;
    
    if (isOfficial) {
      // Official themes: Apply all colors (full theming)
      Object.entries(themeVars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    } else {
      // Community themes: Apply only themeable elements, preserve brand colors for critical elements
      Object.entries(themeVars).forEach(([key, value]) => {
        // Skip brand-critical colors for community themes
        if (key === "--color-primary" || key === "--color-accent" || 
            key === "--color-success" || key === "--color-error" || 
            key === "--color-warning" || key === "--color-info") {
          return; // Preserve brand colors
        }
        root.style.setProperty(key, value);
      });
      
      // Apply brand colors for critical elements
      root.style.setProperty("--color-primary", "#FF6B6B");
      root.style.setProperty("--color-accent", "#6BCEF5");
      root.style.setProperty("--color-success", "#10b981");
      root.style.setProperty("--color-error", "#ef4444");
      root.style.setProperty("--color-warning", "#f59e0b");
      root.style.setProperty("--color-info", "#3b82f6");
    }
  };

  // Sync theme to database
  const syncToDatabase = async (newTheme: Theme, newCustomTheme: CustomTheme | null) => {
    if (!mounted) return; // Don't sync during initial load
    
    setIsSyncing(true);
    setLastSyncError(null);
    
    try {
      // First check if the table schema is correct
      const schemaOk = await ThemeDatabaseService.checkTableSchema();
      if (!schemaOk) {
        console.warn('Profiles table schema check failed, skipping database sync');
        setLastSyncError('Database schema not ready - using localStorage only');
        return;
      }

      await ThemeDatabaseService.syncThemeToDatabase(newTheme, newCustomTheme);
    } catch (error) {
      console.error('Failed to sync theme to database:', error);
      setLastSyncError('Failed to sync theme preferences - using localStorage only');
    } finally {
      setIsSyncing(false);
    }
  };

  // Set base theme with persistence
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyBaseTheme(newTheme);
    
    // Save to localStorage (immediate persistence)
    if (typeof window !== 'undefined') {
      localStorage.setItem('xpeak-theme', newTheme);
    }
    
    // Sync to database (background sync)
    syncToDatabase(newTheme, customTheme);
  };

  // Set custom theme with persistence
  const setCustomTheme = (newCustomTheme: CustomTheme | null) => {
    setCustomThemeState(newCustomTheme);
    
    if (newCustomTheme) {
      applyCustomTheme(newCustomTheme.variables, newCustomTheme.isOfficial);
      
      // Save to localStorage (immediate persistence)
      if (typeof window !== 'undefined') {
        localStorage.setItem('xpeak-custom-theme', JSON.stringify(newCustomTheme));
      }
    } else {
      // Clear custom theme
      if (typeof window !== 'undefined') {
        localStorage.removeItem('xpeak-custom-theme');
      }
    }
    
    // Sync to database (background sync)
    syncToDatabase(theme, newCustomTheme);
  };

  // Clear custom theme
  const clearCustomTheme = () => {
    setCustomThemeState(null);
    
    // Remove custom theme variables from DOM
    const root = document.documentElement;
    const customProperties = [
      '--color-bg', '--color-surface', '--color-text-primary', '--color-text-secondary',
      '--color-border', '--color-primary-hover', '--color-accent-hover', '--color-surface-hover',
      '--color-text-muted', '--color-overlay', '--color-shadow', '--color-bg-dark', '--color-surface-dark'
    ];
    
    customProperties.forEach(prop => {
      root.style.removeProperty(prop);
    });
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('xpeak-custom-theme');
    }
    
    // Sync to database
    syncToDatabase(theme, null);
  };

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyBaseTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Initialize theme on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializeTheme = async () => {
      // Try to load from database first
      const dbTheme = await ThemeDatabaseService.loadThemeFromDatabase();
      
      if (dbTheme) {
        // Use database theme
        setThemeState(dbTheme.theme as Theme);
        applyBaseTheme(dbTheme.theme as Theme);
        
        if (dbTheme.customTheme && dbTheme.customTheme.variables) {
          setCustomThemeState(dbTheme.customTheme);
          applyCustomTheme(dbTheme.customTheme.variables, dbTheme.customTheme.isOfficial);
        }
        
        // Update localStorage to match database
        localStorage.setItem('xpeak-theme', dbTheme.theme);
        if (dbTheme.customTheme) {
          localStorage.setItem('xpeak-custom-theme', JSON.stringify(dbTheme.customTheme));
        }
      } else {
        // Fallback to localStorage
        const savedTheme = localStorage.getItem('xpeak-theme') as Theme | null;
        const initialTheme = savedTheme || 'system';
        
        const savedCustomTheme = localStorage.getItem('xpeak-custom-theme');
        let initialCustomTheme: CustomTheme | null = null;
        
        if (savedCustomTheme) {
          try {
            initialCustomTheme = JSON.parse(savedCustomTheme);
            // Validate the parsed custom theme
            if (!initialCustomTheme || !initialCustomTheme.variables || typeof initialCustomTheme.variables !== 'object') {
              console.warn('Invalid custom theme structure in localStorage, clearing it');
              localStorage.removeItem('xpeak-custom-theme');
              initialCustomTheme = null;
            }
          } catch (error) {
            console.warn('Failed to parse saved custom theme:', error);
            localStorage.removeItem('xpeak-custom-theme');
          }
        }
        
        setThemeState(initialTheme);
        applyBaseTheme(initialTheme);
        
        if (initialCustomTheme && initialCustomTheme.variables) {
          setCustomThemeState(initialCustomTheme);
          applyCustomTheme(initialCustomTheme.variables, initialCustomTheme.isOfficial);
        }
      }
      
      setMounted(true);
    };

    initializeTheme();
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{
        theme: 'system',
        setTheme: () => {},
        resolvedTheme: 'light',
        isDark: false,
        customTheme: null,
        setCustomTheme: () => {},
        applyCustomTheme: () => {},
        clearCustomTheme: () => {},
        isSyncing: false,
        lastSyncError: null,
      }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      resolvedTheme,
      isDark: resolvedTheme === 'dark',
      customTheme,
      setCustomTheme,
      applyCustomTheme,
      clearCustomTheme,
      isSyncing,
      lastSyncError,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useSystemTheme() {
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateTheme = () => {
      setSystemTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    };

    updateTheme();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateTheme);
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, []);

  return systemTheme;
} 