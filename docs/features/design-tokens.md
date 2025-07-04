# Design Tokens Style Guide

> **Xpeak AI Design System** - A comprehensive guide to our design tokens and their usage across the platform.

## 🎨 Colors

### Primary Colors
- `--color-primary`: #6366f1 (indigo-500)
- `--color-primary-light`: #818cf8 (indigo-400)
- `--color-primary-dark`: #4f46e5 (indigo-600)

### Secondary Colors
- `--color-secondary`: #06b6d4 (cyan-500)
- `--color-secondary-light`: #22d3ee (cyan-400)
- `--color-secondary-dark`: #0891b2 (cyan-600)

### Accent Colors
- `--color-accent`: #facc15 (yellow-400)
- `--color-accent-light`: #fde047 (yellow-300)
- `--color-accent-dark`: #eab308 (yellow-500)

### Text Colors
- `--color-text-primary`: #111827 (gray-900)
- `--color-text-secondary`: #4b5563 (gray-600) ⭐ **Accessibility Compliant**
- `--color-text-muted`: #6b7280 (gray-500)
- `--color-text-inverse`: #ffffff (white)

### Background Colors
- `--color-background`: #f9fafb (gray-50)
- `--color-background-alt`: #ffffff (white)
- `--color-surface`: #ffffff (white)
- `--color-surface-alt`: #f3f4f6 (gray-100)

### Status Colors
- `--color-success`: #10b981 (emerald-500)
- `--color-warning`: #f59e0b (amber-500)
- `--color-error`: #ef4444 (red-500)
- `--color-info`: #3b82f6 (blue-500)

## 📏 Spacing Scale

### Base Spacing
- `--spacing-0`: 0
- `--spacing-1`: 0.25rem (4px)
- `--spacing-2`: 0.5rem (8px)
- `--spacing-3`: 0.75rem (12px)
- `--spacing-4`: 1rem (16px)
- `--spacing-5`: 1.25rem (20px)
- `--spacing-6`: 1.5rem (24px)
- `--spacing-8`: 2rem (32px)
- `--spacing-10`: 2.5rem (40px)
- `--spacing-12`: 3rem (48px)
- `--spacing-16`: 4rem (64px)
- `--spacing-20`: 5rem (80px)
- `--spacing-24`: 6rem (96px)

## 🔤 Typography

### Font Sizes
- `--font-size-xs`: 0.75rem (12px)
- `--font-size-sm`: 0.875rem (14px)
- `--font-size-base`: 1rem (16px)
- `--font-size-lg`: 1.125rem (18px)
- `--font-size-xl`: 1.25rem (20px)
- `--font-size-2xl`: 1.5rem (24px)
- `--font-size-3xl`: 1.875rem (30px)
- `--font-size-4xl`: 2.25rem (36px)
- `--font-size-5xl`: 3rem (48px)
- `--font-size-6xl`: 3.75rem (60px)

### Font Family
- `font-family-sans`: Inter, system-ui, sans-serif

## 🔲 Border Radius

- `--radius-none`: 0
- `--radius-sm`: 0.125rem (2px)
- `--radius-base`: 0.25rem (4px)
- `--radius-md`: 0.375rem (6px)
- `--radius-lg`: 0.5rem (8px)
- `--radius-xl`: 0.75rem (12px)
- `--radius-2xl`: 1rem (16px)
- `--radius-3xl`: 1.5rem (24px)
- `--radius-full`: 9999px

## 🌫️ Shadows

- `--shadow-sm`: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
- `--shadow-base`: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)
- `--shadow-md`: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
- `--shadow-lg`: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
- `--shadow-xl`: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
- `--shadow-2xl`: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
- `--shadow-inner`: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)

## ⚡ Transitions

- `--transition-fast`: 150ms ease-in-out
- `--transition-base`: 200ms ease-in-out
- `--transition-slow`: 300ms ease-in-out

## 📐 Z-Index Scale

- `--z-dropdown`: 1000
- `--z-sticky`: 1020
- `--z-fixed`: 1030
- `--z-modal-backdrop`: 1040
- `--z-modal`: 1050
- `--z-popover`: 1060
- `--z-tooltip`: 1070

## 🎯 Usage Guidelines

### Color Usage
- **Primary Text**: Use `text-text-primary` for main content
- **Secondary Text**: Use `text-text-secondary` for supporting content ⭐ **Accessibility Compliant**
- **Muted Text**: Use `text-text-muted` for metadata, captions, and less important information
- **Interactive Elements**: Use `text-primary` for links and buttons

### Spacing Guidelines
- **Component Padding**: Use `p-4` (16px) for standard components
- **Section Spacing**: Use `py-16` (64px) for major sections
- **Grid Gaps**: Use `gap-8` (32px) for consistent spacing
- **Text Spacing**: Use `mb-4` (16px) for paragraph spacing

### Typography Hierarchy
- **Page Titles**: `text-4xl` to `text-6xl`
- **Section Headers**: `text-2xl` to `text-3xl`
- **Subsection Headers**: `text-xl` to `text-2xl`
- **Body Text**: `text-base` to `text-lg`
- **Small Text**: `text-sm` for captions and metadata

## 🔧 Tailwind Integration

All design tokens are available as Tailwind classes:

```css
/* Colors */
.text-token-text-secondary  /* --color-text-secondary */
.bg-token-surface          /* --color-surface */
.border-token-border       /* --color-border */

/* Spacing */
.p-token-4                 /* --spacing-4 */
.mt-token-8                /* --spacing-8 */

/* Typography */
.text-token-lg             /* --font-size-lg */
.font-token-2xl            /* --font-size-2xl */

/* Shadows */
.shadow-token-md           /* --shadow-md */
```

## 🚨 Accessibility Notes

- ✅ `text-text-secondary` (#4b5563) meets WCAG AA standards (4.5:1 contrast ratio)
- ✅ `text-text-muted` (#6b7280) suitable for large text (3:1 ratio)
- ⚠️ Avoid using `text-text-muted` for small body text on white backgrounds
- 🎨 Use `text-text-secondary` for better accessibility compliance

## 📝 Maintenance

> **Keep this file updated whenever you add or modify design tokens.**

### Recent Updates
- **2025-01-25**: Fixed accessibility issues by replacing `text-gray-500` with `text-text-secondary`
- **2025-01-25**: Updated yellow backgrounds to use design token system
- **2025-01-25**: Improved color contrast compliance across all components

---

*This style guide ensures consistency and accessibility across the Xpeak AI platform.* 