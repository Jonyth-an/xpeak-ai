import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lessonId } = await params;
    
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

    // Fetch the lesson to verify ownership and check time restrictions
    const { data: lesson, error: lessonError } = await serverSupabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Check if user is authorized to cancel this lesson (student or tutor)
    if (lesson.student_id !== user.id && lesson.tutor_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to cancel this lesson' }, { status: 403 });
    }

    // Check if lesson is already cancelled
    if (lesson.status === 'cancelled') {
      return NextResponse.json({ error: 'Lesson is already cancelled' }, { status: 400 });
    }

    // Check if lesson is already completed
    if (lesson.status === 'completed') {
      return NextResponse.json({ error: 'Cannot cancel a completed lesson' }, { status: 400 });
    }

    // Check time restriction (12 hours before lesson start)
    const now = new Date();
    const lessonStart = new Date(lesson.scheduled_start);
    const hoursUntilLesson = (lessonStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilLesson < 12) {
      return NextResponse.json({ 
        error: 'Lessons can only be cancelled at least 12 hours before the start time',
        hoursUntilLesson: Math.round(hoursUntilLesson * 10) / 10
      }, { status: 400 });
    }

    // Update lesson status to cancelled
    const { error: updateError } = await serverSupabase
      .from('lessons')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', lessonId);

    if (updateError) {
      console.error('Error cancelling lesson:', updateError);
      return NextResponse.json({ error: 'Failed to cancel lesson' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Lesson cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel lesson API error:', error);
    return NextResponse.json({ error: 'Failed to cancel lesson' }, { status: 500 });
  }
} 