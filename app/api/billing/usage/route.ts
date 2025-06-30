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
    console.log('Admin user authenticated for usage tracking:', adminUser.email);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (userEmail) {
      // Get usage data for specific user
      const { data: usageData, error: usageError } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1);

      if (usageError) {
        console.error('Error fetching usage data:', usageError);
        return NextResponse.json({ error: 'Failed to fetch usage data' }, { status: 500 });
      }

      // Get user's subscription data
      const { data: subscriptionData } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const usageLimits = getUsageLimits(subscriptionData?.status === 'active' ? 'pro' : 'free');

      return NextResponse.json({
        userEmail,
        usage: usageData || [],
        limits: usageLimits,
        subscription: subscriptionData
      });
    } else {
      // Get comprehensive usage data for all users (admin view)
      let query = supabase
        .from('user_usage')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data: allUsage, error: allUsageError } = await query;

      if (allUsageError) {
        console.error('Error fetching all usage data:', allUsageError);
        return NextResponse.json({ error: 'Failed to fetch usage data' }, { status: 500 });
      }

      // Calculate usage statistics
      const stats = calculateUsageStats(allUsage || []);

      return NextResponse.json({
        usage: allUsage || [],
        statistics: stats,
        pagination: {
          limit,
          offset,
          total: allUsage?.length || 0,
          hasMore: (allUsage?.length || 0) >= limit
        },
        filters: {
          startDate,
          endDate
        },
        generatedAt: new Date().toISOString(),
        generatedBy: adminUser.email
      });
    }

  } catch (error) {
    console.error('Error fetching usage data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verify the token and get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { api_calls, storage_mb, feature } = await request.json();

    // Get current usage
    const { data: currentUsage } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_email', user.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Calculate new usage
    const newApiCalls = (currentUsage?.api_calls || 0) + (api_calls || 0);
    const newStorageMb = (currentUsage?.storage_mb || 0) + (storage_mb || 0);
    const newFeaturesUsed = feature ? 
      [...(currentUsage?.features_used || []), feature] : 
      (currentUsage?.features_used || []);

    // Upsert usage data
    const { error: upsertError } = await supabase
      .from('user_usage')
      .upsert({
        user_email: user.email,
        api_calls: newApiCalls,
        storage_mb: newStorageMb,
        features_used: newFeaturesUsed,
        last_updated: new Date().toISOString()
      }, { onConflict: 'user_email' });

    if (upsertError) {
      console.error('Error updating usage data:', upsertError);
      return NextResponse.json({ error: 'Failed to update usage' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      newUsage: {
        api_calls: newApiCalls,
        storage_mb: newStorageMb,
        features_used: newFeaturesUsed
      }
    });

  } catch (error) {
    console.error('Error updating usage data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getUsageLimits(plan: string) {
  const limits = {
    free: {
      apiCalls: 100,
      storage: 100, // MB
      features: ['basic_chat', 'word_bank']
    },
    plus: {
      apiCalls: 1000,
      storage: 500, // MB
      features: ['basic_chat', 'word_bank', 'ai_topics', 'tutor_matching']
    },
    pro: {
      apiCalls: 10000,
      storage: 2000, // MB
      features: ['basic_chat', 'word_bank', 'ai_topics', 'tutor_matching', 'advanced_analytics', 'priority_support']
    }
  };

  return limits[plan as keyof typeof limits] || limits.free;
}

function calculateUsageStats(usageData: any[]) {
  const stats = {
    totalUsers: new Set(usageData.map(u => u.user_email)).size,
    totalApiCalls: usageData.reduce((sum, u) => sum + (u.api_calls || 0), 0),
    totalStorageUsed: usageData.reduce((sum, u) => sum + (u.storage_used_mb || 0), 0),
    averageApiCallsPerUser: 0,
    averageStoragePerUser: 0,
    topUsers: [] as { email: string; apiCalls: number; storageUsed: number }[],
    byFeature: {} as Record<string, number>,
    byDate: {} as Record<string, number>
  };

  if (usageData.length > 0) {
    stats.averageApiCallsPerUser = stats.totalApiCalls / stats.totalUsers;
    stats.averageStoragePerUser = stats.totalStorageUsed / stats.totalUsers;

    // Get top users by API calls
    const userStats = usageData.reduce((acc, usage) => {
      if (!acc[usage.user_email]) {
        acc[usage.user_email] = {
          email: usage.user_email,
          apiCalls: 0,
          storageUsed: 0
        };
      }
      acc[usage.user_email].apiCalls += usage.api_calls || 0;
      acc[usage.user_email].storageUsed += usage.storage_used_mb || 0;
      return acc;
    }, {} as Record<string, { email: string; apiCalls: number; storageUsed: number }>);

    stats.topUsers = (Object.values(userStats) as { email: string; apiCalls: number; storageUsed: number }[])
      .sort((a, b) => b.apiCalls - a.apiCalls)
      .slice(0, 10);

    // Group by date
    usageData.forEach(usage => {
      const date = new Date(usage.created_at).toISOString().split('T')[0];
      stats.byDate[date] = (stats.byDate[date] || 0) + (usage.api_calls || 0);
    });
  }

  return stats;
} 