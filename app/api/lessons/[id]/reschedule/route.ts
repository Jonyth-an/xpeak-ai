import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';

export async function POST(
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
    
    // Parse request body
    const { 
      requestedDate, 
      requestedStartTime, 
      requestedEndTime, 
      reason = '' 
    } = await request.json();
    
    if (!requestedDate || !requestedStartTime || !requestedEndTime) {
      return NextResponse.json({ 
        error: 'Missing required fields: requestedDate, requestedStartTime, requestedEndTime' 
      }, { status: 400 });
    }
    
    // Get the lesson to verify ownership and current status
    const { data: lesson, error: lessonError } = await serverSupabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();
    
    if (lessonError || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }
    
    // Check if user is authorized (student or tutor of this lesson)
    const isStudent = lesson.student_id === user.id;
    const isTutor = lesson.tutor_id === user.id;
    
    if (!isStudent && !isTutor) {
      return NextResponse.json({ error: 'Not authorized to reschedule this lesson' }, { status: 403 });
    }
    
    // Check if lesson can be rescheduled (not cancelled, completed, etc.)
    if (['cancelled', 'completed', 'no_show'].includes(lesson.status)) {
      return NextResponse.json({ 
        error: 'Cannot reschedule a lesson that is cancelled, completed, or marked as no-show' 
      }, { status: 400 });
    }
    
    // Check if lesson is already in reschedule state
    if (lesson.status === 'reschedule_requested') {
      return NextResponse.json({ 
        error: 'Lesson is already in reschedule state' 
      }, { status: 400 });
    }
    
    // Check reschedule limit (max 2 attempts per lesson)
    const { data: existingRequests, error: countError } = await serverSupabase
      .from('reschedule_requests')
      .select('id')
      .eq('lesson_id', lessonId);
    
    if (countError) {
      console.error('Error checking reschedule count:', countError);
      return NextResponse.json({ 
        error: 'Failed to check reschedule history' 
      }, { status: 500 });
    }
    
    if (existingRequests && existingRequests.length >= 2) {
      return NextResponse.json({ 
        error: 'Maximum reschedule attempts (2) reached for this lesson' 
      }, { status: 400 });
    }
    
    // Check time constraints (12-hour rule)
    const lessonStart = new Date(lesson.scheduled_start);
    const now = new Date();
    const hoursUntilLesson = (lessonStart.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilLesson < 12) {
      return NextResponse.json({ 
        error: 'Cannot reschedule lessons less than 12 hours before start time' 
      }, { status: 400 });
    }
    
    // Check for conflicts with the requested time
    const requestedStart = `${requestedDate}T${requestedStartTime}:00`;
    const requestedEnd = `${requestedDate}T${requestedEndTime}:00`;
    
    // Check tutor conflicts
    const { data: tutorConflicts, error: tutorConflictError } = await serverSupabase
      .from('lessons')
      .select('id, scheduled_start, scheduled_end, status')
      .eq('tutor_id', lesson.tutor_id)
      .or(`scheduled_start.lt.${requestedEnd},scheduled_end.gt.${requestedStart}`)
      .in('status', ['pending', 'confirmed', 'reschedule_requested'])
      .neq('id', lessonId);
    
    if (tutorConflictError) {
      console.error('Error checking tutor conflicts:', tutorConflictError);
      return NextResponse.json({ 
        error: 'Failed to check tutor availability' 
      }, { status: 500 });
    }
    
    if (tutorConflicts && tutorConflicts.length > 0) {
      return NextResponse.json({ 
        error: 'Tutor has a conflicting lesson at the requested time' 
      }, { status: 409 });
    }
    
    // Check student conflicts (if student is requesting)
    if (isStudent) {
      const { data: studentConflicts, error: studentConflictError } = await serverSupabase
        .from('lessons')
        .select('id, scheduled_start, scheduled_end, status')
        .eq('student_id', user.id)
        .or(`scheduled_start.lt.${requestedEnd},scheduled_end.gt.${requestedStart}`)
        .in('status', ['pending', 'confirmed', 'reschedule_requested'])
        .neq('id', lessonId);
      
      if (studentConflictError) {
        console.error('Error checking student conflicts:', studentConflictError);
        return NextResponse.json({ 
          error: 'Failed to check your schedule' 
        }, { status: 500 });
      }
      
      if (studentConflicts && studentConflicts.length > 0) {
        return NextResponse.json({ 
          error: 'You have a conflicting lesson at the requested time' 
        }, { status: 409 });
      }
    }
    
    // Create reschedule request
    const rescheduleRequestData = {
      lesson_id: lessonId,
      requested_by: user.id,
      requested_by_type: isStudent ? 'student' : 'tutor',
      requested_date: requestedDate,
      requested_start_time: requestedStartTime,
      requested_end_time: requestedEndTime,
      reason: reason,
      status: 'pending',
      current_scheduled_start: lesson.scheduled_start,
      current_scheduled_end: lesson.scheduled_end
    };
    
    console.log('🔍 Creating reschedule request with data:', rescheduleRequestData);
    console.log('🔍 User type:', isStudent ? 'student' : 'tutor');
    console.log('🔍 User ID:', user.id);
    console.log('🔍 Lesson ID:', lessonId);
    console.log('🔍 Requested date:', requestedDate);
    console.log('🔍 Requested time:', requestedStartTime, '-', requestedEndTime);
    
    const { data: rescheduleRequest, error: createError } = await serverSupabase
      .from('reschedule_requests')
      .insert(rescheduleRequestData)
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Error creating reschedule request:', createError);
      console.error('❌ Error details:', {
        code: createError.code,
        message: createError.message,
        details: createError.details,
        hint: createError.hint
      });
      console.error('❌ Attempted data:', rescheduleRequestData);
      return NextResponse.json({ 
        error: 'Failed to create reschedule request',
        details: createError.message
      }, { status: 500 });
    }
    
    // Update lesson status to reschedule_requested
    const { error: updateError } = await serverSupabase
      .from('lessons')
      .update({ status: 'reschedule_requested' })
      .eq('id', lessonId);
    
    if (updateError) {
      console.error('Error updating lesson status:', updateError);
      // Note: We don't fail the request here since the reschedule request was created
      // The lesson status can be updated manually if needed
    }
    
    console.log('✅ Reschedule request created successfully:', rescheduleRequest.id);
    
    return NextResponse.json({
      success: true,
      rescheduleRequestId: rescheduleRequest.id,
      message: 'Reschedule request submitted successfully'
    });
    
  } catch (error) {
    console.error('Reschedule API error:', error);
    return NextResponse.json({ 
      error: 'Failed to create reschedule request' 
    }, { status: 500 });
  }
} 