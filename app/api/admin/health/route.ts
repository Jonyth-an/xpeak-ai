import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await requireAdminAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    // Mock health data - in production, these would be real checks
    const healthData = {
      timestamp: new Date().toISOString(),
      overall_status: 'healthy',
      services: {
        api_server: {
          status: 'healthy',
          response_time: Math.floor(Math.random() * 200) + 50, // 50-250ms
          uptime: '99.9%',
          last_check: new Date().toISOString(),
          details: 'API server responding normally'
        },
        database: {
          status: 'healthy',
          response_time: Math.floor(Math.random() * 100) + 20, // 20-120ms
          connections: Math.floor(Math.random() * 50) + 10,
          last_check: new Date().toISOString(),
          details: 'Database connection pool healthy'
        },
        stripe: {
          status: 'healthy',
          response_time: Math.floor(Math.random() * 300) + 100, // 100-400ms
          last_check: new Date().toISOString(),
          details: 'Stripe API responding normally'
        },
        supabase: {
          status: 'healthy',
          response_time: Math.floor(Math.random() * 150) + 30, // 30-180ms
          last_check: new Date().toISOString(),
          details: 'Supabase services operational'
        }
      },
      system_metrics: {
        memory_usage: Math.floor(Math.random() * 30) + 60, // 60-90%
        cpu_usage: Math.floor(Math.random() * 40) + 20, // 20-60%
        disk_usage: Math.floor(Math.random() * 20) + 30, // 30-50%
        active_users: Math.floor(Math.random() * 100) + 50 // 50-150
      },
      recent_incidents: [
        {
          id: 'inc_001',
          type: 'warning',
          title: 'High API response time',
          description: 'API response time exceeded 500ms threshold',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          resolved: true
        },
        {
          id: 'inc_002',
          type: 'info',
          title: 'Database maintenance completed',
          description: 'Scheduled database maintenance completed successfully',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
          resolved: true
        }
      ],
      alerts: {
        critical: 0,
        warning: 1,
        info: 2
      }
    };

    return NextResponse.json(healthData);
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 