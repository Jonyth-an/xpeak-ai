import React from 'react';
import { cn } from '@/lib/utils';
import Card from './Card';
import Text from './Text';

interface MetricCard {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

interface MetricsGridProps {
  metrics: MetricCard[];
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  cardVariant?: 'default' | 'elevated' | 'outlined' | 'flat';
  cardPadding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function MetricsGrid({
  metrics,
  columns = 4,
  className,
  cardVariant = 'default',
  cardPadding = 'md'
}: MetricsGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  return (
    <div className={cn(
      'grid gap-4 sm:gap-6',
      gridCols[columns],
      className
    )}>
      {metrics.map((metric, index) => (
        <Card
          key={index}
          variant={cardVariant}
          padding={cardPadding}
          className={cn(
            'transition-all duration-200 hover:shadow-md',
            metric.className
          )}
        >
          <div className="flex items-center">
            {metric.icon && (
              <div className={cn(
                'p-3 rounded-lg flex-shrink-0',
                metric.iconBgColor || 'bg-blue-100',
                metric.iconColor || 'text-blue-600'
              )}>
                {metric.icon}
              </div>
            )}
            <div className={cn('flex-1 min-w-0', metric.icon && 'ml-4')}>
              <Text 
                variant="h2" 
                as="h2" 
                className="text-2xl font-bold text-token-text-primary mb-1"
              >
                {metric.value}
              </Text>
              <Text 
                variant="small" 
                className="text-token-text-secondary mb-1"
              >
                {metric.title}
              </Text>
              {metric.subtitle && (
                <Text 
                  variant="small" 
                  className="text-token-text-muted"
                >
                  {metric.subtitle}
                </Text>
              )}
              {metric.trend && (
                <div className="flex items-center mt-2">
                  <Text 
                    variant="small" 
                    className={cn(
                      'flex items-center',
                      metric.trend.isPositive ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {metric.trend.isPositive ? '↗' : '↘'} {Math.abs(metric.trend.value)}%
                  </Text>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 