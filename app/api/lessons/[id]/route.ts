import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';

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

    // Fetch lesson with tutor and student information
    const { data: lesson, error } = await serverSupabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (error || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Get tutor information to check authorization
    const { data: tutorData, error: tutorError } = await serverSupabase
      .from('tutor_profiles')
      .select('id, user_id, display_name, profile_image_url, bio, teaching_style')
      .eq('id', lesson.tutor_id)
      .single();

    if (tutorError) {
      console.error('Error fetching tutor data:', tutorError);
      return NextResponse.json({ error: 'Failed to fetch tutor information' }, { status: 500 });
    }

    // Check if user is authorized to view this lesson
    const isStudent = lesson.student_id === user.id;
    const isTutor = tutorData.user_id === user.id;
    
    if (!isStudent && !isTutor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }



    // Get student information from auth.users
    const { data: studentData, error: studentError } = await serverSupabase.auth.admin.getUserById(lesson.student_id);

    if (studentError) {
      console.error('Error fetching student data:', studentError);
    }

    // Format the response
    const formattedLesson = {
      ...lesson,
      tutor: tutorData || {
        id: lesson.tutor_id,
        display_name: 'Unknown Tutor'
      },
      student: studentData?.user || {
        id: lesson.student_id,
        email: 'unknown@example.com'
      }
    };

    return NextResponse.json(formattedLesson);

  } catch (error) {
    console.error('Error fetching lesson details:', error);
    return NextResponse.json({ error: 'Failed to fetch lesson details' }, { status: 500 });
  }
} 