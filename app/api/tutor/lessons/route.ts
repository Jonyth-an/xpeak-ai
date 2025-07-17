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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming') === 'true';
    const includeSummary = searchParams.get('include_summary') === 'true';
    
    console.log('🔍 Fetching lessons for tutor:', user.email);
    console.log('📊 Filters:', { page, limit, status, upcoming });

    // First, get the tutor profile to get the tutor_id
    const { data: tutorProfile, error: tutorError } = await serverSupabase
      .from('tutor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tutorError || !tutorProfile) {
      console.error('❌ Tutor profile not found:', tutorError);
      return NextResponse.json({ error: 'Tutor profile not found' }, { status: 404 });
    }

    const tutorId = tutorProfile.id;
    console.log('✅ Found tutor ID:', tutorId);

    // Build the query
    let query = serverSupabase
      .from('lessons')
      .select('*')
      .eq('tutor_id', tutorId);

    // Add status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Add upcoming filter if requested
    if (upcoming) {
      const now = new Date().toISOString();
      query = query.gte('scheduled_start', now);
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    query = query.order('scheduled_start', { ascending: true });

    const { data: lessons, error } = await query;

    if (error) {
      console.error('❌ Error fetching tutor lessons:', error);
      return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
    }

    console.log(`📊 Found ${lessons?.length || 0} lessons for tutor`);

    // Calculate summary if requested
    let summary = null;
    if (includeSummary) {
      // Get all lessons for summary calculation (without pagination)
      const { data: allLessons, error: summaryError } = await serverSupabase
        .from('lessons')
        .select('*')
        .eq('tutor_id', tutorId);

      if (!summaryError && allLessons) {
        const totalLessons = allLessons.length;
        const uniqueStudents = new Set(allLessons.map(lesson => lesson.student_id)).size;
        const totalMinutes = allLessons.reduce((sum, lesson) => sum + (lesson.duration_minutes || 0), 0);
        const totalHours = Math.floor(totalMinutes / 60);
        
        // Get unique countries from students
        const studentIds = Array.from(new Set(allLessons.map(lesson => lesson.student_id)));
        let countriesReached = 0;
        
        if (studentIds.length > 0) {
          const { data: studentData } = await serverSupabase
            .from('users')
            .select('user_metadata')
            .in('id', studentIds);
          
          if (studentData) {
            const countries = new Set(
              studentData
                .map(student => student.user_metadata?.country || 'Unknown')
                .filter(country => country !== 'Unknown')
            );
            countriesReached = countries.size;
          }
        }

        summary = {
          total_lessons: totalLessons,
          total_students: uniqueStudents,
          total_minutes: totalMinutes,
          total_hours: totalHours,
          countries_reached: countriesReached
        };
      }
    }

    // Get student data for all lessons
    const studentIds = Array.from(new Set((lessons || []).map(lesson => lesson.student_id)));
    let students: Record<string, any> = {};
    
    if (studentIds.length > 0) {
      const { data: studentData, error: studentError } = await serverSupabase
        .from('users')
        .select('id, email, user_metadata')
        .in('id', studentIds);
      
      if (!studentError && studentData) {
        students = studentData.reduce((acc: Record<string, any>, student: any) => {
          acc[student.id] = student;
          return acc;
        }, {});
      }
    }

    // Process lessons data
    const processedLessons = (lessons || []).map(lesson => {
      const student = students[lesson.student_id] || {};
      const now = new Date();
      const scheduledStart = new Date(lesson.scheduled_start);
      const minutesUntil = Math.max(0, Math.floor((scheduledStart.getTime() - now.getTime()) / (1000 * 60)));
      
      return {
        id: lesson.id,
        lesson_type: lesson.lesson_type,
        duration_minutes: lesson.duration_minutes,
        scheduled_start: lesson.scheduled_start,
        scheduled_end: lesson.scheduled_end,
        actual_start: lesson.actual_start,
        actual_end: lesson.actual_end,
        status: lesson.status,
        lesson_notes: lesson.lesson_notes,
        student_goals: lesson.student_goals,
        homework_assigned: lesson.homework_assigned,
        created_at: lesson.created_at,
        minutes_until: minutesUntil,
        can_join: lesson.status === 'confirmed' && minutesUntil <= 15 && minutesUntil >= -30,
        student: {
          id: student.id,
          email: student.email,
          name: student.user_metadata?.full_name || student.email?.split('@')[0] || 'Unknown'
        }
      };
    });

    const response: any = {
      lessons: processedLessons,
      pagination: {
        page,
        limit,
        total: processedLessons.length,
        hasMore: processedLessons.length === limit
      }
    };

    if (summary) {
      response.summary = summary;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Unexpected error in tutor lessons API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
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

    const { lessonId, action } = await request.json();

    if (!lessonId || !action) {
      return NextResponse.json({ error: 'Missing lessonId or action' }, { status: 400 });
    }

    // Get the tutor profile to verify ownership
    const { data: tutorProfile, error: tutorError } = await serverSupabase
      .from('tutor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tutorError || !tutorProfile) {
      return NextResponse.json({ error: 'Tutor profile not found' }, { status: 404 });
    }

    // Verify the lesson belongs to this tutor
    const { data: lesson, error: lessonError } = await serverSupabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .eq('tutor_id', tutorProfile.id)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json({ error: 'Lesson not found or access denied' }, { status: 404 });
    }

    // Update lesson status based on action
    let newStatus;
    switch (action) {
      case 'confirm':
        newStatus = 'confirmed';
        break;
      case 'reject':
        newStatus = 'rejected';
        break;
      case 'cancel':
        newStatus = 'cancelled';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { data: updatedLesson, error: updateError } = await serverSupabase
      .from('lessons')
      .update({ status: newStatus })
      .eq('id', lessonId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating lesson:', updateError);
      return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 });
    }

    console.log(`✅ Lesson ${lessonId} ${action}ed successfully`);

    return NextResponse.json({
      success: true,
      lesson: updatedLesson
    });

  } catch (error) {
    console.error('❌ Unexpected error in tutor lessons PATCH:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 