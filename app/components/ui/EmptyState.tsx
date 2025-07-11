import React from 'react';
import Text from './Text';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className || ''}`}>
      {icon && <div className="mb-6 text-5xl">{icon}</div>}
      {title && <Text variant="h3" className="mb-2">{title}</Text>}
      {description && <Text variant="body" className="mb-6 text-token-text-secondary max-w-md mx-auto">{description}</Text>}
      {action}
    </div>
  );
} 