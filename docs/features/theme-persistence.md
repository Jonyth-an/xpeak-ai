# Theme Persistence System

## Overview

The theme persistence system provides robust, user-friendly theme management that automatically saves and restores user theme preferences across browser sessions. It supports both base themes (light/dark/system) and custom themes from the theme picker.

## Features

### ✅ Core Functionality
- **Automatic Persistence**: Themes are automatically saved to localStorage
- **Session Restoration**: Themes are restored when users return to the site
- **Dual Theme Support**: Works with both base themes and custom themes
- **Error Handling**: Graceful fallback if saved data is corrupted
- **Hydration Safe**: Prevents SSR/hydration mismatches

### ✅ User Experience
- **Visual Indicators**: Shows currently applied theme in the picker
- **Clear Controls**: Easy-to-use clear theme functionality
- **Status Display**: Shows theme status in header toggle
- **Tooltips**: Helpful tooltips showing current theme information

### ✅ Developer Tools
- **Export/Import**: Backup and restore theme data
- **Debug Interface**: Comprehensive debugging tools
- **Service Layer**: Clean API for theme operations
- **Type Safety**: Full TypeScript support

## Architecture

### Theme Context (`lib/ThemeContext.tsx`)

The enhanced ThemeContext provides:

```typescript
interface ThemeContextType {
  // Base theme functionality
  theme: Theme; // 'light' | 'dark' | 'system'
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  isDark: boolean;
  
  // Custom theme functionality
  customTheme: CustomTheme | null;
  setCustomTheme: (customTheme: CustomTheme | null) => void;
  applyCustomTheme: (themeVars: Record<string, string>, isOfficial: boolean) => void;
  clearCustomTheme: () => void;
}
```

### Custom Theme Interface

```typescript
interface CustomTheme {
  name: string;           // Theme name (e.g., "Ocean Breeze")
  category: string;       // Category key (e.g., "xpeakOfficial")
  isOfficial: boolean;    // Whether it's an official theme
  variables: Record<string, string>; // CSS custom properties
}
```

### Theme Service (`lib/services/themeService.ts`)

Provides a clean API for theme operations:

```typescript
// Save/retrieve base theme
ThemeService.saveBaseTheme('dark');
ThemeService.getBaseTheme(); // Returns 'dark' | null

// Save/retrieve custom theme
ThemeService.saveCustomTheme(customTheme);
ThemeService.getCustomTheme(); // Returns CustomTheme | null

// Clear themes
ThemeService.clearCustomTheme();
ThemeService.clearAllThemes();

// Export/import
ThemeService.exportThemeData(); // Returns JSON string
ThemeService.importThemeData(jsonString); // Returns boolean
```

## Storage Strategy

### localStorage Keys
- `xpeak-theme`: Base theme preference (light/dark/system)
- `xpeak-custom-theme`: Custom theme data (JSON string)

### Data Structure
```json
{
  "name": "Ocean Breeze",
  "category": "xpeakOfficial",
  "isOfficial": true,
  "variables": {
    "--color-primary": "#FF6B6B",
    "--color-accent": "#6BCEF5",
    "--color-bg": "#f0f9ff",
    // ... more CSS variables
  }
}
```

## Usage Examples

### Basic Theme Management

```typescript
import { useTheme } from '@/lib/ThemeContext';

function MyComponent() {
  const { 
    theme, 
    setTheme, 
    customTheme, 
    setCustomTheme, 
    clearCustomTheme 
  } = useTheme();

  // Set base theme
  setTheme('dark');

  // Apply custom theme
  const oceanTheme = {
    name: 'Ocean Breeze',
    category: 'xpeakOfficial',
    isOfficial: true,
    variables: { /* ... */ }
  };
  setCustomTheme(oceanTheme);

  // Clear custom theme
  clearCustomTheme();
}
```

### Theme Service Operations

```typescript
import { ThemeService } from '@/lib/services/themeService';

// Export theme data for backup
const themeData = ThemeService.exportThemeData();

// Import theme data from backup
const success = ThemeService.importThemeData(themeData);

// Check if custom theme is applied
const hasCustom = ThemeService.hasCustomTheme();

// Get debug information
const info = ThemeService.getThemeInfo();
```

## Integration Points

### Theme Picker Integration

