import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = params.id;
    
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
    
    // Check if user is authorized (student or tutor of this lesson)
    const isStudent = lesson.student_id === user.id;
    const isTutor = lesson.tutor_id === user.id;
    
    if (!isStudent && !isTutor) {
      return NextResponse.json({ error: 'Not authorized to view this lesson' }, { status: 403 });
    }
    
    // Get all reschedule requests for this lesson
    const { data: rescheduleRequests, error: requestsError } = await serverSupabase
      .from('reschedule_requests')
      .select(`
        *,
        requested_by_user:requested_by(
          id,
          email,
          user_metadata
        )
      `)
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: false });
    
    if (requestsError) {
      console.error('Error fetching reschedule requests:', requestsError);
      return NextResponse.json({ 
        error: 'Failed to fetch reschedule history' 
      }, { status: 500 });
    }
    
    // Format the response
    const formattedRequests = rescheduleRequests?.map(request => ({
      id: request.id,
      status: request.status,
      requestedBy: {
        id: request.requested_by_user?.id,
        email: request.requested_by_user?.email,
        name: request.requested_by_user?.user_metadata?.full_name || 'Unknown'
      },
      requestedDate: request.requested_date,
      requestedStartTime: request.requested_start_time,
      requestedEndTime: request.requested_end_time,
      reason: request.reason,
      currentScheduledStart: request.current_scheduled_start,
      currentScheduledEnd: request.current_scheduled_end,
      proposedDate: request.proposed_date,
      proposedStartTime: request.proposed_start_time,
      proposedEndTime: request.proposed_end_time,
      tutorResponse: request.tutor_response,
      tutorResponseReason: request.tutor_response_reason,
      createdAt: request.created_at,
      respondedAt: request.responded_at
    })) || [];
    
    // Get summary statistics
    const totalRequests = formattedRequests.length;
    const pendingRequests = formattedRequests.filter(r => r.status === 'pending').length;
    const acceptedRequests = formattedRequests.filter(r => r.status === 'accepted').length;
    const rejectedRequests = formattedRequests.filter(r => r.status === 'rejected').length;
    const proposedRequests = formattedRequests.filter(r => r.status === 'proposed').length;
    
    return NextResponse.json({
      success: true,
      data: {
        lessonId,
        totalRequests,
        pendingRequests,
        acceptedRequests,
        rejectedRequests,
        proposedRequests,
        canRequestReschedule: totalRequests < 2 && lesson.status !== 'reschedule_requested',
        requests: formattedRequests
      }
    });
    
  } catch (error) {
    console.error('Reschedule history API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch reschedule history' 
    }, { status: 500 });
  }
} 