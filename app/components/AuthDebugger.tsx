'use client';

import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from './ui/Button';
import Text from './ui/Text';

export default function AuthDebugger() {
  const { user, session, loading, clearStaleAuth } = useAuth();

  const handleClearAuth = async () => {
    await clearStaleAuth();
    // Reload the page to ensure clean state
    window.location.reload();
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-token-surface border border-token-surface-alt rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <Text variant="small" className="font-medium mb-2">Auth Debugger (Dev Only)</Text>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>User:</strong> {user ? user.email : 'None'}
        </div>
        <div>
          <strong>Session:</strong> {session ? 'Active' : 'None'}
        </div>
        <div>
          <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
        </div>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleClearAuth}
        className="mt-3 w-full"
      >
        Clear Stale Auth
      </Button>
    </div>
  );
} 