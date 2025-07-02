import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { serverSupabase } from '@/lib/serverSupabaseClient';
import { calculateProration, calculateCredit, getChangeDescription } from '@/lib/prorationCalculator';

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newPriceId } = await request.json();

    if (!newPriceId) {
      return NextResponse.json({ error: 'New price ID is required' }, { status: 400 });
    }

    // Get current active subscription
    const { data: allSubscriptions, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_email', user.email)
      .order('created_at', { ascending: false });

    if (subscriptionError) {
      return NextResponse.json({ error: 'Failed to fetch subscription data' }, { status: 500 });
    }

    if (!allSubscriptions || allSubscriptions.length === 0) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    // Find the most recent active subscription, or the most recent one if none are active
    let currentSubscription = allSubscriptions.find(sub => sub.status === 'active');
    
    // If no active subscription found, get the most recent one
    if (!currentSubscription) {
      currentSubscription = allSubscriptions[0];
    }

    // Get current subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      currentSubscription.stripe_subscription_id
    );

    // Get the new price from Stripe
    const newPrice = await stripe.prices.retrieve(newPriceId);
    
    if (!newPrice.active) {
      return NextResponse.json({ error: 'Price is not active' }, { status: 400 });
    }

    // Calculate proration
    const proration = calculateProration(stripeSubscription, newPrice);
    const credit = calculateCredit(stripeSubscription, newPrice);
    const changeDescription = getChangeDescription(
      stripeSubscription.items.data[0]?.price!,
      newPrice,
      proration
    );

    // Check if this is a downgrade (new price < current price)
    const currentAmount = stripeSubscription.items.data[0]?.price?.unit_amount || 0;
    const newAmount = newPrice.unit_amount || 0;
    const isDowngrade = newAmount < currentAmount;

    if (isDowngrade && credit.creditAmount > 0) {
      // For downgrades with credits, store the credit in the database
      const oldPriceId = stripeSubscription.items.data[0]?.price?.id;
      const { error: creditError } = await supabase
        .from('user_credits')
        .insert({
          user_email: user.email,
          amount: credit.creditAmount,
          currency: 'usd',
          source: 'subscription_downgrade',
          expires_at: new Date(Date.now() + credit.creditDays * 24 * 60 * 60 * 1000).toISOString(),
          metadata: {
            subscription_id: currentSubscription.stripe_subscription_id,
            old_price_id: oldPriceId || null,
            new_price_id: newPriceId,
            days_remaining: credit.creditDays
          }
        });

      if (creditError) {
        console.error('Error storing credit:', creditError);
        return NextResponse.json({ error: 'Failed to store credit' }, { status: 500 });
      }
    }

    // Update the subscription with the new price and proration
    const subscriptionItemId = stripeSubscription.items.data[0]?.id;
    if (!subscriptionItemId) {
      return NextResponse.json({ error: 'No subscription item found' }, { status: 400 });
    }

    const updatedSubscription = await stripe.subscriptions.update(
      currentSubscription.stripe_subscription_id,
      {
        items: [{
          id: subscriptionItemId as string,
          price: newPriceId,
        }],
        proration_behavior: 'create_prorations',
        metadata: {
          ...stripeSubscription.metadata,
          last_change: new Date().toISOString(),
          change_type: 'upgrade_downgrade',
          previous_subscription_id: currentSubscription.stripe_subscription_id,
          user_email: user.email || '',
          is_downgrade: isDowngrade.toString(),
          proration_amount: proration.prorationAmount.toString(),
          credit_amount: credit.creditAmount.toString()
        }
      }
    );

    // Update the database record
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        updated_at: new Date().toISOString(),
        metadata: {
          last_change: new Date().toISOString(),
          change_type: 'upgrade_downgrade',
          proration_amount: proration.prorationAmount,
          credit_amount: credit.creditAmount,
          new_price_id: newPriceId
        }
      })
      .eq('id', currentSubscription.id);

    if (updateError) {
      console.error('Error updating subscription in database:', updateError);
    }

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
      proration: {
        amount: proration.prorationAmount,
        description: changeDescription,
        isDowngrade,
        credit: credit.creditAmount > 0 ? {
          amount: credit.creditAmount,
          days: credit.creditDays
        } : null
      }
    });

  } catch (error) {
    console.error('Error changing subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 