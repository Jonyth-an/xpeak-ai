import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { requireAdminAuth } from '@/lib/adminAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const adminUser = authResult.user;
    console.log('Admin user authenticated:', adminUser.email);

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y, all
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate date range
    const now = new Date();
    let start: Date;
    let end: Date = now;

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
      case 'all':
        start = new Date(0); // Beginning of time
        break;
      default:
        if (startDate && endDate) {
          start = new Date(startDate);
          end = new Date(endDate);
        } else {
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
    }

    // Fetch comprehensive analytics data
    const [
      subscriptionStats,
      revenueData,
      userStats,
      billingEvents,
      usageStats
    ] = await Promise.all([
      getSubscriptionStats(start, end),
      getRevenueData(start, end),
      getUserStats(start, end),
      getBillingEvents(start, end),
      getUsageStats(start, end)
    ]);

    const analytics = {
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
        duration: period
      },
      subscriptions: subscriptionStats,
      revenue: revenueData,
      users: userStats,
      billingEvents,
      usage: usageStats,
      generatedAt: new Date().toISOString(),
      generatedBy: adminUser.email
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getSubscriptionStats(start: Date, end: Date) {
  // Get subscription statistics from database
  const { data: subscriptions, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString());

  if (error) {
    console.error('Error fetching subscriptions:', error);
    return null;
  }

  const stats = {
    total: subscriptions?.length || 0,
    active: subscriptions?.filter(s => s.status === 'active').length || 0,
    canceled: subscriptions?.filter(s => s.status === 'canceled').length || 0,
    paused: subscriptions?.filter(s => s.status === 'paused').length || 0,
    pastDue: subscriptions?.filter(s => s.status === 'past_due').length || 0,
    byPlan: {} as Record<string, number>,
    byBillingCycle: {} as Record<string, number>,
    churnRate: 0,
    growthRate: 0
  };

  // Calculate plan distribution
  subscriptions?.forEach(sub => {
    // You'll need to add plan information to your subscription data
    const plan = 'pro'; // This should come from your subscription data
    stats.byPlan[plan] = (stats.byPlan[plan] || 0) + 1;
  });

  return stats;
}

async function getRevenueData(start: Date, end: Date) {
  try {
    // Get revenue data from Stripe
    const invoices = await stripe.invoices.list({
      created: {
        gte: Math.floor(start.getTime() / 1000),
        lte: Math.floor(end.getTime() / 1000)
      },
      limit: 100
    });

    const revenue = {
      total: 0,
      monthly: 0,
      quarterly: 0,
      yearly: 0,
      byMonth: {} as Record<string, number>,
      byPlan: {} as Record<string, number>,
      averageOrderValue: 0,
      totalInvoices: invoices.data.length
    };

    invoices.data.forEach(invoice => {
      if (invoice.status === 'paid') {
        const amount = invoice.amount_paid || 0;
        revenue.total += amount;

        // Group by month
        const month = new Date(invoice.created * 1000).toISOString().slice(0, 7);
        revenue.byMonth[month] = (revenue.byMonth[month] || 0) + amount;

        // Group by plan (you'll need to extract this from invoice items)
        const plan = 'pro'; // This should come from your invoice data
        revenue.byPlan[plan] = (revenue.byPlan[plan] || 0) + amount;
      }
    });

    revenue.averageOrderValue = revenue.total / revenue.totalInvoices;

    return revenue;
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return null;
  }
}

async function getUserStats(start: Date, end: Date) {
  // Get user statistics
  const { data: users, error } = await serverSupabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Error fetching users:', error);
    return null;
  }

  const filteredUsers = users.users.filter(user => {
    const createdAt = new Date(user.created_at);
    return createdAt >= start && createdAt <= end;
  });

  const stats = {
    total: filteredUsers.length,
    verified: filteredUsers.filter(u => u.email_confirmed_at).length,
    unverified: filteredUsers.filter(u => !u.email_confirmed_at).length,
    active: filteredUsers.filter(u => u.last_sign_in_at).length,
    inactive: filteredUsers.filter(u => !u.last_sign_in_at).length,
    byMonth: {} as Record<string, number>
  };

  // Group by month
  filteredUsers.forEach(user => {
    const month = new Date(user.created_at).toISOString().slice(0, 7);
    stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
  });

  return stats;
}

async function getBillingEvents(start: Date, end: Date) {
  // Get billing events from database
  const { data: events, error } = await supabase
    .from('billing_events')
    .select('*')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching billing events:', error);
    return [];
  }

  return events || [];
}

async function getUsageStats(start: Date, end: Date) {
  // Get usage statistics from database
  const { data: usage, error } = await supabase
    .from('user_usage')
    .select('*')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString());

  if (error) {
    console.error('Error fetching usage stats:', error);
    return null;
  }

  const stats = {
    totalApiCalls: 0,
    totalStorageUsed: 0,
    averageApiCallsPerUser: 0,
    averageStoragePerUser: 0,
    topUsers: [] as any[],
    byFeature: {} as Record<string, number>
  };

  if (usage && usage.length > 0) {
    stats.totalApiCalls = usage.reduce((sum, u) => sum + (u.api_calls || 0), 0);
    stats.totalStorageUsed = usage.reduce((sum, u) => sum + (u.storage_used_mb || 0), 0);
    stats.averageApiCallsPerUser = stats.totalApiCalls / usage.length;
    stats.averageStoragePerUser = stats.totalStorageUsed / usage.length;

    // Get top users by API calls
    const sortedUsers = usage
      .sort((a, b) => (b.api_calls || 0) - (a.api_calls || 0))
      .slice(0, 10);
    
    stats.topUsers = sortedUsers.map(u => ({
      email: u.user_email,
      apiCalls: u.api_calls || 0,
      storageUsed: u.storage_used_mb || 0
    }));
  }

  return stats;
} 