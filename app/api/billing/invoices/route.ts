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

// Helper function to extract product and interval from invoice line items
function extractProductAndInterval(invoice: Stripe.Invoice): { product: string, interval: string } {
  console.log('🔍 DEBUG: extractProductAndInterval called for invoice:', invoice.id);
  
  if (!invoice.lines?.data || invoice.lines.data.length === 0) {
    console.log('🔍 DEBUG: No line items found, returning Xpeak Free');
    return { product: 'Xpeak Free', interval: 'N/A' };
  }

  console.log('🔍 DEBUG: Processing', invoice.lines.data.length, 'line items');

  for (const item of invoice.lines.data) {
    console.log('🔍 DEBUG: Processing line item:', item.id);
    console.log('🔍 DEBUG: Line item keys:', Object.keys(item));
    console.log('🔍 DEBUG: Line item type:', item.object);
    
    // Check pricing object (this is where the price info is stored)
    if ('pricing' in item && item.pricing) {
      console.log('🔍 DEBUG: Found pricing object:', JSON.stringify(item.pricing, null, 2));
      
      // Check if pricing has price information
      const pricing = item.pricing as any;
      if (pricing.price) {
        const price = pricing.price as Stripe.Price;
        console.log('🔍 DEBUG: Found price in pricing:', price.id);
        console.log('🔍 DEBUG: Stripe Price Metadata:', JSON.stringify(price.metadata, null, 2));
        const product = price.metadata?.product_name;
        const interval = price.metadata?.interval;
        if (product || interval) {
          console.log('🔍 DEBUG: Found product/interval in price metadata:', { product, interval });
          return {
            product: product || 'Unknown Product',
            interval: interval || 'N/A',
          };
        }
      }
      
      // Check if pricing has plan information
      if (pricing.plan) {
        const plan = pricing.plan as any;
        console.log('🔍 DEBUG: Found plan in pricing:', plan.id);
        console.log('🔍 DEBUG: Stripe Plan Metadata:', JSON.stringify(plan.metadata, null, 2));
        const product = plan.metadata?.product_name;
        const interval = plan.metadata?.interval;
        if (product || interval) {
          console.log('🔍 DEBUG: Found product/interval in plan metadata:', { product, interval });
          return {
            product: product || 'Unknown Product',
            interval: interval || 'N/A',
          };
        }
      }
    } else {
      console.log('🔍 DEBUG: No pricing object found in line item');
    }
    
    // Fallback: check if there's a price object directly (legacy)
    if ('price' in item && item.price) {
      const price = item.price as Stripe.Price;
      console.log('🔍 DEBUG: Found price object directly:', price.id);
      console.log('🔍 DEBUG: Stripe Price Metadata:', JSON.stringify(price.metadata, null, 2));
      const product = price.metadata?.product_name;
      const interval = price.metadata?.interval;
      if (product || interval) {
        console.log('🔍 DEBUG: Found product/interval in price metadata:', { product, interval });
        return {
          product: product || 'Unknown Product',
          interval: interval || 'N/A',
        };
      }
    }
    
    // Fallback: check if there's a plan object directly (legacy)
    if ('plan' in item && item.plan) {
      const plan = item.plan as any;
      console.log('🔍 DEBUG: Found plan object directly:', plan.id);
      console.log('🔍 DEBUG: Stripe Plan Metadata:', JSON.stringify(plan.metadata, null, 2));
      const product = plan.metadata?.product_name;
      const interval = plan.metadata?.interval;
      if (product || interval) {
        console.log('🔍 DEBUG: Found product/interval in plan metadata:', { product, interval });
        return {
          product: product || 'Unknown Product',
          interval: interval || 'N/A',
        };
      }
    }
  }
  
  console.log('🔍 DEBUG: No product/interval found, returning Unknown Product');
  return { product: 'Unknown Product', interval: 'N/A' };
}

