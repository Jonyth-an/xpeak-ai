import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Create service role client for API operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
      console.log('Auth error or no user:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User authenticated for cancellation:', user.email);

    // Get request body
    const { cancelType } = await request.json();
    
    if (!cancelType || !['immediate', 'end_of_period'].includes(cancelType)) {
      return NextResponse.json({ error: 'Invalid cancel type' }, { status: 400 });
    }

    // Get subscription data from database
    const { data: allSubscriptions, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_email', user.email)
      .order('created_at', { ascending: false });

    if (subscriptionError || !allSubscriptions || allSubscriptions.length === 0) {
      console.log('No subscription data found for user:', user.email);
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    // Find the most recent active subscription, or the most recent one if none are active
    const subscriptionData = allSubscriptions.find(sub => sub.status === 'active') || allSubscriptions[0];

    console.log('Canceling subscription:', subscriptionData.stripe_subscription_id);

    let canceledSubscription;

    if (cancelType === 'immediate') {
      // Cancel immediately
      canceledSubscription = await stripe.subscriptions.cancel(subscriptionData.stripe_subscription_id);
    } else {
      // Cancel at period end
      canceledSubscription = await stripe.subscriptions.update(subscriptionData.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
    }

    // Update the subscription status in our database
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({ 
        status: canceledSubscription.status,
        updated_at: new Date().toISOString()
      })
      .eq('user_email', user.email);

    if (updateError) {
      console.error('Error updating subscription status in database:', updateError);
      // Don't fail the request if database update fails
    }

    console.log('Subscription canceled successfully:', {
      subscriptionId: canceledSubscription.id,
      status: canceledSubscription.status,
      cancelType,
      cancelAtPeriodEnd: canceledSubscription.cancel_at_period_end
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: canceledSubscription.id,
        status: canceledSubscription.status,
        cancel_at_period_end: canceledSubscription.cancel_at_period_end,
        canceled_at: canceledSubscription.canceled_at,
        current_period_end: canceledSubscription.items.data[0]?.current_period_end,
      },
      message: cancelType === 'immediate' 
        ? 'Subscription canceled immediately' 
        : 'Subscription will be canceled at the end of the current period'
    });

  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json({ 
      error: 'Failed to cancel subscription',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 