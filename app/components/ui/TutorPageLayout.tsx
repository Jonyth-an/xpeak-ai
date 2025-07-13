import React from 'react';
import { cn } from '@/lib/utils';

interface TutorPageLayoutProps {
  children: React.ReactNode;
  className?: string;
  containerWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function TutorPageLayout({
  children,
  className,
  containerWidth = 'lg',
  padding = 'md',
  header,
  sidebar,
  footer
}: TutorPageLayoutProps) {
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

  return (
    <div className="min-h-screen bg-token-surface-subtle">
      <div className={cn(
        'mx-auto',
        containerWidths[containerWidth],
        paddings[padding],
        className
      )}>
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
          <main className="flex-1 min-w-0">
            {children}
          </main>

          {/* Sidebar */}
          {sidebar && (
            <aside className="lg:w-80 lg:flex-shrink-0">
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
      </div>
    </div>
  );
} 