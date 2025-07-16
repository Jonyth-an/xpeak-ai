import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rescheduleRequestId = params.id;
    
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
    
    // Parse request body
    const { 
      action, // 'accept', 'reject', 'propose'
      proposedDate, 
      proposedStartTime, 
      proposedEndTime,
      reason = '' 
    } = await request.json();
    
    if (!action || !['accept', 'reject', 'propose'].includes(action)) {
      return NextResponse.json({ 
        error: 'Invalid action. Must be "accept", "reject", or "propose"' 
      }, { status: 400 });
    }
    
    // Get the reschedule request
    const { data: rescheduleRequest, error: requestError } = await serverSupabase
      .from('reschedule_requests')
      .select(`
        *,
        lessons!inner(
          id,
          tutor_id,
          student_id,
          scheduled_start,
          scheduled_end,
          status
        )
      `)
      .eq('id', rescheduleRequestId)
      .single();
    
    if (requestError || !rescheduleRequest) {
      return NextResponse.json({ error: 'Reschedule request not found' }, { status: 404 });
    }
    
    const lesson = rescheduleRequest.lessons;
    
    // Check if user is the tutor of this lesson
    if (lesson.tutor_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to respond to this reschedule request' }, { status: 403 });
    }
    
    // Check if request is still pending
    if (rescheduleRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Reschedule request has already been processed' }, { status: 400 });
    }
    
    // Handle different actions
    if (action === 'accept') {
      // Accept the requested time
      const newScheduledStart = `${rescheduleRequest.requested_date}T${rescheduleRequest.requested_start_time}:00`;
      const newScheduledEnd = `${rescheduleRequest.requested_date}T${rescheduleRequest.requested_end_time}:00`;
      
      // Update lesson with new times and status
      const { error: lessonUpdateError } = await serverSupabase
        .from('lessons')
        .update({
          scheduled_start: newScheduledStart,
          scheduled_end: newScheduledEnd,
          status: 'confirmed'
        })
        .eq('id', lesson.id);
      
      if (lessonUpdateError) {
        console.error('Error updating lesson:', lessonUpdateError);
        return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 });
      }
      
      // Update reschedule request status
      const { error: requestUpdateError } = await serverSupabase
        .from('reschedule_requests')
        .update({
          status: 'accepted',
          tutor_response: 'accepted',
          tutor_response_reason: reason,
          responded_at: new Date().toISOString()
        })
        .eq('id', rescheduleRequestId);
      
      if (requestUpdateError) {
        console.error('Error updating reschedule request:', requestUpdateError);
      }
      
      console.log('✅ Reschedule request accepted');
      
      return NextResponse.json({
        success: true,
        message: 'Reschedule request accepted successfully'
      });
      
    } else if (action === 'reject') {
      // Reject the request and revert lesson to original status
      const { error: lessonUpdateError } = await serverSupabase
        .from('lessons')
        .update({
          status: 'confirmed' // Revert to original status
        })
        .eq('id', lesson.id);
      
      if (lessonUpdateError) {
        console.error('Error updating lesson:', lessonUpdateError);
        return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 });
      }
      
      // Update reschedule request status
      const { error: requestUpdateError } = await serverSupabase
        .from('reschedule_requests')
        .update({
          status: 'rejected',
          tutor_response: 'rejected',
          tutor_response_reason: reason,
          responded_at: new Date().toISOString()
        })
        .eq('id', rescheduleRequestId);
      
      if (requestUpdateError) {
        console.error('Error updating reschedule request:', requestUpdateError);
      }
      
      console.log('✅ Reschedule request rejected');
      
      return NextResponse.json({
        success: true,
        message: 'Reschedule request rejected'
      });
      
    } else if (action === 'propose') {
      // Propose different times
      if (!proposedDate || !proposedStartTime || !proposedEndTime) {
        return NextResponse.json({ 
          error: 'Missing required fields for proposal: proposedDate, proposedStartTime, proposedEndTime' 
        }, { status: 400 });
      }
      
      // Check for conflicts with proposed time
      const proposedStart = `${proposedDate}T${proposedStartTime}:00`;
      const proposedEnd = `${proposedDate}T${proposedEndTime}:00`;
      
      // Check tutor conflicts
      const { data: tutorConflicts, error: tutorConflictError } = await serverSupabase
        .from('lessons')
        .select('id, scheduled_start, scheduled_end, status')
        .eq('tutor_id', lesson.tutor_id)
        .or(`scheduled_start.lt.${proposedEnd},scheduled_end.gt.${proposedStart}`)
        .in('status', ['pending', 'confirmed', 'reschedule_requested'])
        .neq('id', lesson.id);
      
      if (tutorConflictError) {
        console.error('Error checking tutor conflicts:', tutorConflictError);
        return NextResponse.json({ 
          error: 'Failed to check tutor availability' 
        }, { status: 500 });
      }
      
      if (tutorConflicts && tutorConflicts.length > 0) {
        return NextResponse.json({ 
          error: 'You have a conflicting lesson at the proposed time' 
        }, { status: 409 });
      }
      
      // Update reschedule request with proposal
      const { error: requestUpdateError } = await serverSupabase
        .from('reschedule_requests')
        .update({
          status: 'proposed',
          tutor_response: 'proposed',
          tutor_response_reason: reason,
          proposed_date: proposedDate,
          proposed_start_time: proposedStartTime,
          proposed_end_time: proposedEndTime,
          responded_at: new Date().toISOString()
        })
        .eq('id', rescheduleRequestId);
      
      if (requestUpdateError) {
        console.error('Error updating reschedule request:', requestUpdateError);
        return NextResponse.json({ error: 'Failed to update reschedule request' }, { status: 500 });
      }
      
      console.log('✅ Reschedule proposal submitted');
      
      return NextResponse.json({
        success: true,
        message: 'Reschedule proposal submitted successfully'
      });
    }
    
  } catch (error) {
    console.error('Reschedule response API error:', error);
    return NextResponse.json({ 
      error: 'Failed to process reschedule response' 
    }, { status: 500 });
  }
} 