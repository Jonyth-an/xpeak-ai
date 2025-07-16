import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';

export async function PUT(
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

    // Parse request body
    const { student_goals, lesson_notes, homework_assigned } = await request.json();

    // Validate that at least one field is provided
    if (!student_goals && !lesson_notes && !homework_assigned) {
      return NextResponse.json({ 
        error: 'At least one field must be provided: student_goals, lesson_notes, or homework_assigned' 
      }, { status: 400 });
    }

    // Fetch the lesson to check authorization
    const { data: lesson, error: lessonError } = await serverSupabase
      .from('lessons')
      .select('id, student_id, tutor_id, status, scheduled_start')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Check if user is authorized to edit this lesson (student or tutor)
    if (lesson.student_id !== user.id && lesson.tutor_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to edit this lesson' }, { status: 403 });
    }

    // Check if lesson can be edited (not completed or cancelled)
    if (lesson.status === 'completed' || lesson.status === 'cancelled') {
      return NextResponse.json({ 
        error: 'Cannot edit completed or cancelled lessons' 
      }, { status: 400 });
    }

    // Prepare update data (only include provided fields)
    const updateData: any = {};
    if (student_goals !== undefined) updateData.student_goals = student_goals;
    if (lesson_notes !== undefined) updateData.lesson_notes = lesson_notes;
    if (homework_assigned !== undefined) updateData.homework_assigned = homework_assigned;

    // Update the lesson
    const { data: updatedLesson, error: updateError } = await serverSupabase
      .from('lessons')
      .update(updateData)
      .eq('id', lessonId)
      .select('id, student_goals, lesson_notes, homework_assigned, updated_at')
      .single();

    if (updateError) {
      console.error('Error updating lesson:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update lesson. Please try again.' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      lesson: updatedLesson,
      message: 'Lesson details updated successfully'
    });

  } catch (error) {
    console.error('Edit lesson API error:', error);
    return NextResponse.json({ 
      error: 'Failed to update lesson. Please try again.' 
    }, { status: 500 });
  }
} 