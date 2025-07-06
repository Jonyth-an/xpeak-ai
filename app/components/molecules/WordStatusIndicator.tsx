'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../ui';

interface WordStatusIndicatorProps {
  status: 'pending' | 'syncing' | 'synced' | 'error';
  error?: string;
  className?: string;
  showDetails?: boolean;
}

export function WordStatusIndicator({ 
  status, 
  error, 
  className = '',
  showDetails = false 
}: WordStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: '⏳',
          text: 'Pending',
          variant: 'warning' as const,
          animation: 'animate-pulse'
        };
      case 'syncing':
        return {
          icon: '🔄',
          text: 'Syncing',
          variant: 'info' as const,
          animation: 'animate-spin'
        };
      case 'synced':
        return {
          icon: '✅',
          text: 'Synced',
          variant: 'success' as const,
          animation: ''
        };
      case 'error':
        return {
          icon: '❌',
          text: 'Error',
          variant: 'error' as const,
          animation: 'animate-pulse'
        };
      default:
        return {
          icon: '❓',
          text: 'Unknown',
          variant: 'default' as const,
          animation: ''
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Status Badge */}
      <Badge variant={config.variant} size="sm" className={`flex items-center gap-1 ${config.animation}`}>
        <span>{config.icon}</span>
        <span>{config.text}</span>
      </Badge>

      {/* Error Details */}
      {showDetails && status === 'error' && error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-xs text-token-error bg-token-error/20 px-2 py-1 rounded border border-token-error max-w-xs"
        >
          {error}
        </motion.div>
      )}

      {/* Progress Indicator for Syncing */}
      {status === 'syncing' && (
        <motion.div
          className="w-4 h-4 border-2 border-token-accent/20 border-t-token-accent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}
    </div>
  );
}

// Compact version for cards
export function CompactWordStatusIndicator({ 
  status, 
  error, 
  className = '' 
}: WordStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: '⏳',
          variant: 'warning' as const,
          animation: 'animate-pulse'
        };
      case 'syncing':
        return {
          icon: '🔄',
          variant: 'info' as const,
          animation: 'animate-spin'
        };
      case 'synced':
        return {
          icon: '✅',
          variant: 'success' as const,
          animation: ''
        };
      case 'error':
        return {
          icon: '❌',
          variant: 'error' as const,
          animation: 'animate-pulse'
        };
      default:
        return {
          icon: '❓',
          variant: 'default' as const,
          animation: ''
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge 
      variant={config.variant} 
      size="sm"
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${config.animation} ${className}`}
      title={status === 'error' ? error : status}
    >
      <span>{config.icon}</span>
    </Badge>
  );
}

// Progress indicator for bulk operations
export function BulkOperationProgress({ 
  total, 
  completed, 
  failed = 0,
  className = '' 
}: {
  total: number;
  completed: number;
  failed?: number;
  className?: string;
}) {
  const progress = total > 0 ? (completed / total) * 100 : 0;
  const failedProgress = total > 0 ? (failed / total) * 100 : 0;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-xs text-token-secondary">
        <span>Progress</span>
        <span>{completed}/{total}</span>
      </div>
      <div className="w-full bg-token-surface-alt rounded-full h-2">
        <div
          className="bg-token-success"
          style={{ width: `${progress}%` }}
        />
      </div>
      {failed > 0 && (
        <div className="w-full bg-token-surface-alt rounded-full h-2 mt-1">
          <div
            className="bg-token-error"
            style={{ width: `${failedProgress}%` }}
          />
        </div>
      )}
      {failed > 0 && (
        <div className="text-xs text-token-error">
          {failed} failed
        </div>
      )}
    </div>
  );
} 