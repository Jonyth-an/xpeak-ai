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

    const { id: lessonId } = await params;
    const { rating, comment } = await request.json();

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    }

    // Check if lesson exists and user is the student
    const { data: lesson, error: lessonError } = await serverSupabase
      .from('lessons')
      .select('id, student_id, tutor_id, status, scheduled_start')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Verify user is the student of this lesson
    if (lesson.student_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if lesson is completed (past and confirmed)
    const lessonDate = new Date(lesson.scheduled_start);
    const now = new Date();
    if (lessonDate >= now || lesson.status !== 'confirmed') {
      return NextResponse.json({ error: 'Lesson not eligible for feedback' }, { status: 400 });
    }

    // Check if feedback already exists
    const { data: existingFeedback } = await serverSupabase
      .from('lesson_feedback')
      .select('id')
      .eq('lesson_id', lessonId)
      .eq('student_id', user.id)
      .single();

    if (existingFeedback) {
      return NextResponse.json({ error: 'Feedback already submitted' }, { status: 409 });
    }

    // Insert feedback
    const { data: feedback, error: insertError } = await serverSupabase
      .from('lesson_feedback')
      .insert({
        lesson_id: lessonId,
        student_id: user.id,
        tutor_id: lesson.tutor_id,
        rating,
        comment: comment || null,
        is_visible_to_tutor: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting feedback:', insertError);
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      feedback: {
        ...feedback,
        // For security, don't return the comment in the response
        comment: undefined
      }
    });

  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
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

    const { id: lessonId } = await params;

    // Check if lesson exists and user has access
    const { data: lesson, error: lessonError } = await serverSupabase
      .from('lessons')
      .select('id, student_id, tutor_id')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Verify user is either the student or tutor
    if (lesson.student_id !== user.id && lesson.tutor_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get feedback
    const { data: feedback, error: feedbackError } = await serverSupabase
      .from('lesson_feedback')
      .select('*')
      .eq('lesson_id', lessonId)
      .single();

    if (feedbackError) {
      if (feedbackError.code === 'PGRST116') {
        // No feedback found
        return NextResponse.json({ feedback: null });
      }
      console.error('Error fetching feedback:', feedbackError);
      return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
    }

    // Apply rating-based comment visibility for tutors
    if (lesson.tutor_id === user.id && feedback.rating < 4) {
      // Tutor can only see rating, not comment for low ratings
      return NextResponse.json({
        feedback: {
          ...feedback,
          comment: null // Hide comment for low ratings
        }
      });
    }

    return NextResponse.json({ feedback });

  } catch (error) {
    console.error('Feedback GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 