export async function GET(request: NextRequest) {
  try {
    // Check for test mode header
    const bypassAuth = request.headers.get('X-Bypass-Auth') === 'true';
    let user = null;

    if (bypassAuth) {
      // Test mode: use a hardcoded test user
      user = { 
        id: '00000000-0000-0000-0000-000000000001',
        email: 'test@example.com'
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
    const status = searchParams.get('status'); // 'paid', 'open', 'draft', 'void', 'uncollectible'
    const createdAfter = searchParams.get('created_after');
    const createdBefore = searchParams.get('created_before');
    const search = searchParams.get('search'); // New search parameter

    // For test mode, return mock data
    if (bypassAuth) {
      const mockInvoices = [
        {
          id: 'inv_test_1',
          number: 'INV-001',
          amount_paid: 2999,
          amount_due: 2999,
          currency: 'usd',
          status: 'paid',
          created: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60), // 30 days ago
          due_date: Math.floor(Date.now() / 1000) - (25 * 24 * 60 * 60),
          invoice_pdf: 'https://example.com/invoice.pdf',
          hosted_invoice_url: 'https://example.com/invoice',
          description: 'Premium Plan - Monthly Subscription',
          customer_email: 'test@example.com',
          line_items_count: 1,
          period_start: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60),
          period_end: Math.floor(Date.now() / 1000),
          paid_at: Math.floor(Date.now() / 1000) - (25 * 24 * 60 * 60),
          product: 'Xpeak Plus',
          interval: 'Monthly',
        },
        {
          id: 'inv_test_2',
          number: 'INV-002',
          amount_paid: 2999,
          amount_due: 2999,
          currency: 'usd',
          status: 'paid',
          created: Math.floor(Date.now() / 1000) - (60 * 24 * 60 * 60), // 60 days ago
          due_date: Math.floor(Date.now() / 1000) - (55 * 24 * 60 * 60),
          invoice_pdf: 'https://example.com/invoice2.pdf',
          hosted_invoice_url: 'https://example.com/invoice2',
          description: 'Premium Plan - Monthly Subscription',
          customer_email: 'test@example.com',
          line_items_count: 1,
          period_start: Math.floor(Date.now() / 1000) - (60 * 24 * 60 * 60),
          period_end: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60),
          paid_at: Math.floor(Date.now() / 1000) - (55 * 24 * 60 * 60),
          product: 'Xpeak Plus',
          interval: 'Monthly',
        },
        {
          id: 'inv_test_3',
          number: 'INV-003',
          amount_paid: 0,
          amount_due: 2999,
          currency: 'usd',
          status: 'open',
          created: Math.floor(Date.now() / 1000),
          due_date: Math.floor(Date.now() / 1000) + (5 * 24 * 60 * 60),
          invoice_pdf: 'https://example.com/invoice3.pdf',
          hosted_invoice_url: 'https://example.com/invoice3',
          description: 'Premium Plan - Monthly Subscription',
          customer_email: 'test@example.com',
          line_items_count: 1,
          period_start: Math.floor(Date.now() / 1000),
          period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
          product: 'Xpeak Pro',
          interval: 'Quarterly',
        }
      ];

      // Apply filters to mock data
      let filteredInvoices = mockInvoices;

      if (status && status !== 'all') {
        filteredInvoices = filteredInvoices.filter(inv => inv.status === status);
      }

      if (search && search.trim()) {
        const searchLower = search.toLowerCase();
        filteredInvoices = filteredInvoices.filter(inv => 
          inv.number?.toLowerCase().includes(searchLower) ||
          inv.description?.toLowerCase().includes(searchLower) ||
          inv.customer_email?.toLowerCase().includes(searchLower)
        );
      }

      if (createdAfter) {
        const afterTime = parseInt(createdAfter);
        filteredInvoices = filteredInvoices.filter(inv => inv.created >= afterTime);
      }

      if (createdBefore) {
        const beforeTime = parseInt(createdBefore);
        filteredInvoices = filteredInvoices.filter(inv => inv.created <= beforeTime);
      }

      // Apply pagination
      const startIndex = startingAfter ? mockInvoices.findIndex(inv => inv.id === startingAfter) + 1 : 0;
      const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + limit);

      return NextResponse.json({
        invoices: paginatedInvoices,
        hasMore: startIndex + limit < filteredInvoices.length,
        totalCount: filteredInvoices.length,
        pagination: {
          limit,
          startingAfter: paginatedInvoices[paginatedInvoices.length - 1]?.id || null,
          hasMore: startIndex + limit < filteredInvoices.length,
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

    // Fetch invoices from Stripe
    const invoicesResponse = await stripe.invoices.list({
      ...listParams,
      expand: ['data.lines.data.price', 'data.lines.data.plan'],
    });

    // Transform the data for better frontend consumption
    let invoices = invoicesResponse.data.map(invoice => {
      console.log('🔍 DEBUG: Processing invoice:', invoice.id);
      const { product, interval } = extractProductAndInterval(invoice);
      console.log('🔍 DEBUG: Extracted product/interval:', { product, interval });
      
      return {
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
        // Add paid_at timestamp if available
        paid_at: invoice.status === 'paid' ? invoice.created : undefined,
        // Add product and interval information
        product,
        interval,
      };
    });

    // Apply search filtering if search parameter is provided
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      invoices = invoices.filter(invoice => 
        invoice.number?.toLowerCase().includes(searchLower) ||
        invoice.description?.toLowerCase().includes(searchLower) ||
        invoice.customer_email?.toLowerCase().includes(searchLower)
      );
    }

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