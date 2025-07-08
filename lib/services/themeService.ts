import { CustomTheme } from '../ThemeContext';

// Theme storage keys
const THEME_STORAGE_KEY = 'xpeak-theme';
const CUSTOM_THEME_STORAGE_KEY = 'xpeak-custom-theme';

// Theme service class
export class ThemeService {
  // Save base theme (light/dark/system)
  static saveBaseTheme(theme: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }

  // Get saved base theme
  static getBaseTheme(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(THEME_STORAGE_KEY);
    }
    return null;
  }

  // Save custom theme
  static saveCustomTheme(customTheme: CustomTheme): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(customTheme));
    }
  }

  // Get saved custom theme
  static getCustomTheme(): CustomTheme | null {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.warn('Failed to parse saved custom theme:', error);
          localStorage.removeItem(CUSTOM_THEME_STORAGE_KEY);
        }
      }
    }
    return null;
  }

  // Clear custom theme
  static clearCustomTheme(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CUSTOM_THEME_STORAGE_KEY);
    }
  }

  // Clear all theme data
  static clearAllThemes(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(THEME_STORAGE_KEY);
      localStorage.removeItem(CUSTOM_THEME_STORAGE_KEY);
    }
  }

  // Check if a custom theme is applied
  static hasCustomTheme(): boolean {
    return this.getCustomTheme() !== null;
  }

  // Get theme info for debugging/analytics
  static getThemeInfo(): {
    baseTheme: string | null;
    customTheme: CustomTheme | null;
    hasCustomTheme: boolean;
  } {
    return {
      baseTheme: this.getBaseTheme(),
      customTheme: this.getCustomTheme(),
      hasCustomTheme: this.hasCustomTheme(),
    };
  }

  // Export theme data (for backup/transfer)
  static exportThemeData(): string {
    const data = {
      baseTheme: this.getBaseTheme(),
      customTheme: this.getCustomTheme(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  // Import theme data (for restore/transfer)
  static importThemeData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.baseTheme) {
        this.saveBaseTheme(parsed.baseTheme);
      }
      
      if (parsed.customTheme) {
        this.saveCustomTheme(parsed.customTheme);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import theme data:', error);
      return false;
    }
  }
}

// Utility functions
export const themeUtils = {
  // Get system theme preference
  getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },

  // Apply CSS variables to document root
  applyCSSVariables(variables: Record<string, string>): void {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  },

  // Remove CSS variables from document root
  removeCSSVariables(variables: string[]): void {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    variables.forEach(prop => {
      root.style.removeProperty(prop);
    });
  },

  // Get computed CSS variable value
  getCSSVariable(name: string): string {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  },

  // Check if theme is official
  isOfficialTheme(theme: CustomTheme): boolean {
    return theme.isOfficial;
  },

  // Get theme category display name
  getCategoryDisplayName(category: string): string {
    const categoryNames: Record<string, string> = {
      xpeakOfficial: 'Xpeak Official',
      nature: 'Nature Themes',
      colorVibe: 'Color Vibe Themes',
      mood: 'Mood Themes',
      minimalChic: 'Minimal Chic Themes',
    };
    return categoryNames[category] || category;
  },
}; 