import { NextRequest } from 'next/server';
import { socketService } from '@/lib/services/socketService';

export async function GET(request: NextRequest) {
  // This route is used for Socket.IO health checks
  return new Response('WebSocket server is running', { status: 200 });
}

export async function POST(request: NextRequest) {
  // Handle WebSocket upgrade requests
  try {
    const body = await request.json();
    
    // Handle different types of WebSocket events
    switch (body.type) {
      case 'health_check':
        return new Response(JSON.stringify({ 
          status: 'healthy', 
          connectedUsers: socketService.getConnectedUsersCount() 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      
      case 'broadcast':
        // Handle server-side broadcasts
        if (body.role) {
          socketService.broadcastToRole(body.role, body.event, body.data);
        }
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      
      default:
        return new Response(JSON.stringify({ error: 'Unknown event type' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('WebSocket API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 