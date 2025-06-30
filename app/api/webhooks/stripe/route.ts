import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Create service role client for webhook operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('Webhook received:', event.type, event.id);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'customer.updated':
        await handleCustomerUpdated(event.data.object as Stripe.Customer);
        break;
      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  let customerEmail = session.customer_email;
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;
  const changeType = (session as any).subscription_data?.metadata?.change_type;

  // If customer_email is not in session, fetch it from Stripe customer
  if (!customerEmail && customerId) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer && !customer.deleted) {
        customerEmail = customer.email;
      }
    } catch (error) {
      console.error('Error fetching customer from Stripe:', error);
    }
  }

  if (!customerEmail) {
    console.error('No customer email available for session:', session.id);
    return;
  }

  console.log('Processing checkout.session.completed:', {
    customer_email: customerEmail,
    customer_id: customerId,
    subscription_id: subscriptionId,
    change_type: changeType
  });

  // If this is a subscription change, cancel the old subscription
  if (changeType === 'upgrade_downgrade' && (session as any).subscription_data?.metadata?.previous_subscription_id) {
    const previousSubscriptionId = (session as any).subscription_data.metadata.previous_subscription_id;
    try {
      // Cancel the old subscription at period end
      await stripe.subscriptions.update(previousSubscriptionId, {
        cancel_at_period_end: true
      });
      console.log('Canceled previous subscription:', previousSubscriptionId);
    } catch (error) {
      console.error('Error canceling previous subscription:', error);
    }
  }

  // Store the new subscription data
  const subscriptionData = {
    user_email: customerEmail,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log('Upserting subscription data:', subscriptionData);

  // Upsert by user_email
  const { error: upsertError } = await supabase
    .from('user_subscriptions')
    .upsert(subscriptionData, { onConflict: 'user_email' });

  if (upsertError) {
    console.error('Error upserting user subscription:', upsertError);
  } else {
    console.log('Successfully upserted subscription data for:', customerEmail);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing subscription.updated:', {
    subscription_id: subscription.id,
    status: subscription.status,
    pause_collection: subscription.pause_collection
  });

  // First, check if this subscription exists in our database
  const { data: existingSubscription, error: fetchError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching subscription from database:', fetchError);
    return;
  }

  if (!existingSubscription) {
    console.log('Subscription not found in database, skipping update');
    return;
  }

  // Update the subscription record with current status and metadata
  const updateData: any = {
    status: subscription.status,
    updated_at: new Date().toISOString()
  };

  // Handle pause collection updates
  if (subscription.pause_collection) {
    updateData.paused_at = new Date().toISOString();
    updateData.resume_at = subscription.pause_collection.resumes_at ? 
      new Date(subscription.pause_collection.resumes_at * 1000).toISOString() : null;
  } else {
    // Clear pause data if subscription is no longer paused
    updateData.paused_at = null;
    updateData.resume_at = null;
    updateData.pause_duration = null;
  }

  // Handle automatic resume when pause period ends
  if (subscription.pause_collection?.resumes_at) {
    const resumeDate = new Date(subscription.pause_collection.resumes_at * 1000);
    const now = new Date();
    
    if (resumeDate <= now) {
      console.log('Subscription automatically resumed:', subscription.id);
      updateData.paused_at = null;
      updateData.resume_at = null;
      updateData.pause_duration = null;
    }
  }

  // Update the subscription record
  const { error: updateError } = await supabase
    .from('user_subscriptions')
    .update(updateData)
    .eq('stripe_subscription_id', subscription.id);

  if (updateError) {
    console.error('Error updating subscription in database:', updateError);
  } else {
    console.log('Successfully updated subscription:', subscription.id);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing subscription.deleted:', {
    subscription_id: subscription.id,
    status: subscription.status
  });

  // Update the subscription status to canceled/deleted
  const { error: updateError } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);

  if (updateError) {
    console.error('Error updating deleted subscription in database:', updateError);
  } else {
    console.log('Successfully marked subscription as deleted:', subscription.id);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription;
  
  console.log('Processing invoice.payment_succeeded:', {
    invoice_id: invoice.id,
    subscription_id: subscriptionId,
    amount_paid: invoice.amount_paid
  });

  // This event is useful for tracking successful payments
  // You could store payment history or trigger notifications here
  if (subscriptionId) {
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (updateError) {
      console.error('Error updating payment info:', updateError);
    }
  }
}

async function handleCustomerUpdated(customer: Stripe.Customer) {
  console.log('Processing customer.updated:', {
    customer_id: customer.id,
    email: customer.email
  });

  // Update customer information if needed
  // This could be useful for syncing customer data
} 