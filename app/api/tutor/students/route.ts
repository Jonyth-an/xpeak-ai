import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';

export async function GET(request: NextRequest) {
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

    // Check if user has tutor role
    const { data: roleData, error: roleError } = await serverSupabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'tutor')
      .single();

    if (roleError || !roleData) {
      return NextResponse.json({ error: 'Access denied. Tutor role required.' }, { status: 403 });
    }

    // Get tutor profile
    const { data: tutorProfile, error: tutorError } = await serverSupabase
      .from('tutor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tutorError || !tutorProfile) {
      return NextResponse.json({ error: 'Tutor profile not found' }, { status: 404 });
    }

    // Get tutor-student relationships
    const { data: relationships, error: relationshipsError } = await serverSupabase
      .from('tutor_students')
      .select(`
        student_id,
        total_lessons,
        total_minutes,
        first_lesson_at,
        last_lesson_at,
        student_goals,
        tutor_notes,
        student_level
      `)
      .eq('tutor_id', tutorProfile.id);

    if (relationshipsError) {
      console.error('Error fetching relationships:', relationshipsError);
      return NextResponse.json({ error: 'Failed to load student data' }, { status: 500 });
    }

    if (!relationships || relationships.length === 0) {
      return NextResponse.json({
        students: [],
        overview: {
          active_students: 0,
          total_lessons: 0,
          total_hours: 0,
          countries: 0
        }
      });
    }

    // Map student data with basic information
    // In a production environment, you would want to fetch real user data
    const students = relationships.map(rel => {
      return {
        id: rel.student_id,
        name: `Student ${rel.student_id.slice(0, 8)}`,
        email: `student${rel.student_id.slice(0, 4)}@example.com`,
        avatar_url: null,
        country: 'Unknown',
        level: rel.student_level || 'intermediate',
        total_lessons: rel.total_lessons || 0,
        total_hours: Math.round((rel.total_minutes || 0) / 60 * 10) / 10,
        last_lesson_date: rel.last_lesson_at || rel.first_lesson_at,
        goals: rel.student_goals || '',
        tutor_notes: rel.tutor_notes || '',
        first_lesson_at: rel.first_lesson_at
      };
    });

    // Calculate overview stats
    const totalLessons = students.reduce((sum, s) => sum + s.total_lessons, 0);
    const totalHours = students.reduce((sum, s) => sum + s.total_hours, 0);
    const countries = new Set(students.map(s => s.country).filter(Boolean)).size;

    return NextResponse.json({
      students,
      overview: {
        active_students: students.length,
        total_lessons: totalLessons,
        total_hours: Math.round(totalHours * 10) / 10,
        countries
      }
    });

  } catch (error) {
    console.error('Error in tutor students API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 