# FeatureCard Component Documentation

## Overview

The `FeatureCard` component is a flexible, reusable molecule that displays feature information with an icon, title, and description. It's designed to be highly customizable while maintaining consistency with your design system.

## Location

```
app/components/ui/FeatureCard.tsx
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `React.ReactNode` | - | Icon to display (emoji, SVG, or any React node) |
| `title` | `string` | - | **Required.** Title of the feature |
| `children` | `React.ReactNode` | - | **Required.** Description or content |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Controls padding, gap, and text sizes |
| `variant` | `'default' \| 'elevated' \| 'outlined' \| 'filled'` | `'default'` | Visual style variant |
| `iconSize` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'lg'` | Size of the icon |
| `iconAnimation` | `'none' \| 'bounce' \| 'pulse' \| 'spin'` | `'none'` | Hover animation for the icon |
| `align` | `'left' \| 'center' \| 'right'` | `'center'` | Text and content alignment |
| `className` | `string` | `''` | Additional CSS classes |
| `...props` | `HTMLDivElement` | - | All standard div props |

## Size Variants

### Small (`size="sm"`)
- **Use case:** Compact spaces, sidebars, tooltips
- **Padding:** `p-token-4`
- **Gap:** `gap-token-2`
- **Title:** `text-token-lg`
- **Text:** `text-token-sm`

### Medium (`size="md"`)
- **Use case:** Standard feature grids, most common usage
- **Padding:** `p-token-6`
- **Gap:** `gap-token-4`
- **Title:** `text-token-xl`
- **Text:** `text-token-base`

### Large (`size="lg"`)
- **Use case:** Prominent features, hero sections
- **Padding:** `p-token-8`
- **Gap:** `gap-token-6`
- **Title:** `text-token-2xl`
- **Text:** `text-token-lg`

### Extra Large (`size="xl"`)
- **Use case:** Hero cards, key highlights
- **Padding:** `p-token-10`
- **Gap:** `gap-token-8`
- **Title:** `text-token-3xl`
- **Text:** `text-token-xl`

## Visual Variants

### Default (`variant="default"`)
```tsx
<FeatureCard icon="🚀" title="Default Style" variant="default">
  Standard appearance with surface background and base shadow
</FeatureCard>
```

### Elevated (`variant="elevated"`)
```tsx
<FeatureCard icon="💎" title="Elevated Style" variant="elevated">
  Enhanced shadow with hover effects for interactive feel
</FeatureCard>
```

### Outlined (`variant="outlined"`)
```tsx
<FeatureCard icon="🎨" title="Outlined Style" variant="outlined">
  Clean border style with transparent background
</FeatureCard>
```

### Filled (`variant="filled"`)
```tsx
<FeatureCard icon="🎪" title="Filled Style" variant="filled">
  Subtle background tint for emphasis
</FeatureCard>
```

## Icon Animations

### None (`iconAnimation="none"`)
- No animation (default)

### Bounce (`iconAnimation="bounce"`)
```tsx
<FeatureCard icon="⚡" title="Bounce Animation" iconAnimation="bounce">
  Icon bounces on hover
</FeatureCard>
```

### Pulse (`iconAnimation="pulse"`)
```tsx
<FeatureCard icon="💓" title="Pulse Animation" iconAnimation="pulse">
  Icon pulses on hover
</FeatureCard>
```

### Spin (`iconAnimation="spin"`)
```tsx
<FeatureCard icon="🔄" title="Spin Animation" iconAnimation="spin">
  Icon spins on hover
</FeatureCard>
```

## Alignment Options

### Left (`align="left"`)
```tsx
<FeatureCard icon="⬅️" title="Left Aligned" align="left">
  Content aligned to the left for natural reading flow
</FeatureCard>
```

### Center (`align="center"`)
```tsx
<FeatureCard icon="⬆️" title="Center Aligned" align="center">
  Centered content for balanced presentation
</FeatureCard>
```

