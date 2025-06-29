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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log('Auth error or no user:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User authenticated for reactivation:', user.email);

    // Get subscription data from database
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_email', user.email)
      .single();

    if (subscriptionError || !subscriptionData) {
      console.log('No subscription data found for user:', user.email);
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    console.log('Reactivating subscription:', subscriptionData.stripe_subscription_id);

    // Reactivate the subscription by removing the cancel_at_period_end flag
    const reactivatedSubscription = await stripe.subscriptions.update(subscriptionData.stripe_subscription_id, {
      cancel_at_period_end: false,
    });

    // Update the subscription status in our database
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({ 
        status: reactivatedSubscription.status,
        updated_at: new Date().toISOString()
      })
      .eq('user_email', user.email);

    if (updateError) {
      console.error('Error updating subscription status in database:', updateError);
      // Don't fail the request if database update fails
    }

    console.log('Subscription reactivated successfully:', {
      subscriptionId: reactivatedSubscription.id,
      status: reactivatedSubscription.status,
      cancelAtPeriodEnd: reactivatedSubscription.cancel_at_period_end
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: reactivatedSubscription.id,
        status: reactivatedSubscription.status,
        cancel_at_period_end: reactivatedSubscription.cancel_at_period_end,
        current_period_end: reactivatedSubscription.items.data[0]?.current_period_end,
      },
      message: 'Subscription reactivated successfully'
    });

  } catch (error) {
    console.error('Error reactivating subscription:', error);
    return NextResponse.json({ 
      error: 'Failed to reactivate subscription',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 