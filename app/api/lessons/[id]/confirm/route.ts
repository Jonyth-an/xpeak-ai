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
    
    // Get the lesson to verify ownership and current status
    const { data: lesson, error: lessonError } = await serverSupabase
      .from('lessons')
      .select('*')
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

    // Check if user is authorized to confirm this lesson (must be the tutor)
    const isTutor = tutorData.user_id === user.id;
    
    if (!isTutor) {
      return NextResponse.json({ error: 'Only the tutor can confirm this lesson' }, { status: 403 });
    }
    
    // Check if lesson is in pending status
    if (lesson.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Only pending lessons can be confirmed' 
      }, { status: 400 });
    }
    
    // Update lesson status to confirmed
    const { error: updateError } = await serverSupabase
      .from('lessons')
      .update({ 
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', lessonId);
    
    if (updateError) {
      console.error('Error confirming lesson:', updateError);
      return NextResponse.json({ error: 'Failed to confirm lesson' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Lesson confirmed successfully'
    });
    
  } catch (error) {
    console.error('Confirm lesson API error:', error);
    return NextResponse.json({ error: 'Failed to confirm lesson' }, { status: 500 });
  }
} 