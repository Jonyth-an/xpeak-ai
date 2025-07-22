import { useEffect, useRef, useState, useCallback } from 'react';
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

export const useSocket = () => {
  const { session } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<SocketConnectionStatus>({
    connected: false,
    connecting: false,
    error: null,
    authenticated: false
  });
  const [lastEvent, setLastEvent] = useState<SocketEvent | null>(null);

  // Initialize socket connection
  const connect = useCallback(async () => {
    if (!session?.access_token) {
      setConnectionStatus(prev => ({ ...prev, error: 'No session token available' }));
      return;
    }

    if (socketRef.current?.connected) {
      return; // Already connected
    }

    setConnectionStatus(prev => ({ ...prev, connecting: true, error: null }));

    try {
      // Create socket connection
      const socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
        transports: ['websocket', 'polling'],
        autoConnect: false,
        auth: {
          token: session.access_token
        }
      });

      // Connection event handlers
      socket.on('connect', () => {
        console.log('🔌 Socket connected');
        setConnectionStatus(prev => ({ 
          ...prev, 
          connected: true, 
          connecting: false,
          error: null 
        }));

        // Authenticate with the server
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

      // Store socket reference
      socketRef.current = socket;

      // Connect to server
      socket.connect();

    } catch (error) {
      console.error('❌ Socket initialization error:', error);
      setConnectionStatus(prev => ({ 
        ...prev, 
        connecting: false,
        error: 'Failed to initialize socket'
      }));
    }
  }, [session?.access_token]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
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
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
      return true;
    }
    console.warn('⚠️ Socket not connected, cannot emit event:', event);
    return false;
  }, []);

  // Join rooms
  const joinRoom = useCallback((room: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_room', { room });
      return true;
    }
    return false;
  }, []);

  // Leave rooms
  const leaveRoom = useCallback((room: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_room', { room });
      return true;
    }
    return false;
  }, []);

  // Auto-connect when session is available
  useEffect(() => {
    if (session?.access_token && !connectionStatus.connected && !connectionStatus.connecting) {
      connect();
    }
  }, [session?.access_token, connect, connectionStatus.connected, connectionStatus.connecting]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

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
    socket: socketRef.current
  };
}; 