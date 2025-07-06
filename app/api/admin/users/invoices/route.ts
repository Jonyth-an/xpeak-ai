import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
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

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    if (!email) {
      return NextResponse.json({ error: 'Missing email parameter' }, { status: 400 });
    }

    // Get user's Stripe customer ID from DB
    const { data: subscriptions, error: subError } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_email', email)
      .order('created_at', { ascending: false })
      .limit(1);
    if (subError || !subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ invoices: [], hasMore: false, error: 'No subscription found for user' });
    }
    const customerId = subscriptions[0].stripe_customer_id;
    if (!customerId) {
      return NextResponse.json({ invoices: [], hasMore: false, error: 'No Stripe customer ID found for user' });
    }

    // Build Stripe invoice list parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100);
    const startingAfter = searchParams.get('starting_after');
    const status = searchParams.get('status');
    const createdAfter = searchParams.get('created_after');
    const createdBefore = searchParams.get('created_before');
    const listParams: Stripe.InvoiceListParams = {
      customer: customerId,
      limit,
    };
    if (startingAfter) listParams.starting_after = startingAfter;
    if (status) listParams.status = status as Stripe.InvoiceListParams.Status;
    if (createdAfter) listParams.created = { gte: parseInt(createdAfter) };
    if (createdBefore) {
      if (listParams.created && typeof listParams.created === 'object') {
        listParams.created.lte = parseInt(createdBefore);
      } else {
        listParams.created = { lte: parseInt(createdBefore) };
      }
    }

    // Fetch invoices from Stripe
    const invoicesResponse = await stripe.invoices.list(listParams);
    // For each invoice, fetch full line items if not present
    const invoices = await Promise.all(invoicesResponse.data.map(async invoice => {
      let lines = invoice.lines;
      // If lines are not fully expanded, fetch them
      if ((!lines || !lines.data || lines.data.length === 0) && invoice.id) {
        const linesResponse = await stripe.invoices.listLineItems(invoice.id, { limit: 10 });
        lines = linesResponse;
      }
      // Ensure each line item only includes the subscription ID
      const safeLines = {
        ...lines,
        data: lines.data.map(line => ({
          ...line,
          subscription: line.subscription || null,
        })),
      };
      return {
        ...invoice,
        subscription: (invoice as any).subscription || null,
        lines: safeLines,
      };
    }));
    return NextResponse.json({
      invoices,
      hasMore: invoicesResponse.has_more,
      totalCount: invoices.length,
      pagination: {
        limit,
        startingAfter: invoicesResponse.data[invoicesResponse.data.length - 1]?.id || null,
        hasMore: invoicesResponse.has_more,
      }
    });
  } catch (error) {
    console.error('Error fetching admin invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices', invoices: [], hasMore: false }, { status: 500 });
  }
} 