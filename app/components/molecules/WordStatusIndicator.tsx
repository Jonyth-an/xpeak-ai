'use client';

import { Word } from '../../../lib/stores/wordMazeStore';
import { Badge } from '../ui/Badge';

interface WordStatusIndicatorProps {
  status: Word['status'];
  error?: string;
  className?: string;
}

export const WordStatusIndicator = ({ 
  status, 
  error, 
  className = '' 
}: WordStatusIndicatorProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          variant: 'secondary' as const,
          className: 'animate-pulse',
        };
      case 'syncing':
        return {
          label: 'Syncing...',
          variant: 'default' as const,
          className: 'animate-pulse',
        };
      case 'synced':
        return {
          label: 'Synced',
          variant: 'default' as const,
          className: 'text-green-600',
        };
      case 'error':
        return {
          label: 'Error',
          variant: 'destructive' as const,
          className: 'text-red-600',
        };
      default:
        return {
          label: 'Unknown',
          variant: 'secondary' as const,
          className: '',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant={config.variant}
        className={`text-xs ${config.className}`}
      >
        {config.label}
      </Badge>
      {error && (
        <span className="text-xs text-red-500" title={error}>
          ⚠️
        </span>
      )}
    </div>
  );
}; 