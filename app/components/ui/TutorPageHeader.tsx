import React from 'react';
import { cn } from '@/lib/utils';
import Text from './Text';

interface TutorPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  titleVariant?: 'h1' | 'h2' | 'h3';
  subtitleVariant?: 'body' | 'lead' | 'small';
}

export default function TutorPageHeader({
  title,
  subtitle,
  actions,
  className,
  titleVariant = 'h1',
  subtitleVariant = 'body'
}: TutorPageHeaderProps) {
  return (
    <div className={cn(
      'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4',
      className
    )}>
      <div className="flex-1 min-w-0">
        <Text 
          variant={titleVariant} 
          as={titleVariant} 
          className="text-token-primary mb-2"
        >
          {title}
        </Text>
        {subtitle && (
          <Text 
            variant={subtitleVariant} 
            className="text-token-text-secondary"
          >
            {subtitle}
          </Text>
        )}
      </div>
      
      {actions && (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {actions}
        </div>
      )}
    </div>
  );
} 