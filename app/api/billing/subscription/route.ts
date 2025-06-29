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
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verify the token and get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('User authenticated:', user.email);

    // Get all subscriptions for this user and find the most recent active one
    const { data: allSubscriptions, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_email', user.email)
      .order('created_at', { ascending: false });

    console.log('Database query result:', { 
      subscriptionData: allSubscriptions && allSubscriptions.length > 0 ? allSubscriptions[0] : null, 
      subscriptionError,
      totalSubscriptions: allSubscriptions?.length || 0
    });

    if (subscriptionError) {
      console.error('Error fetching subscription data for user:', user.email, subscriptionError);
      return NextResponse.json({ 
        subscription: null, 
        customer: null, 
        paymentMethod: null,
        invoices: [],
        error: 'Failed to fetch subscription data'
      });
    }

    if (!allSubscriptions || allSubscriptions.length === 0) {
      console.log('No subscription data found for user:', user.email);
      return NextResponse.json({ 
        subscription: null, 
        customer: null, 
        paymentMethod: null,
        invoices: []
      });
    }

    // Enhanced logic to handle multiple subscriptions
    let subscriptionData = null;
    
    // First, try to find an active subscription
    subscriptionData = allSubscriptions.find(sub => sub.status === 'active');
    
    // If no active subscription, look for the most recent one regardless of status
    if (!subscriptionData) {
      subscriptionData = allSubscriptions[0];
      console.log('No active subscription found, using most recent:', subscriptionData.status);
    }
    
    // If we have multiple subscriptions, log a warning for cleanup
    if (allSubscriptions.length > 1) {
      console.warn(`Multiple subscriptions found for user ${user.email}:`, {
        total: allSubscriptions.length,
        active: allSubscriptions.filter(sub => sub.status === 'active').length,
        using: subscriptionData.id
      });
    }
    
    console.log('Using subscription:', {
      id: subscriptionData.id,
      status: subscriptionData.status,
      stripe_id: subscriptionData.stripe_subscription_id,
      created_at: subscriptionData.created_at
    });

    // Fetch subscription details from Stripe with error handling
    let subscription;
    try {
      subscription = await stripe.subscriptions.retrieve(subscriptionData.stripe_subscription_id);
      console.log('DEBUG: Stripe subscription response', JSON.stringify(subscription, null, 2));
    } catch (stripeError) {
      console.error('Error fetching subscription from Stripe:', stripeError);
      return NextResponse.json({ 
        subscription: null, 
        customer: null, 
        paymentMethod: null,
        invoices: [],
        error: 'Failed to fetch subscription from Stripe'
      });
    }

    // Fetch customer details with error handling
    let customer;
    try {
      customer = await stripe.customers.retrieve(subscriptionData.stripe_customer_id);
    } catch (stripeError) {
      console.error('Error fetching customer from Stripe:', stripeError);
      customer = null;
    }

    // Fetch payment method details with error handling
    let paymentMethod = null;
    if (subscription.default_payment_method) {
      try {
        paymentMethod = await stripe.paymentMethods.retrieve(subscription.default_payment_method as string);
      } catch (stripeError) {
        console.error('Error fetching payment method from Stripe:', stripeError);
      }
    }

    // Fetch recent invoices with error handling
    let invoices: Stripe.Invoice[] = [];
    try {
      const invoicesResponse = await stripe.invoices.list({
        customer: subscriptionData.stripe_customer_id,
        limit: 5,
        status: 'paid',
      });
      invoices = invoicesResponse.data;
    } catch (stripeError) {
      console.error('Error fetching invoices from Stripe:', stripeError);
    }

    return NextResponse.json({
      subscription: {
        ...subscription,
        // Add pause information from database
        paused_at: subscriptionData.paused_at,
        resume_at: subscriptionData.resume_at,
        pause_duration: subscriptionData.pause_duration,
      },
      customer,
      paymentMethod,
      invoices,
      // Add metadata for debugging
      _debug: {
        totalSubscriptions: allSubscriptions.length,
        activeSubscriptions: allSubscriptions.filter(sub => sub.status === 'active').length,
        selectedSubscriptionId: subscriptionData.id
      }
    });

  } catch (error) {
    console.error('Unexpected error in billing API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      subscription: null, 
      customer: null, 
      paymentMethod: null,
      invoices: []
    }, { status: 500 });
  }
} 