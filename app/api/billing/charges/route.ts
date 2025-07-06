import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's Stripe customer ID
    const { data: profile, error: profileError } = await serverSupabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'No Stripe customer found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const startingAfter = searchParams.get('starting_after');

    // Fetch charges from Stripe
    const charges = await stripe.charges.list({
      customer: profile.stripe_customer_id,
      limit,
      starting_after: startingAfter || undefined,
      expand: ['data.payment_intent'],
    });

    // Process charges to extract product information
    const processedCharges = charges.data.map((charge) => {
      let product = 'Unknown Product';
      let interval = 'N/A';

      // Try to get product info from payment intent metadata
      if (charge.payment_intent && typeof charge.payment_intent === 'object') {
        const paymentIntent = charge.payment_intent as any;
        if (paymentIntent.metadata?.product) {
          product = paymentIntent.metadata.product;
        }
        if (paymentIntent.metadata?.interval) {
          interval = paymentIntent.metadata.interval;
        }
      }

      // Try to get product info from charge description
      if (charge.description) {
        // Common patterns in charge descriptions
        if (charge.description.includes('Xpeak Plus')) {
          product = 'Xpeak Plus';
          if (charge.description.includes('Monthly')) {
            interval = 'Monthly';
          } else if (charge.description.includes('Yearly')) {
            interval = 'Yearly';
          }
        } else if (charge.description.includes('Xpeak Pro')) {
          product = 'Xpeak Pro';
          if (charge.description.includes('Monthly')) {
            interval = 'Monthly';
          } else if (charge.description.includes('Yearly')) {
            interval = 'Yearly';
          }
        }
      }

      return {
        id: charge.id,
        amount: charge.amount,
        currency: charge.currency,
        status: charge.status,
        created: charge.created,
        description: charge.description,
        product,
        interval,
        receipt_url: charge.receipt_url,
      };
    });

    return NextResponse.json({
      charges: processedCharges,
      has_more: charges.has_more,
    });

  } catch (error) {
    console.error('Error fetching charges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch charges' },
      { status: 500 }
    );
  }
} 