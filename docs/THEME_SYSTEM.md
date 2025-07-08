# Theme System Documentation

## Overview

Xpeak AI now supports a comprehensive theme system with dark mode, light mode, and system preference detection. The theme system is built on top of CSS custom properties (design tokens) and provides a seamless user experience with automatic theme switching and persistent preferences.

## Features

- 🌙 **Dark Mode Support** - Complete dark theme with optimized colors
- ☀️ **Light Mode Support** - Beautiful light theme (default)
- 🔄 **System Preference Detection** - Automatically follows OS theme preference
- 💾 **Persistent Storage** - Remembers user's theme choice
- 🎨 **Design Token Integration** - Built on existing design token system
- ⚡ **Smooth Transitions** - Animated theme switching
- 📱 **Responsive Design** - Works across all device sizes

## Quick Start

### 1. Theme Provider Setup

The theme system is already integrated into the root layout:

```tsx
// app/layout.tsx
import { ThemeProvider } from '@/lib/ThemeContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 2. Using Theme Toggle Components

```tsx
import { ThemeToggle, CompactThemeToggle } from '@/app/components/ThemeToggle';

// Simple toggle button
<ThemeToggle variant="button" />

// Dropdown with all options
<ThemeToggle variant="dropdown" />

// Compact version for mobile
<CompactThemeToggle />
```

### 3. Using Theme Hook

```tsx
import { useTheme } from '@/lib/ThemeContext';

function MyComponent() {
  const { theme, setTheme, resolvedTheme, isDark } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Resolved theme: {resolvedTheme}</p>
      <p>Is dark mode: {isDark ? 'Yes' : 'No'}</p>
      
      <button onClick={() => setTheme('dark')}>Switch to Dark</button>
      <button onClick={() => setTheme('light')}>Switch to Light</button>
      <button onClick={() => setTheme('system')}>Use System</button>
    </div>
  );
}
```

## Theme Context API

### `useTheme()` Hook

Returns an object with the following properties:

- `theme: 'light' | 'dark' | 'system'` - Current theme setting
- `setTheme: (theme: 'light' | 'dark' | 'system') => void` - Function to change theme
- `resolvedTheme: 'light' | 'dark'` - Actual applied theme (resolves 'system')
- `isDark: boolean` - Convenience boolean for dark mode

### `useSystemTheme()` Hook

Returns the current system theme preference:

```tsx
import { useSystemTheme } from '@/lib/ThemeContext';

function MyComponent() {
  const systemTheme = useSystemTheme(); // 'light' | 'dark'
  
  return (
    <div>
      System prefers: {systemTheme}
    </div>
  );
}
```

## Design Tokens

The theme system uses CSS custom properties that automatically switch between light and dark values:

### Color Tokens

```css
/* Light mode (default) */
:root {
  --color-bg: #FDFDFD;
  --color-surface: #f9fafb;
  --color-text: #1E1E2F;
  --color-primary: #FF6B6B;
  --color-secondary: #3EE8B5;
  --color-accent: #6BCEF5;
}

/* Dark mode */
[data-theme="dark"] {
  --color-bg: #0F0F0F;
  --color-surface: #1A1A1A;
  --color-text: #FFFFFF;
  --color-primary: #FF8787;
  --color-secondary: #5EEAD4;
  --color-accent: #7DD3FC;
}
```

### Usage in Components

```tsx
// Use design token classes
<div className="bg-token-bg text-token-text">
  <div className="bg-token-surface border-token-border">
    <h1 className="text-token-primary">Title</h1>
    <p className="text-token-text-secondary">Content</p>
  </div>
</div>

// Or use CSS custom properties directly
<div style={{ 
  backgroundColor: 'var(--color-bg)',
  color: 'var(--color-text)'
}}>
  Content
</div>
```

## Theme Toggle Components

### ThemeToggle

A flexible theme toggle component with multiple variants.

#### Props

- `variant?: 'button' | 'dropdown'` - Display variant (default: 'button')
- `className?: string` - Additional CSS classes

#### Examples

```tsx
// Simple toggle button
<ThemeToggle />

// Dropdown with all theme options
<ThemeToggle variant="dropdown" />

// With custom styling
<ThemeToggle className="my-custom-class" />
```

### CompactThemeToggle

A minimal theme toggle for compact spaces like mobile headers.

```tsx
<CompactThemeToggle />
```

## Implementation Details

### Theme Storage

User preferences are stored in `localStorage` with the key `xpeak-theme`:

```javascript
// Save theme
localStorage.setItem('xpeak-theme', 'dark');

// Load theme
const savedTheme = localStorage.getItem('xpeak-theme');
```

### System Preference Detection

The system automatically detects and responds to OS theme changes:

```javascript
// Media query for dark mode preference
window.matchMedia('(prefers-color-scheme: dark)').matches
```

### CSS Implementation

Themes are applied using the `data-theme` attribute on the document root:

```css
/* Light theme */
html[data-theme="light"] {
  /* Light mode variables */
}

/* Dark theme */
html[data-theme="dark"] {
  /* Dark mode variables */
}

/* System preference (when no explicit theme is set) */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    /* Dark mode variables */
  }
}
```

## Best Practices

### 1. Use Design Tokens

Always use design token classes instead of hardcoded colors:

```tsx
// ✅ Good
<div className="bg-token-surface text-token-text border-token-border">

