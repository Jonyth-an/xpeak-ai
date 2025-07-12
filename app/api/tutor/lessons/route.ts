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

    // Get tutor profile
    const { data: tutorProfile, error: profileError } = await serverSupabase
      .from('tutor_profiles')
      .select('id, timezone')
      .eq('user_id', user.id)
      .single();

    if (profileError || !tutorProfile) {
      return NextResponse.json({ error: 'Tutor profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const lessonType = searchParams.get('lesson_type') || 'all';

    const offset = (page - 1) * limit;

    // Build query for lessons
    let query = serverSupabase
      .from('lessons')
      .select(`
        id,
        lesson_type,
        duration_minutes,
        scheduled_start,
        scheduled_end,
        actual_start,
        actual_end,
        status,
        student_id,
        student_timezone,
        lesson_notes,
        student_goals,
        homework_assigned,
        price_paid,
        currency,
        created_at
      `)
      .eq('tutor_id', tutorProfile.id);

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (lessonType !== 'all') {
      query = query.eq('lesson_type', lessonType);
    }

    if (dateFrom) {
      query = query.gte('scheduled_start', `${dateFrom}T00:00:00`);
    }

    if (dateTo) {
      query = query.lte('scheduled_start', `${dateTo}T23:59:59`);
    }

    // Apply sorting and pagination
    query = query
      .order('scheduled_start', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: lessons, error: lessonsError } = await query;

    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
      return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
    }

    // Get student details from auth.users
    const studentIds = Array.from(new Set(lessons?.map(lesson => lesson.student_id) || []));
    let studentDetails: Record<string, any> = {};

    if (studentIds.length > 0) {
      const { data: students } = await serverSupabase.auth.admin.listUsers();
      
      if (students?.users) {
        studentDetails = students.users
          .filter(user => studentIds.includes(user.id))
          .reduce((acc: Record<string, any>, user: any) => {
            acc[user.id] = {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Unknown Student',
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
              country: user.user_metadata?.country || 'Unknown'
            };
            return acc;
          }, {});
      }
    }

    // Get lesson feedback for each lesson
    const lessonIds = lessons?.map(lesson => lesson.id) || [];
    let feedbackDetails: Record<string, any> = {};

    if (lessonIds.length > 0) {
      const { data: feedback } = await serverSupabase
        .from('lesson_feedback')
        .select('lesson_id, rating, comment, tags, is_visible_to_tutor')
        .in('lesson_id', lessonIds)
        .eq('is_visible_to_tutor', true);
      
      if (feedback) {
        feedbackDetails = feedback.reduce((acc: Record<string, any>, fb: any) => {
          acc[fb.lesson_id] = fb;
          return acc;
        }, {});
      }
    }

    // Process lessons with student and feedback data
    const processedLessons = (lessons || []).map(lesson => {
      const student = studentDetails[lesson.student_id];
      const feedback = feedbackDetails[lesson.id];
      
      // Apply search filter if provided
      if (search) {
        const searchTerm = search.toLowerCase();
        const studentName = student?.full_name?.toLowerCase() || '';
        const lessonType = lesson.lesson_type?.toLowerCase() || '';
        
        if (!studentName.includes(searchTerm) && !lessonType.includes(searchTerm)) {
          return null;
        }
      }

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
        price_paid: lesson.price_paid,
        currency: lesson.currency,
        created_at: lesson.created_at,
        student: {
          id: lesson.student_id,
          name: student?.full_name || 'Unknown Student',
          email: student?.email,
          avatar_url: student?.avatar_url,
          country: student?.country || 'Unknown'
        },
        feedback: feedback ? {
          rating: feedback.rating,
          comment: feedback.comment,
          tags: feedback.tags
        } : null
      };
    }).filter(lesson => lesson !== null);

    // Get total count for pagination
    let countQuery = serverSupabase
      .from('lessons')
      .select('id', { count: 'exact' })
      .eq('tutor_id', tutorProfile.id);

    if (status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }

    if (lessonType !== 'all') {
      countQuery = countQuery.eq('lesson_type', lessonType);
    }

    if (dateFrom) {
      countQuery = countQuery.gte('scheduled_start', `${dateFrom}T00:00:00`);
    }

    if (dateTo) {
      countQuery = countQuery.lte('scheduled_start', `${dateTo}T23:59:59`);
    }

    const { count: totalCount } = await countQuery;

    // Calculate summary statistics
    const { data: allLessons } = await serverSupabase
      .from('lessons')
      .select('status, duration_minutes, student_id')
      .eq('tutor_id', tutorProfile.id);

    const totalLessons = allLessons?.length || 0;
    const totalStudents = new Set(allLessons?.map(l => l.student_id)).size;
    const totalMinutes = allLessons?.reduce((sum, l) => sum + (l.duration_minutes || 0), 0) || 0;
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

    // Get countries taught
    const uniqueCountries = new Set(
      Object.values(studentDetails).map((student: any) => student.country).filter(Boolean)
    );

    return NextResponse.json({
      lessons: processedLessons,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      },
      summary: {
        total_lessons: totalLessons,
        total_students: totalStudents,
        total_minutes: totalMinutes,
        total_hours: totalHours,
        countries_reached: uniqueCountries.size
      },
      tutor_timezone: tutorProfile.timezone
    });

  } catch (error) {
    console.error('Error in lessons GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    // Get tutor profile
    const { data: tutorProfile, error: profileError } = await serverSupabase
      .from('tutor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !tutorProfile) {
      return NextResponse.json({ error: 'Tutor profile not found' }, { status: 404 });
    }

    const { lesson_id, lesson_notes, homework_assigned, student_goals } = await request.json();

    if (!lesson_id) {
      return NextResponse.json({ error: 'lesson_id is required' }, { status: 400 });
    }

    // Verify lesson belongs to tutor
    const { data: lesson, error: lessonError } = await serverSupabase
      .from('lessons')
      .select('id')
      .eq('id', lesson_id)
      .eq('tutor_id', tutorProfile.id)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Update lesson
    const updateData: any = {};
    if (lesson_notes !== undefined) updateData.lesson_notes = lesson_notes;
    if (homework_assigned !== undefined) updateData.homework_assigned = homework_assigned;
    if (student_goals !== undefined) updateData.student_goals = student_goals;

    const { data: updatedLesson, error: updateError } = await serverSupabase
      .from('lessons')
      .update(updateData)
      .eq('id', lesson_id)
      .eq('tutor_id', tutorProfile.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating lesson:', updateError);
      return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 });
    }

    return NextResponse.json({
      lesson: updatedLesson,
      message: 'Lesson updated successfully'
    });

  } catch (error) {
    console.error('Error in lessons PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 