### Right (`align="right"`)
```tsx
<FeatureCard icon="➡️" title="Right Aligned" align="right">
  Right-aligned content for specific layouts
</FeatureCard>
```

## Usage Examples

### Basic Usage
```tsx
import FeatureCard from '@/app/components/ui/FeatureCard';

<FeatureCard icon="🤖" title="AI Feature">
  This is a basic feature card with default styling.
</FeatureCard>
```

### Premium Feature Card
```tsx
<FeatureCard 
  icon="🎨" 
  title="Premium Feature" 
  size="lg"
  variant="elevated"
  iconSize="xl"
  iconAnimation="pulse"
  align="center"
>
  A premium feature with enhanced styling, larger size, elevated variant, 
  and animated icon that pulses on hover.
</FeatureCard>
```

### Compact Note Card
```tsx
<FeatureCard 
  icon="📝" 
  title="Quick Note" 
  size="sm"
  variant="outlined"
  iconSize="sm"
  align="left"
>
  A compact note-style card with left alignment and outlined variant 
  for a clean, minimal appearance.
</FeatureCard>
```

### Feature Grid
```tsx
const features = [
  { icon: '🚀', title: 'Fast', description: 'Lightning fast performance' },
  { icon: '🛡️', title: 'Secure', description: 'Enterprise-grade security' },
  { icon: '📱', title: 'Mobile', description: 'Works on all devices' }
];

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {features.map((feature, index) => (
    <FeatureCard 
      key={index}
      icon={feature.icon}
      title={feature.title}
      size="md"
      variant="elevated"
      iconAnimation="bounce"
    >
      {feature.description}
    </FeatureCard>
  ))}
</div>
```

## Design Tokens Used

The component uses your design token system for consistent spacing and styling:

- **Padding:** `p-token-4`, `p-token-6`, `p-token-8`, `p-token-10`
- **Gap:** `gap-token-2`, `gap-token-4`, `gap-token-6`, `gap-token-8`
- **Text Sizes:** `text-token-sm`, `text-token-base`, `text-token-lg`, `text-token-xl`, `text-token-2xl`, `text-token-3xl`
- **Icon Sizes:** `text-token-2xl`, `text-token-3xl`, `text-token-4xl`, `text-token-5xl`
- **Shadows:** `shadow-token-base`, `shadow-token-lg`, `shadow-token-xl`
- **Colors:** `bg-surface`, `bg-primary/5`, `border-border`, `text-text-secondary`
- **Transitions:** `transition-all duration-token-base`

## Best Practices

1. **Consistent Sizing:** Use the same `size` prop across related feature cards for visual consistency
2. **Meaningful Icons:** Choose icons that clearly represent the feature
3. **Concise Titles:** Keep titles short and descriptive
4. **Appropriate Variants:** Use `elevated` for interactive elements, `outlined` for secondary features
5. **Animation Moderation:** Don't overuse animations; they should enhance, not distract
6. **Responsive Design:** The component works well in grid layouts with responsive breakpoints

## Accessibility

- The component uses semantic HTML with proper heading hierarchy
- Icons are decorative and don't require alt text
- Hover animations are subtle and don't cause motion sickness
- Color contrast meets WCAG guidelines through design tokens

## Migration from Old Cards

If you're replacing existing hard-coded cards:

```tsx
// Old way
<div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center">
  <span className="text-4xl mb-2">🔍</span>
  <h3 className="text-xl font-semibold mb-1">Feature Title</h3>
  <p className="text-gray-600">Feature description</p>
</div>

// New way
<FeatureCard 
  icon="🔍" 
  title="Feature Title"
  size="md"
  variant="elevated"
>
  Feature description
</FeatureCard>
```

## Testing

You can test all variants and configurations on the test page:
`http://localhost:3000/test-shadcn`

The test page includes comprehensive examples of all size, variant, alignment, and animation options. 