import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    // Get user from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userEmail = user.email;
    console.log('User authenticated for pause history:', userEmail);

    // Get pause history for the user
    const { data: pauseHistory, error: historyError } = await supabase
      .from('subscription_pause_history')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false })
      .limit(10); // Limit to last 10 events

    if (historyError) {
      console.error('Error fetching pause history:', historyError);
      return NextResponse.json(
        { error: 'Failed to fetch pause history' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pauseHistory: pauseHistory || [],
    });

  } catch (error) {
    console.error('Error fetching pause history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pause history' },
      { status: 500 }
    );
  }
} 