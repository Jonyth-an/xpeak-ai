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
    console.log('Admin user authenticated for audit trail:', adminUser.email);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType');
    const userEmail = searchParams.get('userEmail');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('billing_events')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (userEmail) {
      query = query.eq('user_email', userEmail);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Error fetching audit trail:', error);
      return NextResponse.json({ error: 'Failed to fetch audit trail' }, { status: 500 });
    }

    const auditTrail = {
      events: events || [],
      pagination: {
        limit,
        offset,
        total: events?.length || 0,
        hasMore: (events?.length || 0) >= limit
      },
      filters: {
        eventType,
        userEmail,
        startDate,
        endDate
      },
      generatedAt: new Date().toISOString(),
      generatedBy: adminUser.email
    };

    return NextResponse.json(auditTrail);

  } catch (error) {
    console.error('Error fetching audit trail:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getEventStatistics(startDate?: string | null, endDate?: string | null, userEmail?: string | null) {
  try {
    // Get billing events statistics
    let billingQuery = supabase
      .from('billing_events')
      .select('event_type, created_at');

    if (startDate) {
      billingQuery = billingQuery.gte('created_at', startDate);
    }
    if (endDate) {
      billingQuery = billingQuery.lte('created_at', endDate);
    }
    if (userEmail) {
      billingQuery = billingQuery.eq('user_email', userEmail);
    }

    const { data: billingEvents, error: billingError } = await billingQuery;

    if (billingError) {
      console.error('Error fetching billing events for stats:', billingError);
      return null;
    }

    // Get subscription changes statistics
    let changesQuery = supabase
      .from('subscription_changes')
      .select('change_type, created_at');

    if (startDate) {
      changesQuery = changesQuery.gte('created_at', startDate);
    }
    if (endDate) {
      changesQuery = changesQuery.lte('created_at', endDate);
    }
    if (userEmail) {
      changesQuery = changesQuery.eq('user_email', userEmail);
    }

    const { data: subscriptionChanges, error: changesError } = await changesQuery;

    if (changesError) {
      console.error('Error fetching subscription changes for stats:', changesError);
    }

    // Calculate statistics
    const stats = {
      totalEvents: (billingEvents?.length || 0) + (subscriptionChanges?.length || 0),
      billingEvents: {
        total: billingEvents?.length || 0,
        byType: {} as Record<string, number>
      },
      subscriptionChanges: {
        total: subscriptionChanges?.length || 0,
        byType: {} as Record<string, number>
      },
      byDate: {} as Record<string, number>
    };

    // Count billing events by type
    billingEvents?.forEach(event => {
      stats.billingEvents.byType[event.event_type] = (stats.billingEvents.byType[event.event_type] || 0) + 1;
      
      // Count by date
      const date = new Date(event.created_at).toISOString().split('T')[0];
      stats.byDate[date] = (stats.byDate[date] || 0) + 1;
    });

    // Count subscription changes by type
    subscriptionChanges?.forEach(change => {
      stats.subscriptionChanges.byType[change.change_type] = (stats.subscriptionChanges.byType[change.change_type] || 0) + 1;
      
      // Count by date
      const date = new Date(change.created_at).toISOString().split('T')[0];
      stats.byDate[date] = (stats.byDate[date] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error calculating event statistics:', error);
    return null;
  }
} 