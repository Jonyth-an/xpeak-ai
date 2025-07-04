# SmartMatchFeature Component

A reusable component for displaying AI-powered matching features with customizable icons, animations, and styling.

## Overview

The `SmartMatchFeature` component extracts the "Let AI Help You Find the Right Coach" functionality from the Tutors page into a flexible, reusable component that can be used across different pages with different configurations.

## Features

- **Customizable Content**: Title, description, features, and footer text
- **Flexible Styling**: Different card variants and background colors
- **Icon Animations**: Bounce, pulse, spin, or no animation
- **Responsive Design**: Works on all screen sizes
- **TypeScript Support**: Full type safety with interfaces

## Usage

### Basic Usage

```tsx
import SmartMatchFeature, { SmartMatchFeatureItem } from '@/app/components/molecules/SmartMatchFeature';

const features: SmartMatchFeatureItem[] = [
  {
    icon: '🔍',
    title: 'Smart Discovery',
    text: 'AI-powered recommendations based on your preferences.'
  },
  {
    icon: '🎯',
    title: 'Personalized Matching',
    text: 'Get matched with content that fits your learning style.'
  },
  {
    icon: '📈',
    title: 'Progress Tracking',
    text: 'Monitor your growth with detailed analytics.'
  }
];

<SmartMatchFeature
  title="AI-Powered Learning"
  description="Discover content tailored to your needs and goals."
  features={features}
  footerText="Learn smarter, not harder."
/>
```

### Advanced Configuration

```tsx
<SmartMatchFeature
  title="Custom Title"
  description="Custom description text"
  features={features}
  footerText="Custom footer text"
  className="bg-gradient-to-r from-blue-50 to-indigo-50"
  iconAnimation="pulse"
  cardVariant="elevated"
/>
```

## Props

### SmartMatchFeatureProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `"Let AI Help You Find the Right Coach"` | Main heading text |
| `description` | `string` | `"Finding your ideal tutor shouldn't be a guessing game..."` | Subtitle text |
| `features` | `SmartMatchFeatureItem[]` | **Required** | Array of feature items |
| `footerText` | `string` | `"Switch anytime. Explore freely. Learn your way."` | Footer text (optional if empty) |
| `className` | `string` | `""` | Additional CSS classes |
| `iconAnimation` | `'bounce' \| 'pulse' \| 'spin' \| 'none'` | `'bounce'` | Icon hover animation |
| `cardVariant` | `'default' \| 'elevated' \| 'outlined'` | `'default'` | Card styling variant |

### SmartMatchFeatureItem

| Prop | Type | Description |
|------|------|-------------|
| `icon` | `string` | Emoji or icon to display |
| `title` | `string` | Feature title |
| `text` | `string` | Feature description |

## Examples

### Tutors Page (Default)
```tsx
const tutorFeatures = [
  {
    icon: '🔍',
    title: 'Recommended Coaches',
    text: 'Based on popular picks in your country or region.'
  },
  {
    icon: '🧭',
    title: 'Matched by Learning Goal',
    text: 'Get paired with tutors who helped others like you.'
  },
  {
    icon: '🧠',
    title: 'Context-Aware Matching',
    text: 'The more you learn, the better our AI understands what you need.'
  }
];

<SmartMatchFeature
  title="Let AI Help You Find the Right Coach"
  description="Finding your ideal tutor shouldn't be a guessing game..."
  features={tutorFeatures}
  iconAnimation="bounce"
  cardVariant="default"
/>
```

### AI Topics Page
```tsx
const topicFeatures = [
  {
    icon: '🎯',
    title: 'Personalized Topics',
    text: 'AI generates topics based on your interests and learning goals.'
  },
  {
    icon: '📈',
    title: 'Trending Content',
    text: 'Stay current with topics that are popular in your target language.'
  },
  {
    icon: '🔄',
    title: 'Adaptive Learning',
    text: 'Topics evolve as you progress, keeping your learning fresh.'
  }
];

<SmartMatchFeature
  title="AI-Powered Topic Discovery"
  description="Discover engaging topics that match your interests..."
  features={topicFeatures}
  iconAnimation="pulse"
  cardVariant="elevated"
  className="bg-gradient-to-r from-blue-50 to-indigo-50"
/>
```

### Word Maze Page
```tsx
const wordFeatures = [
  {
    icon: '🧩',
    title: 'Smart Word Collection',
    text: 'Automatically collect and organize words from your conversations.'
  },
  {
    icon: '🎮',
    title: 'Interactive Review',
    text: 'Practice with gamified exercises that adapt to your learning pace.'
  },
  {
    icon: '📊',
    title: 'Progress Tracking',
    text: 'See your vocabulary growth with detailed analytics.'
  }
];

<SmartMatchFeature
  title="Smart Vocabulary Building"
  description="Transform your conversations into a powerful vocabulary system..."
  features={wordFeatures}
  iconAnimation="spin"
  cardVariant="outlined"
  className="bg-gradient-to-r from-green-50 to-emerald-50"
/>
```

## Styling

The component uses design tokens and follows the atomic design system:

- **Background**: Uses `bg-surface` by default
- **Text Colors**: Uses `text-text`, `text-text-muted`, `text-text-secondary`
- **Cards**: Uses the shared `Card` component with different variants
- **Spacing**: Consistent padding and margins using the design system
- **Responsive**: Grid layout adapts from 1 column on mobile to 3 columns on desktop

## Animation Options

- **`bounce`**: Icons bounce on hover (default)
- **`pulse`**: Icons pulse on hover
- **`spin`**: Icons spin on hover
- **`none`**: No animation

## Best Practices

1. **Keep features concise**: Limit to 3-4 features for optimal readability
2. **Use relevant icons**: Choose emojis that clearly represent the feature
3. **Consistent styling**: Use the same `cardVariant` and `iconAnimation` across related sections
4. **Meaningful descriptions**: Keep feature descriptions under 100 characters
5. **Accessible content**: Ensure icons have appropriate alt text and descriptions are clear

## Migration from Hard-coded Sections

To migrate existing hard-coded sections to use `SmartMatchFeature`:

1. Extract the feature data into a `SmartMatchFeatureItem[]` array
2. Replace the hard-coded JSX with the `SmartMatchFeature` component
3. Pass the appropriate props for your use case
4. Test the component with different configurations

## Future Enhancements

Potential improvements for the component:

- Support for custom icon components (not just emojis)
- More animation options
- Customizable grid layouts
- Integration with analytics tracking
- A/B testing support for different configurations 