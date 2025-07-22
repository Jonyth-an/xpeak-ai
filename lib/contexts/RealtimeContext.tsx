'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSocket, SocketConnectionStatus, SocketEvent } from '@/lib/hooks/useSocket';
import { useAuth } from '@/lib/AuthContext';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  showNativeNotification,
  NotificationPayload
} from '@/lib/utils/notificationUtils';

export interface RealtimeState {
  connectionStatus: SocketConnectionStatus;
  lastEvent: SocketEvent | null;
  isOnline: boolean;
  pendingEvents: SocketEvent[];
}

export interface RealtimeContextType {
  // State
  state: RealtimeState;
  
  // Connection methods
  connect: () => Promise<void>;
  disconnect: () => void;
  
  // Event methods
  emit: (event: string, data: any) => boolean;
  joinRoom: (room: string) => boolean;
  leaveRoom: (room: string) => boolean;
  
  // Utility methods
  isConnected: () => boolean;
  isAuthenticated: () => boolean;
  clearPendingEvents: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

interface RealtimeProviderProps {
  children: ReactNode;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ children }) => {
  const { session } = useAuth();
  const socket = useSocket();
  
  const [state, setState] = useState<RealtimeState>({
    connectionStatus: {
      connected: false,
      connecting: false,
      error: null,
      authenticated: false
    },
    lastEvent: null,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingEvents: []
  });

  const [hasPromptedNotification, setHasPromptedNotification] = useState(false);

  // Update state when socket connection status changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      connectionStatus: socket.connectionStatus,
      lastEvent: socket.lastEvent
    }));
  }, [socket.connectionStatus, socket.lastEvent]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      console.log('🌐 Browser went online');
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
      console.log('🌐 Browser went offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-reconnect when coming back online
  useEffect(() => {
    if (state.isOnline && session?.access_token && !state.connectionStatus.connected) {
      console.log('🔄 Attempting to reconnect...');
      socket.connect();
    }
  }, [state.isOnline, session?.access_token, state.connectionStatus.connected, socket]);

  // Store pending events when offline
  useEffect(() => {
    if (!state.isOnline && socket.lastEvent) {
      setState(prev => ({
        ...prev,
        pendingEvents: [...prev.pendingEvents, socket.lastEvent!]
      }));
    }
  }, [socket.lastEvent, state.isOnline]);

  // Connection methods
  const connect = async () => {
    await socket.connect();
  };

  const disconnect = () => {
    socket.disconnect();
  };

  // Event methods
  const emit = (event: string, data: any) => {
    if (!state.connectionStatus.connected) {
      // Store event for later if offline
      const pendingEvent: SocketEvent = {
        type: event,
        data,
        timestamp: Date.now()
      };
      setState(prev => ({
        ...prev,
        pendingEvents: [...prev.pendingEvents, pendingEvent]
      }));
      return false;
    }
    return socket.emit(event, data);
  };

  const joinRoom = (room: string) => {
    return socket.joinRoom(room);
  };

  const leaveRoom = (room: string) => {
    return socket.leaveRoom(room);
  };

  // Utility methods
  const isConnected = () => {
    return state.connectionStatus.connected && state.connectionStatus.authenticated;
  };

  const isAuthenticated = () => {
    return state.connectionStatus.authenticated;
  };

  const clearPendingEvents = () => {
    setState(prev => ({ ...prev, pendingEvents: [] }));
  };

  // Send pending events when reconnected
  useEffect(() => {
    if (state.connectionStatus.connected && state.pendingEvents.length > 0) {
      console.log(`📤 Sending ${state.pendingEvents.length} pending events...`);
      state.pendingEvents.forEach(event => {
        socket.emit(event.type, event.data);
      });
      clearPendingEvents();
    }
  }, [state.connectionStatus.connected, state.pendingEvents, socket]);

  useEffect(() => {
    if (!state.lastEvent) return;
    // Only prompt for permission on first relevant event
    if (!hasPromptedNotification && isNotificationSupported()) {
      if (
        state.lastEvent.type === 'lesson_status_changed' ||
        state.lastEvent.type === 'notification_received' ||
        state.lastEvent.type === 'chat_message'
      ) {
        setHasPromptedNotification(true);
        if (getNotificationPermission() === 'default') {
          requestNotificationPermission();
        }
      }
    }
    // Show native notification if granted and tab is not focused
    if (isNotificationSupported() && getNotificationPermission() === 'granted' && document.visibilityState !== 'visible') {
      let payload: NotificationPayload | null = null;
      if (state.lastEvent.type === 'lesson_status_changed') {
        payload = {
          title: 'Lesson Status Updated',
          body: `Lesson status updated: ${state.lastEvent.data.status}`,
          url: window.location.origin + '/lessons/' + state.lastEvent.data.lessonId
        };
      } else if (state.lastEvent.type === 'notification_received') {
        payload = {
          title: state.lastEvent.data.title || 'Notification',
          body: state.lastEvent.data.message,
          url: window.location.origin
        };
      } else if (state.lastEvent.type === 'chat_message') {
        payload = {
          title: state.lastEvent.data.senderName || 'New Chat Message',
          body: state.lastEvent.data.text || 'You have a new message',
          url: window.location.origin + '/chat/' + (state.lastEvent.data.conversationId || '')
        };
      }
      if (payload) {
        showNativeNotification(payload);
      }
    }
  }, [state.lastEvent, hasPromptedNotification]);

  const contextValue: RealtimeContextType = {
    state,
    connect,
    disconnect,
    emit,
    joinRoom,
    leaveRoom,
    isConnected,
    isAuthenticated,
    clearPendingEvents
  };

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  );
}; 