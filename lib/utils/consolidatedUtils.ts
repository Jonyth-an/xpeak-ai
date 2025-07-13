// Comprehensive utility consolidation
// Eliminates duplicate utility functions across the codebase

import { format, formatDistance, formatRelative, isValid, parseISO } from 'date-fns';

// ============================================================================
// DATE & TIME UTILITIES
// ============================================================================

export const dateUtils = {
  // Format date to readable string
  format: (date: Date | string, formatStr: string = 'MMM dd, yyyy'): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, formatStr) : 'Invalid date';
  },

  // Format relative time (e.g., "2 hours ago")
  formatRelative: (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? formatDistance(dateObj, new Date(), { addSuffix: true }) : 'Invalid date';
  },

  // Format relative to now
  formatRelativeToNow: (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? formatRelative(dateObj, new Date()) : 'Invalid date';
  },

  // Check if date is today
  isToday: (date: Date | string): boolean => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const today = new Date();
    return format(dateObj, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  },

  // Check if date is this week
  isThisWeek: (date: Date | string): boolean => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    return dateObj >= weekStart && dateObj <= weekEnd;
  },

  // Get timezone offset string
  getTimezoneOffset: (): string => {
    const offset = new Date().getTimezoneOffset();
    const hours = Math.abs(Math.floor(offset / 60));
    const minutes = Math.abs(offset % 60);
    const sign = offset > 0 ? '-' : '+';
    return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  },

  // Parse date string safely
  parseSafe: (dateString: string): Date | null => {
    const date = parseISO(dateString);
    return isValid(date) ? date : null;
  }
};

// ============================================================================
// STRING UTILITIES
// ============================================================================

export const stringUtils = {
  // Capitalize first letter
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // Convert to title case
  toTitleCase: (str: string): string => {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  },

  // Truncate string with ellipsis
  truncate: (str: string, length: number, suffix: string = '...'): string => {
    return str.length > length ? str.substring(0, length) + suffix : str;
  },

  // Remove extra whitespace
  normalizeWhitespace: (str: string): string => {
    return str.replace(/\s+/g, ' ').trim();
  },

  // Generate initials from name
  getInitials: (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  },

  // Slugify string for URLs
  slugify: (str: string): string => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  },

  // Check if string is valid email
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Check if string is valid URL
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Generate random string
  randomString: (length: number = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};

// ============================================================================
// NUMBER UTILITIES
// ============================================================================

export const numberUtils = {
  // Format currency
  formatCurrency: (amount: number, currency: string = 'USD', locale: string = 'en-US'): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  // Format number with commas
  formatNumber: (num: number, locale: string = 'en-US'): string => {
    return new Intl.NumberFormat(locale).format(num);
  },

  // Format percentage
  formatPercentage: (value: number, decimals: number = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  // Clamp number between min and max
  clamp: (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  },

  // Round to specified decimal places
  round: (value: number, decimals: number = 2): number => {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },

  // Check if number is in range
  isInRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },

  // Generate random number in range
  randomInRange: (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

export const arrayUtils = {
  // Remove duplicates from array
  unique: <T>(arr: T[]): T[] => {
    return [...new Set(arr)];
  },

  // Group array by key
  groupBy: <T, K extends keyof T>(arr: T[], key: K): Record<string, T[]> => {
    return arr.reduce((groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  // Sort array by key
  sortBy: <T, K extends keyof T>(arr: T[], key: K, direction: 'asc' | 'desc' = 'asc'): T[] => {
    return [...arr].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  },

  // Chunk array into smaller arrays
  chunk: <T>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  },

  // Flatten nested arrays
  flatten: <T>(arr: T[][]): T[] => {
    return arr.reduce((flat, item) => flat.concat(item), [] as T[]);
  },

  // Find item by key-value pair
  findBy: <T, K extends keyof T>(arr: T[], key: K, value: T[K]): T | undefined => {
    return arr.find(item => item[key] === value);
  },

  // Filter array by multiple conditions
  filterBy: <T>(arr: T[], filters: Partial<T>): T[] => {
    return arr.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        return item[key as keyof T] === value;
      });
    });
  }
};

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

