import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Get the user from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get user from Supabase
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tutor profile
    const { data: tutorProfile, error: profileError } = await serverSupabase
      .from('tutor_profiles')
      .select('id, display_name, timezone')
      .eq('user_id', user.id)
      .single();

    if (profileError || !tutorProfile) {
      return NextResponse.json({ error: 'Tutor profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || 'month';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const earningType = searchParams.get('type') || 'all';

    const currentDate = new Date();
    let startDate: Date;
    let endDate = new Date(currentDate);
    
    // Calculate date range
    switch (timeRange) {
      case 'week':
        startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        break;
      case 'quarter':
        const quarterStart = Math.floor(currentDate.getMonth() / 3) * 3;
        startDate = new Date(currentDate.getFullYear(), quarterStart, 1);
        break;
      case 'year':
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(currentDate.getFullYear(), 0, 1);
    }

    // Parallel queries for earnings data
    const [
      earningsResult,
      payoutsResult,
      summaryResult
    ] = await Promise.all([
      // Get earnings with pagination and filters
      serverSupabase
        .from('tutor_earnings')
        .select('*')
        .eq('tutor_id', tutorProfile.id)
        .gte('earned_at', startDate.toISOString())
        .lte('earned_at', endDate.toISOString())
        .eq(earningType !== 'all' ? 'earning_type' : 'tutor_id', earningType !== 'all' ? earningType : tutorProfile.id)
        .order('earned_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1),
      
      // Get recent payouts
      serverSupabase
        .from('tutor_payouts')
        .select('*')
        .eq('tutor_id', tutorProfile.id)
        .order('payout_date', { ascending: false })
        .limit(10),
      
      // Get summary data (all time)
      serverSupabase
        .from('tutor_earnings')
        .select('earning_type, amount, is_paid')
        .eq('tutor_id', tutorProfile.id)
    ]);

    const earnings = earningsResult.data || [];
    const payouts = payoutsResult.data || [];
    const allEarnings = summaryResult.data || [];

    // Calculate summary statistics
    const totalEarnings = allEarnings.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const paidEarnings = allEarnings.filter(e => e.is_paid).reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const pendingEarnings = allEarnings.filter(e => !e.is_paid).reduce((sum, e) => sum + parseFloat(e.amount), 0);
    
    const lessonEarnings = allEarnings.filter(e => e.earning_type === 'lesson').reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const bonusEarnings = allEarnings.filter(e => e.earning_type === 'bonus').reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const referralEarnings = allEarnings.filter(e => e.earning_type === 'referral').reduce((sum, e) => sum + parseFloat(e.amount), 0);

    // Calculate period earnings
    const periodEarnings = earnings.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const periodPendingEarnings = earnings.filter(e => !e.is_paid).reduce((sum, e) => sum + parseFloat(e.amount), 0);

    // Calculate monthly trends (last 6 months)
    const monthlyTrends = calculateMonthlyEarnings(allEarnings);

    // Calculate payout summary
    const totalPayouts = payouts.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const pendingPayouts = payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const completedPayouts = payouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + parseFloat(p.amount), 0);

    // Get total count for pagination
    let countQuery = serverSupabase
      .from('tutor_earnings')
      .select('id', { count: 'exact' })
      .eq('tutor_id', tutorProfile.id)
      .gte('earned_at', startDate.toISOString())
      .lte('earned_at', endDate.toISOString());

    if (earningType !== 'all') {
      countQuery = countQuery.eq('earning_type', earningType);
    }

    const { count: totalCount } = await countQuery;

    // Calculate next payout eligibility
    const nextPayoutEligible = pendingEarnings >= 50; // Minimum $50 for payout
    const nextPayoutDate = getNextPayoutDate();

    return NextResponse.json({
      summary: {
        total_earnings: Math.round(totalEarnings * 100) / 100,
        paid_earnings: Math.round(paidEarnings * 100) / 100,
        pending_earnings: Math.round(pendingEarnings * 100) / 100,
        period_earnings: Math.round(periodEarnings * 100) / 100,
        period_pending: Math.round(periodPendingEarnings * 100) / 100,
        lesson_earnings: Math.round(lessonEarnings * 100) / 100,
        bonus_earnings: Math.round(bonusEarnings * 100) / 100,
        referral_earnings: Math.round(referralEarnings * 100) / 100,
        currency: 'USD'
      },
      earnings: {
        data: earnings.map(e => ({
          id: e.id,
          earning_type: e.earning_type,
          amount: parseFloat(e.amount),
          currency: e.currency,
          description: e.description,
          bonus_tier: e.bonus_tier,
          earned_at: e.earned_at,
          is_paid: e.is_paid,
          lesson_id: e.lesson_id,
          payout_id: e.payout_id
        })),
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / limit)
        }
      },
      payouts: {
        recent_payouts: payouts.map(p => ({
          id: p.id,
          amount: parseFloat(p.amount),
          currency: p.currency,
          payment_method: p.payment_method,
          payment_account_id: p.payment_account_id,
          payout_date: p.payout_date,
          status: p.status,
          transaction_id: p.transaction_id,
          notes: p.notes,
          created_at: p.created_at
        })),
        summary: {
          total_payouts: Math.round(totalPayouts * 100) / 100,
          pending_payouts: Math.round(pendingPayouts * 100) / 100,
          completed_payouts: Math.round(completedPayouts * 100) / 100,
          next_payout_eligible: nextPayoutEligible,
          next_payout_date: nextPayoutDate,
          minimum_payout: 50.00
        }
      },
      trends: {
        monthly_data: monthlyTrends,
        time_range: timeRange,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      },
      filters: {
        earning_type: earningType,
        time_range: timeRange,
        page,
        limit
      }
    });

  } catch (error) {
    console.error('Error in earnings GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the user from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get user from Supabase
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tutor profile
    const { data: tutorProfile, error: profileError } = await serverSupabase
      .from('tutor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !tutorProfile) {
      return NextResponse.json({ error: 'Tutor profile not found' }, { status: 404 });
    }

    const { action, amount, payment_method, payment_account_id } = await request.json();

    if (action === 'request_payout') {
      // Validate payout request
      if (!amount || amount < 50) {
        return NextResponse.json({ error: 'Minimum payout amount is $50' }, { status: 400 });
      }

      if (!payment_method || !payment_account_id) {
        return NextResponse.json({ error: 'Payment method and account required' }, { status: 400 });
      }

      // Check available balance
      const { data: pendingEarnings } = await serverSupabase
        .from('tutor_earnings')
        .select('amount')
        .eq('tutor_id', tutorProfile.id)
        .eq('is_paid', false);

      const availableBalance = (pendingEarnings || []).reduce((sum, e) => sum + parseFloat(e.amount), 0);

      if (amount > availableBalance) {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
      }

      // Create payout request
      const { data: payout, error: payoutError } = await serverSupabase
        .from('tutor_payouts')
        .insert({
          tutor_id: tutorProfile.id,
          amount: amount,
          currency: 'USD',
          payment_method: payment_method,
          payment_account_id: payment_account_id,
          payout_date: new Date().toISOString(),
          status: 'pending',
          notes: 'Payout requested by tutor'
        })
        .select()
        .single();

      if (payoutError) {
        console.error('Error creating payout:', payoutError);
        return NextResponse.json({ error: 'Failed to create payout request' }, { status: 500 });
      }

      return NextResponse.json({
        payout,
        message: 'Payout request submitted successfully'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error in earnings POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to calculate monthly earnings trends
function calculateMonthlyEarnings(allEarnings: any[]) {
  const months = [];
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
    
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    
    const monthEarnings = allEarnings.filter(e => {
      const earnedDate = new Date(e.earned_at);
      return earnedDate >= monthStart && earnedDate <= monthEnd;
    });
    
    const totalAmount = monthEarnings.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const lessonAmount = monthEarnings.filter(e => e.earning_type === 'lesson').reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const bonusAmount = monthEarnings.filter(e => e.earning_type === 'bonus').reduce((sum, e) => sum + parseFloat(e.amount), 0);
    
    months.push({
      month: monthKey,
      month_name: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      total_earnings: Math.round(totalAmount * 100) / 100,
      lesson_earnings: Math.round(lessonAmount * 100) / 100,
      bonus_earnings: Math.round(bonusAmount * 100) / 100,
      transaction_count: monthEarnings.length
    });
  }
  
  return months;
}

// Helper function to get next payout date (assuming weekly payouts on Fridays)
function getNextPayoutDate() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 5 = Friday
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7; // Next Friday
  const nextFriday = new Date(today.getTime() + daysUntilFriday * 24 * 60 * 60 * 1000);
  return nextFriday.toISOString();
} 