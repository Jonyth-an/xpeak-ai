# 🎨 Complete Design Token System

## Overview

The Xpeak AI design token system provides a comprehensive, semantic, and maintainable approach to styling across the entire application. This system ensures consistency, accessibility, and easy theming through CSS custom properties and utility classes.

## 🎯 Core Principles

- **Semantic Naming**: Tokens are named by their purpose, not their appearance
- **Accessibility First**: All colors meet WCAG AA/AAA contrast requirements
- **Scalable**: Easy to extend and modify across the entire application
- **Maintainable**: Single source of truth for all design decisions
- **Performance**: No runtime calculations, all values are pre-defined

## 📁 File Structure

```
styles/
├── design-tokens.css          # Core design token definitions
└── README.md                  # Design token documentation

app/
├── globals.css               # Utility classes and global styles
└── components/ui/
    ├── Typography.tsx        # Typography component system
    └── index.ts              # Component exports
```

## 🎨 Color System

### Primary Colors
- `--color-primary`: Electric Coral (#FF6B6B)
- `--color-secondary`: Sky Mint (#3EE8B5)
- `--color-accent`: Glow Blue (#6BCEF5)

### Semantic Colors
- `--color-success`: Green (#22C55E)
- `--color-warning`: Amber (#F59E0B)
- `--color-error`: Red (#EF4444)
- `--color-info`: Blue (#3B82F6)

### Background Colors
- `--color-bg`: Main background (#FDFDFD)
- `--color-surface`: Card surfaces (#f9fafb)
- `--color-elevated`: Elevated surfaces (#ffffff)

### Text Colors
- `--color-text`: Primary text (#1E1E2F)
- `--color-text-secondary`: Secondary text (#475569)
- `--color-text-tertiary`: Tertiary text (#64748B)

## 📝 Typography System

### Font Families
```css
--font-family-sans: 'Inter', 'Helvetica Neue', sans-serif;
--font-family-serif: 'Georgia', serif;
--font-family-mono: 'JetBrains Mono', monospace;
```

### Font Weights
```css
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Line Heights
```css
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

### Letter Spacing
```css
--letter-spacing-tight: -0.01em;
--letter-spacing-normal: 0;
--letter-spacing-wide: 0.02em;
```

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

### Semantic Typography Scale

#### Display Text (Hero Headlines)
- `--text-display-2xl`: 4rem (64px) - Hero headlines
- `--text-display-xl`: 3rem (48px) - Large headlines
- `--text-display-lg`: 2.25rem (36px) - Main headlines
- `--text-display-md`: 1.875rem (30px) - Section headlines
- `--text-display-sm`: 1.5rem (24px) - Subsection headlines
- `--text-display-xs`: 1.25rem (20px) - Small headlines

#### Headings
- `--text-heading-xl`: 1.25rem (20px) - Large headings
- `--text-heading-lg`: 1.125rem (18px) - Main headings
- `--text-heading-md`: 1rem (16px) - Sub headings
- `--text-heading-sm`: 0.875rem (14px) - Small headings

#### Body Text
- `--text-body-xl`: 1.125rem (18px) - Large body text
- `--text-body-lg`: 1rem (16px) - Main body text
- `--text-body-md`: 0.875rem (14px) - Small body text
- `--text-body-sm`: 0.75rem (12px) - Caption text
- `--text-body-xs`: 0.625rem (10px) - Micro text

## 📏 Spacing System

### Base Spacing Scale
```css
--space-0: 0;
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
--space-32: 8rem;      /* 128px */
--space-40: 10rem;     /* 160px */
--space-48: 12rem;     /* 192px */
--space-56: 14rem;     /* 224px */
--space-64: 16rem;     /* 256px */
```

### Semantic Spacing
```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */
--space-3xl: 4rem;     /* 64px */
--space-4xl: 6rem;     /* 96px */
```

## 🎯 Usage Examples

### Typography Components

```tsx
import { Typography, DisplayLG, HeadingMD, BodyLG } from '@/app/components/ui';

// Using the main Typography component
<Typography variant="display-lg" color="primary" weight="bold">
  Hero Headline
</Typography>

// Using convenience components
<DisplayLG color="primary" weight="bold">
  Hero Headline
</DisplayLG>

<HeadingMD color="secondary" align="center">
  Section Heading
</HeadingMD>

<BodyLG color="tertiary" leading="relaxed">
  Body text with relaxed line height for better readability.
</BodyLG>
```

### Utility Classes

```tsx
// Typography utilities
<div className="text-token-display-lg font-token-bold text-token-primary">
  Large Display Text
</div>

<div className="text-token-heading-md font-token-semibold text-token-secondary text-token-center">
  Centered Heading
</div>

<div className="text-token-body-lg text-token-tertiary leading-token-relaxed">
  Body text with relaxed line height
</div>

// Spacing utilities
<div className="p-token-lg m-token-xl">
  Content with large padding and margin
</div>

<div className="px-token-md py-token-sm">
  Content with medium horizontal padding and small vertical padding
</div>

<div className="gap-token-md">
  Flexbox container with medium gap
</div>

// Color utilities
<div className="bg-token-surface text-token-primary border border-token">
  Card with surface background
</div>

<div className="bg-token-success/20 text-token-success">
  Success message with light background
</div>
```

### Layout Utilities

```tsx
// Container utilities
<div className="container-token-lg mx-auto">
  Centered container with large max-width
</div>

// Z-index utilities
<div className="z-token-modal">
  Modal content
</div>

// Aspect ratio utilities
<div className="aspect-token-video">
  Video container with 16:9 aspect ratio
</div>

// Animation utilities
<div className="transition-token-base ease-token-in-out">
  Smoothly animated element
</div>
```

## 🔧 Migration Guide

### From Hardcoded Colors
```tsx
// Before
<div className="text-gray-800 bg-blue-500 border-red-300">
  Content
</div>

// After
<div className="text-token-primary bg-token-accent border-token-error">
  Content
</div>
```

### From Hardcoded Typography
```tsx
// Before
<h1 className="text-3xl font-bold text-gray-900">
  Heading
</h1>

// After
<Typography variant="display-lg" weight="bold" color="primary">
  Heading
</Typography>

// Or using utility classes
<h1 className="text-token-display-lg font-token-bold text-token-primary">
  Heading
</h1>
```

### From Hardcoded Spacing
```tsx
// Before
<div className="p-6 m-4 gap-3">
  Content
</div>

// After
<div className="p-token-lg m-token-md gap-token-sm">
  Content
</div>
```

## 🎨 Theming

The design token system makes theming easy by changing CSS custom properties:

```css
/* Light theme (default) */
:root {
  --color-bg: #FDFDFD;
  --color-text: #1E1E2F;
  --color-surface: #f9fafb;
}

/* Dark theme */
[data-theme="dark"] {
  --color-bg: #1a1a1a;
  --color-text: #ffffff;
  --color-surface: #2d2d2d;
}
```

## ♿ Accessibility

All color combinations meet WCAG AA/AAA contrast requirements:

- **Primary text**: 4.5:1 contrast ratio minimum
- **Large text**: 3:1 contrast ratio minimum
- **Interactive elements**: 4.5:1 contrast ratio minimum

## 📱 Responsive Design

The design token system supports responsive design through Tailwind's responsive prefixes:

```tsx
<div className="text-token-display-sm md:text-token-display-md lg:text-token-display-lg">
  Responsive typography
</div>

<div className="p-token-sm md:p-token-md lg:p-token-lg">
  Responsive spacing
</div>
```

## 🚀 Performance Benefits

- **No runtime calculations**: All values are pre-defined CSS custom properties
- **Smaller bundle size**: Utility classes are optimized and tree-shaken
- **Faster rendering**: No JavaScript calculations during render
- **Better caching**: CSS is cached separately from JavaScript

## 🔄 Maintenance

### Adding New Tokens

1. **Define the token** in `styles/design-tokens.css`:
```css
--color-new-accent: #FF6B6B;
```

2. **Add utility classes** in `app/globals.css`:
```css
.bg-token-new-accent { background-color: var(--color-new-accent); }
.text-token-new-accent { color: var(--color-new-accent); }
```

3. **Update documentation** in this file

### Updating Existing Tokens

1. **Change the value** in `styles/design-tokens.css`
2. **Test across the application** to ensure consistency
3. **Update documentation** if the semantic meaning changes

## 📚 Best Practices

1. **Use semantic naming**: `text-token-primary` not `text-token-gray-900`
2. **Prefer components over utilities**: Use `<Typography>` over utility classes when possible
3. **Maintain consistency**: Use the same token for similar purposes across the app
4. **Test accessibility**: Ensure color combinations meet contrast requirements
5. **Document changes**: Update this documentation when adding new tokens

## 🎯 Future Enhancements

- [ ] Dark theme support
- [ ] High contrast mode
- [ ] Reduced motion preferences
- [ ] Custom theme builder
- [ ] Design token validation
- [ ] Automated accessibility testing 