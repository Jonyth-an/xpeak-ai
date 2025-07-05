import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { email, source = 'footer' } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Normalize email (lowercase)
    const normalizedEmail = email.toLowerCase().trim();

    // Check if already subscribed
    const { data: existingSubscription, error: checkError } = await serverSupabase
      .from('newsletter_subscriptions')
      .select('id, status')
      .eq('email', normalizedEmail)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new subscriptions
      console.error('Error checking existing subscription:', checkError);
      return NextResponse.json(
        { error: 'Failed to check subscription status' },
        { status: 500 }
      );
    }

    // If already subscribed and active, return success
    if (existingSubscription && existingSubscription.status === 'active') {
      return NextResponse.json(
        { message: 'You are already subscribed to our newsletter!' },
        { status: 200 }
      );
    }

    // If unsubscribed, reactivate
    if (existingSubscription && existingSubscription.status === 'unsubscribed') {
      const { error: updateError } = await serverSupabase
        .from('newsletter_subscriptions')
        .update({
          status: 'active',
          unsubscribed_at: null,
          source,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.id);

      if (updateError) {
        console.error('Error reactivating subscription:', updateError);
        return NextResponse.json(
          { error: 'Failed to reactivate subscription' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: 'Welcome back! Your newsletter subscription has been reactivated.' },
        { status: 200 }
      );
    }

    // Create new subscription
    const { error: insertError } = await serverSupabase
      .from('newsletter_subscriptions')
      .insert({
        email: normalizedEmail,
        status: 'active',
        source,
        metadata: {
          userAgent: request.headers.get('user-agent') || '',
          referer: request.headers.get('referer') || '',
          timestamp: new Date().toISOString()
        }
      });

    if (insertError) {
      console.error('Error creating subscription:', insertError);
      return NextResponse.json(
        { error: 'Failed to subscribe to newsletter' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Successfully subscribed to our newsletter!' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Newsletter subscription endpoint' },
    { status: 200 }
  );
} 