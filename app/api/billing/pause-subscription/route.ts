import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { pauseDuration } = await request.json();
    
    if (!pauseDuration || ![1, 2, 3].includes(pauseDuration)) {
      return NextResponse.json(
        { error: 'Invalid pause duration. Must be 1, 2, or 3 months.' },
        { status: 400 }
      );
    }

    // Get user from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userEmail = user.email;
    console.log('User authenticated for pause:', userEmail);

    // Get user's most recent active subscription
    const { data: allSubscriptions, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false });

    if (subscriptionError || !allSubscriptions || allSubscriptions.length === 0) {
      console.log('No subscription found for user:', userEmail);
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Find the most recent active subscription, or the most recent one if none are active
    const subscriptionData = allSubscriptions.find(sub => sub.status === 'active') || allSubscriptions[0];

    // Check if subscription is already paused
    if (subscriptionData.status === 'paused') {
      return NextResponse.json(
        { error: 'Subscription is already paused' },
        { status: 400 }
      );
    }

    // Check if subscription is active
    if (subscriptionData.status !== 'active') {
      return NextResponse.json(
        { error: 'Subscription is not active and cannot be paused' },
        { status: 400 }
      );
    }

    const { stripe_subscription_id } = subscriptionData;

    // Pause the subscription in Stripe
    const subscription = await stripe.subscriptions.update(stripe_subscription_id, {
      pause_collection: {
        behavior: 'keep_as_draft',
      },
    });

    // Calculate resume date (pause duration months from now)
    const resumeDate = new Date();
    resumeDate.setMonth(resumeDate.getMonth() + pauseDuration);

    // Update subscription in database with pause information
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'paused',
        paused_at: new Date().toISOString(),
        resume_at: resumeDate.toISOString(),
        pause_duration: pauseDuration,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', stripe_subscription_id);

    if (updateError) {
      console.error('Error updating subscription in database:', updateError);
      return NextResponse.json(
        { error: 'Failed to update subscription status' },
        { status: 500 }
      );
    }

    // Log pause event in history table
    const { error: historyError } = await supabase
      .from('subscription_pause_history')
      .insert({
        user_email: userEmail,
        stripe_subscription_id: stripe_subscription_id,
        action: 'paused',
        pause_duration: pauseDuration,
        paused_at: new Date().toISOString(),
        resume_date: resumeDate.toISOString(),
        metadata: {
          stripe_subscription_status: subscription.status,
          pause_collection_behavior: subscription.pause_collection?.behavior,
        },
      });

    if (historyError) {
      console.error('Error logging pause history:', historyError);
      // Don't fail the request if history logging fails
    }

    return NextResponse.json({
      success: true,
      message: `Subscription paused for ${pauseDuration} month${pauseDuration > 1 ? 's' : ''}`,
      resumeDate: resumeDate.toISOString(),
    });

  } catch (error) {
    console.error('Error pausing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to pause subscription' },
      { status: 500 }
    );
  }
} 