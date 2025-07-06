import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { requireAdminAuth } from '@/lib/adminAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const adminUser = authResult.user;
    console.log('Admin user authenticated for billing analytics:', adminUser.email);

    // Get user's subscription data (for backward compatibility)
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');

    if (userEmail) {
      // If specific user requested, get their data
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subscriptionError || !subscriptionData) {
        return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
      }

      // Fetch detailed analytics from Stripe for this user
      const analytics = await getBillingAnalytics(subscriptionData.stripe_customer_id);
      return NextResponse.json(analytics);
    } else {
      // Redirect to admin analytics for comprehensive data
      return NextResponse.json({ 
        error: 'Use /api/admin/analytics for comprehensive analytics',
        redirect: '/api/admin/analytics'
      }, { status: 302 });
    }

  } catch (error) {
    console.error('Error fetching billing analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getBillingAnalytics(customerId: string) {
  try {
    // Get customer data from Stripe
    const customer = await stripe.customers.retrieve(customerId);
    
    // Get subscription data
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10
    });

    // Get invoice data
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 10
    });

    // Get payment method data
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card'
    });

    return {
      customer: {
        id: customer.id,
        email: 'deleted' in customer ? null : customer.email,
        name: 'deleted' in customer ? null : customer.name,
        created: 'deleted' in customer ? null : customer.created,
        default_source: 'deleted' in customer ? null : customer.default_source
      },
      subscriptions: subscriptions.data.map(sub => ({
        id: sub.id,
        status: sub.status,
        current_period_start: (sub as any).current_period_start,
        current_period_end: (sub as any).current_period_end,
        cancel_at_period_end: sub.cancel_at_period_end,
        created: sub.created,
        items: sub.items.data.map(item => ({
          id: item.id,
          price: {
            id: item.price.id,
            unit_amount: item.price.unit_amount,
            currency: item.price.currency,
            recurring: item.price.recurring
          }
        }))
      })),
      invoices: invoices.data.map(inv => ({
        id: inv.id,
        amount_paid: inv.amount_paid,
        status: inv.status,
        created: inv.created,
        due_date: inv.due_date,
        hosted_invoice_url: inv.hosted_invoice_url
      })),
      paymentMethods: paymentMethods.data.map(pm => ({
        id: pm.id,
        type: pm.type,
        card: pm.card ? {
          brand: pm.card.brand,
          last4: pm.card.last4,
          exp_month: pm.card.exp_month,
          exp_year: pm.card.exp_year
        } : null
      })),
      summary: {
        totalSubscriptions: subscriptions.data.length,
        activeSubscriptions: subscriptions.data.filter(s => s.status === 'active').length,
        totalInvoices: invoices.data.length,
        totalPaid: invoices.data.filter(i => i.status === 'paid').reduce((sum, inv) => sum + (inv.amount_paid || 0), 0),
        paymentMethods: paymentMethods.data.length
      }
    };
  } catch (error) {
    console.error('Error fetching Stripe analytics:', error);
    throw error;
  }
} 