import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { serverSupabase } from '@/lib/serverSupabaseClient';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get the user from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get user from Supabase
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the user's tutor application
    const { data: application, error } = await supabase
      .from('tutor_applications')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching tutor application:', error);
      return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
    }

    return NextResponse.json({ 
      application: application || null 
    });

  } catch (error) {
    console.error('Error in tutor applications GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the user from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get user from Supabase
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationData, action } = await request.json();

    if (!applicationData) {
      return NextResponse.json({ error: 'Application data is required' }, { status: 400 });
    }

    // Check if user already has an application
    const { data: existingApplication } = await supabase
      .from('tutor_applications')
      .select('id, status')
      .eq('user_id', user.id)
      .single();

    let result;

    if (existingApplication) {
      // Update existing application
      if (action === 'submit' && (existingApplication.status === 'drafting' || existingApplication.status === 'pending')) {
        // Submit the application (allow resubmission of pending applications)
        result = await supabase
          .from('tutor_applications')
          .update({
            application_data: applicationData,
            status: 'pending',
            submitted_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .select()
          .single();
      } else if (existingApplication.status === 'drafting' || existingApplication.status === 'pending') {
        // Save draft (allow saving pending applications)
        result = await supabase
          .from('tutor_applications')
          .update({
            application_data: applicationData
          })
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        return NextResponse.json({ 
          error: 'Cannot update submitted application' 
        }, { status: 400 });
      }
    } else {
      // Create new application
      const newApplication = {
        user_id: user.id,
        application_data: applicationData,
        status: action === 'submit' ? 'pending' : 'drafting',
        submitted_at: action === 'submit' ? new Date().toISOString() : null
      };

      result = await supabase
        .from('tutor_applications')
        .insert([newApplication])
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error saving tutor application:', result.error);
      return NextResponse.json({ error: 'Failed to save application' }, { status: 500 });
    }

    return NextResponse.json({ 
      application: result.data,
      message: action === 'submit' ? 'Application submitted successfully' : 'Draft saved successfully'
    });

  } catch (error) {
    console.error('Error in tutor applications POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 