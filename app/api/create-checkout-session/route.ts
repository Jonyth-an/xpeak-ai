import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Map your plan IDs and intervals to Stripe Price IDs (replace with your real price IDs)
const PRICE_IDS: Record<string, Record<string, string>> = {
  plus: {
    month: 'price_1RessSFM2iXH8TuN4U2vQz9E',    // Replace with your Stripe price ID for Plus Monthly
    quarter: 'price_1Ret11FM2iXH8TuNdLCrRIxK',// Replace with your Stripe price ID for Plus Quarterly
    year: 'price_1Ret1bFM2iXH8TuNClhnN7c2',      // Replace with your Stripe price ID for Plus Yearly
  },
  pro: {
    month: 'price_1Rest1FM2iXH8TuNKvbhbeTG',     // Replace with your Stripe price ID for Pro Monthly
    quarter: 'price_1Ret29FM2iXH8TuNKl7fICBr', // Replace with your Stripe price ID for Pro Quarterly
    year: 'price_1Ret2RFM2iXH8TuNYQIQk9BU',       // Replace with your Stripe price ID for Pro Yearly
  },
};

export async function POST(req: NextRequest) {
  console.log('Stripe key:', process.env.STRIPE_SECRET_KEY);
  try {
    const { planId, interval } = await req.json();
    const priceId = PRICE_IDS[planId]?.[interval];
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan or interval selected.' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/cancel`,
      metadata: {
        planId,
        interval,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
} 