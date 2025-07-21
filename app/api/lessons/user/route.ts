import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';

// In-memory cache for lessons (user + params)
const lessonsCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

function getCacheKey(userId, upcoming, status, offset, limit) {
  return `${userId}|${upcoming}|${status}|${offset}|${limit}`;
}

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

    const cacheKey = getCacheKey(user.id, upcoming, status, offset, limit);
    const now = Date.now();
    const cached = lessonsCache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ lessons: cached.data, total: cached.total });
    }

    // Use the new Postgres function for deduplication and fetching lessons
    const { data: lessons, error: lessonsError } = await serverSupabase.rpc('get_distinct_student_lessons', {
      p_student_id: user.id,
      p_upcoming: upcoming,
      p_status: status,
      p_offset: offset,
      p_limit: limit
    });

    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
      return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
    }

    // Map lessons to expected API response format
    const mappedLessons = (lessons || []).map(lesson => {
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
        can_join: minutesUntil <= 60 && minutesUntil >= -60 && lesson.status === 'confirmed',
        tutor: {
          id: lesson.tutor_profile_id,
          name: lesson.tutor_display_name,
          profile_image_url: lesson.tutor_profile_image_url,
          bio: lesson.tutor_bio,
          timezone: lesson.tutor_timezone
        },
        feedback: null // Feedback is not included in the function; add if needed
      };
    });

    // Get total count for pagination (keep as is)
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
    } else {
      // For past lessons, show lessons that are in the past AND not pending/cancelled
      const now = new Date();
      countQuery = countQuery
        .lt('scheduled_start', now.toISOString())
        .neq('status', 'pending')
        .neq('status', 'cancelled');
    }

    const { count: totalCount } = await countQuery;

    // After fetching lessons from DB and mapping
    lessonsCache.set(cacheKey, { data: mappedLessons, total: totalCount, timestamp: now });

    return NextResponse.json({
      lessons: mappedLessons,
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