import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';

// Get user credits
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get active credits for the user
    const { data: credits, error: creditsError } = await serverSupabase
      .from('user_credits')
      .select('*')
      .eq('user_email', user.email)
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (creditsError) {
      console.error('Error fetching credits:', creditsError);
      return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
    }

    // Calculate total available credit
    const totalCredit = credits?.reduce((sum, credit) => sum + credit.amount, 0) || 0;

    return NextResponse.json({
      credits: credits || [],
      totalCredit,
      currency: 'usd'
    });

  } catch (error) {
    console.error('Error getting credits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Apply credit to an invoice
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invoiceId, amount } = await request.json();

    if (!invoiceId || !amount) {
      return NextResponse.json({ error: 'Invoice ID and amount are required' }, { status: 400 });
    }

    // Get available credits
    const { data: credits, error: creditsError } = await serverSupabase
      .from('user_credits')
      .select('*')
      .eq('user_email', user.email)
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: true }); // Use oldest credits first

    if (creditsError || !credits || credits.length === 0) {
      return NextResponse.json({ error: 'No available credits' }, { status: 404 });
    }

    let remainingAmount = amount;
    const appliedCredits = [];

    // Apply credits to the invoice
    for (const credit of credits) {
      if (remainingAmount <= 0) break;

      const appliedAmount = Math.min(credit.amount, remainingAmount);
      
      // Update credit record
      const { error: updateError } = await serverSupabase
        .from('user_credits')
        .update({
          amount: credit.amount - appliedAmount,
          status: credit.amount - appliedAmount <= 0 ? 'used' : 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', credit.id);

      if (updateError) {
        console.error('Error updating credit:', updateError);
        continue;
      }

      // Record credit application
      const { error: applicationError } = await serverSupabase
        .from('credit_applications')
        .insert({
          user_email: user.email,
          credit_id: credit.id,
          invoice_id: invoiceId,
          amount: appliedAmount,
          currency: 'usd',
          applied_at: new Date().toISOString()
        });

      if (applicationError) {
        console.error('Error recording credit application:', applicationError);
      }

      appliedCredits.push({
        creditId: credit.id,
        appliedAmount,
        remainingAmount: credit.amount - appliedAmount
      });

      remainingAmount -= appliedAmount;
    }

    return NextResponse.json({
      success: true,
      totalApplied: amount - remainingAmount,
      remainingAmount,
      appliedCredits
    });

  } catch (error) {
    console.error('Error applying credit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 