// ❌ Bad
<div className="bg-gray-100 text-gray-900 border-gray-200">
```

### 2. Test Both Themes

Always test your components in both light and dark modes:

```tsx
// Test page: /test/theme-demo
```

### 3. Consider Contrast

Ensure sufficient contrast ratios in both themes:

```css
/* High contrast text */
.text-token-text { /* 4.5:1 minimum */ }

/* Large text */
.text-token-text-secondary { /* 3:1 minimum */ }
```

### 4. Smooth Transitions

Add transition classes for smooth theme switching:

```tsx
<div className="transition-colors duration-200">
  {/* Content */}
</div>
```

### 5. Icon Considerations

Use icons that work well in both themes:

```tsx
// Icons automatically inherit text color
<Sun className="text-token-text-secondary" />
<Moon className="text-token-text-secondary" />
```

## Migration Guide

### From Hardcoded Colors

```tsx
// Before
<div className="bg-white text-black border-gray-200">

// After
<div className="bg-token-surface text-token-text border-token-border">
```

### From Tailwind Colors

```tsx
// Before
<div className="bg-gray-50 text-gray-900">

// After
<div className="bg-token-surface text-token-text">
```

### From CSS Variables

```tsx
// Before
<div style={{ backgroundColor: 'var(--bg-color)' }}>

// After
<div className="bg-token-bg">
```

## Troubleshooting

### Theme Not Switching

1. Check if `ThemeProvider` is wrapping your app
2. Verify `suppressHydrationWarning` is on the `<html>` tag
3. Check browser console for errors

### Colors Not Updating

1. Ensure you're using design token classes (`bg-token-*`, `text-token-*`)
2. Check if CSS custom properties are being applied
3. Verify the `data-theme` attribute is set on the document root

### Hydration Mismatch

1. Use `suppressHydrationWarning` on the `<html>` tag
2. Ensure theme state is properly initialized
3. Check for server/client rendering differences

## Future Enhancements

### Planned Features

- 🌈 **Custom Themes** - User-defined color schemes
- 🎨 **Theme Editor** - Visual theme customization
- 🌍 **Regional Themes** - Location-based theme preferences
- ⏰ **Time-based Themes** - Automatic switching based on time
- 🎭 **Brand Themes** - Partner/customer specific themes

### Extensibility

The theme system is designed to be easily extensible:

```tsx
// Add custom theme
const customTheme = {
  name: 'custom',
  colors: {
    primary: '#custom-color',
    // ... other colors
  }
};

// Extend theme context
const extendedTheme = {
  ...baseTheme,
  custom: customTheme
};
```

## Examples

### Complete Component Example

```tsx
'use client';

import React from 'react';
import { useTheme } from '@/lib/ThemeContext';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { Card, Button, Text } from '@/app/components/ui';

export function ThemeAwareComponent() {
  const { theme, isDark, setTheme } = useTheme();

  return (
    <Card className="p-6 bg-token-surface border-token-border">
      <div className="flex items-center justify-between mb-4">
        <Text variant="h3" className="text-token-text">
          Theme Aware Component
        </Text>
        <ThemeToggle />
      </div>
      
      <div className="space-y-4">
        <div className="p-4 bg-token-surface-subtle rounded-token-md">
          <Text className="text-token-text-secondary">
            Current theme: <strong className="text-token-primary">{theme}</strong>
          </Text>
          <Text className="text-token-text-secondary">
            Is dark mode: <strong className="text-token-primary">{isDark ? 'Yes' : 'No'}</strong>
          </Text>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="primary" 
            onClick={() => setTheme('light')}
            disabled={theme === 'light'}
          >
            Light
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => setTheme('dark')}
            disabled={theme === 'dark'}
          >
            Dark
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setTheme('system')}
            disabled={theme === 'system'}
          >
            System
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

### Header Integration

```tsx
// components/Header.tsx
import { ThemeToggle } from '@/app/components/ThemeToggle';

export function Header() {
  return (
    <header className="bg-token-surface border-b border-token-border">
      <div className="flex items-center justify-between">
        <Logo />
        <nav>{/* Navigation items */}</nav>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <ThemeToggle variant="button" />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
```

## Testing

### Manual Testing

1. Visit `/test/theme-demo` to see all theme features
2. Test theme switching with the toggle buttons
3. Change system theme and verify automatic switching
4. Refresh page to verify persistence

### Automated Testing

```tsx
// Example test
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@/lib/ThemeContext';
import { ThemeToggle } from '@/app/components/ThemeToggle';

test('theme toggle switches themes', () => {
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
  
  const toggle = screen.getByRole('button');
  fireEvent.click(toggle);
  
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
});
```

## Performance Considerations

- Theme switching is optimized with CSS custom properties
- No re-renders required for theme changes
- Minimal JavaScript overhead
- Efficient localStorage usage
- Smooth CSS transitions

## Browser Support

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers
- ⚠️ IE11 (limited support)

## Contributing

When adding new components or features:

1. Use design tokens for all colors
2. Test in both light and dark modes
3. Ensure proper contrast ratios
4. Add smooth transitions
5. Update documentation

---

For more information, see the [Design Tokens Documentation](./DESIGN_TOKENS_SYSTEM.md) and [Theme Demo Page](/test/theme-demo). 