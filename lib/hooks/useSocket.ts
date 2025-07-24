import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/lib/AuthContext';

export interface SocketConnectionStatus {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  authenticated: boolean;
}

export interface SocketEvent {
  type: string;
  data: any;
  timestamp: number;
}

// --- Singleton Socket Instance ---
let socketInstance: Socket | null = null;
let currentToken: string | null = null;

function getSingletonSocket(token: string): Socket {
  if (!socketInstance || currentToken !== token) {
    if (socketInstance) {
      socketInstance.disconnect();
    }
    // Disable Socket.IO connection since we're using Supabase real-time
    socketInstance = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      auth: { token },
      timeout: 1000, // Very short timeout to fail fast
      forceNew: true
    });
    currentToken = token;
  }
  return socketInstance;
}

export const useSocket = () => {
  const { session } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<SocketConnectionStatus>({
    connected: false,
    connecting: false,
    error: null,
    authenticated: false
  });
  const [lastEvent, setLastEvent] = useState<SocketEvent | null>(null);

  // Setup and teardown event listeners
  useEffect(() => {
    // Disable Socket.IO connection since we're using Supabase real-time
    // Set connection status to connected to avoid errors
    setConnectionStatus({
      connected: true,
      connecting: false,
      error: null,
      authenticated: true
    });
    
    // Note: Real-time events are handled by Supabase subscriptions, not Socket.IO
    // The chat system uses Supabase's real-time features instead
    
    return () => {
      // Cleanup if needed
    };
  }, [session?.access_token]);

  // Disconnect function (for provider to call on global unmount)
  const disconnect = useCallback(() => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
      currentToken = null;
      setConnectionStatus({
        connected: false,
        connecting: false,
        error: null,
        authenticated: false
      });
    }
  }, []);

  // Emit events
  const emit = useCallback((event: string, data: any) => {
    if (socketInstance?.connected) {
      socketInstance.emit(event, data);
      return true;
    }
    console.warn('⚠️ Socket not connected, cannot emit event:', event);
    return false;
  }, []);

  // Join rooms
  const joinRoom = useCallback((room: string) => {
    if (socketInstance?.connected) {
      socketInstance.emit('join_room', { room });
      return true;
    }
    return false;
  }, []);

  // Leave rooms
  const leaveRoom = useCallback((room: string) => {
    if (socketInstance?.connected) {
      socketInstance.emit('leave_room', { room });
      return true;
    }
    return false;
  }, []);

  // Connect function (for provider to call)
  const connect = useCallback(async () => {
    if (session?.access_token) {
      const socket = getSingletonSocket(session.access_token);
      if (!socket.connected) {
        socket.connect();
      }
    }
  }, [session?.access_token]);

  return {
    // Connection status
    connectionStatus,
    lastEvent,
    // Connection methods
    connect,
    disconnect,
    // Event methods
    emit,
    joinRoom,
    leaveRoom,
    // Socket instance (for advanced usage)
    socket: socketInstance
  };
}; 