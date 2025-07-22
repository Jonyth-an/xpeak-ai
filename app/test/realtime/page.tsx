'use client';

import React, { useEffect, useState } from 'react';
import { useRealtime } from '@/lib/contexts/RealtimeContext';
import { ConnectionStatus, Card } from '@/app/components/ui';
import { Button } from '@/app/components/ui/Button';
import { useToast } from '@/app/components/ui/ToastContainer';

export default function RealtimeTestPage() {
  const { state, emit, isConnected, isAuthenticated } = useRealtime();
  const { toast } = useToast();
  const [testEvents, setTestEvents] = useState<any[]>([]);

  useEffect(() => {
    console.log('🔌 Connection status:', state.connectionStatus);
    console.log('🌐 Online status:', state.isOnline);
    console.log('✅ Connected:', isConnected());
    console.log('🔐 Authenticated:', isAuthenticated());
  }, [state.connectionStatus, state.isOnline, isConnected, isAuthenticated]);

  const handleTestEvent = (eventType: string) => {
    if (!isConnected()) {
      toast({
        title: 'Not Connected',
        description: 'Please wait for connection to be established',
        type: 'warning'
      });
      return;
    }

    const testData = {
      message: `Test ${eventType} event`,
      timestamp: Date.now(),
      userId: 'test-user'
    };

    const success = emit(eventType, testData);
    
    if (success) {
      setTestEvents(prev => [...prev, { type: eventType, data: testData, timestamp: Date.now() }]);
      toast({
        title: 'Event Sent',
        description: `${eventType} event emitted successfully`,
        type: 'success'
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Real-time Infrastructure Test</h1>
        <ConnectionStatus variant="detailed" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Connection Status</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Internet:</span>
              <span className={state.isOnline ? 'text-green-500' : 'text-red-500'}>
                {state.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Socket:</span>
              <span className={state.connectionStatus.connected ? 'text-green-500' : 'text-red-500'}>
                {state.connectionStatus.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Authenticated:</span>
              <span className={isAuthenticated() ? 'text-green-500' : 'text-yellow-500'}>
                {isAuthenticated() ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Test Controls</h2>
          <div className="space-y-3">
            <Button
              onClick={() => handleTestEvent('test_event')}
              disabled={!isConnected()}
              className="w-full"
            >
              Send Test Event
            </Button>
            <Button
              onClick={() => handleTestEvent('lesson_status_update')}
              disabled={!isConnected()}
              className="w-full"
            >
              Test Lesson Status
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
} 