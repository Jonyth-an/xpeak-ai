// Comprehensive layout system
// Consolidates page layouts and eliminates duplicate layout code

import React from 'react';
import { cn } from '@/lib/utils';

// Base layout props
export interface BaseLayoutProps {
  children: React.ReactNode;
  className?: string;
  containerWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  background?: 'default' | 'subtle' | 'primary' | 'secondary';
}

// Standard page layout
export interface StandardPageLayoutProps extends BaseLayoutProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: 'sm' | 'md' | 'lg';
  showContainer?: boolean;
}

export function StandardPageLayout({
  children,
  className,
  containerWidth = 'lg',
  padding = 'md',
  background = 'default',
  header,
  sidebar,
  footer,
  sidebarPosition = 'left',
  sidebarWidth = 'md',
  showContainer = true
}: StandardPageLayoutProps) {
  const containerWidths = {
    sm: 'max-w-4xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-8xl',
    full: 'max-w-none'
  };

  const paddings = {
    none: '',
    sm: 'px-4 sm:px-6 lg:px-8 py-4',
    md: 'px-4 sm:px-6 lg:px-8 py-6 lg:py-8',
    lg: 'px-4 sm:px-6 lg:px-8 py-8 lg:py-12'
  };

  const backgrounds = {
    default: 'bg-token-surface',
    subtle: 'bg-token-surface-subtle',
    primary: 'bg-token-primary/5',
    secondary: 'bg-token-secondary/5'
  };

  const sidebarWidths = {
    sm: 'lg:w-64',
    md: 'lg:w-80',
    lg: 'lg:w-96'
  };

  const content = (
    <>
      {/* Header */}
      {header && (
        <div className="mb-6 lg:mb-8">
          {header}
        </div>
      )}

      {/* Main Content */}
      <div className={cn(
        'flex flex-col lg:flex-row gap-6 lg:gap-8',
        sidebar ? 'lg:grid lg:grid-cols-[1fr_auto]' : ''
      )}>
        {/* Primary Content */}
        <main className={cn(
          'flex-1 min-w-0',
          sidebar && sidebarPosition === 'right' ? 'lg:order-1' : ''
        )}>
          {children}
        </main>

        {/* Sidebar */}
        {sidebar && (
          <aside className={cn(
            'lg:flex-shrink-0',
            sidebarWidths[sidebarWidth],
            sidebarPosition === 'right' ? 'lg:order-2' : ''
          )}>
            {sidebar}
          </aside>
        )}
      </div>

      {/* Footer */}
      {footer && (
        <div className="mt-8 lg:mt-12">
          {footer}
        </div>
      )}
    </>
  );

  return (
    <div className={cn('min-h-screen', backgrounds[background])}>
      {showContainer ? (
        <div className={cn(
          'mx-auto',
          containerWidths[containerWidth],
          paddings[padding],
          className
        )}>
          {content}
        </div>
      ) : (
        <div className={cn(paddings[padding], className)}>
          {content}
        </div>
      )}
    </div>
  );
}

