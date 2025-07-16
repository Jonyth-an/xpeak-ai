import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const requestId = params.id;

    // Get the tutor profile for the current user
    const { data: tutorProfile, error: tutorError } = await serverSupabase
      .from('tutor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tutorError || !tutorProfile) {
      return NextResponse.json({ error: 'Tutor profile not found' }, { status: 404 });
    }

    // Get the reschedule request and verify it belongs to this tutor
    const { data: rescheduleRequest, error: requestError } = await serverSupabase
      .from('reschedule_requests')
      .select(`
        *,
        lesson:lessons!inner(
          id,
          tutor_id
        )
      `)
      .eq('id', requestId)
      .eq('lesson.tutor_id', tutorProfile.id)
      .eq('status', 'pending')
      .single();

    if (requestError || !rescheduleRequest) {
      return NextResponse.json({ error: 'Reschedule request not found or access denied' }, { status: 404 });
    }

    // Update the reschedule request status to rejected
    const { error: updateError } = await serverSupabase
      .from('reschedule_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating reschedule request:', updateError);
      return NextResponse.json({ error: 'Failed to reject reschedule request' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Reschedule request rejected successfully',
      requestId: requestId
    });

  } catch (error) {
    console.error('Error in reject reschedule request API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 