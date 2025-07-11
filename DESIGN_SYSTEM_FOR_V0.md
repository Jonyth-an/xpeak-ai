# 🎨 Xpeak AI Design System for v0

## Overview
This document contains the complete design system for Xpeak AI, including color tokens, typography, spacing, components, and patterns. Use this with v0 to generate UI components that match our design system.

## 🎯 Brand Identity
- **Primary Color**: Electric Coral (#FF6B6B) - Used for main CTAs, primary actions
- **Secondary Color**: Sky Mint (#3EE8B5) - Used for secondary actions, success states
- **Accent Color**: Glow Blue (#6BCEF5) - Used for highlights, links, focus states
- **Design Philosophy**: Modern, clean, accessible, with vibrant gradients and smooth animations

## 🎨 Color Palette

### Primary Colors
```css
--color-primary: #FF6B6B;        /* Electric Coral */
--color-primary-50: #FFF5F5;
--color-primary-100: #FFE3E3;
--color-primary-200: #FFC9C9;
--color-primary-300: #FFA8A8;
--color-primary-400: #FF8787;
--color-primary-500: #FF6B6B;
--color-primary-600: #FA5252;
--color-primary-700: #F03E3E;
--color-primary-800: #E03131;
--color-primary-900: #C92A2A;
```

### Secondary Colors
```css
--color-secondary: #3EE8B5;      /* Sky Mint */
--color-secondary-50: #F0FDF9;
--color-secondary-100: #CCFBF1;
--color-secondary-200: #99F6E4;
--color-secondary-300: #5EEAD4;
--color-secondary-400: #2DD4BF;
--color-secondary-500: #3EE8B5;
--color-secondary-600: #0D9488;
--color-secondary-700: #0F766E;
--color-secondary-800: #115E59;
--color-secondary-900: #134E4A;
```

### Accent Colors
```css
--color-accent: #6BCEF5;         /* Glow Blue */
--color-accent-50: #F0F9FF;
--color-accent-100: #E0F2FE;
--color-accent-200: #BAE6FD;
--color-accent-300: #7DD3FC;
--color-accent-400: #38BDF8;
--color-accent-500: #6BCEF5;
--color-accent-600: #0284C7;
--color-accent-700: #0369A1;
--color-accent-800: #075985;
--color-accent-900: #0C4A6E;
```

### Status Colors
```css
--color-success: #22C55E;        /* Green */
--color-warning: #F59E0B;        /* Amber */
--color-error: #EF4444;          /* Red */
--color-info: #3B82F6;           /* Blue */
```

### Neutral Colors
```css
--color-gray-50: #F9FAFB;
--color-gray-100: #F3F4F6;
--color-gray-200: #E5E7EB;
--color-gray-300: #D1D5DB;
--color-gray-400: #9CA3AF;
--color-gray-500: #6B7280;
--color-gray-600: #4B5563;
--color-gray-700: #374151;
--color-gray-800: #1F2937;
--color-gray-900: #111827;
```

### Background Colors
```css
--color-bg: #FDFDFD;             /* Main background */
--color-surface: #f9fafb;        /* Card surfaces */
--color-surface-subtle: #f5f5f5; /* Subtle surfaces */
--color-surface-accent: #fff5f5; /* Accent surfaces */
--color-surface-accent-light: #fff8f8;
--color-surface-accent-dark: #ffe8e8;
```

### Text Colors
```css
--color-text: #1E1E2F;           /* Primary text */
--color-text-secondary: #475569; /* Secondary text */
--color-text-muted: #64748B;     /* Muted text */
--color-text-inverse: #FFFFFF;   /* White text */
```

## 📝 Typography System

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

## 📏 Spacing System

### Base Spacing
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

## 🎨 Gradients

### Brand Gradients
```css
--gradient-hero: linear-gradient(135deg, #FF6B6B, #FDE68A);
--gradient-spark: linear-gradient(90deg, #3EE8B5, #6BCEF5);
--gradient-trek: linear-gradient(120deg, #6BCEF5, #FF6B6B);
--gradient-primary: linear-gradient(135deg, #FF6B6B, #FA5252);
--gradient-secondary: linear-gradient(135deg, #3EE8B5, #0D9488);
--gradient-accent: linear-gradient(135deg, #6BCEF5, #0284C7);
```

## 🔘 Button System

### Button Variants

#### Primary Button
- **Background**: `#FF6B6B` (Electric Coral)
- **Hover**: `#FA5252` (darker coral)
- **Text**: White
- **Shadow**: Large shadow for depth
- **Border Radius**: Full rounded (pill shape)
- **Use Case**: Main CTAs, primary actions

#### Secondary Button
- **Background**: Transparent
- **Border**: 2px solid `#3EE8B5` (Sky Mint)
- **Text**: `#0F766E` (dark mint)
- **Hover**: `#F0FDF9` (light mint background)
- **Use Case**: Secondary actions, alternative choices

#### Outline Button
- **Background**: Transparent
- **Border**: 2px solid `#E5E7EB` (light gray)
- **Text**: `#475569` (secondary text)
- **Hover**: `#F9FAFB` (light gray background)
- **Use Case**: Tertiary actions, subtle interactions

#### Feature Buttons (Gradient)
- **Sagea**: Gradient from `#FF6B6B` to `#FF8787`
- **Word Maze**: Gradient from `#3EE8B5` to `#0D9488`
- **Topic Sparks**: Gradient from `#6BCEF5` to `#0284C7`
- **Learning Treks**: Gradient from `#FF6B6B` to `#6BCEF5`
- **Tutors Crew**: Gradient from `#3EE8B5` to `#FF6B6B`

### Button Sizes
- **Small**: `px-4 py-2 text-sm`
- **Medium**: `px-6 py-3 text-base` (default)
- **Large**: `px-8 py-4 text-lg`

### Button States
- **Default**: Full opacity
- **Hover**: Slightly darker background, smooth transition
- **Focus**: Ring with brand color, accessible focus indicator
- **Disabled**: 50% opacity, not clickable

## 🎨 Component Patterns

### Cards
- **Background**: `#f9fafb` (surface color)
- **Border**: `#E5E7EB` (light border)
- **Border Radius**: `0.5rem` (8px)
- **Shadow**: Subtle shadow for depth
- **Padding**: `1.5rem` (24px)
- **Hover**: Slight scale effect, enhanced shadow

### Sidebar Cards
- **Background**: `#fff5f5` (accent surface)
- **Border Radius**: `0.5rem` (8px)
- **Padding**: `1rem` (16px)
- **Border**: Top border with `#E5E7EB` for separation

### Navigation Items
- **Active State**: Background `#fff5f5`, border `#FF6B6B`, text `#FF6B6B`
- **Hover State**: Background `#fff8f8`, subtle scale effect
- **Default State**: Text `#475569` (secondary)
- **Icons**: 16px, with hover scale effect

### Status Indicators
- **Drafting**: Clock icon, warning color (`#F59E0B`)
- **Pending**: Clock icon, info color (`#3B82F6`)
- **Reviewing**: Alert icon, warning color (`#F59E0B`)
- **Waitlist**: Clock icon, info color (`#3B82F6`)
- **Rejected**: X icon, error color (`#EF4444`)
- **Approved**: Check icon, success color (`#22C55E`)

## 🎯 Design Principles

### 1. Accessibility First
- All colors meet WCAG AA/AAA contrast requirements
- Focus indicators are clearly visible
- Text sizes are readable (minimum 14px for body text)

### 2. Consistent Spacing
- Use the spacing scale consistently
- Maintain visual hierarchy through spacing
- Group related elements with consistent gaps

### 3. Smooth Animations
- All interactions have smooth transitions (200ms duration)
- Hover effects include subtle scale and shadow changes
- Loading states use smooth animations

### 4. Visual Hierarchy
- Use typography scale to establish hierarchy
- Use color to guide attention
- Use spacing to group and separate content

### 5. Brand Personality
- Vibrant but professional colors
- Rounded corners for friendly feel
- Gradients for modern, dynamic appearance
- Clean, minimal layouts

## 🎨 Usage Examples for v0

### Button Examples
```tsx
// Primary CTA
<Button variant="primary" size="lg">
  Get Started
</Button>

// Secondary action
<Button variant="secondary" size="md">
  Learn More
</Button>

// Feature-specific button
<Button variant="feature" feature="sagea" size="md">
  Meet Sagea
</Button>
```

### Card Examples
```tsx
// Standard card
<Card className="p-6 bg-surface border border-border rounded-lg shadow-sm">
  <h3 className="text-xl font-semibold text-text mb-4">Card Title</h3>
  <p className="text-text-secondary">Card content goes here.</p>
</Card>

// Sidebar card
<Card className="p-4 bg-surface-accent rounded-lg">
  <div className="flex items-center space-x-3 mb-3">
    <Icon className="w-5 h-5 text-primary" />
    <h4 className="font-semibold text-text">Section Title</h4>
  </div>
  <p className="text-sm text-text-secondary mb-3">Description text.</p>
  <Button variant="primary" size="sm" className="w-full">
    Action
  </Button>
</Card>
```

### Navigation Examples
```tsx
// Navigation item
<Link href="/dashboard" className="flex items-center space-x-3 p-4 rounded-lg transition-all duration-200 hover:bg-surface-accent-light hover:scale-[1.01]">
  <Icon className="w-4 h-4 text-text-muted" />
  <span className="font-medium text-text-secondary">Dashboard</span>
</Link>

// Active navigation item
<Link href="/dashboard" className="flex items-center space-x-3 p-4 rounded-lg bg-surface-accent border border-primary text-primary shadow-sm scale-[1.02]">
  <Icon className="w-4 h-4 text-primary" />
  <span className="font-medium text-primary">Dashboard</span>
</Link>
```

## 🎨 Color Usage Guidelines

### Primary Actions
- Use `#FF6B6B` (Electric Coral) for main CTAs
- Use gradients for feature-specific buttons
- Always ensure sufficient contrast with text

### Secondary Actions
- Use `#3EE8B5` (Sky Mint) for secondary actions
- Use outline variants for less prominent actions

### Information & Status
- Success: `#22C55E` (Green)
- Warning: `#F59E0B` (Amber)
- Error: `#EF4444` (Red)
- Info: `#3B82F6` (Blue)

### Text Hierarchy
- Primary text: `#1E1E2F` (Dark)
- Secondary text: `#475569` (Medium gray)
- Muted text: `#64748B` (Light gray)

This design system ensures consistency, accessibility, and a modern, professional appearance across all Xpeak AI interfaces. 