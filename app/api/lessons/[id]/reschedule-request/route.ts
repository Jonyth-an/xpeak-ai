import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lessonId } = await params;
    
    // Get user from request
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the lesson to verify ownership
    const { data: lesson, error: lessonError } = await serverSupabase
      .from('lessons')
      .select('student_id, tutor_id, status')
      .eq('id', lessonId)
      .single();
    
    if (lessonError || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }
    
    // Get tutor information to check authorization
    const { data: tutorData, error: tutorError } = await serverSupabase
      .from('tutor_profiles')
      .select('id, user_id')
      .eq('id', lesson.tutor_id)
      .single();

    if (tutorError) {
      console.error('Error fetching tutor data:', tutorError);
      return NextResponse.json({ error: 'Failed to fetch tutor information' }, { status: 500 });
    }

    // Check if user is authorized (student or tutor of this lesson)
    const isStudent = lesson.student_id === user.id;
    const isTutor = tutorData.user_id === user.id;
    
    if (!isStudent && !isTutor) {
      return NextResponse.json({ error: 'Not authorized to view this lesson' }, { status: 403 });
    }
    
    // Get the pending reschedule request for this lesson
    const { data: rescheduleRequest, error: requestError } = await serverSupabase
      .from('reschedule_requests')
      .select('*')
      .eq('lesson_id', lessonId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (requestError) {
      if (requestError.code === 'PGRST116') {
        // No pending reschedule request found
        return NextResponse.json({
          success: true,
          data: null
        });
      }
      
      console.error('Error fetching reschedule request:', requestError);
      return NextResponse.json({ 
        error: 'Failed to fetch reschedule request' 
      }, { status: 500 });
    }
    
    // Format the response
    const formattedRequest = {
      id: rescheduleRequest.id,
      status: rescheduleRequest.status,
      requestedBy: {
        id: rescheduleRequest.requested_by,
        type: rescheduleRequest.requested_by_type
      },
      requestedDate: rescheduleRequest.requested_date,
      requestedStartTime: rescheduleRequest.requested_start_time,
      requestedEndTime: rescheduleRequest.requested_end_time,
      reason: rescheduleRequest.reason,
      currentScheduledStart: rescheduleRequest.current_scheduled_start,
      currentScheduledEnd: rescheduleRequest.current_scheduled_end,
      proposedDate: rescheduleRequest.proposed_date,
      proposedStartTime: rescheduleRequest.proposed_start_time,
      proposedEndTime: rescheduleRequest.proposed_end_time,
      tutorResponse: rescheduleRequest.tutor_response,
      tutorResponseReason: rescheduleRequest.tutor_response_reason,
      createdAt: rescheduleRequest.created_at,
      respondedAt: rescheduleRequest.responded_at
    };
    
    return NextResponse.json({
      success: true,
      data: formattedRequest
    });
    
  } catch (error) {
    console.error('Reschedule request API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch reschedule request' 
    }, { status: 500 });
  }
} 