import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/adminAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const adminUser = authResult.user;
    console.log('Admin user authenticated:', adminUser.email);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const feature = searchParams.get('feature') || 'all';

    // Calculate date range
    const now = new Date();
    let start: Date;

    switch (period) {
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // For now, we'll return mock data since we don't have a usage tracking table yet
    // In a real implementation, you would query a user_usage or similar table
    const mockUsageData = [
      {
        user_email: 'clshou@gmail.com',
        feature: 'ai_topics',
        usage_count: 45,
        last_used: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_email: 'clshou@gmail.com',
        feature: 'word_maze',
        usage_count: 23,
        last_used: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_email: 'clshou@gmail.com',
        feature: 'tutor_matching',
        usage_count: 12,
        last_used: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_email: 'test@example.com',
        feature: 'ai_topics',
        usage_count: 18,
        last_used: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_email: 'demo@example.com',
        feature: 'word_maze',
        usage_count: 31,
        last_used: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Filter by feature if specified
    let filteredData = mockUsageData;
    if (feature !== 'all') {
      filteredData = mockUsageData.filter(usage => usage.feature === feature);
    }

    // Filter by date range
    filteredData = filteredData.filter(usage => {
      const usageDate = new Date(usage.last_used);
      return usageDate >= start && usageDate <= now;
    });

    return NextResponse.json({
      usage: filteredData,
      period: {
        start: start.toISOString(),
        end: now.toISOString(),
        duration: period
      },
      totalUsage: filteredData.reduce((sum, usage) => sum + usage.usage_count, 0),
      uniqueUsers: new Set(filteredData.map(u => u.user_email)).size,
      generatedAt: new Date().toISOString(),
      generatedBy: adminUser.email
    });

  } catch (error) {
    console.error('Error fetching admin usage data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 