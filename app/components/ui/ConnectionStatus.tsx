'use client';

import React from 'react';
import { useRealtime } from '@/lib/contexts/RealtimeContext';
import { Wifi, WifiOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  className?: string;
  showDetails?: boolean;
  variant?: 'minimal' | 'detailed' | 'full';
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  className,
  showDetails = false,
  variant = 'minimal'
}) => {
  const { state, isConnected, isAuthenticated } = useRealtime();
  const { connectionStatus, isOnline } = state;

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        text: 'Offline',
        description: 'No internet connection'
      };
    }

    if (connectionStatus.connecting) {
      return {
        icon: Loader2,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        text: 'Connecting...',
        description: 'Establishing real-time connection'
      };
    }

    if (connectionStatus.error) {
      return {
        icon: AlertCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        text: 'Connection Error',
        description: connectionStatus.error
      };
    }

    if (isConnected()) {
      return {
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        text: 'Connected',
        description: 'Real-time connection active'
      };
    }

    if (connectionStatus.connected && !isAuthenticated()) {
      return {
        icon: AlertCircle,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        text: 'Authenticating...',
        description: 'Verifying user session'
      };
    }

    return {
      icon: WifiOff,
      color: 'text-gray-400',
      bgColor: 'bg-gray-50',
      text: 'Disconnected',
      description: 'Real-time features unavailable'
    };
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className={cn('p-1 rounded-full', statusInfo.bgColor)}>
          <Icon className={cn('h-3 w-3', statusInfo.color)} />
        </div>
        {showDetails && (
          <span className="text-xs text-token-text-muted">
            {statusInfo.text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('flex items-center gap-3 p-2 rounded-lg', statusInfo.bgColor, className)}>
        <div className={cn('p-1 rounded-full', statusInfo.bgColor)}>
          <Icon className={cn('h-4 w-4', statusInfo.color)} />
        </div>
        <div className="flex flex-col">
          <span className={cn('text-sm font-medium', statusInfo.color)}>
            {statusInfo.text}
          </span>
          <span className="text-xs text-token-text-muted">
            {statusInfo.description}
          </span>
        </div>
        {connectionStatus.connecting && (
          <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div className={cn('flex flex-col gap-2 p-3 rounded-lg border', statusInfo.bgColor, className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', statusInfo.color)} />
          <span className={cn('text-sm font-medium', statusInfo.color)}>
            {statusInfo.text}
          </span>
        </div>
        {connectionStatus.connecting && (
          <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
        )}
      </div>
      
      <span className="text-xs text-token-text-muted">
        {statusInfo.description}
      </span>
      
      {variant === 'full' && (
        <div className="text-xs text-token-text-muted space-y-1">
          <div className="flex justify-between">
            <span>Internet:</span>
            <span className={isOnline ? 'text-green-500' : 'text-red-500'}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Socket:</span>
            <span className={connectionStatus.connected ? 'text-green-500' : 'text-red-500'}>
              {connectionStatus.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Auth:</span>
            <span className={isAuthenticated() ? 'text-green-500' : 'text-yellow-500'}>
              {isAuthenticated() ? 'Authenticated' : 'Pending'}
            </span>
          </div>
          {state.pendingEvents.length > 0 && (
            <div className="flex justify-between">
              <span>Pending:</span>
              <span className="text-yellow-500">
                {state.pendingEvents.length} events
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 