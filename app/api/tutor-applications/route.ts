import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { applicationData, action } = await request.json();
    
    // Get user from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = serverSupabase;

    if (action === 'save') {
      // Save as draft
      const { data, error } = await supabase
        .from('tutor_applications')
        .upsert({
          user_id: user.id,
          status: 'drafting',
          application_data: applicationData
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving application:', error);
        return NextResponse.json({ error: 'Failed to save application' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Application saved successfully',
        application: data 
      });

    } else if (action === 'submit') {
      // Submit application
      const { data, error } = await supabase
        .from('tutor_applications')
        .upsert({
          user_id: user.id,
          status: 'pending',
          application_data: applicationData,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting application:', error);
        return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Application submitted successfully',
        application: data 
      });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in tutor application API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = serverSupabase;

    // Get user's existing application
    const { data, error } = await supabase
      .from('tutor_applications')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching application:', error);
      return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
    }

    return NextResponse.json({ 
      application: data || null 
    });

  } catch (error) {
    console.error('Error in tutor application GET API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 