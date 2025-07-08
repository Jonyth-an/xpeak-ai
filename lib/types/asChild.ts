import React from 'react';

/**
 * Utility type for components that support the asChild pattern
 * This allows a component to render as a different element while maintaining its props
 */
export type AsChildProps<T extends React.ElementType = React.ElementType> = {
  asChild?: boolean;
  children: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, 'asChild' | 'children'>;

/**
 * Type for the component that will be rendered when asChild is true
 */
export type AsChildComponent<T extends React.ElementType = React.ElementType> = {
  asChild: true;
  children: React.ReactElement;
} & Omit<React.ComponentPropsWithoutRef<T>, 'asChild' | 'children'>;

/**
 * Type for the component that will be rendered when asChild is false
 */
export type DefaultComponent<T extends React.ElementType = React.ElementType> = {
  asChild?: false;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;

/**
 * Union type for components that support asChild pattern
 */
export type ComponentWithAsChild<T extends React.ElementType = React.ElementType> = 
  | AsChildComponent<T>
  | DefaultComponent<T>;

/**
 * Helper type to extract the element type from a component
 */
export type ElementType<T> = T extends React.ComponentType<infer P> 
  ? P extends { asChild: true; children: React.ReactElement<infer E> }
    ? E
    : never
  : never;

/**
 * Example usage:
 * 
 * interface ButtonProps extends AsChildProps<'button'> {
 *   variant?: 'primary' | 'secondary';
 *   size?: 'sm' | 'md' | 'lg';
 * }
 * 
 * const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
 *   ({ asChild = false, children, ...props }, ref) => {
 *     const Comp = asChild ? Slot : 'button';
 *     return <Comp ref={ref} {...props}>{children}</Comp>;
 *   }
 * );
 */ 