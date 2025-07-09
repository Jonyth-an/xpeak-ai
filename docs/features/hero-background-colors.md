# Hero Background Colors

This feature allows each page to have its own custom hero background color that the header will use when at the top of the page. When users scroll down, the header transitions to a solid white background with shadow.

## How to Use

### 1. Basic Usage

Add the `heroBackgroundColor` prop to your Layout component:

```tsx
import Layout from '@/components/Layout';

export default function MyPage() {
  return (
    <Layout heroBackgroundColor="linear-gradient(to bottom right, #3b82f6, #8b5cf6, #ec4899)">
      {/* Your page content */}
    </Layout>
  );
}
```

### 2. Supported Color Formats

You can use any valid CSS background value:

- **Solid colors**: `"#3b82f6"` or `"rgb(59, 130, 246)"`
- **Gradients**: `"linear-gradient(to bottom right, #3b82f6, #8b5cf6)"`
- **Tailwind colors**: `"bg-blue-500"` (though inline styles are preferred for gradients)

### 3. Examples

#### Home Page (Subtle gradient)
```tsx
<Layout heroBackgroundColor="linear-gradient(to bottom right, rgb(248 250 252), rgb(241 245 249), rgb(226 232 240))">
```

#### Word Maze Page (Vibrant gradient)
```tsx
<Layout heroBackgroundColor="linear-gradient(to bottom right, rgb(59 130 246), rgb(147 51 234), rgb(236 72 153))">
```

#### Topic Spark Page (Warm gradient)
```tsx
<Layout heroBackgroundColor="linear-gradient(to bottom right, rgb(251 146 60), rgb(245 101 101), rgb(239 68 68))">
```

### 4. Behavior

- **At the top**: Header uses the custom background color with backdrop blur
- **When scrolled**: Header transitions to solid white with shadow
- **Smooth transition**: 300ms duration for all changes

### 5. Context Usage (Advanced)

For more complex scenarios, you can use the context directly:

```tsx
import { HeroBackgroundContext } from '@/components/Header';

export default function MyPage() {
  return (
    <HeroBackgroundContext.Provider value="linear-gradient(to right, #3b82f6, #8b5cf6)">
      <Layout>
        {/* Your content */}
      </Layout>
    </HeroBackgroundContext.Provider>
  );
}
```

## Best Practices

1. **Match your hero section**: Use colors that complement your page's hero section
2. **Ensure readability**: Make sure text remains readable on the background
3. **Consistent branding**: Use colors that align with your brand identity
4. **Performance**: Prefer CSS gradients over complex images for better performance

## Implementation Details

The feature works by:
1. Passing the background color through the Layout component
2. Using React Context to share the color with the Header
3. Applying the color via inline styles when not scrolled
4. Transitioning to white background when scrolled 

# Hero/Header Seamless Blending – Default Rule

## Default Behavior

- If you pass a `heroBackgroundColor` prop to the `Layout` component, the header and the top (hero) section will blend seamlessly:
  - No white space or top padding between header and hero section.
  - The header background matches the hero section background at the top of the page.
- This is now the **default** for all hero/top-section pages.
- Only pages that do **not** pass `heroBackgroundColor` (e.g., dashboard, admin, etc.) will get the default top padding to prevent content from being hidden behind the fixed header.
- You do **not** need to use a `seamlessHeader` prop anymore.

## How to Use

```tsx
import Layout from '@/components/Layout';

export default function MyHeroPage() {
  return (
    <Layout heroBackgroundColor="#f5f5f5">
      <section className="bg-token-surface-subtle ...">
        {/* Hero content */}
      </section>
      {/* ...rest of page... */}
    </Layout>
  );
}
```

- Always use the same color/gradient for both the header and the hero section for a seamless look.
- If you do **not** want this effect, simply omit the `heroBackgroundColor` prop. 