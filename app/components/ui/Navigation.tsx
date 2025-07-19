'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Text from './Text';
import { Button } from './Button';
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';

interface NavigationItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: NavigationItem[];
  disabled?: boolean;
  external?: boolean;
}

interface NavigationProps {
  items: NavigationItem[];
  variant?: 'horizontal' | 'vertical' | 'mobile';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onItemClick?: (item: NavigationItem) => void;
  activeItem?: string;
}

export function Navigation({
  items,
  variant = 'horizontal',
  size = 'md',
  className,
  onItemClick,
  activeItem
}: NavigationProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [mobileOpen, setMobileOpen] = useState(false);

  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const toggleExpanded = (label: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (item: NavigationItem) => {
    if (item.children) {
      toggleExpanded(item.label);
    } else if (onItemClick) {
      onItemClick(item);
    }
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isActive = activeItem === item.href;
    const isExpanded = expandedItems.has(item.label);
    const hasChildren = item.children && item.children.length > 0;

    const itemClasses = cn(
      'flex items-center gap-3 px-4 py-2 rounded-md transition-colors cursor-pointer',
      sizes[size],
      level > 0 && 'ml-4',
      isActive && 'bg-token-primary text-white',
      !isActive && 'hover:bg-token-surface-subtle text-token-text-primary',
      item.disabled && 'opacity-50 cursor-not-allowed'
    );

    return (
      <div key={item.label}>
        <div
          className={itemClasses}
          onClick={() => !item.disabled && handleItemClick(item)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              !item.disabled && handleItemClick(item);
            }
          }}
        >
          {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
          <Text variant="body" className="flex-1">
            {item.label}
          </Text>
          {item.badge && (
            <span className="px-2 py-1 text-xs bg-token-primary text-white rounded-full">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform',
                isExpanded && 'rotate-180'
              )}
            />
          )}
          {item.external && (
            <span className="w-4 h-4 text-token-text-muted">
              ↗
            </span>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (variant === 'mobile') {
    return (
      <div className={className}>
        {/* Mobile Menu Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden"
          aria-label="Toggle mobile menu"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>

        {/* Mobile Menu Overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full w-80 bg-token-surface shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-token-surface-alt">
                <Text variant="h3" className="text-token-text-primary">
                  Menu
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-4 space-y-2">
                {items.map((item) => renderNavigationItem(item))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'vertical') {
    return (
      <nav className={cn('space-y-2', className)}>
        {items.map((item) => renderNavigationItem(item))}
      </nav>
    );
  }

  // Horizontal navigation
  return (
    <nav className={cn('flex items-center space-x-1', className)}>
      {items.map((item) => renderNavigationItem(item))}
    </nav>
  );
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
  onItemClick?: (item: BreadcrumbItem) => void;
}

export function Breadcrumbs({
  items,
  separator = <ChevronRight className="w-4 h-4 text-token-text-muted" />,
  className,
  onItemClick
}: BreadcrumbsProps) {
  return (
    <nav className={cn('flex items-center space-x-2', className)} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={item.label}>
          <div className="flex items-center space-x-2">
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            {index === items.length - 1 ? (
              <Text variant="body" className="text-token-text-primary font-medium">
                {item.label}
              </Text>
            ) : (
              <button
                onClick={() => onItemClick?.(item)}
                className="text-token-text-secondary hover:text-token-text-primary transition-colors"
                disabled={!item.href && !onItemClick}
              >
                <Text variant="body">{item.label}</Text>
              </button>
            )}
          </div>
          {index < items.length - 1 && (
            <span className="flex-shrink-0" aria-hidden="true">
              {separator}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

interface TabItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Tabs({
  items,
  value,
  onChange,
  variant = 'default',
  size = 'md',
  className
}: TabsProps) {
  const variants = {
    default: {
      container: 'border-b border-token-surface-alt',
      item: 'border-b-2 border-transparent hover:border-token-surface-alt',
      active: 'border-token-primary text-token-primary'
    },
    pills: {
      container: 'space-x-1',
      item: 'rounded-md hover:bg-token-surface-subtle',
      active: 'bg-token-primary text-white'
    },
    underline: {
      container: 'border-b border-token-surface-alt',
      item: 'border-b-2 border-transparent hover:border-token-surface-alt',
      active: 'border-token-primary text-token-primary'
    }
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const { container, item, active } = variants[variant];

  return (
    <div className={cn('flex', container, className)}>
      {items.map((tab) => (
        <button
          key={tab.value}
          onClick={() => !tab.disabled && onChange(tab.value)}
          disabled={tab.disabled}
          className={cn(
            'flex items-center gap-2 transition-colors',
            sizes[size],
            item,
            value === tab.value && active,
            tab.disabled && 'opacity-50 cursor-not-allowed'
          )}
          role="tab"
          aria-selected={value === tab.value}
          aria-disabled={tab.disabled}
        >
          {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
          <Text variant="body">{tab.label}</Text>
          {tab.badge && (
            <span className="px-2 py-1 text-xs bg-token-primary text-white rounded-full">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  showFirstLast?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  showFirstLast = true,
  className
}: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <nav className={cn('flex items-center justify-center space-x-1', className)} aria-label="Pagination">
      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="Go to first page"
        >
          First
        </Button>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        Previous
      </Button>

      {showPageNumbers && (
        <div className="flex items-center space-x-1">
          {getVisiblePages().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-token-text-muted">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className="w-8 h-8 p-0"
                  aria-label={`Go to page ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </Button>

      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Go to last page"
        >
          Last
        </Button>
      )}
    </nav>
  );
} 