import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
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
    console.log('User authenticated for resume:', userEmail);

    // Get user's most recent paused subscription
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

    // Find the most recent paused subscription
    const subscriptionData = allSubscriptions.find(sub => sub.status === 'paused');
    
    if (!subscriptionData) {
      console.log('No paused subscription found for user:', userEmail);
      return NextResponse.json(
        { error: 'No paused subscription found' },
        { status: 404 }
      );
    }

    const { stripe_subscription_id, paused_at, resume_at, pause_duration } = subscriptionData;

    // Resume the subscription in Stripe
    const subscription = await stripe.subscriptions.update(stripe_subscription_id, {
      pause_collection: null, // Remove pause collection
    });

    // Update subscription in database - clear pause information
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'active',
        paused_at: null,
        resume_at: null,
        pause_duration: null,
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

    // Log resume event in history table
    const { error: historyError } = await supabase
      .from('subscription_pause_history')
      .insert({
        user_email: userEmail,
        stripe_subscription_id: stripe_subscription_id,
        action: 'resumed',
        resumed_at: new Date().toISOString(),
        metadata: {
          stripe_subscription_status: subscription.status,
          original_pause_duration: pause_duration,
          original_paused_at: paused_at,
          original_resume_at: resume_at,
          resumed_early: new Date() < new Date(resume_at || ''),
        },
      });

    if (historyError) {
      console.error('Error logging resume history:', historyError);
      // Don't fail the request if history logging fails
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription resumed successfully',
      subscription: {
        id: subscription.id,
        status: subscription.status,
      },
    });

  } catch (error) {
    console.error('Error resuming subscription:', error);
    return NextResponse.json(
      { error: 'Failed to resume subscription' },
      { status: 500 }
    );
  }
} 