The theme picker automatically:
- Shows currently applied theme with visual indicators
- Provides clear theme functionality
- Displays persistence status
- Handles theme application through the context

### Header Integration

The theme toggle in the header:
- Shows custom theme indicator when applied
- Displays tooltip with current theme name
- Integrates with dropdown to show theme info

### Error Handling

The system includes comprehensive error handling:
- Invalid JSON in localStorage
- Missing theme data
- Corrupted theme variables
- SSR/hydration mismatches

## Testing

### Test Page: `/test/theme-persistence`

The test page provides:
- Real-time theme state monitoring
- Storage status display
- Theme control buttons
- Export/import functionality
- Debug information
- Testing instructions

### Testing Checklist

1. **Basic Persistence**
   - [ ] Apply custom theme
   - [ ] Refresh page
   - [ ] Verify theme persists

2. **Base Theme Integration**
   - [ ] Apply custom theme
   - [ ] Change base theme (light/dark/system)
   - [ ] Verify custom theme remains

3. **Clear Functionality**
   - [ ] Apply custom theme
   - [ ] Clear custom theme
   - [ ] Verify theme is removed from storage

4. **Export/Import**
   - [ ] Apply custom theme
   - [ ] Export theme data
   - [ ] Clear all themes
   - [ ] Import theme data
   - [ ] Verify theme is restored

5. **Error Handling**
   - [ ] Corrupt localStorage data
   - [ ] Verify graceful fallback
   - [ ] Check error logging

## Performance Considerations

### Optimizations
- **Lazy Loading**: Theme data is only loaded when needed
- **Minimal Re-renders**: Context updates are optimized
- **Efficient Storage**: Only essential data is persisted
- **Cleanup**: Unused CSS variables are properly removed

### Memory Management
- Custom theme variables are cleaned up when themes are cleared
- No memory leaks from event listeners
- Efficient localStorage usage

## Future Enhancements

### Planned Features
- **Server-side Sync**: Sync themes across devices
- **Theme Analytics**: Track theme usage patterns
- **Community Themes**: User-generated theme sharing
- **Theme Presets**: Quick theme switching
- **Advanced Export**: Export themes as files

### Potential Improvements
- **Compression**: Compress theme data for storage efficiency
- **Validation**: Enhanced theme data validation
- **Migration**: Automatic theme data migration
- **Backup**: Automatic theme backup to cloud

## Troubleshooting

### Common Issues

1. **Theme not persisting**
   - Check localStorage permissions
   - Verify ThemeProvider is wrapping the app
   - Check for JavaScript errors

2. **Hydration mismatch**
   - Ensure ThemeProvider handles SSR correctly
   - Check for client-side only code

3. **Custom theme not applying**
   - Verify theme data structure
   - Check CSS variable names
   - Ensure theme is official or community type

### Debug Tools

Use the test page at `/test/theme-persistence` to:
- Monitor theme state in real-time
- Check localStorage contents
- Export/import theme data
- Clear all theme data
- View debug information

## API Reference

### ThemeContext Hooks

```typescript
// Main theme hook
const { 
  theme, 
  setTheme, 
  resolvedTheme, 
  isDark,
  customTheme,
  setCustomTheme,
  applyCustomTheme,
  clearCustomTheme 
} = useTheme();

// System theme hook
const systemTheme = useSystemTheme();
```

### ThemeService Methods

```typescript
// Storage operations
ThemeService.saveBaseTheme(theme: string): void
ThemeService.getBaseTheme(): string | null
ThemeService.saveCustomTheme(theme: CustomTheme): void
ThemeService.getCustomTheme(): CustomTheme | null
ThemeService.clearCustomTheme(): void
ThemeService.clearAllThemes(): void

// Utility operations
ThemeService.hasCustomTheme(): boolean
ThemeService.getThemeInfo(): ThemeInfo
ThemeService.exportThemeData(): string
ThemeService.importThemeData(data: string): boolean
```

### ThemeUtils Functions

```typescript
// Utility functions
themeUtils.getSystemTheme(): 'light' | 'dark'
themeUtils.applyCSSVariables(variables: Record<string, string>): void
themeUtils.removeCSSVariables(variables: string[]): void
themeUtils.getCSSVariable(name: string): string
themeUtils.isOfficialTheme(theme: CustomTheme): boolean
themeUtils.getCategoryDisplayName(category: string): string
``` 