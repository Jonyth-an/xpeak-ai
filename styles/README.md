# Design Tokens

This folder contains the design system tokens for Xpeak AI.

## Files

- `design-tokens.css` - CSS custom properties for colors, typography, spacing, shadows, and more

## Usage

### In CSS
```css
.my-component {
  color: var(--color-primary);
  background: var(--color-background);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
```

### In Tailwind Classes
```jsx
// Colors
<div className="bg-token-primary text-token-text">
<div className="bg-token-surface border-token-secondary">

// Typography
<h1 className="text-token-4xl font-bold">
<p className="text-token-lg text-token-text-secondary">

// Spacing
<div className="p-token-4 m-token-2">
<div className="space-y-token-6">

// Border Radius
<button className="rounded-token-lg">
<div className="rounded-token-2xl">

// Shadows
<div className="shadow-token-md">
<button className="shadow-token-lg hover:shadow-token-xl">

// Transitions
<div className="transition-token-base">
<button className="transition-token-fast">
```

## Token Categories

### Colors
- Primary colors (indigo-based)
- Secondary colors (cyan-based)
- Accent colors (yellow-based)
- Text colors (gray scale)
- Background colors
- Status colors (success, warning, error, info)

### Typography
- Font sizes from xs to 6xl
- All sizes are rem-based for accessibility

### Spacing
- Consistent spacing scale from 0 to 24
- Based on 0.25rem (4px) increments

### Border Radius
- Range from none to full
- Includes common UI patterns

### Shadows
- Subtle to dramatic shadow options
- Includes inner shadow for form elements

### Transitions
- Fast, base, and slow transition durations
- Consistent easing

### Z-Index
- Semantic z-index scale for layering
- Covers common UI patterns (dropdowns, modals, etc.)

## Benefits

1. **Consistency** - All components use the same design values
2. **Maintainability** - Change tokens in one place to update the entire design system
3. **Accessibility** - Rem-based sizing and proper contrast ratios
4. **Performance** - CSS custom properties are optimized by modern browsers
5. **Developer Experience** - Clear naming and comprehensive documentation 