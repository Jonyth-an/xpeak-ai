# Comprehensive Design Token System

This document outlines the complete design token system for Xpeak AI, covering colors, typography, spacing, borders, shadows, animations, and more.

## Table of Contents

1. [Color System](#color-system)
2. [Typography System](#typography-system)
3. [Spacing System](#spacing-system)
4. [Border System](#border-system)
5. [Shadow System](#shadow-system)
6. [Animation System](#animation-system)
7. [Layout System](#layout-system)
8. [Z-Index System](#z-index-system)
9. [Utility Classes](#utility-classes)
10. [Component Classes](#component-classes)
11. [Usage Guidelines](#usage-guidelines)

## Color System

### Brand Colors
- `--color-primary`: Electric Coral (#FF6B6B)
- `--color-secondary`: Sky Mint (#3EE8B5)
- `--color-accent`: Glow Blue (#6BCEF5)

### Semantic Colors
- `--color-success`: Green for success states
- `--color-warning`: Amber for warning states
- `--color-error`: Red for error states
- `--color-info`: Blue for informational states

### Background Colors
- `--color-bg`: Main background (#FDFDFD)
- `--color-surface`: Card and surface backgrounds
- `--color-bg-muted`: Muted background
- `--color-bg-overlay`: Overlay background

### Text Colors
- `--color-text`: Primary text (#1E1E2F)
- `--color-text-secondary`: Secondary text
- `--color-text-muted`: Muted text
- `--color-text-inverse`: Inverse text (white)

## Typography System

### Font Sizes
```css
--font-xs: 0.75rem;      /* 12px */
--font-sm: 0.875rem;     /* 14px */
--font-base: 1rem;       /* 16px */
--font-md: 1.125rem;     /* 18px */
--font-lg: 1.25rem;      /* 20px */
--font-xl: 1.5rem;       /* 24px */
--font-2xl: 1.875rem;    /* 30px */
--font-3xl: 2.25rem;     /* 36px */
--font-4xl: 3rem;        /* 48px */
--font-5xl: 4rem;        /* 64px */
```

### Font Weights
- `--font-weight-regular`: 400
- `--font-weight-medium`: 500
- `--font-weight-semibold`: 600
- `--font-weight-bold`: 700

### Line Heights
- `--line-height-tight`: 1.25
- `--line-height-normal`: 1.5
- `--line-height-relaxed`: 1.75

### Letter Spacing
- `--letter-spacing-tight`: -0.01em
- `--letter-spacing-normal`: 0
- `--letter-spacing-wide`: 0.02em

## Spacing System

### Base Spacing Scale
```css
--space-xs: 0.25rem;     /* 4px */
--space-sm: 0.5rem;      /* 8px */
--space-md: 1rem;        /* 16px */
--space-lg: 1.5rem;      /* 24px */
--space-xl: 2rem;        /* 32px */
--space-2xl: 3rem;       /* 48px */
--space-3xl: 4rem;       /* 64px */
--space-4xl: 6rem;       /* 96px */
```

### Extended Spacing Scale
```css
--space-0: 0;
--space-1: 0.25rem;      /* 4px */
--space-2: 0.5rem;       /* 8px */
--space-3: 0.75rem;      /* 12px */
--space-4: 1rem;         /* 16px */
--space-5: 1.25rem;      /* 20px */
--space-6: 1.5rem;       /* 24px */
--space-8: 2rem;         /* 32px */
--space-10: 2.5rem;      /* 40px */
--space-12: 3rem;        /* 48px */
--space-16: 4rem;        /* 64px */
--space-20: 5rem;        /* 80px */
--space-24: 6rem;        /* 96px */
--space-32: 8rem;        /* 128px */
--space-40: 10rem;       /* 160px */
--space-48: 12rem;       /* 192px */
--space-56: 14rem;       /* 224px */
--space-64: 16rem;       /* 256px */
```

## Border System

### Border Radius
```css
--radius-none: 0;
--radius-xs: 2px;
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 24px;
--radius-3xl: 32px;
--radius-full: 9999px;
```

### Border Widths
```css
--border-thin: 1px;
--border-regular: 2px;
--border-thick: 4px;
```

### Border Colors
- `--color-border`: Light neutral border
- `--color-border-strong`: Stronger border
- `--color-border-focus`: Focus state border
- `--color-border-error`: Error state border
- `--color-border-success`: Success state border
- `--color-border-warning`: Warning state border

## Shadow System

### Shadow Scale
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.15);
--shadow-xl: 0 20px 30px rgba(0, 0, 0, 0.2);
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);
--shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-glow: 0 0 20px rgba(107, 206, 245, 0.3);
```

## Animation System

### Transitions
```css
--transition-fast: 150ms ease-in-out;
--transition-base: 250ms ease-in-out;
--transition-slow: 400ms ease;
```

### Motion Curves
```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Animation Durations
```css
--duration-75: 75ms;
--duration-100: 100ms;
--duration-150: 150ms;
--duration-200: 200ms;
--duration-300: 300ms;
--duration-500: 500ms;
--duration-700: 700ms;
--duration-1000: 1000ms;
```

## Layout System

### Container Widths
```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

### Grid System
```css
--grid-gutter: 1.5rem;
--grid-gap-sm: 0.75rem;
--grid-gap-md: 1.5rem;
--grid-gap-lg: 2.5rem;
```

### Aspect Ratios
```css
--aspect-square: 1 / 1;
--aspect-video: 16 / 9;
--aspect-photo: 4 / 3;
--aspect-wide: 21 / 9;
--aspect-ultrawide: 32 / 9;
```

## Z-Index System

### Z-Index Scale
```css
--z-auto: auto;
--z-default: 0;
--z-10: 10;
--z-20: 20;
--z-30: 30;
--z-40: 40;
--z-50: 50;
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
--z-toast: 1080;
```

## Utility Classes

### Border Radius Utilities
```css
.radius-none, .radius-xs, .radius-sm, .radius-md, .radius-lg, .radius-xl, .radius-2xl, .radius-3xl, .radius-full
```

### Shadow Utilities
```css
.shadow-none, .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl, .shadow-2xl, .shadow-inner, .shadow-glow
```

### Transition Utilities
```css
.transition-none, .transition-fast, .transition-base, .transition-slow
```

### Z-Index Utilities
```css
.z-auto, .z-0, .z-10, .z-20, .z-30, .z-40, .z-50, .z-dropdown, .z-sticky, .z-fixed, .z-modal, .z-toast, .z-tooltip
```

### Opacity Utilities
```css
.opacity-0, .opacity-25, .opacity-50, .opacity-75, .opacity-100
```

### Container Utilities
```css
.container-sm, .container-md, .container-lg, .container-xl, .container-2xl
```

### Animation Utilities
```css
.duration-75, .duration-100, .duration-150, .duration-200, .duration-300, .duration-500, .duration-700, .duration-1000
.ease-linear, .ease-in, .ease-out, .ease-in-out, .ease-bounce
```

## Component Classes

### Semantic Component Classes
```css
.card, .button, .modal, .dropdown, .tooltip, .toast
```

### Layout Component Classes
```css
.container, .grid, .flex
```

### Interactive States
```css
.interactive, .focus-ring, .loading, .disabled
```

## Usage Guidelines

### 1. Color Usage
- Use semantic colors for states (success, warning, error, info)
- Use brand colors for primary actions and highlights
- Use neutral colors for backgrounds and borders
- Ensure sufficient contrast ratios for accessibility

### 2. Typography Usage
- Use semantic font sizes for consistent hierarchy
- Apply appropriate line heights for readability
- Use font weights to create visual hierarchy
- Consider letter spacing for headings and display text

### 3. Spacing Usage
- Use the spacing scale consistently across components
- Apply larger spacing for sections and smaller for elements
- Use consistent spacing within component groups
- Consider responsive spacing adjustments

### 4. Border Usage
- Use consistent border radius for similar components
- Apply appropriate border widths for emphasis
- Use semantic border colors for states
- Consider border removal for minimal designs

### 5. Shadow Usage
- Use shadows to create depth and hierarchy
- Apply consistent shadow levels for similar components
- Use glow shadows sparingly for special effects
- Consider shadow removal for flat designs

### 6. Animation Usage
- Use fast transitions for micro-interactions
- Apply base transitions for standard interactions
- Use slow transitions for major state changes
- Apply appropriate easing curves for natural motion

### 7. Layout Usage
- Use container widths for consistent page layouts
- Apply grid gaps for consistent spacing
- Use aspect ratios for media content
- Consider responsive breakpoints

### 8. Z-Index Usage
- Use the z-index scale systematically
- Apply higher z-index values for overlays and modals
- Use sticky and fixed positioning appropriately
- Consider stacking context implications

## Migration Guide

### From Hardcoded Values
1. Replace hardcoded colors with semantic color tokens
2. Replace hardcoded spacing with spacing scale tokens
3. Replace hardcoded border radius with radius tokens
4. Replace hardcoded shadows with shadow tokens
5. Replace hardcoded transitions with transition tokens

### From Tailwind Classes
1. Replace `bg-blue-500` with `background: var(--color-primary)`
2. Replace `p-4` with `padding: var(--space-md)`
3. Replace `rounded-lg` with `border-radius: var(--radius-lg)`
4. Replace `shadow-md` with `box-shadow: var(--shadow-md)`
5. Replace `transition-all` with `transition: var(--transition-base)`

## Best Practices

1. **Consistency**: Always use design tokens instead of hardcoded values
2. **Semantic Naming**: Use semantic token names that describe their purpose
3. **Accessibility**: Ensure all color combinations meet WCAG contrast requirements
4. **Performance**: Use CSS custom properties for dynamic theming
5. **Maintainability**: Document token usage and update tokens systematically
6. **Responsive Design**: Use responsive variants of tokens when needed
7. **Dark Mode**: Consider dark mode variants for all tokens
8. **Testing**: Test token usage across different components and contexts

## Examples

### Card Component
```css
.card {
  background: var(--color-surface);
  border: var(--border-thin) solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-md);
  transition: var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

### Button Component
```css
.button {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  font-weight: var(--font-weight-medium);
  transition: var(--transition-fast);
  cursor: pointer;
}

.button:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```

### Modal Component
```css
.modal {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  padding: var(--space-lg);
  z-index: var(--z-modal);
  max-width: var(--container-md);
  margin: 0 auto;
}
```

This comprehensive design token system provides a solid foundation for consistent, accessible, and maintainable UI development across the Xpeak AI platform. 