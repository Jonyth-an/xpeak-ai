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
  apiVersion: '2025-06-30.basil',
});

// Enhanced interface for combined transaction data
interface EnhancedInvoice {
  id: string;
  number: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  status: string;
  created: number;
  due_date?: number;
  invoice_pdf?: string;
  hosted_invoice_url?: string;
  description?: string;
  customer_email?: string;
  line_items_count: number;
  period_start?: number;
  period_end?: number;
  paid_at?: number;
  product?: string;
  interval?: string;
  
  // Enhanced fields
  payment_method?: {
    type: string;
    brand?: string;
    last4?: string;
    exp_month?: number;
    exp_year?: number;
  };
  refunds?: Array<{
    id: string;
    amount: number;
    reason?: string;
    created: number;
    status: string;
  }>;
  line_items: Array<{
    description: string;
    amount: number;
    quantity: number;
    product_name?: string;
    interval?: string;
    unit_amount?: number;
  }>;
  tax_amount?: number;
  discount_amount?: number;
  subtotal?: number;
  total_tax_amounts?: Array<{
    amount: number;
    inclusive: boolean;
    tax_rate?: {
      percentage: number;
      display_name: string;
    };
  }>;
  payment_intent?: {
    id: string;
    status: string;
    created: number;
    amount: number;
    currency: string;
  };
  charge?: {
    id: string;
    status: string;
    created: number;
    receipt_url?: string;
    failure_reason?: string;
    outcome?: {
      type: string;
      seller_message: string;
    };
  };
  subscription?: {
    id: string;
    status: string;
    current_period_start: number;
    current_period_end: number;
  };
}

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

