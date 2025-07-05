# Design Tokens Migration Guide

## Overview
This document tracks the migration from hardcoded Tailwind colors to our new design tokens system.

## Brand Colors
- **Primary**: #FF6B6B (Electric Coral)
- **Secondary**: #3EE8B5 (Sky Mint)  
- **Accent**: #6BCEF5 (Glow Blue)

## Migration Status

### ✅ Phase 1: Foundation (COMPLETED)
- [x] Updated `tailwind.config.js` with complete design tokens mapping
- [x] Updated `styles/design-tokens.css` with expanded color system
- [x] Fixed build issues (Suspense boundaries)
- [x] Created migration documentation

### ✅ Phase 2: Core Components (COMPLETED)
- [x] Header & Navigation (`components/Header.tsx`) - **COMPLETED**
- [x] Footer (`components/Footer.tsx`) - **COMPLETED**
- [x] Layout Components (`components/Layout.tsx`) - **COMPLETED** (No colors to migrate)
- [x] UI Components (`components/ui/` folder) - **COMPLETED** (Already using semantic tokens)
- [x] Form Components (Login, Signup, PasswordReset) - **COMPLETED**

### ⏳ Phase 3: Pages (PENDING)
- [ ] Home Page (`app/home/page.tsx`)
- [ ] Landing Pages (`app/meet-sagea/`, `app/topic-spark/`, `app/word-maze/`)
- [ ] Static Pages (`app/pricing/`, `app/community/`, `app/career/`)
- [ ] User Pages (`app/dashboard/`, `app/profile/`)

### ⏳ Phase 4: Advanced Features (PENDING)
- [ ] Admin Pages (`app/admin/`)
- [ ] API Routes (if any styling exists)
- [ ] Email Templates (if any styling exists)

## Color Mapping Reference

### Old → New Mapping
| Old Class | New Token Class | Description |
|-----------|----------------|-------------|
| `bg-blue-50` | `bg-bg-alt` | Light background |
| `text-indigo-700` | `text-primary-700` | Primary text |
| `from-blue-500 to-indigo-600` | `bg-gradient-primary` | Primary gradient |
| `text-slate-800` | `text-text` | Primary text |
| `bg-gray-50` | `bg-bg-muted` | Muted background |
| `border-gray-200` | `border-border` | Default border |
| `text-gray-400` | `text-text-muted` | Muted text |
| `text-gray-800` | `text-text` | Primary text |
| `bg-background` | `bg-surface` | Surface background |

### Status Colors
| Old Class | New Token Class | Description |
|-----------|----------------|-------------|
| `text-green-600` | `text-success-600` | Success text |
| `bg-red-100` | `bg-error-100` | Error background |
| `border-yellow-200` | `border-warning-200` | Warning border |
| `text-blue-600` | `text-info-600` | Info text |

## Migration Checklist Template

For each component/page:

### Pre-Migration
- [ ] Document current color usage
- [ ] Identify hardcoded colors
- [ ] Plan token replacements

### Migration
- [ ] Replace hardcoded colors with tokens
- [ ] Test visual appearance
- [ ] Verify accessibility
- [ ] Update any custom CSS

### Post-Migration
- [ ] Test in different themes (if applicable)
- [ ] Verify responsive behavior
- [ ] Check for any regressions
- [ ] Update documentation

## Testing Strategy

### Visual Testing
- [ ] Compare before/after screenshots
- [ ] Test on different screen sizes
- [ ] Verify color contrast ratios
- [ ] Check hover/focus states

### Functional Testing
- [ ] Ensure all interactions work
- [ ] Test form submissions
- [ ] Verify navigation functionality
- [ ] Check loading states

## Rollback Plan

If issues arise:
1. Revert to previous commit
2. Document the specific issue
3. Fix the problem in isolation
4. Re-apply migration with fix

## Notes
- All legacy color classes are preserved for backward compatibility
- New components should use token classes exclusively
- Gradual migration allows for testing and validation
- Design tokens enable future theming capabilities 