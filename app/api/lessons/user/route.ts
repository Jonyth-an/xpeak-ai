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
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'all';
    const upcoming = searchParams.get('upcoming') === 'true';

    const offset = (page - 1) * limit;

    // Build query for lessons
    let query = serverSupabase
      .from('lessons')
      .select(`
        id,
        tutor_id,
        lesson_type,
        duration_minutes,
        scheduled_start,
        scheduled_end,
        actual_start,
        actual_end,
        status,
        lesson_notes,
        student_goals,
        homework_assigned,
        price_paid,
        currency,
        created_at,
        tutor_profiles!inner(
          id,
          display_name,
          profile_image_url,
          bio,
          timezone
        )
      `)
      .eq('student_id', user.id);

    // Apply filters
    if (status !== 'all') {
      // Handle comma-separated status values
      const statusList = status.split(',');
      if (statusList.length === 1) {
        query = query.eq('status', status);
      } else {
        query = query.in('status', statusList);
      }
    }

    if (upcoming) {
      const now = new Date();
      query = query.gte('scheduled_start', now.toISOString());
    }

    // Apply sorting and pagination
    query = query
      .order('scheduled_start', { ascending: upcoming ? true : false })
      .range(offset, offset + limit - 1);

    const { data: lessons, error: lessonsError } = await query;

    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
      return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
    }

    // Process lessons data
    const processedLessons = (lessons || []).map(lesson => {
      const tutor = lesson.tutor_profiles as any;
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
        price_paid: lesson.price_paid,
        currency: lesson.currency,
        created_at: lesson.created_at,
        minutes_until: minutesUntil,
        can_join: minutesUntil <= 15 && minutesUntil >= 0 && lesson.status === 'confirmed',
        tutor: {
          id: tutor.id,
          name: tutor.display_name,
          profile_image_url: tutor.profile_image_url,
          bio: tutor.bio,
          timezone: tutor.timezone
        }
      };
    });

    // Remove duplicates based on scheduled_start, scheduled_end, and tutor_id
    const uniqueLessons = processedLessons.filter((lesson, index, self) => {
      const key = `${lesson.scheduled_start}-${lesson.scheduled_end}-${lesson.tutor.id}`;
      return index === self.findIndex(l => 
        `${l.scheduled_start}-${l.scheduled_end}-${l.tutor.id}` === key
      );
    });

    console.log(`📊 Found ${processedLessons.length} lessons, ${uniqueLessons.length} unique after deduplication`);

    // Get total count for pagination
    let countQuery = serverSupabase
      .from('lessons')
      .select('id', { count: 'exact' })
      .eq('student_id', user.id);

    if (status !== 'all') {
      // Handle comma-separated status values
      const statusList = status.split(',');
      if (statusList.length === 1) {
        countQuery = countQuery.eq('status', status);
      } else {
        countQuery = countQuery.in('status', statusList);
      }
    }

    if (upcoming) {
      const now = new Date();
      countQuery = countQuery.gte('scheduled_start', now.toISOString());
    }

    const { count: totalCount } = await countQuery;

    return NextResponse.json({
      lessons: uniqueLessons,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in user lessons GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 