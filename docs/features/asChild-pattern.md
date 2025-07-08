# asChild Pattern Implementation

## Overview

The `asChild` pattern is a powerful React pattern that allows components to render as different HTML elements while maintaining their styling and behavior. This pattern is inspired by Radix UI and provides maximum flexibility for component composition.

## How It Works

When `asChild` is `true`, the component uses Radix UI's `Slot` component to render its children as the root element, passing all props (including className) to the child element. When `asChild` is `false` (default), it renders as its default element.

## Implementation

### Core Components

1. **Button Component** (`app/components/ui/Button.tsx`)
   - Supports rendering as any element when `asChild={true}`
   - Maintains all styling and variants
   - Type-safe with TypeScript

2. **TypeScript Utilities** (`lib/types/asChild.ts`)
   - Provides type-safe interfaces for asChild components
   - Ensures proper prop forwarding
   - Prevents type errors

### Key Features

- **Type Safety**: Full TypeScript support with proper type inference
- **Accessibility**: Maintains accessibility features when rendering as different elements
- **Styling**: All CSS classes and variants are preserved
- **Flexibility**: Can render as any valid HTML element or React component

## Usage Examples

### 1. Button as Link

```tsx
import { Button } from '@/app/components/ui/Button';
import Link from 'next/link';

<Button asChild variant="primary">
  <Link href="/dashboard">
    Go to Dashboard
  </Link>
</Button>
```

### 2. Button as External Link

```tsx
<Button asChild variant="outline">
  <a href="https://github.com" target="_blank" rel="noopener noreferrer">
    Visit GitHub
  </a>
</Button>
```

### 3. Button as Form Submit

```tsx
<form onSubmit={handleSubmit}>
  <Button asChild type="submit" variant="success">
    <button type="submit">
      Submit Form
    </button>
  </Button>
</form>
```

### 4. Button as Accessible Div

```tsx
<Button asChild variant="warning">
  <div 
    role="button" 
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    }}
    onClick={handleClick}
  >
    Custom Interactive Element
  </div>
</Button>
```

### 5. Feature Variants with asChild

```tsx
<Button asChild variant="feature" feature="sagea">
  <Link href="/meet-sagea">
    Meet Sagea
  </Link>
</Button>

<Button asChild variant="feature" feature="word-maze">
  <Link href="/word-maze">
    Word Maze
  </Link>
</Button>
```

## TypeScript Support

### Basic Usage

```tsx
interface ButtonProps extends AsChildProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}
```

### Advanced Types

```tsx
// When asChild is true, children must be a ReactElement
type AsChildComponent = {
  asChild: true;
  children: React.ReactElement;
} & Omit<React.ComponentPropsWithoutRef<T>, 'asChild' | 'children'>;

// When asChild is false, children can be ReactNode
type DefaultComponent = {
  asChild?: false;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;
```

## Best Practices

### 1. Accessibility

When using `asChild` with custom elements, ensure proper accessibility:

```tsx
<Button asChild variant="primary">
  <div 
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    }}
    onClick={handleClick}
  >
    Accessible Custom Button
  </div>
</Button>
```

### 2. Event Handling

Ensure proper event handling when using custom elements:

```tsx
<Button asChild variant="secondary">
  <div 
    onClick={handleClick}
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
  >
    Interactive Element
  </div>
</Button>
```

### 3. Form Integration

For form elements, maintain proper form semantics:

```tsx
<form onSubmit={handleSubmit}>
  <Button asChild type="submit">
    <button type="submit">
      Submit
    </button>
  </Button>
</form>
```

## Common Use Cases

### 1. Navigation Buttons

```tsx
// Internal navigation
<Button asChild variant="primary">
  <Link href="/dashboard">Dashboard</Link>
</Button>

// External links
<Button asChild variant="outline">
  <a href="https://docs.example.com" target="_blank">
    Documentation
  </a>
</Button>
```

### 2. Interactive Cards

```tsx
<Button asChild variant="tertiary">
  <div 
    role="button"
    tabIndex={0}
    onClick={() => router.push('/card-details')}
  >
    <h3>Card Title</h3>
    <p>Card description...</p>
  </div>
</Button>
```

### 3. File Inputs

```tsx
<Button asChild variant="outline">
  <label htmlFor="file-input">
    Choose File
  </label>
</Button>
<input 
  id="file-input" 
  type="file" 
  className="hidden"
  onChange={handleFileChange}
/>
```

## Demo

Visit `/test/asChild-demo` to see interactive examples of all asChild patterns in action.

## Migration Guide

### From Regular Buttons

**Before:**
```tsx
<Link href="/dashboard">
  <Button variant="primary">Dashboard</Button>
</Link>
```

**After:**
```tsx
<Button asChild variant="primary">
  <Link href="/dashboard">Dashboard</Link>
</Button>
```

### Benefits of Migration

1. **Better Semantics**: Proper HTML structure
2. **Improved Accessibility**: Screen readers understand the element type
3. **SEO Benefits**: Search engines can follow links properly
4. **Performance**: No unnecessary wrapper elements

## Troubleshooting

### Common Issues

1. **TypeScript Errors**: Ensure you're using the correct types from `lib/types/asChild`
2. **Styling Issues**: Check that className is being passed correctly
3. **Event Handling**: Verify that events are properly forwarded to the child element

### Debug Tips

1. Use React DevTools to inspect the rendered DOM structure
2. Check that props are being forwarded correctly
3. Verify accessibility attributes are present when needed

## Future Enhancements

1. **More Components**: Extend asChild pattern to other UI components
2. **Advanced Types**: Add more sophisticated type inference
3. **Performance**: Optimize for large-scale usage
4. **Testing**: Add comprehensive test coverage for asChild scenarios

## Related Documentation

- [Radix UI Slot Documentation](https://www.radix-ui.com/primitives/utilities/slot)
- [React Composition Patterns](https://react.dev/learn/passing-props-to-a-component)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) 