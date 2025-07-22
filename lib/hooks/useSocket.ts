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
    socketInstance = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      auth: { token }
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
    if (!session?.access_token) {
      setConnectionStatus(prev => ({ ...prev, error: 'No session token available' }));
      return;
    }
    const socket = getSingletonSocket(session.access_token);

    // Prevent duplicate listeners
    socket.removeAllListeners();

    // Connection event handlers
    socket.on('connect', () => {
      console.log('🔌 Socket connected');
      setConnectionStatus(prev => ({ 
        ...prev, 
        connected: true, 
        connecting: false,
        error: null 
      }));
      socket.emit('authenticate', { token: session.access_token });
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setConnectionStatus(prev => ({ 
        ...prev, 
        connected: false,
        authenticated: false,
        error: reason === 'io server disconnect' ? 'Server disconnected' : null
      }));
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setConnectionStatus(prev => ({ 
        ...prev, 
        connecting: false,
        error: error.message || 'Connection failed'
      }));
    });

    // Authentication event handlers
    socket.on('authenticated', () => {
      console.log('✅ Socket authenticated');
      setConnectionStatus(prev => ({ ...prev, authenticated: true }));
    });

    socket.on('authentication_error', (error) => {
      console.error('❌ Socket authentication error:', error);
      setConnectionStatus(prev => ({ 
        ...prev, 
        authenticated: false,
        error: error.message || 'Authentication failed'
      }));
    });

    // Real-time event handlers
    socket.on('lesson_status_changed', (data) => {
      console.log('📚 Lesson status changed:', data);
      setLastEvent({ type: 'lesson_status_changed', data, timestamp: Date.now() });
    });

    socket.on('chat_message_received', (data) => {
      console.log('💬 Chat message received:', data);
      setLastEvent({ type: 'chat_message_received', data, timestamp: Date.now() });
    });

    socket.on('material_updated', (data) => {
      console.log('📄 Material updated:', data);
      setLastEvent({ type: 'material_updated', data, timestamp: Date.now() });
    });

    socket.on('notification_received', (data) => {
      console.log('🔔 Notification received:', data);
      setLastEvent({ type: 'notification_received', data, timestamp: Date.now() });
    });

    // Connect if not already connected
    if (!socket.connected && !connectionStatus.connecting) {
      setConnectionStatus(prev => ({ ...prev, connecting: true }));
      socket.connect();
    }

    // Cleanup on unmount
    return () => {
      // Do not disconnect the singleton socket here, just remove listeners
      if (socket) {
        socket.removeAllListeners();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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