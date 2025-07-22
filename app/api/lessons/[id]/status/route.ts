import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';
import { socketService } from '@/lib/services/socketService';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lessonId } = await params;
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Parse request body
    const { status } = await request.json();
    if (!status) {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 });
    }
    // Fetch the lesson to check authorization
    const { data: lesson, error: lessonError } = await serverSupabase
      .from('lessons')
      .select('id, student_id, tutor_id, status')
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
      return NextResponse.json({ error: 'Failed to fetch tutor information' }, { status: 500 });
    }
    // Check if user is authorized to update this lesson (student, tutor, or admin)
    const isStudent = lesson.student_id === user.id;
    const isTutor = tutorData.user_id === user.id;
    const isAdmin = user.email?.includes('admin');
    if (!isStudent && !isTutor && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized to update this lesson' }, { status: 403 });
    }
    // Check if lesson can be updated (not completed or cancelled)
    if (lesson.status === 'completed' || lesson.status === 'cancelled') {
      return NextResponse.json({ error: 'Cannot update completed or cancelled lessons' }, { status: 400 });
    }
    // Update the lesson status
    const { data: updatedLesson, error: updateError } = await serverSupabase
      .from('lessons')
      .update({ status })
      .eq('id', lessonId)
      .select('id, status, student_id, tutor_id, updated_at')
      .single();
    if (updateError) {
      return NextResponse.json({ error: 'Failed to update lesson status' }, { status: 500 });
    }
    // Emit real-time event via Socket.IO
    socketService.broadcastLessonStatus(lessonId, status);
    return NextResponse.json({
      success: true,
      lesson: updatedLesson,
      message: 'Lesson status updated successfully'
    });
  } catch (error) {
    console.error('Lesson status update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 