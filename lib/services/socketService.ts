import { Server as SocketIOServer } from 'socket.io';
import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export interface SocketData {
  userId: string;
  userRole: 'tutor' | 'student' | 'admin';
  sessionToken: string;
}

export interface RealtimeEvent {
  type: 'lesson_status' | 'notification' | 'chat_message' | 'material_update';
  data: any;
  timestamp: number;
  userId?: string;
}

class SocketService {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, SocketData> = new Map();

  initialize(server: NetServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
    console.log('✅ WebSocket server initialized');
  }

  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', async (socket) => {
      console.log(`🔌 New socket connection: ${socket.id}`);

      // Handle authentication
      socket.on('authenticate', async (data: { token: string }) => {
        try {
          const userData = await this.authenticateUser(data.token);
          if (userData) {
            this.connectedUsers.set(socket.id, userData);
            socket.data = userData;
            
            // Join user-specific rooms
            socket.join(`user:${userData.userId}`);
            socket.join(`role:${userData.userRole}`);
            
            socket.emit('authenticated', { success: true });
            console.log(`✅ User authenticated: ${userData.userId} (${userData.userRole})`);
          } else {
            socket.emit('authentication_error', { message: 'Invalid token' });
          }
        } catch (error) {
          console.error('❌ Authentication error:', error);
          socket.emit('authentication_error', { message: 'Authentication failed' });
        }
      });

      // Handle lesson status updates
      socket.on('lesson_status_update', (data: { lessonId: string; status: string }) => {
        this.broadcastLessonStatus(data.lessonId, data.status);
      });

      // Handle chat messages
      socket.on('chat_message', (data: { lessonId: string; message: string; senderId: string }) => {
        this.broadcastChatMessage(data.lessonId, data.message, data.senderId);
      });

      // Handle material updates
      socket.on('material_update', (data: { materialId: string; action: 'created' | 'updated' | 'deleted' }) => {
        this.broadcastMaterialUpdate(data.materialId, data.action);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
        this.connectedUsers.delete(socket.id);
      });
    });
  }

  private async authenticateUser(token: string): Promise<SocketData | null> {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Verify the session token
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        console.error('❌ Token verification failed:', error);
        return null;
      }

      // Get user role from database
      const { data: profile, error: profileError } = await supabase
        .from('tutor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let userRole: 'tutor' | 'student' | 'admin' = 'student';
      if (profile) {
        userRole = 'tutor';
      }

      // Check if user is admin (you can add your admin logic here)
      if (user.email?.includes('admin')) {
        userRole = 'admin';
      }

      return {
        userId: user.id,
        userRole,
        sessionToken: token
      };
    } catch (error) {
      console.error('❌ Authentication error:', error);
      return null;
    }
  }

  // Broadcast methods
  public broadcastLessonStatus(lessonId: string, status: string) {
    if (!this.io) return;
    
    this.io.to(`lesson:${lessonId}`).emit('lesson_status_changed', {
      lessonId,
      status,
      timestamp: Date.now()
    });
  }

  public broadcastChatMessage(lessonId: string, message: string, senderId: string) {
    if (!this.io) return;
    
    this.io.to(`lesson:${lessonId}`).emit('chat_message_received', {
      lessonId,
      message,
      senderId,
      timestamp: Date.now()
    });
  }

  public broadcastMaterialUpdate(materialId: string, action: 'created' | 'updated' | 'deleted') {
    if (!this.io) return;
    
    this.io.to('role:tutor').emit('material_updated', {
      materialId,
      action,
      timestamp: Date.now()
    });
  }

  public sendNotification(userId: string, notification: any) {
    if (!this.io) return;
    
    this.io.to(`user:${userId}`).emit('notification_received', {
      ...notification,
      timestamp: Date.now()
    });
  }

  public broadcastToRole(role: string, event: string, data: any) {
    if (!this.io) return;
    
    this.io.to(`role:${role}`).emit(event, {
      ...data,
      timestamp: Date.now()
    });
  }

  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public getConnectedUsers(): Map<string, SocketData> {
    return new Map(this.connectedUsers);
  }
}

// Export singleton instance
export const socketService = new SocketService(); 