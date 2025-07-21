import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: requestId } = await params;

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
          tutor_id,
          scheduled_start,
          scheduled_end
        )
      `)
      .eq('id', requestId)
      .eq('lesson.tutor_id', tutorProfile.id)
      .eq('status', 'pending')
      .single();

    if (requestError || !rescheduleRequest) {
      return NextResponse.json({ error: 'Reschedule request not found or access denied' }, { status: 404 });
    }

    // Update the reschedule request status to approved
    const { error: updateError } = await serverSupabase
      .from('reschedule_requests')
      .update({ status: 'approved' })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating reschedule request:', updateError);
      return NextResponse.json({ error: 'Failed to approve reschedule request' }, { status: 500 });
    }

    // Update the lesson with the new schedule
    const { error: lessonUpdateError } = await serverSupabase
      .from('lessons')
      .update({
        scheduled_start: `${rescheduleRequest.requested_date}T${rescheduleRequest.requested_start_time}`,
        scheduled_end: `${rescheduleRequest.requested_date}T${rescheduleRequest.requested_end_time}`,
        status: 'confirmed'
      })
      .eq('id', rescheduleRequest.lesson_id);

    if (lessonUpdateError) {
      console.error('Error updating lesson:', lessonUpdateError);
      return NextResponse.json({ error: 'Failed to update lesson schedule' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Reschedule request approved successfully',
      requestId: requestId
    });

  } catch (error) {
    console.error('Error in approve reschedule request API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 