// Dashboard layout
export interface DashboardLayoutProps extends StandardPageLayoutProps {
  navigation?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function DashboardLayout({
  children,
  navigation,
  breadcrumbs,
  actions,
  showBackButton = false,
  onBack,
  ...props
}: DashboardLayoutProps) {
  const header = (
    <div className="space-y-4">
      {/* Navigation */}
      {navigation && (
        <div className="border-b border-token-border pb-4">
          {navigation}
        </div>
      )}

      {/* Breadcrumbs and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-token-surface-hover transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {breadcrumbs}
        </div>
        {actions && (
          <div className="flex flex-wrap gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <StandardPageLayout
      {...props}
      header={header}
    >
      {children}
    </StandardPageLayout>
  );
}

// Form layout
export interface FormLayoutProps extends StandardPageLayoutProps {
  title?: string;
  subtitle?: string;
  submitButton?: React.ReactNode;
  cancelButton?: React.ReactNode;
  isLoading?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function FormLayout({
  children,
  title,
  subtitle,
  submitButton,
  cancelButton,
  isLoading = false,
  maxWidth = 'lg',
  ...props
}: FormLayoutProps) {
  const maxWidths = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  const header = title && (
    <div className="text-center mb-8">
      <h1 className="text-2xl font-bold text-token-text-primary mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-token-text-secondary">
          {subtitle}
        </p>
      )}
    </div>
  );

  const footer = (submitButton || cancelButton) && (
    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-6 border-t border-token-border">
      {cancelButton}
      {submitButton}
    </div>
  );

  return (
    <StandardPageLayout
      {...props}
      containerWidth="full"
      className={cn('flex justify-center', props.className)}
    >
      <div className={cn('w-full', maxWidths[maxWidth])}>
        {header}
        <div className={cn(
          'space-y-6',
          isLoading && 'opacity-50 pointer-events-none'
        )}>
          {children}
        </div>
        {footer}
      </div>
    </StandardPageLayout>
  );
}

// Card layout
export interface CardLayoutProps extends BaseLayoutProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function CardLayout({
  children,
  title,
  subtitle,
  actions,
  variant = 'default',
  padding = 'md',
  className,
  ...props
}: CardLayoutProps) {
  const variants = {
    default: 'bg-token-surface border border-token-border',
    elevated: 'bg-token-surface shadow-lg border border-token-border',
    outlined: 'bg-transparent border-2 border-token-border'
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={cn(
      'rounded-lg',
      variants[variant],
      className
    )}>
      {/* Header */}
      {(title || actions) && (
        <div className={cn(
          'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4',
          padding !== 'none' && 'pb-4 border-b border-token-border'
        )}>
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-token-text-primary">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-token-text-secondary mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={cn(
        'space-y-4',
        paddings[padding]
      )}>
        {children}
      </div>
    </div>
  );
}

// Grid layout
export interface GridLayoutProps extends BaseLayoutProps {
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
}

export function GridLayout({
  children,
  columns = 1,
  gap = 'md',
  responsive = true,
  className,
  ...props
}: GridLayoutProps) {
  const gaps = {
    none: '',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: responsive ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2',
    3: responsive ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-3',
    4: responsive ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-4',
    6: responsive ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6' : 'grid-cols-6',
    12: responsive ? 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-12' : 'grid-cols-12'
  };

  return (
    <div className={cn(
      'grid',
      gridCols[columns],
      gaps[gap],
      className
    )}>
      {children}
    </div>
  );
}

// List layout
export interface ListLayoutProps extends BaseLayoutProps {
  items: React.ReactNode[];
  itemSpacing?: 'none' | 'sm' | 'md' | 'lg';
  dividers?: boolean;
  hover?: boolean;
}

export function ListLayout({
  items,
  itemSpacing = 'md',
  dividers = false,
  hover = false,
  className,
  ...props
}: ListLayoutProps) {
  const spacings = {
    none: '',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6'
  };

  return (
    <div className={cn(
      'divide-y',
      dividers ? 'divide-token-border' : 'divide-transparent',
      spacings[itemSpacing],
      className
    )}>
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            'py-4',
            hover && 'hover:bg-token-surface-hover transition-colors rounded-lg px-2 -mx-2'
          )}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

// Split layout
export interface SplitLayoutProps extends BaseLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  ratio?: '1/3' | '1/2' | '2/3';
  reverse?: boolean;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  sticky?: 'left' | 'right' | 'both' | 'none';
}

export function SplitLayout({
  left,
  right,
  ratio = '1/2',
  reverse = false,
  gap = 'lg',
  sticky = 'none',
  className,
  ...props
}: SplitLayoutProps) {
  const ratios = {
    '1/3': 'lg:grid-cols-1 lg:grid-cols-3',
    '1/2': 'lg:grid-cols-1 lg:grid-cols-2',
    '2/3': 'lg:grid-cols-2 lg:grid-cols-3'
  };

  const gaps = {
    none: '',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  };

  const stickyClasses = {
    left: 'lg:sticky lg:top-4 lg:self-start',
    right: 'lg:sticky lg:top-4 lg:self-start',
    both: 'lg:sticky lg:top-4 lg:self-start',
    none: ''
  };

  const order = reverse ? 'lg:order-2' : 'lg:order-1';
  const orderReverse = reverse ? 'lg:order-1' : 'lg:order-2';

  return (
    <div className={cn(
      'grid grid-cols-1 lg:grid-cols-2',
      gaps[gap],
      className
    )}>
      <div className={cn(stickyClasses[sticky], order)}>
        {left}
      </div>
      <div className={cn(stickyClasses[sticky], orderReverse)}>
        {right}
      </div>
    </div>
  );
}

// Export all layouts
export const PageLayouts = {
  Standard: StandardPageLayout,
  Dashboard: DashboardLayout,
  Form: FormLayout,
  Card: CardLayout,
  Grid: GridLayout,
  List: ListLayout,
  Split: SplitLayout
}; 