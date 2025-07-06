import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  variant?: 
    // Display variants
    | 'display-2xl' | 'display-xl' | 'display-lg' | 'display-md' | 'display-sm' | 'display-xs'
    // Heading variants
    | 'heading-xl' | 'heading-lg' | 'heading-md' | 'heading-sm'
    // Body variants
    | 'body-xl' | 'body-lg' | 'body-md' | 'body-sm' | 'body-xs'
    // Legacy size variants
    | 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  transform?: 'uppercase' | 'lowercase' | 'capitalize' | 'normal-case';
  decoration?: 'underline' | 'line-through' | 'no-underline';
  tracking?: 'tight' | 'normal' | 'wide';
  leading?: 'tight' | 'normal' | 'relaxed';
  color?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'warning' | 'error' | 'link';
  family?: 'sans' | 'mono' | 'serif';
}

const Typography: React.FC<TypographyProps> = ({
  children,
  className,
  as,
  variant = 'body-lg',
  weight,
  align,
  transform,
  decoration,
  tracking,
  leading,
  color = 'primary',
  family = 'sans',
  ...props
}) => {
  // Determine the element to render
  const getElement = (): keyof React.JSX.IntrinsicElements => {
    if (as) return as;
    
    // Semantic element mapping
    if (variant.startsWith('display')) return 'h1';
    if (variant.startsWith('heading')) return 'h2';
    return 'p';
  };

  const Element = getElement();

  // Build class names
  const classes = cn(
    // Base font family
    `font-token-${family}`,
    
    // Typography variant
    variant.startsWith('display') && `text-token-${variant}`,
    variant.startsWith('heading') && `text-token-${variant}`,
    variant.startsWith('body') && `text-token-${variant}`,
    !variant.startsWith('display') && !variant.startsWith('heading') && !variant.startsWith('body') && `text-token-${variant}`,
    
    // Font weight
    weight && `font-token-${weight}`,
    
    // Text alignment
    align && `text-token-${align}`,
    
    // Text transform
    transform && `text-token-${transform}`,
    
    // Text decoration
    decoration && `text-token-${decoration}`,
    
    // Letter spacing
    tracking && `tracking-token-${tracking}`,
    
    // Line height
    leading && `leading-token-${leading}`,
    
    // Text color
    `text-token-${color}`,
    
    className
  );

  return (
    <Element className={classes} {...props}>
      {children}
    </Element>
  );
};

// Convenience components for common use cases
export const Display2XL: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="display-2xl" {...props} />
);

export const DisplayXL: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="display-xl" {...props} />
);

export const DisplayLG: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="display-lg" {...props} />
);

export const DisplayMD: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="display-md" {...props} />
);

export const DisplaySM: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="display-sm" {...props} />
);

export const DisplayXS: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="display-xs" {...props} />
);

export const HeadingXL: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="heading-xl" {...props} />
);

export const HeadingLG: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="heading-lg" {...props} />
);

export const HeadingMD: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="heading-md" {...props} />
);

export const HeadingSM: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="heading-sm" {...props} />
);

export const BodyXL: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body-xl" {...props} />
);

export const BodyLG: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body-lg" {...props} />
);

export const BodyMD: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body-md" {...props} />
);

export const BodySM: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body-sm" {...props} />
);

export const BodyXS: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body-xs" {...props} />
);

export default Typography; 