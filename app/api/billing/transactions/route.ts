import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseKey) {
  throw new Error('supabaseKey is required.');
}

const supabase = createClient(supabaseUrl, supabaseKey);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function GET(request: NextRequest) {
  try {
    // Check for bypass auth header (for testing)
    const bypassAuth = request.headers.get('X-Bypass-Auth') === 'true';
    let user;

    if (bypassAuth) {
      // Test mode
      user = {
        email: 'test@example.com',
        id: '00000000-0000-0000-0000-000000000001'
      };
      console.log('Test mode enabled - using test user:', user.email);
    } else {
      // Normal mode: get the authorization header
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const token = authHeader.substring(7);
      
      // Verify the token and get user info
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !authUser) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      
      user = authUser;
    }

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const startingAfter = searchParams.get('starting_after');
    const status = searchParams.get('status'); // 'succeeded', 'processing', 'requires_payment_method', etc.
    const createdAfter = searchParams.get('created_after');
    const createdBefore = searchParams.get('created_before');

    // For test mode, return mock data
    if (bypassAuth) {
      const mockTransactions = [
        {
          id: 'pi_test_1',
          object: 'payment_intent',
          amount: 2999,
          currency: 'usd',
          status: 'succeeded',
          created: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60), // 30 days ago
          customer: 'cus_test_1',
          description: 'Xpeak Plus - Monthly Subscription',
          metadata: {
            product_name: 'Xpeak Plus',
            interval: 'Monthly'
          },
          charges: {
            data: [{
              id: 'ch_test_1',
              amount: 2999,
              currency: 'usd',
              status: 'succeeded',
              created: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60),
              description: 'Xpeak Plus - Monthly Subscription'
            }]
          }
        },
        {
          id: 'pi_test_2',
          object: 'payment_intent',
          amount: 2999,
          currency: 'usd',
          status: 'succeeded',
          created: Math.floor(Date.now() / 1000) - (60 * 24 * 60 * 60), // 60 days ago
          customer: 'cus_test_1',
          description: 'Xpeak Plus - Monthly Subscription',
          metadata: {
            product_name: 'Xpeak Plus',
            interval: 'Monthly'
          },
          charges: {
            data: [{
              id: 'ch_test_2',
              amount: 2999,
              currency: 'usd',
              status: 'succeeded',
              created: Math.floor(Date.now() / 1000) - (60 * 24 * 60 * 60),
              description: 'Xpeak Plus - Monthly Subscription'
            }]
          }
        }
      ];

      return NextResponse.json({
        transactions: mockTransactions,
        hasMore: false,
        totalCount: mockTransactions.length,
        pagination: {
          limit,
          startingAfter: null,
          hasMore: false,
        }
      });
    }

    // Get user's subscription to find customer ID
    const { data: subscriptions, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_email', user.email)
      .order('created_at', { ascending: false })
      .limit(1);

    if (subscriptionError || !subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ 
        transactions: [],
        hasMore: false,
        error: 'No subscription found for user'
      });
    }

    const customerId = subscriptions[0].stripe_customer_id;

    // Build Stripe payment intent list parameters
    const listParams: any = {
      customer: customerId,
      limit: Math.min(limit, 100), // Cap at 100 for performance
    };

    if (startingAfter) {
      listParams.starting_after = startingAfter;
    }

    if (status) {
      listParams.status = status;
    }

    // Handle date range filtering
    if (createdAfter || createdBefore) {
      listParams.created = {};
      
      if (createdAfter) {
        listParams.created.gte = parseInt(createdAfter);
      }
      
      if (createdBefore) {
        listParams.created.lte = parseInt(createdBefore);
      }
    }

    // Fetch payment intents from Stripe
    const paymentIntentsResponse = await stripe.paymentIntents.list(listParams);

    // Transform the data for better frontend consumption
    const transactions = paymentIntentsResponse.data.map(paymentIntent => {
      // Extract product information from metadata or description
      let product = 'Unknown Product';
      let interval = 'N/A';

      if (paymentIntent.metadata?.product_name) {
        product = paymentIntent.metadata.product_name;
      } else if (paymentIntent.description) {
        // Try to extract from description like "Xpeak Plus - Monthly Subscription"
        const match = paymentIntent.description.match(/(Xpeak\s+(Plus|Pro))\s*-\s*(Monthly|Quarterly|Yearly)/i);
        if (match) {
          product = match[1];
          interval = match[3];
        }
      }

      // Get the first successful charge (we'll need to fetch charges separately)
      const charge = (paymentIntent as any).charges?.data?.[0];

      return {
        id: paymentIntent.id,
        object: paymentIntent.object,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        created: paymentIntent.created,
        customer: paymentIntent.customer,
        description: paymentIntent.description,
        metadata: paymentIntent.metadata,
        product,
        interval,
        charge: charge ? {
          id: charge.id,
          amount: charge.amount,
          currency: charge.currency,
          status: charge.status,
          created: charge.created,
          description: charge.description,
          receipt_url: charge.receipt_url,
        } : null,
      };
    });

    return NextResponse.json({
      transactions,
      hasMore: paymentIntentsResponse.has_more,
      totalCount: transactions.length,
      pagination: {
        limit,
        startingAfter: paymentIntentsResponse.data[paymentIntentsResponse.data.length - 1]?.id || null,
        hasMore: paymentIntentsResponse.has_more,
      }
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch transactions',
      transactions: [],
      hasMore: false
    }, { status: 500 });
  }
} 