// Helper function to enhance invoice with additional data
async function enhanceInvoiceWithAdditionalData(invoice: Stripe.Invoice, customerId: string): Promise<EnhancedInvoice> {
  const { product, interval } = extractProductAndInterval(invoice);
  
  // Enhanced line items
  const line_items = invoice.lines?.data.map(item => {
    const pricing = item.pricing as any;
    const price = pricing?.price || (item as any).price;
    const plan = pricing?.plan || (item as any).plan;
    
    return {
      description: item.description || 'Subscription',
      amount: item.amount,
      quantity: item.quantity || 1,
      product_name: price?.metadata?.product_name || plan?.metadata?.product_name,
      interval: price?.metadata?.interval || plan?.metadata?.interval,
      unit_amount: price?.unit_amount || plan?.amount,
    };
  }) || [];

  // Get payment intent if available
  let payment_intent = undefined;
  if ((invoice as any).payment_intent && typeof (invoice as any).payment_intent === 'string') {
    try {
      const pi = await stripe.paymentIntents.retrieve((invoice as any).payment_intent);
      payment_intent = {
        id: pi.id,
        status: pi.status,
        created: pi.created,
        amount: pi.amount,
        currency: pi.currency,
      };
    } catch (error) {
      console.log('Could not retrieve payment intent:', (invoice as any).payment_intent);
    }
  }

  // Get charge information
  let charge = undefined;
  if (payment_intent) {
    try {
      const charges = await stripe.charges.list({
        payment_intent: payment_intent.id,
        limit: 1,
      });
      
      if (charges.data.length > 0) {
        const chargeData = charges.data[0];
        charge = {
          id: chargeData.id,
          status: chargeData.status,
          created: chargeData.created,
          receipt_url: chargeData.receipt_url || undefined,
          failure_reason: (chargeData as any).failure_reason || undefined,
          outcome: chargeData.outcome ? {
            type: chargeData.outcome.type,
            seller_message: chargeData.outcome.seller_message || '',
          } : undefined,
        };
      }
    } catch (error) {
      console.log('Could not retrieve charge for payment intent:', payment_intent.id);
    }
  }

  // Get refunds
  let refunds: EnhancedInvoice['refunds'] = [];
  if (charge) {
    try {
      const refundsResponse = await stripe.refunds.list({
        charge: charge.id,
        limit: 10,
      });
      
      refunds = refundsResponse.data.map(refund => ({
        id: refund.id,
        amount: refund.amount,
        reason: refund.reason || undefined,
        created: refund.created,
        status: refund.status || 'unknown',
      }));
    } catch (error) {
      console.log('Could not retrieve refunds for charge:', charge.id);
    }
  }

  // Get payment method information
  let payment_method = undefined;
  if (payment_intent) {
    try {
      const pi = await stripe.paymentIntents.retrieve(payment_intent.id, {
        expand: ['payment_method'],
      });
      
      if (pi.payment_method && typeof pi.payment_method === 'object') {
        const pm = pi.payment_method as any;
        if (pm.type === 'card' && pm.card) {
          payment_method = {
            type: pm.type,
            brand: pm.card.brand,
            last4: pm.card.last4,
            exp_month: pm.card.exp_month,
            exp_year: pm.card.exp_year,
          };
        } else {
          payment_method = {
            type: pm.type,
          };
        }
      }
    } catch (error) {
      console.log('Could not retrieve payment method for payment intent:', payment_intent.id);
    }
  }

  // Get subscription information
  let subscription = undefined;
  if ((invoice as any).subscription && typeof (invoice as any).subscription === 'string') {
    try {
      const sub = await stripe.subscriptions.retrieve((invoice as any).subscription);
      subscription = {
        id: sub.id,
        status: sub.status,
        current_period_start: (sub as any).current_period_start,
        current_period_end: (sub as any).current_period_end,
      };
    } catch (error) {
      console.log('Could not retrieve subscription:', (invoice as any).subscription);
    }
  }

  return {
    id: invoice.id ?? '',
    number: invoice.number ?? '',
    amount_paid: invoice.amount_paid,
    amount_due: invoice.amount_due,
    currency: invoice.currency ?? '',
    status: invoice.status ?? '',
    created: invoice.created,
    due_date: invoice.due_date ?? undefined,
    invoice_pdf: invoice.invoice_pdf ?? undefined,
    hosted_invoice_url: invoice.hosted_invoice_url ?? undefined,
    description: invoice.description ?? undefined,
    customer_email: invoice.customer_email ?? undefined,
    line_items_count: invoice.lines?.data?.length || 0,
    period_start: invoice.period_start ?? undefined,
    period_end: invoice.period_end ?? undefined,
    paid_at: invoice.status === 'paid' ? invoice.created : undefined,
    product: product ?? '',
    interval: interval ?? '',
    
    // Enhanced fields
    payment_method,
    refunds,
    line_items,
    tax_amount: (invoice as any).tax ?? undefined,
    discount_amount: (invoice as any).discount ?? undefined,
    subtotal: invoice.subtotal ?? undefined,
    total_tax_amounts: ((invoice as any).total_tax_amounts as Array<any> | undefined)?.map((tax: any) => ({
      amount: tax.amount,
      inclusive: tax.inclusive,
      tax_rate: tax.tax_rate ? {
        percentage: tax.tax_rate.percentage,
        display_name: tax.tax_rate.display_name,
      } : undefined,
    })),
    payment_intent,
    charge: charge
      ? {
          id: charge.id,
          status: charge.status ?? '',
          created: charge.created,
          receipt_url: charge.receipt_url ?? undefined,
          failure_reason: (charge as any).failure_reason || undefined,
          outcome: charge.outcome
            ? {
                type: charge.outcome.type ?? '',
                seller_message: charge.outcome.seller_message || '',
              }
            : undefined,
        }
      : undefined,
    subscription,
  };
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
    const enhanced = searchParams.get('enhanced') === 'true'; // New parameter for enhanced data

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
          payment_method: {
            type: 'card',
            brand: 'visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 2025,
          },
          refunds: [],
          line_items: [
            {
              description: 'Xpeak Plus - Monthly Subscription',
              amount: 2999,
              quantity: 1,
              product_name: 'Xpeak Plus',
              interval: 'Monthly',
              unit_amount: 2999,
            }
          ],
          tax_amount: 0,
          discount_amount: 0,
          subtotal: 2999,
          total_tax_amounts: [],
          payment_intent: {
            id: 'pi_test_1',
            status: 'succeeded',
            created: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60),
            amount: 2999,
            currency: 'usd',
          },
          charge: {
            id: 'ch_test_1',
            status: 'succeeded',
            created: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60),
            receipt_url: 'https://example.com/receipt',
          },
          subscription: {
            id: 'sub_test_1',
            status: 'active',
            current_period_start: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60),
            current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
          },
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
          payment_method: {
            type: 'card',
            brand: 'visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 2025,
          },
          refunds: [
            {
              id: 're_test_1',
              amount: 500,
              reason: 'requested_by_customer',
              created: Math.floor(Date.now() / 1000) - (50 * 24 * 60 * 60),
              status: 'succeeded',
            }
          ],
          line_items: [
            {
              description: 'Xpeak Plus - Monthly Subscription',
              amount: 2999,
              quantity: 1,
              product_name: 'Xpeak Plus',
              interval: 'Monthly',
              unit_amount: 2999,
            }
          ],
          tax_amount: 0,
          discount_amount: 0,
          subtotal: 2999,
          total_tax_amounts: [],
          payment_intent: {
            id: 'pi_test_2',
            status: 'succeeded',
            created: Math.floor(Date.now() / 1000) - (60 * 24 * 60 * 60),
            amount: 2999,
            currency: 'usd',
          },
          charge: {
            id: 'ch_test_2',
            status: 'succeeded',
            created: Math.floor(Date.now() / 1000) - (60 * 24 * 60 * 60),
            receipt_url: 'https://example.com/receipt2',
          },
          subscription: {
            id: 'sub_test_1',
            status: 'active',
            current_period_start: Math.floor(Date.now() / 1000) - (60 * 24 * 60 * 60),
            current_period_end: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60),
          },
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
          payment_method: undefined,
          refunds: [],
          line_items: [
            {
              description: 'Xpeak Pro - Quarterly Subscription',
              amount: 2999,
              quantity: 1,
              product_name: 'Xpeak Pro',
              interval: 'Quarterly',
              unit_amount: 2999,
            }
          ],
          tax_amount: 0,
          discount_amount: 0,
          subtotal: 2999,
          total_tax_amounts: [],
          payment_intent: undefined,
          charge: undefined,
          subscription: {
            id: 'sub_test_2',
            status: 'active',
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60),
          },
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
    let invoices: EnhancedInvoice[] = [];
    
    if (enhanced) {
      // Enhanced mode: fetch additional data for each invoice
      const enhancedInvoices = await Promise.all(
        invoicesResponse.data.map(invoice => enhanceInvoiceWithAdditionalData(invoice, customerId))
      );
      invoices = enhancedInvoices;
    } else {
      // Basic mode: just extract product and interval
      invoices = invoicesResponse.data.map(invoice => {
        console.log('🔍 DEBUG: Processing invoice:', invoice.id);
        const { product, interval } = extractProductAndInterval(invoice);
        console.log('🔍 DEBUG: Extracted product/interval:', { product, interval });
        
        return {
          id: invoice.id ?? '',
          number: invoice.number ?? '',
          amount_paid: invoice.amount_paid,
          amount_due: invoice.amount_due,
          currency: invoice.currency ?? '',
          status: invoice.status ?? '',
          created: invoice.created,
          due_date: invoice.due_date ?? undefined,
          invoice_pdf: invoice.invoice_pdf ?? undefined,
          hosted_invoice_url: invoice.hosted_invoice_url ?? undefined,
          description: invoice.description ?? undefined,
          customer_email: invoice.customer_email ?? undefined,
          line_items_count: invoice.lines?.data?.length || 0,
          period_start: invoice.period_start ?? undefined,
          period_end: invoice.period_end ?? undefined,
          paid_at: invoice.status === 'paid' ? invoice.created : undefined,
          product: product ?? '',
          interval: interval ?? '',
        } as EnhancedInvoice;
      });
    }

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