import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { serverSupabase } from '@/lib/serverSupabaseClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    // Get the user from the request
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { address, name, phone } = body;

    // Get Stripe customer ID from your DB
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_email', user.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data?.stripe_customer_id) {
      return NextResponse.json({ error: 'Stripe customer not found' }, { status: 404 });
    }

    // Update billing address in Stripe
    await stripe.customers.update(data.stripe_customer_id, {
      address,
      name,
      phone,
    });

    // (Optional) Store billing address in your DB for redundancy
    // await serverSupabase.from('user_billing_info').upsert({ ... })

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error updating billing info:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
} 