export const objectUtils = {
  // Deep clone object
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as T;
    if (obj instanceof Array) return obj.map(item => objectUtils.deepClone(item)) as T;
    if (typeof obj === 'object') {
      const clonedObj = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = objectUtils.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
    return obj;
  },

  // Pick specific keys from object
  pick: <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  },

  // Omit specific keys from object
  omit: <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  },

  // Check if object is empty
  isEmpty: (obj: any): boolean => {
    if (obj == null) return true;
    if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
    return Object.keys(obj).length === 0;
  },

  // Merge objects deeply
  deepMerge: <T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T => {
    if (!sources.length) return target;
    const source = sources.shift();
    if (source === undefined) return target;

    if (isObject(target) && isObject(source)) {
      for (const key in source) {
        if (isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          objectUtils.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return objectUtils.deepMerge(target, ...sources);
  }
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export const validationUtils = {
  // Check if value is required
  required: (value: any): boolean => {
    return value !== null && value !== undefined && value !== '';
  },

  // Check if value is valid email
  email: (value: string): boolean => {
    return stringUtils.isValidEmail(value);
  },

  // Check if value is valid URL
  url: (value: string): boolean => {
    return stringUtils.isValidUrl(value);
  },

  // Check if value is valid phone number
  phone: (value: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
  },

  // Check if value is valid password
  password: (value: string, minLength: number = 8): boolean => {
    return value.length >= minLength;
  },

  // Check if value is in range
  inRange: (value: number, min: number, max: number): boolean => {
    return numberUtils.isInRange(value, min, max);
  },

  // Check if value matches pattern
  matches: (value: string, pattern: RegExp): boolean => {
    return pattern.test(value);
  }
};

// ============================================================================
// COLOR UTILITIES
// ============================================================================

export const colorUtils = {
  // Convert hex to RGB
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  // Convert RGB to hex
  rgbToHex: (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  },

  // Check if color is light or dark
  isLight: (hex: string): boolean => {
    const rgb = colorUtils.hexToRgb(hex);
    if (!rgb) return false;
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128;
  },

  // Generate random color
  randomColor: (): string => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }
};

// ============================================================================
// DEBOUNCE & THROTTLE UTILITIES
// ============================================================================

export const debounceUtils = {
  // Debounce function
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// ============================================================================
// LOCAL STORAGE UTILITIES
// ============================================================================

export const storageUtils = {
  // Set item in localStorage
  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  // Get item from localStorage
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue || null;
    }
  },

  // Remove item from localStorage
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  // Clear all localStorage
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

export const errorUtils = {
  // Safe JSON parse
  safeJsonParse: <T>(json: string, defaultValue?: T): T | null => {
    try {
      return JSON.parse(json);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return defaultValue || null;
    }
  },

  // Safe function execution
  safeExecute: <T>(fn: () => T, defaultValue?: T): T | null => {
    try {
      return fn();
    } catch (error) {
      console.error('Error executing function:', error);
      return defaultValue || null;
    }
  },

  // Retry function with exponential backoff
  retry: async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> => {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError!;
  }
};

// ============================================================================
// ASYNC UTILITIES
// ============================================================================

export const asyncUtils = {
  // Delay execution
  delay: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Timeout promise
  timeout: <T>(promise: Promise<T>, ms: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), ms)
      )
    ]);
  },

  // Retry with delay
  retryWithDelay: async <T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        await asyncUtils.delay(delay);
        return asyncUtils.retryWithDelay(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// ============================================================================
// EXPORT ALL UTILITIES
// ============================================================================

export const consolidatedUtils = {
  date: dateUtils,
  string: stringUtils,
  number: numberUtils,
  array: arrayUtils,
  object: objectUtils,
  validation: validationUtils,
  color: colorUtils,
  debounce: debounceUtils,
  storage: storageUtils,
  error: errorUtils,
  async: asyncUtils
}; 