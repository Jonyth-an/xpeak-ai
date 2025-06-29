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

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const startingAfter = searchParams.get('starting_after');
    const status = searchParams.get('status'); // 'paid', 'open', 'draft', 'void', 'uncollectible'
    const createdAfter = searchParams.get('created_after');
    const createdBefore = searchParams.get('created_before');

    // Get user's subscription to find customer ID
    const { data: subscriptions, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_email', user.email)
      .order('created_at', { ascending: false })
      .limit(1);

    if (subscriptionError || !subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ 
        invoices: [],
        hasMore: false,
        error: 'No subscription found for user'
      });
    }

    const customerId = subscriptions[0].stripe_customer_id;

    // Build Stripe invoice list parameters
    const listParams: Stripe.InvoiceListParams = {
      customer: customerId,
      limit: Math.min(limit, 100), // Cap at 100 for performance
    };

    if (startingAfter) {
      listParams.starting_after = startingAfter;
    }

    if (status) {
      listParams.status = status as Stripe.InvoiceListParams.Status;
    }

    if (createdAfter) {
      listParams.created = { gte: parseInt(createdAfter) };
    }

    if (createdBefore) {
      if (listParams.created && typeof listParams.created === 'object') {
        listParams.created.lte = parseInt(createdBefore);
      } else {
        listParams.created = { lte: parseInt(createdBefore) };
      }
    }

    // Fetch invoices from Stripe
    const invoicesResponse = await stripe.invoices.list(listParams);

    // Transform the data for better frontend consumption
    const invoices = invoicesResponse.data.map(invoice => ({
      id: invoice.id,
      number: invoice.number,
      amount_paid: invoice.amount_paid,
      amount_due: invoice.amount_due,
      currency: invoice.currency,
      status: invoice.status,
      created: invoice.created,
      due_date: invoice.due_date,
      invoice_pdf: invoice.invoice_pdf,
      hosted_invoice_url: invoice.hosted_invoice_url,
      description: invoice.description,
      customer_email: invoice.customer_email,
      // Add line items summary
      line_items_count: invoice.lines?.data?.length || 0,
      // Add period information if available
      period_start: invoice.period_start,
      period_end: invoice.period_end,
    }));

    return NextResponse.json({
      invoices,
      hasMore: invoicesResponse.has_more,
      totalCount: invoices.length,
      // Add pagination info
      pagination: {
        limit,
        startingAfter: invoicesResponse.data[invoicesResponse.data.length - 1]?.id || null,
        hasMore: invoicesResponse.has_more,
      }
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch invoices',
      invoices: [],
      hasMore: false
    }, { status: 500 });
  }
} 